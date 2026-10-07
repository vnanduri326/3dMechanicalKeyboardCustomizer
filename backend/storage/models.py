from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
import uuid
from storage.db import Base


class RawPage(Base):
    __tablename__ = "raw_pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False, default="mechanicalkeyboards.com")
    handle = Column(String, nullable=False)
    raw_json = Column(JSONB, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed = Column(Boolean, default=False)

    def __init__(self, **kwargs):
        kwargs.setdefault("id", str(uuid.uuid4()))
        kwargs.setdefault("source", "mechanicalkeyboards.com")
        kwargs.setdefault("fetched_at", datetime.now(timezone.utc))
        kwargs.setdefault("processed", False)
        super().__init__(**kwargs)

class ColorVariant(Base):
    __tablename__ = "color_variants"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    color_name = Column(String, nullable=False)
    color_hex = Column(String, nullable=True)
    plate_material = Column(String, nullable=True)
    price = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    in_stock = Column(Boolean, default=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    canonical_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    product_type_raw = Column(String, nullable=False)
    color_variants = Column(JSONB, default=list)
    tags = Column(JSONB, default=list)