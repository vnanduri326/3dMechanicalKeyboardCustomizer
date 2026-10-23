from io import BytesIO

import httpx
from PIL import Image

# Successful samples only. A failed download is not cached so a later run can retry.
_HEX_CACHE: dict[str, str] = {}

NEAR_WHITE = 240
NEAR_BLACK = 15


def sample_hex_from_bytes(data: bytes) -> str | None:
    """Average the center of an image, skipping near-white and near-black pixels."""
    image = Image.open(BytesIO(data)).convert("RGB")
    width, height = image.size
    if width == 0 or height == 0:
        return None

    left = int(width * 0.3)
    top = int(height * 0.3)
    right = max(int(width * 0.7), left + 1)
    bottom = max(int(height * 0.7), top + 1)
    pixels = list(image.crop((left, top, right, bottom)).get_flattened_data())
    usable = [pixel for pixel in pixels if not _is_extreme(pixel)]
    chosen = usable or pixels
    if not chosen:
        return None

    count = len(chosen)
    red = sum(pixel[0] for pixel in chosen) // count
    green = sum(pixel[1] for pixel in chosen) // count
    blue = sum(pixel[2] for pixel in chosen) // count
    return f"#{red:02x}{green:02x}{blue:02x}"


def sample_hex_from_url(url: str) -> str | None:
    """Download an image URL and return a sampled hex. Reuses a previous sample for the same URL."""
    cached = _HEX_CACHE.get(url)
    if cached is not None:
        return cached
    try:
        response = httpx.get(url, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
        sampled = sample_hex_from_bytes(response.content)
    except Exception:
        return None
    if sampled is not None:
        _HEX_CACHE[url] = sampled
    return sampled


def _is_extreme(pixel: tuple[int, int, int]) -> bool:
    return all(channel >= NEAR_WHITE for channel in pixel) or all(
        channel <= NEAR_BLACK for channel in pixel
    )
