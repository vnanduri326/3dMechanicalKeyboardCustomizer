import html
import re
from typing import Any, Iterable

from api.schemas import RecommendationPreferences


_SIZES = {
    "full size": "100%",
    "fullsize": "100%",
    "full-size": "100%",
    "tkl": "80%",
    "tenkeyless": "80%",
}
_SIZE_NUMBERS = ("40", "60", "65", "68", "70", "75", "80", "96", "98", "100")
_KEYCAP_TERMS = (
    "PBT",
    "ABS",
    "Cherry profile",
    "OEM profile",
    "SA profile",
    "DSA profile",
    "XDA profile",
    "MT3 profile",
    "KAT profile",
    "dye-sub",
    "double-shot",
)
_SWITCH_TERMS = ("Linear", "Tactile", "Clicky")
_PLATE_MATERIALS = (
    "FR4",
    "Polypropylene",
    "Polycarbonate",
    "Aluminum",
    "Brass",
    "Carbon fiber",
    "POM",
    "Steel",
    "Copper",
)


def _value(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def _product_text(product: Any) -> str:
    description = str(_value(product, "description", "") or "")
    description = html.unescape(re.sub(r"<[^>]*>", " ", description))
    values = [
        _value(product, "canonical_name", ""),
        _value(product, "product_type_raw", ""),
        description,
        *(_value(product, "tags", []) or []),
    ]
    for variant in _value(product, "color_variants", []) or []:
        values.extend(
            [
                _value(variant, "plate_material", ""),
                _value(variant, "color_name", ""),
            ]
        )
        options = _value(variant, "options", {}) or {}
        values.extend(options.keys())
        values.extend(options.values())
    return " ".join(str(value) for value in values if value)


def _sizes_in(value: str, include_bare_numbers: bool) -> set[str]:
    normalized = _normalized(value)
    sizes = {
        f"{number}%"
        for number in _SIZE_NUMBERS
        if re.search(rf"(?<![a-z0-9]){number}\s*%(?!\+)", value.casefold())
    }
    if include_bare_numbers:
        sizes.update(
            f"{number}%"
            for number in _SIZE_NUMBERS
            if re.search(rf"(?<![a-z0-9]){number}(?![a-z0-9%])", value.casefold())
        )
    for alias, size in _SIZES.items():
        if _normalized(alias) in normalized:
            sizes.add(size)
    return sizes


def _size_values(product: Any) -> set[str]:
    name = str(_value(product, "canonical_name", "") or "")
    name_sizes = _sizes_in(name, include_bare_numbers=True)
    if name_sizes:
        return name_sizes

    product_type = str(_value(product, "product_type_raw", "") or "")
    type_sizes = _sizes_in(product_type, include_bare_numbers=False)
    if type_sizes:
        return type_sizes

    tags = " ".join(_value(product, "tags", []) or [])
    return _sizes_in(tags, include_bare_numbers=True)


def _plate_values(product: Any) -> set[str]:
    plates: set[str] = set()
    description = str(_value(product, "description", "") or "")
    description = html.unescape(re.sub(r"<[^>]*>", " ", description))
    searchable_text = _normalized(
        " ".join(
            [
                description,
                str(_value(product, "canonical_name", "") or ""),
                str(_value(product, "product_type_raw", "") or ""),
                *(_value(product, "tags", []) or []),
            ]
        )
    )
    for material in _PLATE_MATERIALS:
        material_text = _normalized(material)
        if re.search(rf"\b{re.escape(material_text)}\b", searchable_text):
            plates.add(material)

    for variant in _value(product, "color_variants", []) or []:
        material = _value(variant, "plate_material")
        if material:
            plates.add(str(material).strip())
        options = _value(variant, "options", {}) or {}
        for name, option in options.items():
            if "plate" in str(name).casefold() and option:
                plates.add(str(option).strip())
    return {plate for plate in plates if plate}


def _matches_text(product: Any, preference: str) -> bool:
    text = _normalized(_product_text(product))
    normalized_preference = _normalized(preference)
    if normalized_preference in {"linear switches", "tactile switches", "clicky switches", "silent switches"}:
        normalized_preference = normalized_preference.removesuffix(" switches")
    elif normalized_preference == "he magnetic switches":
        return "hall effect" in text or "magnetic" in text or "he switch" in text
    elif normalized_preference == "low profile":
        return "low profile" in text

    return bool(
        normalized_preference
        and f" {normalized_preference} " in f" {text} "
    )


def _matches_plate(product: Any, preference: str) -> bool:
    target = _normalized(preference)
    return any(
        target == _normalized(value)
        or target in _normalized(value)
        or _normalized(value) in target
        for value in _plate_values(product)
    )


def _matches_size(product: Any, preference: str) -> bool:
    normalized = _normalized(preference)
    if normalized == "low profile":
        return _matches_text(product, preference)
    requested = _SIZES.get(normalized, preference.strip())
    if requested.isdigit():
        requested = f"{requested}%"
    return requested in _size_values(product)


def rank_part_recommendations(
    products: Iterable[Any], preferences: RecommendationPreferences
) -> list[tuple[Any, str, int, list[str]]]:
    requested_by_category = {
        "keycap": [("keycap", preferences.keycap)],
        "switch": [("switch", preferences.switch)],
        "pcb_plate": [("plate", preferences.plate), ("size", preferences.size)],
    }
    ranked: dict[str, list[tuple[Any, int, list[str], float]]] = {
        category: [] for category in requested_by_category
    }

    for product in products:
        product_type = str(_value(product, "type", "") or "").casefold()
        category = "keycap" if product_type == "keycaps" else product_type
        if category not in requested_by_category:
            continue

        requested = [
            (name, value.strip())
            for name, value in requested_by_category[category]
            if value and value.strip()
        ]
        if not requested:
            continue

        matches = []
        for name, value in requested:
            matched = {
                "keycap": lambda: _matches_text(product, value),
                "switch": lambda: _matches_text(product, value),
                "plate": lambda: _matches_plate(product, value),
                "size": lambda: _matches_size(product, value),
            }[name]()
            if matched:
                matches.append(f"{name.title()}: {value}")

        if not matches:
            continue

        score = round(100 * len(matches) / len(requested))
        price = _value(product, "min_price")
        ranked[category].append(
            (
                product,
                score,
                matches,
                float(price) if price is not None else float("inf"),
            )
        )

    recommendations = []
    for category, category_rankings in ranked.items():
        category_rankings.sort(
            key=lambda item: (
                -item[1],
                item[3],
                str(_value(item[0], "canonical_name", "")).casefold(),
            )
        )
        if category_rankings:
            product, score, matches, _ = category_rankings[0]
            recommendations.append((product, category, score, matches))
    return recommendations


def get_recommendation_options(products: Iterable[Any]) -> dict[str, list[str]]:
    products = list(products)
    keycaps = [
        product
        for product in products
        if str(_value(product, "type", "") or "").casefold() in {"keycap", "keycaps"}
    ]
    switches = [
        product
        for product in products
        if str(_value(product, "type", "") or "").casefold() == "switch"
    ]
    plate_products = [
        product
        for product in products
        if str(_value(product, "type", "") or "").casefold() == "pcb_plate"
    ]
    keycap_text = _normalized(" ".join(_product_text(product) for product in keycaps))
    switch_text = _normalized(" ".join(_product_text(product) for product in switches))
    keycap_options = [
        value for value in _KEYCAP_TERMS if _normalized(value) in keycap_text
    ]
    switch_options = [
        value for value in _SWITCH_TERMS if _normalized(value) in switch_text
    ]
    plate_options = sorted(
        {plate for product in plate_products for plate in _plate_values(product)},
        key=str.casefold,
    )
    sizes = sorted(
        {size for product in plate_products for size in _size_values(product)},
        key=lambda size: int(size.rstrip("%")),
    )
    return {
        "keycap": keycap_options,
        "switch": switch_options,
        "plate": plate_options,
        "size": sizes,
    }
