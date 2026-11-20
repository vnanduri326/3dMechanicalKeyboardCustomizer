# backend/scripts/run_full_pipeline.py
import sys
import time
from fetcher.collection import get_all_products
from scripts.run_fetch import process_and_store_handle

def run(collection: str = "mechanical-keyboards", max_pages: int = 1):
    print(f"Step 1: Getting products from collection '{collection}'...")
    products = get_all_products(collection=collection, max_pages=max_pages)
    print(f"Found {len(products)} unique products.\n")

    print("Step 2: Normalizing and storing each product...")
    for i, product in enumerate(products, start=1):
        handle = product["handle"]
        print(f"[{i}/{len(products)}] {handle}")
        process_and_store_handle(handle, product_data=product)
        time.sleep(0.5)

    print(f"\nDone processing '{collection}'.")

if __name__ == "__main__":
    target_collection = sys.argv[1] if len(sys.argv) > 1 else "mechanical-keyboards"
    target_max_pages = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    run(collection=target_collection, max_pages=target_max_pages)