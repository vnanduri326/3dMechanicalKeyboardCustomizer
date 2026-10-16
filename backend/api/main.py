import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api.schemas import ProductListOut, ProductOut
from storage.db import get_db
from storage.models import Product

app = FastAPI(title="Keyboard Customizer API")

# Comma-separated list, so the deployed Vercel URL can be added later via env var
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _min_price(p: Product) -> Optional[float]:
    prices = [v["price"] for v in (p.color_variants or []) if v.get("price") is not None]
    return min(prices) if prices else None


def to_out(p: Product) -> ProductOut:
    # Prefer the min_price column once Jayden's migration adds it
    min_price = getattr(p, "min_price", None)
    if min_price is None:
        min_price = _min_price(p)
    return ProductOut(
        id=p.id,
        canonical_name=p.canonical_name,
        type=p.type,
        brand=p.brand,
        product_type_raw=p.product_type_raw,
        min_price=min_price,
        color_variants=p.color_variants or [],
        tags=p.tags or [],
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products", response_model=ProductListOut)
def list_products(
    type: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if type:
        query = query.filter(Product.type == type)
    if brand:
        query = query.filter(Product.brand == brand)
    query = query.order_by(Product.canonical_name)

    if max_price is None:
        total = query.count()
        rows = query.offset(offset).limit(limit).all()
    else:
        # TEMP: filter in Python until the min_price column exists.
        # Switch to query.filter(Product.min_price <= max_price) after the migration.
        matching = [
            p for p in query.all()
            if (mp := _min_price(p)) is not None and mp <= max_price
        ]
        total = len(matching)
        rows = matching[offset : offset + limit]

    return ProductListOut(
        items=[to_out(p) for p in rows], total=total, limit=limit, offset=offset
    )


@app.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return to_out(p)