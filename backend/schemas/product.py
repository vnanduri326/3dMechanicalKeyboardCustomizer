# schemas/product.py
from pydantic import BaseModel
from typing import Optional
from schemas.raw_listing import Image, RawListing, Variant
from fetcher.color_sample import sample_hex_from_url

COLOR_HEX_MAP: dict[str, str] = {
    "Anodized Black": "#1a1a1a",
    "Anodized Grey-gold": "#8a7a5c",
    "Anodized Ink": "#2c2a4a",
    "Anodized Nimbus": "#a8b0bc",
    "Anodized Sand Gold": "#c9a869",
    "Anodized Scarlet": "#c41e3a",
    "Anodized Silver": "#c0c0c0",
    "Anodized Tyrian": "#8b5a9f",
    "Aquamarine": "#7fffd4",
    "Black": "#1a1a1a",
    "Blue": "#3b6ea5",
    "Blush Pink": "#de98a0",
    "Bubble Dragon Green": "#3d8b6e",
    "Carbon Black": "#0d0d0d",
    "Charcoal": "#36454f",
    "Classic Black": "#1a1a1a",
    "Console Eclipse Grey": "#3a3a3a",
    "Crimson Blaze": "#dc143c",
    "Dark Green": "#006400",
    "Dark Grey": "#4a4a4a",
    "Dusty Rose": "#c08081",
    "First Light": "#e8dcc8",
    "Grey": "#808080",
    "Gunmetal Grey": "#2a3439",
    "Ice Blue": "#a8c6d8",
    "Imp Basalt Grey": "#4a4640",
    "Light Pink": "#f4c2d7",
    "Luna": "#d6dce4",
    "Mint Breeze": "#98d7c2",
    "Navy": "#000080",
    "Nebula": "#4b3f72",
    "Nickel": "#727472",
    "Orange": "#ff8c00",
    "Petal": "#f2c4ce",
    "Pink": "#ffc0cb",
    "Purple": "#8b5a9f",
    "Red": "#c41e3a",
    "Retro Console Retro White": "#f0ebe3",
    "Retro Grey": "#6b6b6b",
    "Sage": "#9caf88",
    "Sand Gold": "#c9a869",
    "Shadow Black": "#121212",
    "Shell White": "#f7f4ef",
    "Silver": "#c0c0c0",
    "Sky Blue": "#87ceeb",
    "Slate Blue": "#6a5acd",
    "Snow": "#fffafa",
    "Soy": "#d4c4a8",
    "SpaceGrey": "#65737e",
    "Spray-Coated Baby Pink": "#f4c2d7",
    "Spray-Coated Butter Yellow": "#f5e6a3",
    "Spray-Coated Iceberg": "#d6eaf5",
    "Spray-Coated Spark": "#f5c518",
    "Spray-coated Cream": "#fffdd0",
    "Taupe Grey": "#8b7d6b",
    "Teal": "#008080",
    "Tyrian Purple": "#8b5a9f",
    "Volt": "#ceff00",
    "Warm Silver": "#b8b0a4",
    "White": "#f5f5f5",
    "White Peach Pink": "#ffdab9",
    "Yellow": "#ffd700",
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
    handle: str
    min_price: float | None = None
    source_url: str
    image_url: str | None = None
    type: str  # "keyboard" | "switch" | "keycap" | "other"
    brand: str
    product_type_raw: str
    color_variants: list[ColorVariant] = []
    tags: list[str] = []

def resolve_color_hex(color_name: str) -> Optional[str]:
    if not color_name or color_name == "N/A":
        return None
    return COLOR_HEX_MAP.get(color_name)


def find_variant_image(variant: Variant, images: list[Image]) -> Optional[Image]:
    """Match a variant to its product photo by image_id, then by variant_ids."""
    if variant.image_id is not None:
        for image in images:
            if image.id == variant.image_id:
                return image
    if variant.id is not None:
        for image in images:
            if variant.id in image.variant_ids:
                return image
    return None


def hex_for_variant(color_name: str, variant: Variant, images: list[Image]) -> Optional[str]:
    """Sample the variant photo when one is linked; otherwise use the exact color map."""
    if not color_name or color_name == "N/A":
        return None
    image = find_variant_image(variant, images)
    if image is not None and image.src:
        sampled = sample_hex_from_url(image.src)
        if sampled:
            return sampled
    return resolve_color_hex(color_name)

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
                color_hex=hex_for_variant(color_name, v, listing.images) if color_name else None,
                plate_material=plate_material,
                price=parse_price(v.price),
                sku=v.sku,
                in_stock=True,
            )
        )
    prices = [cv.price for cv in color_variants]
    min_price = min(prices) if prices else None
    image_url = listing.images[0].src if listing.images else None
    source_url = f"https://mechanicalkeyboards.com/products/{listing.handle}"

    return Product(
        canonical_name=listing.title,
	    handle=listing.handle,
        type=product_type,
        brand=listing.vendor,
        product_type_raw=listing.product_type,
        min_price=min_price,
        source_url=source_url,
        image_url=image_url,
        color_variants=color_variants,
        tags=[t.strip() for t in listing.tags.split(",") if t.strip()],
    )