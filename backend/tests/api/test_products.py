# tests/api/test_products.py
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_product_has_buy_link_fields():
    response = client.get("/api/products?limit=1")
    assert response.status_code == 200
    item = response.json()["items"][0]
    assert "handle" in item and item["handle"] is not None
    assert item["source_url"].startswith("https://mechanicalkeyboards.com/products/")


def test_max_price_filter():
    response = client.get("/api/products?max_price=100&limit=100")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) > 0
    assert all(i["min_price"] <= 100 for i in items)