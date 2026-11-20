from types import SimpleNamespace

from scripts import run_fetch
from storage.models import Product as DBProduct, RawPage


class FakeSession:
    def __init__(self, raw_page):
        self.raw_page = raw_page
        self.merged = []
        self.closed = False

    def get(self, model, key):
        assert model is RawPage
        assert key == "mechanicalkeyboards.com:test-handle"
        return self.raw_page

    def merge(self, value):
        self.merged.append(value)

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        self.closed = True


def test_process_and_store_skips_already_processed_product(monkeypatch):
    session = FakeSession(SimpleNamespace(processed=True, raw_json={}))
    monkeypatch.setattr(run_fetch, "SessionLocal", lambda: session)
    monkeypatch.setattr(
        run_fetch,
        "fetch_product",
        lambda handle: (_ for _ in ()).throw(AssertionError("unexpected refetch")),
    )

    run_fetch.process_and_store_handle("test-handle")

    assert session.merged == []
    assert session.closed


def test_process_and_store_reuses_unprocessed_saved_raw_data(monkeypatch):
    raw_json = {
        "title": "Test Keycaps",
        "vendor": "Test",
        "product_type": "Keycaps",
    }
    session = FakeSession(SimpleNamespace(processed=False, raw_json=raw_json))
    normalized = SimpleNamespace(
        canonical_name="Test Keycaps",
        handle="test-handle",
        source_url="https://mechanicalkeyboards.com/products/test-handle",
        image_url=None,
        min_price=None,
        type="keycap",
        brand="Test",
        product_type_raw="Keycaps",
        description=None,
        color_variants=[],
        tags=[],
    )
    monkeypatch.setattr(run_fetch, "SessionLocal", lambda: session)
    monkeypatch.setattr(
        run_fetch,
        "fetch_product",
        lambda handle: (_ for _ in ()).throw(AssertionError("unexpected refetch")),
    )
    monkeypatch.setattr(run_fetch, "normalize_listing", lambda listing: normalized)

    run_fetch.process_and_store_handle("test-handle")

    assert any(isinstance(value, DBProduct) for value in session.merged)
    saved_raw_page = next(
        value for value in session.merged if isinstance(value, RawPage) and value.processed
    )
    assert saved_raw_page.processed
    assert session.closed


def test_process_and_store_uses_collection_product_data(monkeypatch):
    product_data = {
        "title": "Test Plate",
        "vendor": "Test",
        "product_type": "Plates",
        "handle": "test-handle",
    }
    session = FakeSession(None)
    normalized = SimpleNamespace(
        canonical_name="Test Plate",
        handle="test-handle",
        source_url="https://mechanicalkeyboards.com/products/test-handle",
        image_url=None,
        min_price=None,
        type="pcb_plate",
        brand="Test",
        product_type_raw="Plates",
        description=None,
        color_variants=[],
        tags=[],
    )
    monkeypatch.setattr(run_fetch, "SessionLocal", lambda: session)
    monkeypatch.setattr(
        run_fetch,
        "fetch_product",
        lambda handle: (_ for _ in ()).throw(AssertionError("unexpected product request")),
    )
    monkeypatch.setattr(run_fetch, "normalize_listing", lambda listing: normalized)

    run_fetch.process_and_store_handle("test-handle", product_data=product_data)

    saved_raw_page = next(
        value for value in session.merged if isinstance(value, RawPage) and value.processed
    )
    assert saved_raw_page.raw_json == product_data
    assert saved_raw_page.processed
    assert any(isinstance(value, DBProduct) for value in session.merged)
    assert session.closed
