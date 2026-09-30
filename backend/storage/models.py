from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import uuid
from storage.db import Base


class RawPage(Base):
    __tablename__ = "raw_pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False, default="mechanicalkeyboards.com")
    handle = Column(String, nullable=False)
    raw_json = Column(JSONB, nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)