# backend/scripts/run_fetch.py
from fetcher.product import fetch_product
from schemas.raw_listing import RawListing
from schemas.product import normalize_listing
from storage.db import SessionLocal
from storage.models import RawPage, Product as DBProduct


def process_and_store_handle(handle: str, source: str = "mechanicalkeyboards.com"):
    db = SessionLocal()

    # Step 1: Fetch + store raw data — commit immediately, independent of normalization
    try:
        raw_json = fetch_product(handle)
        raw_page = RawPage(
            id=f"{source}:{handle}",
            source=source,
            handle=handle,
            raw_json=raw_json,
            processed=False,  # not yet normalized
        )
        db.merge(raw_page)
        db.commit()
    except Exception as e:
        db.rollback()
        db.close()
        print(f"Failed to fetch/store raw data for {handle}: {e}")
        return  # nothing to normalize if the fetch itself failed

    # Step 2: Validate + normalize + store product — separate try, won't undo the raw save if it fails
    try:
        raw_listing = RawListing(**raw_json)
        p = normalize_listing(raw_listing)

        db_product = DBProduct(
            id=f"prod:{handle}",
            canonical_name=p.canonical_name,
            type=p.type,
            brand=p.brand,
            product_type_raw=p.product_type_raw,
            color_variants=[v.model_dump() for v in p.color_variants],
            tags=p.tags,
        )
        db.merge(db_product)

        # mark the raw page as successfully processed
        raw_page.processed = True
        db.merge(raw_page)

        db.commit()
        print(f"Successfully fetched, normalized, and stored: {handle} ({p.type})")

    except Exception as e:
        db.rollback()
        print(f"Fetched OK, but normalization failed for {handle}: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    test_handles = [
        "evoworks-evo75-aluminum-hotswap-wireless-keyboard",
        "ducky-one-x-full-size-inductive-keyboard",
        "ducky-yellow-backlit-31-key-oem-profile-double-shot-abs-rubber-keycap-set",
    ]
    for h in test_handles:
        process_and_store_handle(h)