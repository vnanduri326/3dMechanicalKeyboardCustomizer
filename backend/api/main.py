import os
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api import filters
from api.schemas import ProductListOut, ProductOut
from storage.db import get_db
from storage.models import Product

app = FastAPI(
    title="Keyboard Customizer API",
    description="Backend services for product discovery, filtering, and 3D customizer asset lookup.",
    version="1.0.0",
)

# Include filters router under /api prefix
app.include_router(filters.router, prefix="/api")

# CORS setup for frontend local dev (Vite default: 5173)
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def to_out(p: Product) -> ProductOut:
    return ProductOut(
        id=p.id,
        canonical_name=p.canonical_name,
        handle=p.handle,
        type=p.type,
        brand=p.brand,
        product_type_raw=p.product_type_raw,
        min_price=p.min_price,
        source_url=p.source_url,
        image_url=p.image_url,
        color_variants=p.color_variants or [],
        tags=p.tags or [],
    )


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/api/products", response_model=ProductListOut, tags=["Products"])
@app.get("/products", response_model=ProductListOut, tags=["Products"], include_in_schema=False)
def list_products(
    type: Optional[str] = Query(None, description="Filter by product category (case-insensitive)"),
    brand: Optional[str] = Query(None, description="Filter by brand name (case-insensitive)"),
    max_price: Optional[float] = Query(None, ge=0, description="Filter items with min_price <= max_price"),
    sort_by: Optional[str] = Query(
        "name_asc",
        description="Sort order: 'price_asc', 'price_desc', 'name_asc', or 'name_desc'",
    ),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    # Case-insensitive filtering
    if type:
        query = query.filter(Product.type.ilike(type))
    if brand:
        query = query.filter(Product.brand.ilike(brand))
    if max_price is not None:
        query = query.filter(Product.min_price <= max_price)

    # Dynamic sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.min_price.asc().nullslast())
    elif sort_by == "price_desc":
        query = query.order_by(Product.min_price.desc().nullslast())
    elif sort_by == "name_desc":
        query = query.order_by(Product.canonical_name.desc())
    else:  # Default: name_asc
        query = query.order_by(Product.canonical_name.asc())

    total = query.count()
    rows = query.offset(offset).limit(limit).all()

    return ProductListOut(
        items=[to_out(p) for p in rows], total=total, limit=limit, offset=offset
    )


@app.get("/api/products/{product_id}", response_model=ProductOut, tags=["Products"])
@app.get("/products/{product_id}", response_model=ProductOut, tags=["Products"], include_in_schema=False)
def get_product(product_id: str, db: Session = Depends(get_db)):
    # Support lookup by full GID 'prod:handle' or bare 'handle'
    target_id = product_id if product_id.startswith("prod:") else f"prod:{product_id}"
    p = db.get(Product, target_id)
    if p is None:
        # Fallback search by handle column if passed directly
        p = db.query(Product).filter(Product.handle == product_id).first()
    if p is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return to_out(p)