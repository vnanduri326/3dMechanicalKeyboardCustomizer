from fetcher.collection import (
    extract_handles_from_html,
    fetch_collection_page,
    get_all_product_handles,
    get_all_products,
)


def test_extract_handles_from_html_finds_products():
    fake_html = '''
    <div class="mega-menu">
      <a href="/products/unrelated-promo-keyboard">Promo</a>
    </div>
    <ul id="product-grid">
      <li class="collection-product-card">
        <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Evo75</a>
      </li>
      <li class="collection-product-card">
        <a href="/products/ducky-one-x-full-size-inductive-keyboard">Ducky One X</a>
      </li>
    </ul>
    '''
    handles = extract_handles_from_html(fake_html)
    assert "evoworks-evo75-aluminum-hotswap-wireless-keyboard" in handles
    assert "ducky-one-x-full-size-inductive-keyboard" in handles
    assert "unrelated-promo-keyboard" not in handles


def test_extract_handles_dedupes():
    fake_html = '''
    <li class="collection-product-card">
      <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Link 1</a>
      <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Link 2</a>
    </li>
    '''
    handles = extract_handles_from_html(fake_html)
    assert handles.count("evoworks-evo75-aluminum-hotswap-wireless-keyboard") == 1


def test_get_all_product_handles_walks_pages_and_stops_at_empty_page(monkeypatch):
    pages = {
        1: '<li class="collection-product-card"><a href="/products/first"></a></li>',
        2: '''
            <li class="collection-product-card"><a href="/products/first"></a></li>
            <li class="collection-product-card"><a href="/products/second"></a></li>
        ''',
        3: '<ul id="product-grid"></ul>',
    }
    monkeypatch.setattr(
        "fetcher.collection.fetch_collection_page",
        lambda page, collection: pages[page],
    )

    handles = get_all_product_handles("test-collection", max_pages=10)

    assert handles == ["first", "second"]


def test_get_all_products_walks_pages_and_deduplicates_handles(monkeypatch):
    pages = {
        1: [{"handle": "first"}, {"handle": "second"}],
        2: [{"handle": "second"}, {"handle": "third"}],
        3: [],
    }
    monkeypatch.setattr(
        "fetcher.collection.fetch_collection_products_page",
        lambda page, collection: pages[page],
    )

    products = get_all_products("test-collection", max_pages=10)

    assert [product["handle"] for product in products] == ["first", "second", "third"]


def test_fetch_collection_page_returns_html():
    html = fetch_collection_page(page=1)
    assert len(html) > 0
    assert "product" in html.lower()