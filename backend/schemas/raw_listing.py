from pydantic import BaseModel
from typing import Optional


class Variant(BaseModel):
    id: Optional[int] = None
    title: str
    price: str
    sku: str
    option1: Optional[str] = None
    option2: Optional[str] = None
    barcode: Optional[str] = None
    weight: Optional[float] = None
    image_id: Optional[int] = None


class Option(BaseModel):
    name: str
    values: list[str]


class Image(BaseModel):
    id: Optional[int] = None
    src: str
    variant_ids: list[int] = []


class RawListing(BaseModel):
    """Validated shape of one product's raw JSON from mechanicalkeyboards.com."""
    title: str
    vendor: str
    product_type: str
    tags: str
    variants: list[Variant]
    options: list[Option]
    images: list[Image]
    body_html: Optional[str] = None


if __name__ == "__main__":
    sample = {
        "title": "Evoworks Evo75 Aluminum Hotswap Wireless Keyboard",
        "vendor": "Evoworks",
        "product_type": "75% Keyboards",
        "tags": "75, aluminum, hotswap",
        "variants": [{"title": "Black / FR4", "price": "169.90", "sku": "EVO-EVO75-BKFR4", "option1": "Black", "option2": "FR4"}],
        "options": [{"name": "Color", "values": ["Black", "Purple"]}],
        "images": [{"src": "https://cdn.shopify.com/example.jpg", "variant_ids": []}],
    }
    listing = RawListing(**sample)
    print(listing.title, "validated OK")