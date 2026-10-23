import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Index, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB

from storage.db import Base


class RawPage(Base):
    __tablename__ = "raw_pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False, default="mechanicalkeyboards.com")
    handle = Column(String, nullable=False, index=True)
    raw_json = Column(JSONB, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed = Column(Boolean, default=False, index=True)

    def __init__(self, **kwargs):
        kwargs.setdefault("id", str(uuid.uuid4()))
        kwargs.setdefault("source", "mechanicalkeyboards.com")
        kwargs.setdefault("fetched_at", datetime.now(timezone.utc))
        kwargs.setdefault("processed", False)
        super().__init__(**kwargs)


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    canonical_name = Column(String, nullable=False)
    handle = Column(String, nullable=True, unique=True, index=True)
    min_price = Column(Numeric(10, 2), nullable=True, index=True)
    source_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    type = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    product_type_raw = Column(String, nullable=False)
    color_variants = Column(JSONB, default=list)
    tags = Column(JSONB, default=list)

    __table_args__ = (
        Index("idx_product_brand_type", "brand", "type"),
        Index("idx_product_brand_price", "brand", "min_price"),
    )