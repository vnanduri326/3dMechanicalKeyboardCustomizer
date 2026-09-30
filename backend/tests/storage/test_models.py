from storage.models import RawPage


def test_raw_page_creation():
    page = RawPage(
        handle="evoworks-evo75-aluminum-hotswap-wireless-keyboard",
        raw_json={"title": "Test Keyboard"},
    )
    assert page.source == "mechanicalkeyboards.com"
    assert page.processed is False
    assert page.raw_json["title"] == "Test Keyboard"