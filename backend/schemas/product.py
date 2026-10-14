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
    "Charcoal": "#36454F",
    "Snow": "#FFFAFA",
    "Silver": "#C0C0C0",
    "Blue": "#0000FF",
    "Navy": "#000080",
    "Pink": "#FFC0Cb",
    "Red": "#FF0000",
    "Warm Silver": "#D7D0C6",
    "Yellow": "#FFFF00",
    "Dark Green": "#006400",
    "Slate Blue": "#6A5ACD",
    "Soy": "#6A6051",
    "Taupe Grey": "#8B8589",
    "Auqamarine": "#7FFFD4",
    "Blush Pink": "#DE5D83",
    "Carbon Black": "#0C0A00",
    "Classic Black": "#000000",
    "Dusty Rose": "#C9A6A6",
    "First Light": "#EFE2DE",
    "Gunmetal Grey": "#818589",
    "Nebula": "#CBDBD6",
    "Nickel": "#727472",
    "Orange": "#FFA500",
    "Retro White": "#F2E8D8",
    "Retro Grey": "#989692",
    "Sage": "#B2AC88",
    "Sand Gold": "#F7E5A9",
    "Shadow Black": "#1B1610",
    "Shell White": "#F0EBE0",
    "Sky Blue": "#87CEEB",
    "Space Grey": "#717378",
    "Baby Pink": "#F4C2C2",
    "Butter Yellow": "#FFFD74",
    "Iceberg": "#71A6D2",
    "Creme": "#FFFDD0",
    "Teal": "#008080",
    "Volt": "#CEFF00",
    "Yellow": "#FFFF00",
}

class ColorVariant(BaseModel):
    color_name: str
    color_hex: Optional[str] = None
    plate_material: Optional[str] = None
    switch_type: Optional[str] = None   # NEW
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
def parse_price(raw: str) -> float:
    """Convert price strings like '1,299.00' or '$18.00' into a float."""
    cleaned = raw.replace(",", "").replace("$", "").strip()
    return float(cleaned)
def normalize_listing(listing: RawListing) -> Product:
    product_type_lower = listing.product_type.lower()
    if "keyboard" in product_type_lower:
        product_type = "keyboard"
    elif "switch" in product_type_lower:
        product_type = "switch"
    elif "keycap" in product_type_lower:
        product_type = "keycap"
    else:
        product_type = "other"

    # Figure out which option slot (option1 or option2) is actually "Color"
    color_option_index = None  # will be 1 or 2
    for i, opt in enumerate(listing.options, start=1):
        if opt.name.lower() == "color":
            color_option_index = i
            break

    color_variants = []
    for v in listing.variants:
        if color_option_index == 1:
            raw_color = v.option1
        elif color_option_index == 2:
            raw_color = v.option2
        else:
            raw_color = None  # this product has no "Color" option at all

        color_name = raw_color if raw_color not in (None, "Default Title", "") else None

        # plate material (or any non-color second attribute) — just grab whichever
        # option ISN'T the color one, for informational purposes
        if color_option_index == 1:
            plate_material = v.option2
        else:
            plate_material = v.option1

        if plate_material in (None, "Default Title", ""):
            plate_material = None

        color_variants.append(
            ColorVariant(
                color_name=color_name or "N/A",
                color_hex=resolve_color_hex(color_name) if color_name else None,
                plate_material=plate_material,
                price=parse_price(v.price),
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
        tags=[t.strip() for t in listing.tags.split(",") if t.strip()],
    )