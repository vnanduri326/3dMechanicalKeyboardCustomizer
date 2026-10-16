# backend/scripts/run_full_pipeline.py
import sys
import time
from fetcher.collection import get_all_product_handles
from scripts.run_fetch import process_and_store_handle

def run(collection: str = "mechanical-keyboards", max_pages: int = 2):
    print(f"Step 1: Getting handles from collection '{collection}'...")
    handles = get_all_product_handles(collection=collection, max_pages=max_pages)
    print(f"Found {len(handles)} unique handles.\n")

    print("Step 2: Fetching, normalizing, and storing each product...")
    for i, handle in enumerate(handles, start=1):
        print(f"[{i}/{len(handles)}] {handle}")
        process_and_store_handle(handle)
        time.sleep(0.5)

    print(f"\nDone processing '{collection}'.")

if __name__ == "__main__":
    target_collection = sys.argv[1] if len(sys.argv) > 1 else "mechanical-keyboards"
    run(collection=target_collection, max_pages=2)