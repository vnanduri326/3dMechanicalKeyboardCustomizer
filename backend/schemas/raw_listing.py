from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RawListing(BaseModel):
    title: str
    handle: Optional[str] = None
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