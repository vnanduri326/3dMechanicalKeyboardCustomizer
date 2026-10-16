from schemas.product import resolve_color_hex, ColorVariant, Product, normalize_listing
from schemas.raw_listing import RawListing

# tests/schemas/test_normalize.py

def test_normalize_listing_handles_default_title():
    raw = {
        "title": "Test Keycap Set",
        "vendor": "TestBrand",
        "product_type": "OEM Profile Keycaps",
        "tags": "keycap",
        "variants": [
            {"title": "Default Title", "price": "18.00", "sku": "TEST-001", "option1": "Default Title", "option2": None}
        ],
        "options": [{"name": "Title", "values": ["Default Title"]}],
        "images": [],
    }
    listing = RawListing(**raw)
    product = normalize_listing(listing)

    assert product.color_variants[0].color_name == "N/A"
    assert product.color_variants[0].color_hex is None