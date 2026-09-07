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

def test_wishlists_isolated_per_account():
    # User A (phone number)
    user_a_header = {"X-User-Email": "9876543210@phone.anywherebnb.in"}
    # User B (email address)
    user_b_header = {"X-User-Email": "priya.sharma@example.com"}

    # Fetch a listing id
    listings = client.get("/api/listings").json()["items"]
    listing_1 = listings[0]["id"]
    listing_2 = listings[1]["id"]

    # Clear/ensure clean state for User A and User B
    a_ids = client.get("/api/wishlists/ids", headers=user_a_header).json()
    if listing_1 in a_ids:
        client.post("/api/wishlists/toggle", json={"listing_id": listing_1}, headers=user_a_header)

    b_ids = client.get("/api/wishlists/ids", headers=user_b_header).json()
    if listing_1 in b_ids:
        client.post("/api/wishlists/toggle", json={"listing_id": listing_1}, headers=user_b_header)
    if listing_2 in b_ids:
        client.post("/api/wishlists/toggle", json={"listing_id": listing_2}, headers=user_b_header)

    # User A favorites listing_1
    res_a = client.post("/api/wishlists/toggle", json={"listing_id": listing_1}, headers=user_a_header)
    assert res_a.status_code == 200
    assert res_a.json()["is_favorited"] is True

    # User A sees listing_1 in their wishlist
    a_ids = client.get("/api/wishlists/ids", headers=user_a_header).json()
    assert listing_1 in a_ids

    # User B checks their wishlist -> MUST NOT contain listing_1
    b_ids_now = client.get("/api/wishlists/ids", headers=user_b_header).json()
    assert listing_1 not in b_ids_now

    # User B favorites listing_2
    res_b = client.post("/api/wishlists/toggle", json={"listing_id": listing_2}, headers=user_b_header)
    assert res_b.status_code == 200
    assert res_b.json()["is_favorited"] is True

    # User A still does NOT have listing_2, but still has listing_1
    a_ids_updated = client.get("/api/wishlists/ids", headers=user_a_header).json()
    assert listing_2 not in a_ids_updated
    assert listing_1 in a_ids_updated

