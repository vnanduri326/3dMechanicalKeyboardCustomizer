# schemas/product.py
from pydantic import BaseModel
from typing import Optional
from schemas.raw_listing import RawListing

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
    canonical_name: str
    type: str  # "keyboard" | "switch" | "keycap" | "other"
    brand: str
    product_type_raw: str
    color_variants: list[ColorVariant] = []
    tags: list[str] = []

def resolve_color_hex(color_name: str) -> Optional[str]:
    if not color_name or color_name == "N/A":
        return None
    return COLOR_HEX_MAP.get(color_name)

def detect_product_type(raw_type: str, tags: list[str], title: str) -> str:
    combined = f"{raw_type} {' '.join(tags)} {title}".lower()
    if any(k in combined for k in ["switch", "switches"]):
        return "switch"
    if any(k in combined for k in ["keycap", "keycaps", "caps"]):
        return "keycap"
    if any(k in combined for k in ["keyboard", "diy kit", "barebone"]):
        return "keyboard"
    return "other"

def normalize_listing(listing: RawListing) -> Product:
    raw_tags = [t.strip() for t in listing.tags.split(",") if t.strip()] if isinstance(listing.tags, str) else listing.tags
    product_type = detect_product_type(listing.product_type, raw_tags, listing.title)

    color_variants = []
    for v in listing.variants:
        raw_color = v.option1.strip() if v.option1 else None
        
        # Handle "Default Title" single-variant edge case
        if not raw_color or raw_color in ("Default Title", "Default"):
            color_name = "N/A"
        else:
            color_name = raw_color

        color_variants.append(
            ColorVariant(
                color_name=color_name,
                color_hex=resolve_color_hex(color_name),
                plate_material=v.option2,
                price=float(v.price),
                sku=v.sku,
                in_stock=True,
            )
        )

    return Product(
        canonical_name=listing.title,
        type=product_type,
        brand=listing.vendor,
        product_type_raw=listing.product_type,
        color_variants=color_variants,
        tags=raw_tags,
    )