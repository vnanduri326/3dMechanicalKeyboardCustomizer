from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import httpx
from tenacity import RetryCallState, retry, retry_if_exception, wait_exponential


def _is_retryable(error: BaseException) -> bool:
    if isinstance(error, (httpx.ConnectError, httpx.TimeoutException)):
        return True
    return isinstance(error, httpx.HTTPStatusError) and (
        error.response.status_code == 429 or error.response.status_code >= 500
    )


def _retry_after_seconds(response: httpx.Response) -> float | None:
    value = response.headers.get("Retry-After")
    if not value:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        try:
            retry_at = parsedate_to_datetime(value)
        except (TypeError, ValueError, OverflowError):
            return None
        if retry_at.tzinfo is None:
            retry_at = retry_at.replace(tzinfo=timezone.utc)
        return max(0.0, (retry_at - datetime.now(timezone.utc)).total_seconds())


_wait_exponential = wait_exponential(multiplier=1, min=2, max=10)


def _wait_before_retry(retry_state: RetryCallState) -> float:
    error = retry_state.outcome.exception() if retry_state.outcome else None
    if isinstance(error, httpx.HTTPStatusError) and error.response.status_code == 429:
        retry_after = _retry_after_seconds(error.response)
        if retry_after is not None:
            return retry_after
    return _wait_exponential(retry_state)


def _stop_retrying(retry_state: RetryCallState) -> bool:
    error = retry_state.outcome.exception() if retry_state.outcome else None
    if (
        isinstance(error, httpx.HTTPStatusError)
        and error.response.status_code == 429
        and retry_state.attempt_number >= 2
    ):
        return True
    return retry_state.attempt_number >= 3


fetch_retry = retry(
    stop=_stop_retrying,
    wait=_wait_before_retry,
    retry=retry_if_exception(_is_retryable),
    reraise=True,
)