from pydantic import BaseModel, Field, field_validator
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
    handle: str = ""
    vendor: str
    product_type: str
    tags: list[str] = Field(default_factory=list)
    variants: list[dict] = Field(default_factory=list)
    images: list[dict] = Field(default_factory=list)
    options: list[dict] = Field(default_factory=list)
    body_html: Optional[str] = None

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []