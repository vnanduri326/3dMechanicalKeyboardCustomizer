import pytest
from pydantic import ValidationError
from schemas.raw_listing import RawListing


def test_raw_listing_validates_real_shape():
    sample = {
        "title": "Evoworks Evo75 Aluminum Hotswap Wireless Keyboard",
        "vendor": "Evoworks",
        "product_type": "75% Keyboards",
        "tags": "75, aluminum, hotswap",
        "variants": [
            {"title": "Black / FR4", "price": "169.90", "sku": "EVO-EVO75-BKFR4", "option1": "Black", "option2": "FR4"}
        ],
        "options": [{"name": "Color", "values": ["Black", "Purple"]}],
        "images": [{"src": "https://cdn.shopify.com/example.jpg", "variant_ids": []}],
    }
    listing = RawListing(**sample)
    assert listing.title == "Evoworks Evo75 Aluminum Hotswap Wireless Keyboard"
    assert len(listing.variants) == 1


def test_raw_listing_rejects_missing_required_field():
    incomplete = {"vendor": "Evoworks"}
    with pytest.raises(ValidationError):
        RawListing(**incomplete)


def test_raw_listing_allows_missing_optional_fields():
    minimal = {
        "title": "Test Keyboard",
        "vendor": "TestBrand",
        "product_type": "TKL Keyboards",
        "tags": "",
        "variants": [],
        "options": [],
        "images": [],
    }
    listing = RawListing(**minimal)
    assert listing.body_html is None