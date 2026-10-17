"""
Edge case tests for normalize_listing().

These use FAKE data to check that normalization handles unusual
situations, not just the happy path.
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
    handle=None,
    images=None,
):
    """Build a fake RawListing. Only pass the fields a test cares about."""
    if variants is None:
        variants = [
            {"title": "Default Title", "price": "10.00", "sku": "TEST-SKU",
             "option1": "Default Title", "option2": None}
        ]
    raw = {
        "title": title,
        "handle": handle,
        "vendor": vendor,
        "product_type": product_type,
        "tags": tags,
        "variants": variants,
        "options": options or [],
        "images": images or [],
    }
    return RawListing(**raw)


# ---- product type detection ----

def test_normalize_listing_detects_switch_type():
    listing = make_fake_listing(product_type="Linear Switches", tags="switch, linear")
    assert normalize_listing(listing).type == "switch"


def test_normalize_listing_detects_keycap_type():
    listing = make_fake_listing(product_type="SA Profile Keycaps", tags="keycap")
    assert normalize_listing(listing).type == "keycap"


def test_normalize_listing_handles_unknown_type():
    listing = make_fake_listing(product_type="Mouse Pads")
    assert normalize_listing(listing).type == "other"


# ---- options and colors ----

def test_normalize_listing_handles_default_title():
    listing = make_fake_listing(title="Plain Keycap Set", product_type="OEM Profile Keycaps")
    cv = normalize_listing(listing).color_variants[0]
    assert cv.color_name == "N/A"
    assert cv.color_hex is None


def test_normalize_listing_both_color_and_switch():
    listing = make_fake_listing(
        options=[
            {"name": "Switch", "values": ["Cherry MX Red"]},
            {"name": "Color", "values": ["Black"]},
        ],
        variants=[{"title": "Cherry MX Red / Black", "price": "150.00", "sku": "KB-1",
                   "option1": "Cherry MX Red", "option2": "Black"}],
    )
    cv = normalize_listing(listing).color_variants[0]
    assert cv.color_name == "Black"
    assert cv.options == {"Switch": "Cherry MX Red", "Color": "Black"}


def test_normalize_listing_keeps_non_color_options():
    listing = make_fake_listing(
        product_type="Cherry Profile Keycaps",
        options=[{"name": "Kit", "values": ["Base", "Novelties"]}],
        variants=[{"title": "Base", "price": "69.99", "sku": "KIT-BASE", "option1": "Base"}],
    )
    cv = normalize_listing(listing).color_variants[0]
    assert cv.color_name == "N/A"
    assert cv.options == {"Kit": "Base"}
    assert cv.plate_material is None


# ---- prices ----

def test_normalize_listing_handles_comma_in_price():
    listing = make_fake_listing(variants=[
        {"title": "Default Title", "price": "1,299.00", "sku": "EXPENSIVE", "option1": None}
    ])
    assert normalize_listing(listing).color_variants[0].price == 1299.00


def test_normalize_listing_handles_dollar_sign_in_price():
    listing = make_fake_listing(variants=[
        {"title": "Default Title", "price": "$18.00", "sku": "DOLLAR", "option1": None}
    ])
    assert normalize_listing(listing).color_variants[0].price == 18.00


def test_normalize_listing_handles_whole_number_price():
    listing = make_fake_listing(variants=[
        {"title": "Default Title", "price": "150", "sku": "WHOLE", "option1": None}
    ])
    assert normalize_listing(listing).color_variants[0].price == 150.0


def test_normalize_listing_skips_variant_without_price():
    listing = make_fake_listing(variants=[
        {"title": "A", "price": None, "sku": "A", "option1": None},
        {"title": "B", "price": "12.50", "sku": "B", "option1": None},
    ])
    product = normalize_listing(listing)
    assert len(product.color_variants) == 1
    assert product.min_price == 12.5


# ---- other fields ----

def test_normalize_listing_handles_missing_sku():
    listing = make_fake_listing(variants=[{"title": "A", "price": "10.00", "option1": None}])
    assert normalize_listing(listing).color_variants[0].sku == ""


def test_normalize_listing_reads_available_flag():
    listing = make_fake_listing(variants=[
        {"title": "A", "price": "10.00", "sku": "A", "option1": None, "available": False},
        {"title": "B", "price": "10.00", "sku": "B", "option1": None, "available": True},
    ])
    assert [cv.in_stock for cv in normalize_listing(listing).color_variants] == [False, True]


def test_normalize_listing_builds_source_url_and_image():
    listing = make_fake_listing(
        handle="test-board",
        images=[{"src": "https://cdn.example.com/a.jpg"}],
    )
    product = normalize_listing(listing)
    assert product.source_url == "https://mechanicalkeyboards.com/products/test-board"
    assert product.image_url == "https://cdn.example.com/a.jpg"


def test_normalize_listing_without_handle_or_images():
    product = normalize_listing(make_fake_listing())
    assert product.source_url is None
    assert product.image_url is None