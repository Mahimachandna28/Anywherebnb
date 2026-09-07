from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_wishlist_ids():
    res = client.get("/api/wishlists/ids")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    for item_id in data:
        assert isinstance(item_id, int)

def test_get_user_wishlists():
    res = client.get("/api/wishlists")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    for listing in data:
        assert "id" in listing
        assert "title" in listing
        assert "price_per_night" in listing
        assert "images" in listing

def test_wishlist_toggle_lifecycle():
    # 1. Fetch available listings
    listings_res = client.get("/api/listings")
    assert listings_res.status_code == 200
    listings = listings_res.json()["items"]
    assert len(listings) > 0

    # Pick the last listing
    test_listing_id = listings[-1]["id"]

    # 2. Get initial status
    initial_ids_res = client.get("/api/wishlists/ids")
    initial_ids = initial_ids_res.json()
    was_favorited = test_listing_id in initial_ids

    # 3. Toggle wishlist
    res_toggle1 = client.post("/api/wishlists/toggle", json={"listing_id": test_listing_id})
    assert res_toggle1.status_code == 200
    toggle1_data = res_toggle1.json()
    assert toggle1_data["listing_id"] == test_listing_id
    assert toggle1_data["is_favorited"] == (not was_favorited)

    # 4. Verify IDs reflect the toggle
    ids_res1 = client.get("/api/wishlists/ids")
    ids1 = ids_res1.json()
    if toggle1_data["is_favorited"]:
        assert test_listing_id in ids1
    else:
        assert test_listing_id not in ids1

    # 5. Toggle back to original state
    res_toggle2 = client.post("/api/wishlists/toggle", json={"listing_id": test_listing_id})
    assert res_toggle2.status_code == 200
    assert res_toggle2.json()["is_favorited"] == was_favorited

def test_wishlist_toggle_invalid_listing():
    res = client.post("/api/wishlists/toggle", json={"listing_id": 999999})
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()
