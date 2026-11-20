import httpx

from fetcher.product import fetch_product
from schemas.raw_listing import RawListing
from schemas.product import normalize_listing
from storage.db import SessionLocal
from storage.models import RawPage, Product as DBProduct


def process_and_store_handle(
    handle: str,
    source: str = "mechanicalkeyboards.com",
    product_data: dict | None = None,
):
    db = SessionLocal()

    try:
        raw_page_id = f"{source}:{handle}"

        # Reuse fetched data after an interrupted or failed normalization.
        raw_page = db.get(RawPage, raw_page_id)
        if raw_page is not None and raw_page.processed:
            print(f"Already processed, skipping: {handle}")
            return

        if raw_page is not None:
            raw_json = raw_page.raw_json
            print(f"Reusing saved raw data: {handle}")
        else:
            raw_json = product_data if product_data is not None else fetch_product(handle)
            db.merge(RawPage(
                id=raw_page_id,
                source=source,
                handle=handle,
                raw_json=raw_json,
                processed=False,
            ))
            db.commit()

        # A normalization failure leaves the raw page available for the next run.
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
            description=p.description,
            color_variants=[v.model_dump() for v in p.color_variants],
            tags=p.tags,
        ))
        db.merge(RawPage(
            id=f"{source}:{handle}", source=source, handle=handle,
            raw_json=raw_json, processed=True,
        ))
        db.commit()
        print(f"Stored: {handle} ({p.type}, {len(p.color_variants)} variants)")
    except httpx.HTTPStatusError as e:
        db.rollback()
        if e.response.status_code == 429:
            retry_after = e.response.headers.get("Retry-After")
            wait_message = f"; retry after {retry_after} seconds" if retry_after else ""
            raise RuntimeError(
                f"Product endpoint rate-limited while fetching {handle}{wait_message}"
            ) from e
        print(f"Failed to fetch/store raw data for {handle}: {e}")
    except Exception as e:
        db.rollback()
        print(f"Failed to fetch/store/normalize {handle}: {e}")
    finally:
        db.close()