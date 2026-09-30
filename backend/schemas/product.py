from pydantic import BaseModel
from typing import Optional

COLOR_HEX_MAP: dict[str, str] = {
    "Black": "#1a1a1a",
    "Dark Grey": "#4a4a4a",
    "Grey": "#808080",
    "White": "#f5f5f5",
    "Purple": "#8b5a9f",
    "Tyrian Purple": "#8b5a9f",
    "Ice Blue": "#a8c6d8",
    "First Light": "#e8dcc8",
    "Sage": "#9caf88",
    "Sand Gold": "#c9a869",
    "Light Pink": "#f4c2d7",
}


class ColorVariant(BaseModel):
    color_name: str
    color_hex: Optional[str] = None
    plate_material: Optional[str] = None
    price: float
    sku: str
    in_stock: bool = True


class Product(BaseModel):
    """Canonical product schema — what gets stored in the database."""
    canonical_name: str
    type: str  # "keyboard" | "switch" | "keycap"
    brand: str
    product_type_raw: str
    color_variants: list[ColorVariant] = []
    tags: list[str] = []


def resolve_color_hex(color_name: str) -> Optional[str]:
    return COLOR_HEX_MAP.get(color_name)