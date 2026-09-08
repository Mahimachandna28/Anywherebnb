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
    assert len(res_all.json()) >= 6

def test_host_ownership_isolation():
    """Verify that each host sees ONLY their own listings and bookings."""
    res_users = client.get("/api/users")
    users = {u["name"]: u for u in res_users.json()}
    
    rahul_id = users["Rahul Sharma"]["id"]
    priya_id = users["Priya Sharma"]["id"]
    arjun_id = users["Arjun Nair"]["id"]

    # 1. Rahul's dashboard and listings
    res_rahul_listings = client.get("/api/host/listings", headers={"X-User-Id": str(rahul_id)})
    assert res_rahul_listings.status_code == 200
    rahul_listings = res_rahul_listings.json()
    assert len(rahul_listings) == 5
    rahul_cities = {l["city"] for l in rahul_listings}
    assert "Goa" in rahul_cities
    assert "Manali" in rahul_cities
    assert "Jaipur" in rahul_cities

    res_rahul_dash = client.get("/api/host/dashboard", headers={"X-User-Id": str(rahul_id)})
    assert res_rahul_dash.status_code == 200
    rahul_dash = res_rahul_dash.json()
    assert rahul_dash["host"]["name"] == "Rahul Sharma"
    assert rahul_dash["metrics"]["active_listings_count"] == 5
    assert len(rahul_dash["recent_reservations"]) == 2
    guest_names = {r["guest_name"] for r in rahul_dash["recent_reservations"]}
    assert "Aman Verma" in guest_names
    assert "Priya Sharma" in guest_names

    # 2. Priya's dashboard and listings (MUST NOT see Rahul's or Arjun's properties)
    res_priya_listings = client.get("/api/host/listings", headers={"X-User-Id": str(priya_id)})
    assert res_priya_listings.status_code == 200
    priya_listings = res_priya_listings.json()
    assert len(priya_listings) == 5
    priya_cities = {l["city"] for l in priya_listings}
    assert "Udaipur" in priya_cities
    assert "Alleppey" in priya_cities
    assert "Goa" not in priya_cities  # Isolation check!

    res_priya_dash = client.get("/api/host/dashboard", headers={"X-User-Id": str(priya_id)})
    assert res_priya_dash.status_code == 200
    priya_dash = res_priya_dash.json()
    assert priya_dash["host"]["name"] == "Priya Sharma"
    assert priya_dash["metrics"]["active_listings_count"] == 5
    assert len(priya_dash["recent_reservations"]) == 1
    assert priya_dash["recent_reservations"][0]["guest_name"] == "Aarav Patel"

    # 3. Arjun's dashboard and listings
    res_arjun_listings = client.get("/api/host/listings", headers={"X-User-Id": str(arjun_id)})
    assert res_arjun_listings.status_code == 200
    arjun_listings = res_arjun_listings.json()
    assert len(arjun_listings) == 6
    arjun_cities = {l["city"] for l in arjun_listings}
    assert "Delhi" in arjun_cities
    assert "Varanasi" in arjun_cities
    assert "Goa" not in arjun_cities

    res_arjun_dash = client.get("/api/host/dashboard", headers={"X-User-Id": str(arjun_id)})
    assert res_arjun_dash.status_code == 200
    arjun_dash = res_arjun_dash.json()
    assert arjun_dash["host"]["name"] == "Arjun Nair"
    assert arjun_dash["metrics"]["active_listings_count"] == 6
    assert len(arjun_dash["recent_reservations"]) == 1
    assert arjun_dash["recent_reservations"][0]["guest_name"] == "Ananya Iyer"

def test_host_crud_creates_under_active_host():
    """Verify that a listing created with X-User-Id belongs to that host only."""
    res_users = client.get("/api/users")
    users = {u["name"]: u for u in res_users.json()}
    priya_id = users["Priya Sharma"]["id"]
    rahul_id = users["Rahul Sharma"]["id"]

    new_listing_data = {
        "title": "Priya's Private Kerala Backwater Villa",
        "description": "Secluded luxury villa on Vembanad Lake.",
        "property_type": "Villa",
        "category": "Lakefront",
        "room_type": "Entire place",
        "address": "Jetty Road 1",
        "city": "Kumarakom",
        "state": "Kerala",
        "country": "India",
        "latitude": 9.6175,
        "longitude": 76.4302,
        "price_per_night": 12500,
        "cleaning_fee": 1500,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2.0,
        "amenity_ids": [],
        "image_urls": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"],
    }

    # Create as Priya
    create_res = client.post("/api/listings", json=new_listing_data, headers={"X-User-Id": str(priya_id)})
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # Priya must see it
    priya_res = client.get("/api/host/listings", headers={"X-User-Id": str(priya_id)})
    assert any(l["id"] == created_id for l in priya_res.json())

    # Rahul MUST NOT see it
    rahul_res = client.get("/api/host/listings", headers={"X-User-Id": str(rahul_id)})
    assert not any(l["id"] == created_id for l in rahul_res.json())

    # Clean up by deleting
    del_res = client.delete(f"/api/listings/{created_id}", headers={"X-User-Id": str(priya_id)})
    assert del_res.status_code == 204

