from typing import Optional

from pydantic import BaseModel

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
    "Pink": "#FFC0Cb",
    "Red": "#FF0000",
    "Warm Silver": "#D7D0C6",
    "Dark Green": "#006400",
    "Slate Blue": "#6A5ACD",
    "Soy": "#6A6051",
    "Taupe Grey": "#8B8589",
    "Aquamarine": "#7FFFD4",
    "Blush Pink": "#DE5D83",
    "Carbon Black": "#0C0A00",
    "Classic Black": "#000000",
    "Dusty Rose": "#C9A6A6",
    "First Light": "#EFE2DE",
    "Gunmetal Grey": "#818589",
    "Nebula": "#CBDBD6",
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
    price: float
    sku: str
    in_stock: bool = True
    options: dict[str, str] = {}  # every option on this variant, by its real name


class Product(BaseModel):
    canonical_name: str
    handle: Optional[str] = None
    min_price: Optional[float] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    type: str  # "keyboard" | "switch" | "keycap" | "other"
    brand: str
    product_type_raw: str
    color_variants: list[ColorVariant] = []
    tags: list[str] = []

COLOR_KEYWORDS: list[tuple[str, str]] = [
    ("dark grey", "#4a4a4a"),
    ("ice blue", "#a8c6d8"),
    ("light pink", "#f4c2d7"),
    ("sand gold", "#c9a869"),
    ("black", "#1a1a1a"),
    ("white", "#f5f5f5"),
    ("grey", "#808080"),
    ("gray", "#808080"),
    ("silver", "#c0c0c0"),
    ("gold", "#c9a869"),
    ("pink", "#f4c2d7"),
    ("purple", "#8b5a9f"),
    ("blue", "#3b6ea5"),
    ("green", "#3d8b6e"),
    ("red", "#c41e3a"),
    ("yellow", "#ffd700"),
    ("orange", "#ff8c00"),
    ("navy", "#000080"),
    ("teal", "#008080"),
]


def resolve_color_hex(color_name: str) -> Optional[str]:
    if not color_name or color_name == "N/A":
        return None
    exact = COLOR_HEX_MAP.get(color_name)
    if exact:
        return exact
    lowered = color_name.lower()
    for keyword, hex_code in COLOR_KEYWORDS:
        if keyword in lowered:
            return hex_code
    return None


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


def parse_price(raw) -> float:
    """Convert price strings like '1,299.00' or '$18.00' into a float."""
    cleaned = str(raw).replace(",", "").replace("$", "").strip()
    return float(cleaned)


def _get(obj, key, default=None):
    """Read a key from a dict, or an attribute from an object."""
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def normalize_listing(listing: RawListing) -> Product:
    lowered_type = listing.product_type.lower()
    if "keyboard" in lowered_type:
        product_type = "keyboard"
    elif "switch" in lowered_type:
        product_type = "switch"
    elif "keycap" in lowered_type:
        product_type = "keycap"
    else:
        product_type = "other"

    option_names = [str(_get(o, "name", "")) for o in (listing.options or [])]

    color_variants: list[ColorVariant] = []
    for v in listing.variants or []:
        price_raw = _get(v, "price")
        if price_raw in (None, ""):
            continue  # a variant with no price can't be listed

        values = [_get(v, "option1"), _get(v, "option2"), _get(v, "option3")]
        opts = {
            name: str(value)
            for name, value in zip(option_names, values)
            if value not in (None, "", "Default Title")
        }
        color_name = next(
            (val for name, val in opts.items() if name.lower() in ("color", "colour")),
            None,
        )
        plate_material = next(
            (val for name, val in opts.items() if "plate" in name.lower()),
            None,
        )

        color_variants.append(
            ColorVariant(
                color_name=color_name or "N/A",
                color_hex=hex_for_variant(color_name, v, listing.images) if color_name else None,
                plate_material=plate_material,
                price=parse_price(price_raw),
                sku=str(_get(v, "sku", "") or ""),
                in_stock=bool(_get(v, "available", True)),
                options=opts,
            )
        )

    prices = [cv.price for cv in color_variants]
    min_price = min(prices) if prices else None

    images = listing.images or []
    image_url = _get(images[0], "src") if images else None

    source_url = (
        f"https://mechanicalkeyboards.com/products/{listing.handle}"
        if listing.handle
        else None
    )

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
        tags=listing.tags,
    )