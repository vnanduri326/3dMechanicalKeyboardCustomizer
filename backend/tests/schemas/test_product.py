from schemas.product import resolve_color_hex, ColorVariant, Product


def test_resolve_color_hex_known_color():
    assert resolve_color_hex("Black") == "#1a1a1a"


def test_resolve_color_hex_unknown_color_returns_none():
    assert resolve_color_hex("Some Made Up Color") is None


def test_resolve_color_hex_matches_keyword_inside_name():
    assert resolve_color_hex("Midnight Navy") == "#000080"


def test_color_variant_creation():
    variant = ColorVariant(
        color_name="Ice Blue",
        color_hex="#a8c6d8",
        plate_material="FR4",
        price=169.90,
        sku="EVO-EVO75-BUFR4",
    )
    assert variant.in_stock is True


def test_product_creation_with_variants():
    product = Product(
        canonical_name="Evoworks Evo75",
        handle="evoworks-evo75",
        source_url="https://mechanicalkeyboards.com/products/evoworks-evo75",
        type="keyboard",
        brand="Evoworks",
        product_type_raw="75% Keyboards",
        color_variants=[
            ColorVariant(color_name="Black", price=169.90, sku="EVO-EVO75-BKFR4"),
        ],
    )
    assert len(product.color_variants) == 1
    assert product.type == "keyboard"