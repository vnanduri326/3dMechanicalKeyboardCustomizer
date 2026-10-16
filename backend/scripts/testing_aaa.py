
from schemas.raw_listing import RawListing
from schemas.product import normalize_listing


raw_data = {
    "title": "Test Keyboard",
    "vendor": "TestBrand",
    "product_type": "75% Keyboards",   # try: "Linear Switches", "SA Profile Keycaps", "Mouse Pads"
    "tags": "75, aluminum, hotswap",   # try: "" (empty)

    "options": [
        {"name": "Switch", "values": ["Cherry MX Red", "Cherry MX Brown"]},
        {"name": "Color", "values": ["Black", "White"]},
        # try: only one option, or reorder these two, or rename "Color" to "Colour"
    ],

    "variants": [
        {
            "title": "Cherry MX Red / Black",
            "price": "150.00",          # try: "1,299.00" or "0" or "150"
            "sku": "TEST-001",
            "option1": "Cherry MX Red", # try: "Default Title" or None
            "option2": "Black",         # try: None or "Default Title"
        },
        # add more variant dicts here if you want multiple variants
    ],

    "images": [],
}

# run — no need to edit anything below this

print("--- Raw input ---")
print(raw_data)
print()

try:
    listing = RawListing(**raw_data)
    print("--- Validated RawListing ---")
    print(listing)
    print()

    product = normalize_listing(listing)
    print("--- Normalized Product ---")
    print(f"canonical_name: {product.canonical_name}")
    print(f"type: {product.type}")
    print(f"brand: {product.brand}")
    print(f"tags: {product.tags}")
    print(f"color_variants:")
    for cv in product.color_variants:
        print(f" - {cv}")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")