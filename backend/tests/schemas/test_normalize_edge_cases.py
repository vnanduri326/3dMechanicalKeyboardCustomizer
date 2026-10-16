"""
Edge case tests for normalize_listing().

These tests use FAKE/made-up data (not real fetched products) to check
that our normalization logic handles unusual situations correctly —
things that might not show up in a simple, "happy path" test.
"""

from schemas.raw_listing import RawListing
from schemas.product import normalize_listing


def make_fake_listing(
    title="Test Product",
    vendor="TestBrand",
    product_type="75% Keyboards",
    tags="test",
    variants=None,
    options=None,
):
    """
    Helper function to build a fake RawListing quickly, so each test
    below doesn't have to repeat the same long dictionary every time.
    Only pass in the fields you actually want to change for that test.
    """
    if variants is None:
        variants = [
            {"title": "Default Title", "price": "10.00", "sku": "TEST-SKU", "option1": "Default Title", "option2": None}
        ]
    if options is None:
        options = []

    raw = {
        "title": title,
        "vendor": vendor,
        "product_type": product_type,
        "tags": tags,
        "variants": variants,
        "options": options,
        "images": [],
    }
    return RawListing(**raw)



def test_normalize_listing_handles_default_title():
    listing = make_fake_listing(
        title="Plain Keycap Set",
        product_type="OEM Profile Keycaps",
    )
    product = normalize_listing(listing)

    assert product.color_variants[0].color_name == "N/A"
    assert product.color_variants[0].color_hex is None



def test_normalize_listing_detects_switch_type():
    listing = make_fake_listing(
        title="Gateron Yellow Switch Set",
        vendor="Gateron",
        product_type="Linear Switches",  # <- contains the word "switches"
        tags="switch, linear",
    )
    product = normalize_listing(listing)

    assert product.type == "switch"



def test_normalize_listing_detects_keycap_type():
    listing = make_fake_listing(
        title="GMK Olivia Keycap Set",
        vendor="GMK",
        product_type="SA Profile Keycaps",  # <- contains the word "keycaps"
        tags="keycap, sa profile",
    )
    product = normalize_listing(listing)

    assert product.type == "keycap"


def test_normalize_listing_handles_unknown_type():
    listing = make_fake_listing(
        title="Some Random Accessory",
        product_type="Mouse Pads",  # not keyboard/switch/keycap
    )
    product = normalize_listing(listing)

    assert product.type == "other"


def test_normalize_listing_handles_comma_in_price():
    listing = make_fake_listing(
        variants=[
            {"title": "Default Title", "price": "1,299.00", "sku": "EXPENSIVE-SKU", "option1": None, "option2": None}
        ]
    )
    product = normalize_listing(listing)
    assert product.color_variants[0].price == 1299.00
def test_normalize_listing_handles_dollar_sign_in_price():
    listing = make_fake_listing(
        variants=[
            {"title": "Default Title", "price": "$18.00", "sku": "DOLLAR-SKU", "option1": None, "option2": None}
        ]
    )
    product = normalize_listing(listing)
    assert product.color_variants[0].price == 18.00


def test_normalize_listing_handles_whole_number_price():
    listing = make_fake_listing(
        variants=[
            {"title": "Default Title", "price": "150", "sku": "WHOLE-SKU", "option1": None, "option2": None}
        ]
    )
    product = normalize_listing(listing)
    assert product.color_variants[0].price == 150.0