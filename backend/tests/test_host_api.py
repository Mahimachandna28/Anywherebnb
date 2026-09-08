from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_host_dashboard_metrics():
    res = client.get("/api/host/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    metrics = data["metrics"]
    assert "total_revenue" in metrics
    assert "active_listings_count" in metrics
    assert "total_reservations_count" in metrics
    assert "average_rating" in metrics
    assert "recent_reservations" in data

def test_host_listings_retrieval():
    res = client.get("/api/host/listings")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for l in data:
        assert "title" in l
        assert "price_per_night" in l
        assert "bookings_count" in l

def test_host_crud_lifecycle():
    # 1. CREATE a new listing
    create_payload = {
        "title": "Brand New Himalayan Pine Chalet",
        "description": "Unique secluded mountain retreat with glass ceilings for stargazing in Manali.",
        "property_type": "Cabin",
        "category": "Cabins",
        "room_type": "Entire place",
        "address": "Solang Valley Ridge 44",
        "city": "Manali",
        "state": "Himachal Pradesh",
        "country": "India",
        "latitude": 32.2432,
        "longitude": 77.1892,
        "price_per_night": 8500,
        "cleaning_fee": 1200,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1.5,
        "amenity_ids": [],
        "image_urls": [
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        ],
    }

    res_create = client.post("/api/listings", json=create_payload)
    assert res_create.status_code == 201
    created = res_create.json()
    listing_id = created["id"]
    assert created["title"] == "Brand New Himalayan Pine Chalet"
    assert created["city"] == "Manali"
    assert len(created["images"]) == 2

    # 2. READ newly created listing
    res_get = client.get(f"/api/listings/{listing_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == listing_id

    # 3. UPDATE the listing
    update_payload = {
        "title": "Updated Himalayan Pine Chalet (Renovated)",
        "price_per_night": 9200,
        "cleaning_fee": 1400,
    }
    res_update = client.put(f"/api/listings/{listing_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Updated Himalayan Pine Chalet (Renovated)"
    assert res_update.json()["price_per_night"] == 9200

    # 4. DELETE the listing
    res_del = client.delete(f"/api/listings/{listing_id}")
    assert res_del.status_code == 204

    # 5. VERIFY deletion (404)
    res_verify = client.get(f"/api/listings/{listing_id}")
    assert res_verify.status_code == 404

def test_wishlist_toggle_and_retrieval():
    # Pick first listing
    list_res = client.get("/api/listings")
    listing_id = list_res.json()["items"][0]["id"]

    # Toggle favorite
    res_toggle = client.post("/api/wishlists/toggle", json={"listing_id": listing_id})
    assert res_toggle.status_code == 200
    status1 = res_toggle.json()["is_favorited"]

    # Toggle again -> should invert
    res_toggle2 = client.post("/api/wishlists/toggle", json={"listing_id": listing_id})
    assert res_toggle2.status_code == 200
    assert res_toggle2.json()["is_favorited"] == (not status1)

    # Re-toggle to desired state
    client.post("/api/wishlists/toggle", json={"listing_id": listing_id})

    # Get IDs
    res_ids = client.get("/api/wishlists/ids")
    assert res_ids.status_code == 200
    assert isinstance(res_ids.json(), list)

def test_users_endpoints():
    res_me = client.get("/api/users/me")
    assert res_me.status_code == 200
    assert "email" in res_me.json()

    res_all = client.get("/api/users")
    assert res_all.status_code == 200
    assert len(res_all.json()) >= 4

def test_multi_host_data_isolation_and_ownership():
    # 1. Fetch all users
    users_res = client.get("/api/users")
    assert users_res.status_code == 200
    users = users_res.json()
    rahul = next(u for u in users if u["email"] == "rahul.sharma@example.com")
    priya = next(u for u in users if u["email"] == "priya.sharma@example.com")
    arjun = next(u for u in users if u["email"] == "arjun.kapoor@example.com")

    # 2. Verify Rahul's dashboard and listings
    dash_rahul = client.get(f"/api/host/dashboard?host_id={rahul['id']}").json()
    assert dash_rahul["host"]["name"] == "Rahul Sharma"
    assert dash_rahul["metrics"]["active_listings_count"] == 5

    listings_rahul = client.get(f"/api/host/listings?host_id={rahul['id']}").json()
    assert len(listings_rahul) == 5
    rahul_titles = [l["title"] for l in listings_rahul]
    assert any("Candolim" in t for t in rahul_titles)
    assert any("Solang" in t for t in rahul_titles)

    # 3. Verify Priya's dashboard and listings are strictly isolated
    dash_priya = client.get(f"/api/host/dashboard?host_id={priya['id']}").json()
    assert dash_priya["host"]["name"] == "Priya Sharma"
    assert dash_priya["metrics"]["active_listings_count"] == 5

    listings_priya = client.get(f"/api/host/listings?host_id={priya['id']}").json()
    assert len(listings_priya) == 5
    priya_titles = [l["title"] for l in listings_priya]
    assert any("Amber" in t for t in priya_titles)
    assert any("Pichola" in t for t in priya_titles)
    # Ensure zero overlap: Priya does not see Rahul's listings
    for t in rahul_titles:
        assert t not in priya_titles

    # 4. Verify Arjun's dashboard and listings are strictly isolated
    dash_arjun = client.get(f"/api/host/dashboard?host_id={arjun['id']}").json()
    assert dash_arjun["host"]["name"] == "Arjun Kapoor"
    assert dash_arjun["metrics"]["active_listings_count"] == 6

    listings_arjun = client.get(f"/api/host/listings?host_id={arjun['id']}").json()
    assert len(listings_arjun) == 6
    arjun_titles = [l["title"] for l in listings_arjun]
    assert any("Indiranagar" in t for t in arjun_titles)
    assert any("Backwaters" in t for t in arjun_titles)
    for t in rahul_titles:
        assert t not in arjun_titles

