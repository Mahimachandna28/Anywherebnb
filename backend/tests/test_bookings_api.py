from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_calculate_price_available():
    # Fetch a valid listing
    list_res = client.get("/api/listings")
    listing_id = list_res.json()["items"][0]["id"]
    nightly_rate = list_res.json()["items"][0]["price_per_night"]

    today = date.today()
    check_in = (today + timedelta(days=60)).isoformat()
    check_out = (today + timedelta(days=65)).isoformat()

    payload = {
        "listing_id": listing_id,
        "check_in_date": check_in,
        "check_out_date": check_out,
        "total_guests": 2,
    }

    res = client.post("/api/bookings/calculate-price", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_available"] is True
    assert data["total_nights"] == 5
    assert data["base_price"] == 5 * nightly_rate
    assert data["total_price"] == data["base_price"] + data["cleaning_fee"] + data["service_fee"]

def test_create_booking_success_and_conflict_rejection():
    list_res = client.get("/api/listings")
    listing_id = list_res.json()["items"][0]["id"]

    today = date.today()
    check_in = (today + timedelta(days=80)).isoformat()
    check_out = (today + timedelta(days=85)).isoformat()

    payload = {
        "listing_id": listing_id,
        "check_in_date": check_in,
        "check_out_date": check_out,
        "total_guests": 2,
        "adults": 2,
        "children": 0,
        "payment_method": "Credit Card (Mock)",
    }

    # 1. Create original booking
    res = client.post("/api/bookings", json=payload)
    assert res.status_code == 201
    booking_data = res.json()
    booking_id = booking_data["id"]
    assert booking_data["status"] == "confirmed"
    assert booking_data["total_nights"] == 5

    # 2. Attempt duplicate/overlapping booking (same dates) -> MUST fail with 400
    res_conflict = client.post("/api/bookings", json=payload)
    assert res_conflict.status_code == 400
    assert "no longer available" in res_conflict.json()["detail"].lower()

    # 3. Attempt partial overlap booking (days 82 to 87) -> MUST fail with 400
    overlap_payload = {
        "listing_id": listing_id,
        "check_in_date": (today + timedelta(days=82)).isoformat(),
        "check_out_date": (today + timedelta(days=87)).isoformat(),
        "total_guests": 2,
        "adults": 2,
    }
    res_overlap = client.post("/api/bookings", json=overlap_payload)
    assert res_overlap.status_code == 400

    # 4. Verify booking appears in My Trips
    trips_res = client.get("/api/bookings/my-trips")
    assert trips_res.status_code == 200
    my_booking_ids = [b["id"] for b in trips_res.json()]
    assert booking_id in my_booking_ids

    # 5. Cancel the booking
    cancel_res = client.post(f"/api/bookings/{booking_id}/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 6. Verify dates are freed up and can be booked again!
    res_rebook = client.post("/api/bookings", json=payload)
    assert res_rebook.status_code == 201
    new_booking_id = res_rebook.json()["id"]

    # Clean up
    client.post(f"/api/bookings/{new_booking_id}/cancel")

def test_booking_guest_capacity_exceeded():
    list_res = client.get("/api/listings")
    listing = list_res.json()["items"][0]

    today = date.today()
    payload = {
        "listing_id": listing["id"],
        "check_in_date": (today + timedelta(days=120)).isoformat(),
        "check_out_date": (today + timedelta(days=125)).isoformat(),
        "total_guests": listing["max_guests"] + 5,  # Exceeding capacity
        "adults": listing["max_guests"] + 5,
    }

    res = client.post("/api/bookings", json=payload)
    assert res.status_code == 400
    assert "maximum" in res.json()["detail"].lower()

def test_cancel_nonexistent_booking():
    res = client.post("/api/bookings/999999/cancel")
    assert res.status_code == 404

def test_create_booking_invalid_date_order():
    list_res = client.get("/api/listings")
    listing_id = list_res.json()["items"][0]["id"]
    today = date.today()

    payload = {
        "listing_id": listing_id,
        "check_in_date": (today + timedelta(days=20)).isoformat(),
        "check_out_date": (today + timedelta(days=15)).isoformat(),  # Check-out before check-in
        "total_guests": 2,
    }

    res = client.post("/api/bookings", json=payload)
    assert res.status_code == 400
    assert "after" in res.json()["detail"].lower()

def test_calculate_price_nonexistent_listing():
    today = date.today()
    payload = {
        "listing_id": 999999,
        "check_in_date": (today + timedelta(days=5)).isoformat(),
        "check_out_date": (today + timedelta(days=10)).isoformat(),
        "total_guests": 2,
    }
    res = client.post("/api/bookings/calculate-price", json=payload)
    assert res.status_code == 404

def test_evaluator_booking_correctness_overlap_and_turnover():
    """
    Evaluator Scenario Testing:
    Test A:
      Guest selects: June 10 -> June 14, 2 guests
      Booking: 4 nights × ₹X + cleaning fee + service fee = total
      Complete checkout -> verify persistence in DB and My Trips
    Test B (Overlap Collision):
      Try booking same listing again: June 12 -> June 15
      Must REJECT with HTTP 400 because dates overlap.
    Test B (Adjacent Turnover Allowed):
      Try booking same listing: June 14 -> June 17
      Must BE ALLOWED (HTTP 201) because checkout on June 14 frees property for new check-in on June 14.
    """
    list_res = client.get("/api/listings")
    listing = list_res.json()["items"][0]
    listing_id = listing["id"]
    nightly_rate = listing["price_per_night"]
    cleaning_fee = listing["cleaning_fee"]

    # 1. TEST A: Book June 10 -> June 14 (4 nights)
    check_in_a = "2027-06-10"
    check_out_a = "2027-06-14"
    payload_a = {
        "listing_id": listing_id,
        "check_in_date": check_in_a,
        "check_out_date": check_out_a,
        "total_guests": 2,
        "adults": 2,
        "children": 0,
        "payment_method": "Credit Card (Mock)",
    }

    # Verify price calculation endpoint first
    calc_res = client.post("/api/bookings/calculate-price", json={
        "listing_id": listing_id,
        "check_in_date": check_in_a,
        "check_out_date": check_out_a,
        "total_guests": 2,
    })
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["total_nights"] == 4
    expected_base = 4 * nightly_rate
    expected_service = round(expected_base * 0.14)
    expected_total = expected_base + cleaning_fee + expected_service
    assert calc_data["base_price"] == expected_base
    assert calc_data["total_price"] == expected_total

    # Complete checkout for Test A
    res_a = client.post("/api/bookings", json=payload_a)
    assert res_a.status_code == 201
    booking_a = res_a.json()
    assert booking_a["total_nights"] == 4
    assert booking_a["total_price"] == expected_total
    assert booking_a["status"] == "confirmed"

    # Verify booking exists in My Trips
    trips_res = client.get("/api/bookings/my-trips")
    assert trips_res.status_code == 200
    trips_ids = [b["id"] for b in trips_res.json()]
    assert booking_a["id"] in trips_ids

    # 2. TEST B (OVERLAP): Try booking same listing again: June 12 -> June 15
    payload_b_overlap = {
        "listing_id": listing_id,
        "check_in_date": "2027-06-12",
        "check_out_date": "2027-06-15",
        "total_guests": 2,
        "adults": 2,
        "children": 0,
    }
    res_b_overlap = client.post("/api/bookings", json=payload_b_overlap)
    assert res_b_overlap.status_code == 400
    assert "no longer available" in res_b_overlap.json()["detail"].lower()

    # 3. TEST B (ADJACENT TURNOVER): Try booking June 14 -> June 17
    # June 14 is checkout morning for booking A, so June 14 afternoon is open for new check-in!
    payload_b_adjacent = {
        "listing_id": listing_id,
        "check_in_date": "2027-06-14",
        "check_out_date": "2027-06-17",
        "total_guests": 2,
        "adults": 2,
        "children": 0,
    }
    res_b_adjacent = client.post("/api/bookings", json=payload_b_adjacent)
    assert res_b_adjacent.status_code == 201
    booking_b_adj = res_b_adjacent.json()
    assert booking_b_adj["total_nights"] == 3
    assert booking_b_adj["status"] == "confirmed"

    # Clean up test bookings
    client.post(f"/api/bookings/{booking_a['id']}/cancel")
    client.post(f"/api/bookings/{booking_b_adj['id']}/cancel")

