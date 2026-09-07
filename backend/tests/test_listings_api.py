from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 10
    ids = [c["id"] for c in data]
    assert "Beachfront" in ids
    assert "Cabins" in ids
    assert "Mansions" in ids

def test_get_amenities():
    response = client.get("/api/amenities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 20
    names = [a["name"] for a in data]
    assert "Fast Wifi" in names
    assert "Private infinity pool" in names

def test_get_listings():
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 16
    assert len(data["items"]) >= 16

    # Verify first listing has image array
    first = data["items"][0]
    assert "title" in first
    assert "price_per_night" in first
    assert "rating" in first
    assert len(first["images"]) > 0

def test_filter_listings_by_destination():
    response = client.get("/api/listings?destination=Positano")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert "Positano" in item["city"] or "Positano" in item["title"]

def test_filter_listings_by_category():
    response = client.get("/api/listings?category=Beachfront")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["category"] == "Beachfront"

def test_get_listing_detail_success():
    # First get a valid listing id
    list_res = client.get("/api/listings")
    first_id = list_res.json()["items"][0]["id"]

    response = client.get(f"/api/listings/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id
    assert "description" in data
    assert "host" in data
    assert data["host"] is not None
    assert "booked_dates" in data
    assert isinstance(data["booked_dates"], list)
    assert len(data["images"]) >= 5

def test_get_listing_detail_not_found():
    response = client.get("/api/listings/99999")
    assert response.status_code == 404
