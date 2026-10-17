from typing import Optional

from pydantic import BaseModel

from schemas.raw_listing import RawListing

COLOR_HEX_MAP: dict[str, str] = {
    "Black": "#1a1a1a",
    "Dark Grey": "#4a4a4a",
    "Grey": "#808080",
    "White": "#f5f5f5",
    "Purple": "#8b5a9f",
    "Tyrian Purple": "#8b5a9f",
    "Ice Blue": "#a8c6d8",
    "Light Pink": "#f4c2d7",
    "Charcoal": "#36454F",
    "Snow": "#FFFAFA",
    "Silver": "#C0C0C0",
    "Blue": "#0000FF",
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


def resolve_color_hex(color_name: str) -> Optional[str]:
    if not color_name or color_name == "N/A":
        return None
    return COLOR_HEX_MAP.get(color_name)


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
                color_hex=resolve_color_hex(color_name) if color_name else None,
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