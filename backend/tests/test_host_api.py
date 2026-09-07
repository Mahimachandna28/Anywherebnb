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

def test_host_crud_lifecycle():
    # 1. CREATE a new listing
    create_payload = {
        "title": "Brand New Alpine Glass Cabin",
        "description": "Unique secluded mountain retreat with glass ceilings for stargazing.",
        "property_type": "Cabin",
        "category": "Cabins",
        "room_type": "Entire place",
        "address": "Mountain Pass 44",
        "city": "Innsbruck",
        "state": "Tyrol",
        "country": "Austria",
        "latitude": 47.2692,
        "longitude": 11.4041,
        "price_per_night": 320,
        "cleaning_fee": 75,
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
    assert created["title"] == "Brand New Alpine Glass Cabin"
    assert created["city"] == "Innsbruck"
    assert len(created["images"]) == 2

    # 2. READ newly created listing
    res_get = client.get(f"/api/listings/{listing_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == listing_id

    # 3. UPDATE the listing
    update_payload = {
        "title": "Updated Alpine Glass Cabin (Renovated)",
        "price_per_night": 350,
        "cleaning_fee": 90,
    }
    res_update = client.put(f"/api/listings/{listing_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Updated Alpine Glass Cabin (Renovated)"
    assert res_update.json()["price_per_night"] == 350

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
