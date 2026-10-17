from typing import Optional

from pydantic import BaseModel


class ColorVariantOut(BaseModel):
    color_name: str
    color_hex: Optional[str] = None
    plate_material: Optional[str] = None
    price: float
    sku: str
    in_stock: bool = True
    options: dict[str, str] = {}


class ProductOut(BaseModel):
    id: str
    canonical_name: str
    handle: Optional[str] = None
    type: str
    brand: str
    product_type_raw: str
    min_price: Optional[float] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    color_variants: list[ColorVariantOut] = []
    tags: list[str] = []


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    limit: int
    offset: int