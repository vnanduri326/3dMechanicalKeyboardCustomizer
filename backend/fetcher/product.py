import httpx
from fetcher.retry import fetch_retry

BASE_URL = "https://mechanicalkeyboards.com"


@fetch_retry
def fetch_product(handle: str) -> dict:
    """
    Fetches a single product's structured JSON from mechanicalkeyboards.com.
    `handle` is the URL slug, e.g. "evoworks-evo75-aluminum-hotswap-wireless-keyboard"
    """
    url = f"{BASE_URL}/products/{handle}.json"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.json()["product"]


if __name__ == "__main__":
    product = fetch_product("evoworks-evo75-aluminum-hotswap-wireless-keyboard")
    print(product["title"])
    print(f"{len(product['variants'])} variants")