import httpx
import pytest

from fetcher.retry import fetch_retry


def test_http_429_waits_for_retry_after_then_retries_once(monkeypatch):
    request = httpx.Request("GET", "https://example.com/product.json")
    response = httpx.Response(429, headers={"Retry-After": "60"}, request=request)
    calls = 0

    monkeypatch.setattr("tenacity.nap.time.sleep", lambda _: None)

    @fetch_retry
    def fetch():
        nonlocal calls
        calls += 1
        if calls == 1:
            raise httpx.HTTPStatusError("rate limited", request=request, response=response)
        return "ok"

    assert fetch() == "ok"
    assert calls == 2


def test_http_429_stops_after_one_retry(monkeypatch):
    request = httpx.Request("GET", "https://example.com/product.json")
    response = httpx.Response(429, headers={"Retry-After": "60"}, request=request)
    calls = 0

    monkeypatch.setattr("tenacity.nap.time.sleep", lambda _: None)

    @fetch_retry
    def fetch():
        nonlocal calls
        calls += 1
        raise httpx.HTTPStatusError("rate limited", request=request, response=response)

    with pytest.raises(httpx.HTTPStatusError):
        fetch()

    assert calls == 2
