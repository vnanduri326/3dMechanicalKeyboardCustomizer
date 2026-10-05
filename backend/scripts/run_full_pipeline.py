# backend/scripts/run_full_pipeline.py
from fetcher.collection import get_all_product_handles
from scripts.run_fetch import process_and_store_handle
import time

def run():
    print("Step 1: Getting handles from collection...")
    handles = get_all_product_handles(max_pages=2)  # start small, 2 pages
    print(f"Found {len(handles)} unique handles.\n")

    print("Step 2: Fetching, normalizing, and storing each product...")
    for i, handle in enumerate(handles, start=1):
        print(f"[{i}/{len(handles)}] {handle}")
        process_and_store_handle(handle)
        time.sleep(0.5)  # basic politeness delay between requests

    print("\nDone.")

if __name__ == "__main__":
    run()