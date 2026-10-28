from fetcher.product import fetch_product
from schemas.raw_listing import RawListing
from schemas.product import normalize_listing
from storage.db import SessionLocal
from storage.models import RawPage, Product as DBProduct


def process_and_store_handle(handle: str, source: str = "mechanicalkeyboards.com"):
    db = SessionLocal()

    # Step 1: fetch and store the raw JSON, committed on its own
    try:
        raw_json = fetch_product(handle)
        raw_page = RawPage(
            id=f"{source}:{handle}",
            source=source,
            handle=handle,
            raw_json=raw_json,
            processed=False,
        )
        db.merge(raw_page)
        db.commit()
    except Exception as e:
        db.rollback()
        db.close()
        print(f"Failed to fetch/store raw data for {handle}: {e}")
        return

    # Step 2: validate, normalize, store. A failure here keeps the raw page.
    try:
        p = normalize_listing(RawListing(**raw_json))

        db.merge(DBProduct(
            id=f"prod:{handle}",
            canonical_name=p.canonical_name,
            handle=p.handle or handle,
            source_url=p.source_url,
            image_url=p.image_url,
            min_price=p.min_price,
            type=p.type,
            brand=p.brand,
            product_type_raw=p.product_type_raw,
            color_variants=[v.model_dump() for v in p.color_variants],
            tags=p.tags,
        ))
        db.merge(RawPage(
            id=f"{source}:{handle}", source=source, handle=handle,
            raw_json=raw_json, processed=True,
        ))
        db.commit()
        print(f"Stored: {handle} ({p.type}, {len(p.color_variants)} variants)")
    except Exception as e:
        db.rollback()
        print(f"Fetched OK, but normalization failed for {handle}: {e}")
    finally:
        db.close()


DEFAULT_HANDLES = [
    "evoworks-evo75-aluminum-hotswap-wireless-keyboard",
    "ducky-one-x-full-size-inductive-keyboard",
    "ducky-yellow-backlit-31-key-oem-profile-double-shot-abs-rubber-keycap-set",
]


if __name__ == "__main__":
    import sys

    handles = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_HANDLES
    for handle in handles:
        process_and_store_handle(handle)