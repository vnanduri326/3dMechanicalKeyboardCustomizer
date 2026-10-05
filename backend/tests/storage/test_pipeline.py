# backend/tests/storage/test_pipeline.py
import pytest
from schemas.raw_listing import RawListing
from schemas.product import normalize_listing
from storage.models import Product as DBProduct, RawPage
from storage.db import SessionLocal

def test_raw_to_normalized_db_flow():
    db = SessionLocal()
    try:
        raw_data = {
            "title": "Ducky Keycap Set",
            "vendor": "Ducky",
            "product_type": "OEM Profile Keycaps",
            "tags": "keycap",
            "variants": [
                {
                    "title": "Default Title",
                    "price": "18.00",
                    "sku": "DUCKY-001",
                    "option1": "Default Title",
                    "option2": None
                }
            ],
            "options": [],
            "images": []
        }

        raw_listing = RawListing(**raw_data)
        product_pydantic = normalize_listing(raw_listing)

        db_product = DBProduct(
            id="prod:test-ducky",
            canonical_name=product_pydantic.canonical_name,
            type=product_pydantic.type,
            brand=product_pydantic.brand,
            product_type_raw=product_pydantic.product_type_raw,
            color_variants=[v.model_dump() for v in product_pydantic.color_variants],
            tags=product_pydantic.tags
        )

        db.merge(db_product)
        db.commit()

        saved = db.query(DBProduct).filter_by(id="prod:test-ducky").first()
        assert saved is not None
        assert saved.type == "keycap"
        assert saved.color_variants[0]["color_name"] == "N/A"
    finally:
        db.close()