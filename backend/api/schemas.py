from typing import Optional
from pydantic import BaseModel


class ColorVariantOut(BaseModel):
    color_name: str
    color_hex: Optional[str] = None
    plate_material: Optional[str] = None
    price: float
    sku: str
    in_stock: bool = True


class ProductOut(BaseModel):
    id: str
    canonical_name: str
    type: str
    brand: str
    product_type_raw: str
    min_price: Optional[float] = None
    color_variants: list[ColorVariantOut] = []
    tags: list[str] = []


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    limit: int
    offset: int