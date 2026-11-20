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


def test_normalize_listing_keeps_plain_text_product_description():
    raw = {
        "title": "Test Keyboard",
        "vendor": "TestBrand",
        "product_type": "75% Keyboards",
        "tags": "75, keyboard",
        "body_html": "<p>Includes PBT keycaps &amp; linear switches.</p>",
        "variants": [],
        "options": [],
        "images": [],
    }

    product = normalize_listing(RawListing(**raw))

    assert product.description == "Includes PBT keycaps & linear switches."


def test_normalize_listing_recognizes_plate_product_type():
    listing = RawListing(
        title="FR4 Plate",
        vendor="TestBrand",
        product_type="Keyboard Plates",
        variants=[],
        options=[],
        images=[],
    )

    assert normalize_listing(listing).type == "pcb_plate"


def test_normalize_listing_recognizes_case_product_type():
    listing = RawListing(
        title="TKL Aluminum Case",
        vendor="TestBrand",
        product_type="Keyboard Cases",
        variants=[],
        options=[],
        images=[],
    )

    assert normalize_listing(listing).type == "case"