from io import BytesIO

from PIL import Image

from fetcher.color_sample import sample_hex_from_bytes, sample_hex_from_url
from schemas.product import find_variant_image, hex_for_variant, normalize_listing
from schemas.raw_listing import Image as ListingImage
from schemas.raw_listing import RawListing, Variant


def _png(color: tuple[int, int, int]) -> bytes:
    image = Image.new("RGB", (20, 20), color)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _listing(**overrides) -> RawListing:
    raw = {
        "title": "Test Keyboard",
        "vendor": "TestBrand",
        "product_type": "75% Keyboards",
        "tags": "keyboard",
        "variants": [
            {
                "id": 10,
                "title": "Black / FR4",
                "price": "169.90",
                "sku": "SKU-1",
                "option1": "Black",
                "option2": "FR4",
                "image_id": 100,
            }
        ],
        "options": [{"name": "Color", "values": ["Black"]}],
        "images": [
            {"id": 100, "src": "https://cdn.example.com/black.jpg", "variant_ids": [10]}
        ],
    }
    raw.update(overrides)
    return RawListing(**raw)


def test_sample_hex_from_bytes_uses_center_color():
    assert sample_hex_from_bytes(_png((10, 20, 30))) == "#0a141e"


def test_sample_hex_from_bytes_ignores_white_border():
    image = Image.new("RGB", (20, 20), (255, 255, 255))
    for x in range(6, 14):
        for y in range(6, 14):
            image.putpixel((x, y), (200, 10, 10))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    assert sample_hex_from_bytes(buffer.getvalue()) == "#c80a0a"


def test_find_variant_image_by_image_id():
    listing = _listing()
    found = find_variant_image(listing.variants[0], listing.images)
    assert found is not None
    src = found["src"] if isinstance(found, dict) else found.src
    assert str(src).endswith("black.jpg")


def test_find_variant_image_by_variant_ids_when_image_id_missing():
    variant = Variant(id=10, title="Black", price="10.00", sku="SKU", option1="Black")
    images = [ListingImage(id=5, src="https://cdn.example.com/a.jpg", variant_ids=[10])]
    found = find_variant_image(variant, images)
    assert found is not None
    assert found.id == 5


def test_find_variant_image_returns_none_when_unlinked():
    variant = Variant(id=99, title="Black", price="10.00", sku="SKU", option1="Black")
    images = [ListingImage(id=5, src="https://cdn.example.com/a.jpg", variant_ids=[10])]
    assert find_variant_image(variant, images) is None


def test_normalize_listing_uses_sampled_hex(monkeypatch):
    monkeypatch.setattr(
        "schemas.product.sample_hex_from_url",
        lambda url: "#112233",
    )
    product = normalize_listing(_listing())
    assert product.color_variants[0].color_hex == "#112233"


def test_normalize_listing_falls_back_to_map_without_image(monkeypatch):
    def fail_if_called(url):
        raise AssertionError(url)

    monkeypatch.setattr("schemas.product.sample_hex_from_url", fail_if_called)
    listing = _listing(
        variants=[
            {"title": "Black", "price": "10.00", "sku": "SKU", "option1": "Black"}
        ],
        images=[],
    )
    product = normalize_listing(listing)
    assert product.color_variants[0].color_hex == "#1a1a1a"


def test_hex_for_variant_returns_none_for_unknown_unlinked_color():
    variant = Variant(title="Mystery", price="10.00", sku="SKU", option1="Mystery Finish")
    assert hex_for_variant("Mystery Finish", variant, []) is None


def test_sample_hex_from_url_caches(monkeypatch):
    calls = {"n": 0}

    def fake_get(url, timeout, follow_redirects):
        calls["n"] += 1

        class Response:
            content = _png((1, 2, 3))

            def raise_for_status(self):
                return None

        return Response()

    monkeypatch.setattr("fetcher.color_sample.httpx.get", fake_get)
    monkeypatch.setattr("fetcher.color_sample._HEX_CACHE", {})
    first = sample_hex_from_url("https://cdn.example.com/once.png")
    second = sample_hex_from_url("https://cdn.example.com/once.png")
    assert first == second == "#010203"
    assert calls["n"] == 1
