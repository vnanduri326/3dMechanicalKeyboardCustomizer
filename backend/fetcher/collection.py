# fetcher/collection.py
import httpx
import re
from fetcher.retry import fetch_retry

BASE_URL = "https://mechanicalkeyboards.com"

@fetch_retry
def fetch_collection_page(page: int, collection: str = "mechanical-keyboards") -> str:
    """Fetches one page of the specified collection as HTML."""
    url = f"{BASE_URL}/collections/{collection}?page={page}"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text


def extract_handles_from_html(html: str) -> list[str]:
    """Pulls product handles out of collection page HTML (/products/{handle} links)."""
    matches = re.findall(r'/products/([a-z0-9\-]+)', html)
    return list(dict.fromkeys(matches))


def get_all_product_handles(collection: str = "mechanical-keyboards", max_pages: int = 2) -> list[str]:
    """Walks pages of the target collection, collects all unique product handles."""
    all_handles = []
    for page in range(1, max_pages + 1):
        html = fetch_collection_page(page, collection=collection)
        handles = extract_handles_from_html(html)
        if not handles:
            break
        all_handles.extend(handles)
        print(f"[{collection}] Page {page}: found {len(handles)} handles")
    return list(dict.fromkeys(all_handles))