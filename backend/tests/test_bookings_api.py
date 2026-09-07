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
