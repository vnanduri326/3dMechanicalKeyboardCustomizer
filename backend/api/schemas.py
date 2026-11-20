from typing import Literal, Optional

from pydantic import BaseModel, Field


class ColorVariantOut(BaseModel):
    color_name: str
    color_hex: Optional[str] = None
    plate_material: Optional[str] = None
    price: float
    sku: str
    in_stock: bool = True
    options: dict[str, str] = Field(default_factory=dict)


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
    color_variants: list[ColorVariantOut] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    limit: int
    offset: int


class RecommendationPreferences(BaseModel):
    keycap: Optional[str] = None
    switch: Optional[str] = None
    plate: Optional[str] = None
    size: Optional[str] = None


class PartRecommendationOut(ProductOut):
    category: Literal["keycap", "switch", "pcb_plate", "case"]
    score: int
    matching_preferences: list[str] = Field(default_factory=list)


class RecommendationListOut(BaseModel):
    items: list[PartRecommendationOut]
    total: int


class RecommendationOptionsOut(BaseModel):
    keycap: list[str] = Field(default_factory=list)
    switch: list[str] = Field(default_factory=list)
    plate: list[str] = Field(default_factory=list)
    size: list[str] = Field(default_factory=list)