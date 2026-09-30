from fetcher.collection import extract_handles_from_html, fetch_collection_page


def test_extract_handles_from_html_finds_products():
    fake_html = '''
    <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Evo75</a>
    <a href="/products/ducky-one-x-full-size-inductive-keyboard">Ducky One X</a>
    '''
    handles = extract_handles_from_html(fake_html)
    assert "evoworks-evo75-aluminum-hotswap-wireless-keyboard" in handles
    assert "ducky-one-x-full-size-inductive-keyboard" in handles


def test_extract_handles_dedupes():
    fake_html = '''
    <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Link 1</a>
    <a href="/products/evoworks-evo75-aluminum-hotswap-wireless-keyboard">Link 2</a>
    '''
    handles = extract_handles_from_html(fake_html)
    assert handles.count("evoworks-evo75-aluminum-hotswap-wireless-keyboard") == 1


def test_fetch_collection_page_returns_html():
    html = fetch_collection_page(page=1)
    assert len(html) > 0
    assert "product" in html.lower()