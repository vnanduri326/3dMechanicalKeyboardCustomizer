import pytest
from fetcher.product import fetch_product


def test_fetch_product_returns_expected_fields():
    product = fetch_product("evoworks-evo75-aluminum-hotswap-wireless-keyboard")
    assert "title" in product
    assert "vendor" in product
    assert "variants" in product
    assert isinstance(product["variants"], list)
    assert len(product["variants"]) > 0


def test_fetch_product_variant_has_required_fields():
    product = fetch_product("evoworks-evo75-aluminum-hotswap-wireless-keyboard")
    variant = product["variants"][0]
    assert "price" in variant
    assert "sku" in variant
    assert "option1" in variant


def test_fetch_product_raises_on_invalid_handle():
    with pytest.raises(Exception):
        fetch_product("this-handle-definitely-does-not-exist-12345")