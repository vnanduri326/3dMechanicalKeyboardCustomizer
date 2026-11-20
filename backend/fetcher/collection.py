# fetcher/collection.py
import re
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx

from fetcher.retry import fetch_retry

BASE_URL = "https://mechanicalkeyboards.com"


class _CollectionProductParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.handles: list[str] = []
        self._product_card_depth = 0
        self._list_item_stack: list[bool] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "li":
            is_product_card = "collection-product-card" in (attributes.get("class") or "").split()
            self._list_item_stack.append(is_product_card)
            if is_product_card:
                self._product_card_depth += 1

        if tag == "a" and self._product_card_depth:
            path = urlparse(attributes.get("href") or "").path
            match = re.fullmatch(r"/products/([a-z0-9-]+)/?", path)
            if match:
                self.handles.append(match.group(1))

    def handle_endtag(self, tag: str) -> None:
        if tag == "li" and self._list_item_stack:
            if self._list_item_stack.pop():
                self._product_card_depth -= 1


@fetch_retry
def fetch_collection_page(page: int, collection: str = "mechanical-keyboards") -> str:
    """Fetches one page of the specified collection as HTML."""
    url = f"{BASE_URL}/collections/{collection}?page={page}"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text


@fetch_retry
def fetch_collection_products_page(
    page: int, collection: str = "mechanical-keyboards"
) -> list[dict]:
    """Fetches one page of structured products from a Shopify collection."""
    url = f"{BASE_URL}/collections/{collection}/products.json"
    response = httpx.get(url, params={"limit": 250, "page": page}, timeout=10.0)
    response.raise_for_status()
    products = response.json().get("products")
    if not isinstance(products, list):
        raise ValueError(f"Collection {collection!r} did not return a product list")
    return products


def extract_handles_from_html(html: str) -> list[str]:
    """Pull product handles only from product cards in a collection page."""
    parser = _CollectionProductParser()
    parser.feed(html)
    return list(dict.fromkeys(parser.handles))


def get_all_product_handles(collection: str = "mechanical-keyboards", max_pages: int = 100) -> list[str]:
    """Walks pages of the target collection, collects all unique product handles."""
    all_handles = []
    seen_handles = set()
    for page in range(1, max_pages + 1):
        html = fetch_collection_page(page, collection=collection)
        handles = extract_handles_from_html(html)
        new_handles = [handle for handle in handles if handle not in seen_handles]
        if not new_handles:
            break
        all_handles.extend(new_handles)
        seen_handles.update(new_handles)
        print(f"[{collection}] Page {page}: found {len(new_handles)} new handles")
    return all_handles


def get_all_products(
    collection: str = "mechanical-keyboards", max_pages: int = 100
) -> list[dict]:
    """Walks collection pages and returns unique structured product records."""
    all_products: list[dict] = []
    seen_handles: set[str] = set()
    for page in range(1, max_pages + 1):
        products = fetch_collection_products_page(page, collection=collection)
        new_products = []
        for product in products:
            handle = product.get("handle")
            if not handle:
                raise ValueError(f"Collection {collection!r} returned a product without a handle")
            if handle not in seen_handles:
                new_products.append(product)
                seen_handles.add(handle)
        if not new_products:
            break
        all_products.extend(new_products)
        print(f"[{collection}] Page {page}: found {len(new_products)} new products")
    return all_products