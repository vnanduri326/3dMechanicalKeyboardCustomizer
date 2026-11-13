from types import SimpleNamespace

from fastapi.testclient import TestClient

from api.recommendations import get_recommendation_options, rank_part_recommendations
from api.main import app
from api.schemas import RecommendationPreferences
from storage.db import get_db


def test_part_recommendations_choose_best_product_per_matching_category():
    keycaps = SimpleNamespace(
        type="keycap",
        canonical_name="Cherry Profile PBT Keycaps",
        product_type_raw="Cherry Profile Keycaps",
        description="",
        tags=[],
        color_variants=[],
        min_price=60,
    )
    switches = SimpleNamespace(
        type="switch",
        canonical_name="Linear Switches",
        product_type_raw="Linear Switches",
        description="",
        tags=[],
        color_variants=[],
        min_price=25,
    )
    plate = SimpleNamespace(
        type="pcb_plate",
        canonical_name="75% FR4 Plate",
        product_type_raw="Keyboard Plates",
        description="",
        tags=["75"],
        color_variants=[],
        min_price=30,
    )
    keyboard = SimpleNamespace(
        type="keyboard",
        canonical_name="75% Cherry Linear Keyboard",
        product_type_raw="Keyboard",
        description="Cherry keycaps and linear switches",
        tags=["75"],
        color_variants=[],
        min_price=100,
    )

    ranked = rank_part_recommendations(
        [keyboard, keycaps, switches, plate],
        RecommendationPreferences(
            keycap="Cherry Profile",
            switch="Linear Switches",
            plate="FR4",
            size="75%",
        ),
    )

    assert [(category, product.canonical_name, score) for product, category, score, _ in ranked] == [
        ("keycap", "Cherry Profile PBT Keycaps", 100),
        ("switch", "Linear Switches", 100),
        ("pcb_plate", "75% FR4 Plate", 100),
    ]


def test_switch_recommendation_matches_switch_product_description():
    switch = SimpleNamespace(
        type="switch",
        canonical_name="Compact Switch",
        product_type_raw="Switches",
        description="Hot-swappable linear switches.",
        tags=[],
        color_variants=[],
        min_price=100,
    )

    ranked = rank_part_recommendations(
        [switch],
        RecommendationPreferences(switch="Linear Switches"),
    )

    assert ranked[0][1] == "switch"
    assert ranked[0][2] == 100
    assert ranked[0][3] == ["Switch: Linear Switches"]


def test_60_percent_plus_product_type_does_not_match_exact_60_percent():
    plate = SimpleNamespace(
        type="pcb_plate",
        canonical_name="Compact Plate / 60%+",
        product_type_raw="Compact Plates / 60%+",
        description="",
        tags=["60%+"],
        color_variants=[],
        min_price=25,
    )

    ranked = rank_part_recommendations(
        [plate],
        RecommendationPreferences(size="60%"),
    )

    assert ranked == []


def test_recommendation_options_use_product_details_and_variants():
    keycaps = SimpleNamespace(
        type="keycap",
        canonical_name="PBT Keycaps",
        product_type_raw="Cherry Profile Keycaps",
        description="",
        tags=[],
        color_variants=[],
    )
    switches = SimpleNamespace(
        type="switch",
        canonical_name="Tactile Switches",
        product_type_raw="Tactile Switches",
        description="",
        tags=[],
        color_variants=[],
    )
    plate = SimpleNamespace(
        type="pcb_plate",
        canonical_name="75% FR4 Plate",
        product_type_raw="Keyboard Plate",
        description="",
        tags=["75"],
        color_variants=[
            {
                "color_name": "N/A",
                "plate_material": "FR4",
                "price": 180,
                "sku": "STUDIO-75-FR4",
                "options": {},
            }
        ],
    )

    keyboard = SimpleNamespace(
        type="keyboard",
        canonical_name="Unrelated Keyboard",
        product_type_raw="100% Keyboard",
        description="ABS keycaps with clicky switches and brass plate.",
        tags=["100"],
        color_variants=[],
    )
    options = get_recommendation_options([keyboard, keycaps, switches, plate])

    assert "PBT" in options["keycap"]
    assert "Tactile" in options["switch"]
    assert "ABS" not in options["keycap"]
    assert "Clicky" not in options["switch"]
    assert options["plate"] == ["FR4"]
    assert options["size"] == ["75%"]


def test_recommendation_endpoint_returns_closest_part_per_category():
    keyboard = SimpleNamespace(
        id="prod:studio-75",
        canonical_name="Studio 75 Keyboard",
        handle="studio-75",
        type="keyboard",
        brand="Studio",
        product_type_raw="75% Keyboards",
        min_price=180,
        source_url="https://example.com/studio-75",
        image_url=None,
        description="Includes PBT keycaps and linear switches.",
        tags=["75", "keyboard"],
        color_variants=[
            {
                "color_name": "N/A",
                "plate_material": "FR4",
                "price": 180,
                "sku": "STUDIO-75-FR4",
                "options": {},
            }
        ],
    )
    keycap = SimpleNamespace(
        id="prod:cherry-keycaps",
        canonical_name="Cherry Profile Keycaps",
        handle="cherry-keycaps",
        type="keycap",
        brand="Studio",
        product_type_raw="Cherry Profile Keycaps",
        min_price=50,
        source_url="https://example.com/cherry-keycaps",
        image_url=None,
        description="PBT keycap set",
        tags=[],
        color_variants=[],
    )
    switch = SimpleNamespace(
        id="prod:linear-switches",
        canonical_name="Linear Switches",
        handle="linear-switches",
        type="switch",
        brand="Studio",
        product_type_raw="Linear Switches",
        min_price=20,
        source_url="https://example.com/linear-switches",
        image_url=None,
        description="",
        tags=[],
        color_variants=[],
    )
    plate = SimpleNamespace(
        id="prod:75-fr4-plate",
        canonical_name="75% FR4 Plate",
        handle="75-fr4-plate",
        type="pcb_plate",
        brand="Studio",
        product_type_raw="Keyboard Plate",
        min_price=30,
        source_url="https://example.com/75-fr4-plate",
        image_url=None,
        description="",
        tags=["75"],
        color_variants=[
            {
                "color_name": "N/A",
                "plate_material": "FR4",
                "price": 30,
                "sku": "PLATE-75-FR4",
                "options": {},
            }
        ],
    )

    class QueryStub:
        def filter(self, *_conditions):
            return self

        def all(self):
            return [keyboard, keycap, switch, plate]

    class SessionStub:
        def query(self, _model):
            return QueryStub()

    app.dependency_overrides[get_db] = lambda: SessionStub()
    try:
        response = TestClient(app).post(
            "/api/recommendations",
            json={
                "keycap": "Cherry Profile",
                "switch": "Linear Switches",
                "plate": "FR4",
                "size": "75%",
            },
        )
    finally:
        app.dependency_overrides.pop(get_db)

    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 3
    assert [(item["category"], item["id"], item["score"]) for item in result["items"]] == [
        ("keycap", "prod:cherry-keycaps", 100),
        ("switch", "prod:linear-switches", 100),
        ("pcb_plate", "prod:75-fr4-plate", 100),
    ]
