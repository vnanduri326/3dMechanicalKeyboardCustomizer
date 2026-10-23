# api/filters.py
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from storage.db import get_db
from storage.models import Product

router = APIRouter()


@router.get("/filters")
def get_filters(db: Session = Depends(get_db)):
    # Safely extract distinct non-empty brands
    raw_brands = db.query(Product.brand).distinct().all()
    brands = sorted([b[0] for b in raw_brands if b[0]])

    # Safely extract distinct non-empty product types
    raw_types = db.query(Product.type).distinct().all()
    types = sorted([t[0] for t in raw_types if t[0]])

    # Extract price aggregates
    min_price = db.query(func.min(Product.min_price)).scalar()
    max_price = db.query(func.max(Product.min_price)).scalar()

    return {
        "brands": brands,
        "types": types,
        "price_range": {
            "min": float(min_price) if min_price is not None else 0.0,
            "max": float(max_price) if max_price is not None else 0.0,
        },
    }