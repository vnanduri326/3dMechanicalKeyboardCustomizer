from scripts.run_full_pipeline import run


def test_run_defaults_to_one_collection_page(monkeypatch):
    calls = []

    def fake_get_all_product_handles(collection, max_pages):
        calls.append((collection, max_pages))
        return []

    monkeypatch.setattr(
        "scripts.run_full_pipeline.get_all_product_handles",
        fake_get_all_product_handles,
    )

    run(collection="sa-profile-keycaps")

    assert calls == [("sa-profile-keycaps", 1)]
