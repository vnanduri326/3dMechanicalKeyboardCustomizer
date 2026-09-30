import httpx
import re
from fetcher.retry import fetch_retry

BASE_URL = "https://mechanicalkeyboards.com"
COLLECTION = "mechanical-keyboards"  # scope to a specific collection as the team decides


@fetch_retry
def fetch_collection_page(page: int) -> str:
    """Fetches one page of the collection as HTML."""
    url = f"{BASE_URL}/collections/{COLLECTION}?page={page}"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text


def extract_handles_from_html(html: str) -> list[str]:
    """Pulls product handles out of collection page HTML (/products/{handle} links)."""
    matches = re.findall(r'/products/([a-z0-9\-]+)', html)
    return list(dict.fromkeys(matches))  # dedupe, preserve order


def get_all_product_handles(max_pages: int = 46) -> list[str]:
    """Walks every page of the collection, collects all unique product handles."""
    all_handles = []
    for page in range(1, max_pages + 1):
        html = fetch_collection_page(page)
        handles = extract_handles_from_html(html)
        if not handles:
            break
        all_handles.extend(handles)
        print(f"Page {page}: found {len(handles)} handles")
    return list(dict.fromkeys(all_handles))


if __name__ == "__main__":
    handles = get_all_product_handles(max_pages=2)  # test small first
    print(f"Total unique handles: {len(handles)}")
    print(handles[:5])