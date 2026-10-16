from fetcher.collection import get_all_product_handles

handles = get_all_product_handles(max_pages=3)
print(f"Got {len(handles)} real handles")

for h in handles:
    print(h)