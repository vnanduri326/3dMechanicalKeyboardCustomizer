# backend/scripts/check_colors.py
from fetcher.collection import get_all_product_handles
from fetcher.product import fetch_product
from schemas.raw_listing import RawListing

handles = get_all_product_handles(max_pages=3)

all_colors = set()
for h in handles:
    try:
        raw = fetch_product(h)
        listing = RawListing(**raw)
        for opt in listing.options:
            if opt.name.lower() == "color":
                all_colors.update(opt.values)
    except Exception as e:
        print(f"Skipped {h}: {e}")

print(sorted(all_colors))
print(f"\nTotal unique colors found: {len(all_colors)}")