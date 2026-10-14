from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from storage.db import get_db
from storage.models import Product

router = APIRouter()


class FilterOption(BaseModel):
    value: str
    count: int


class FiltersOut(BaseModel):
    types: list[FilterOption]
    brands: list[FilterOption]


@router.get("/filters", response_model=FiltersOut)
def get_filters(db: Session = Depends(get_db)):
    # "Count how many products have each type" -> one row per type
    type_rows = (
        db.query(Product.type, func.count(Product.id))
        .group_by(Product.type)
        .order_by(Product.type)
        .all()
    )
    brand_rows = (
    )
    pass