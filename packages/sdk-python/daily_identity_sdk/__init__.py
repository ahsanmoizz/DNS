"""Dependency-free Daily Identity helpers for Python integrations.

Contract transaction calls intentionally remain provider-owned; this package
provides canonical namespace validation and payment-request interoperability.
"""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from time import time
from urllib.parse import parse_qs, quote, unquote
import re

_LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
_AMOUNT = re.compile(r"^\d+(?:\.\d{1,18})?$")


def normalize_label(value: str) -> str:
    label = value.strip().lower()
    if not _LABEL.fullmatch(label):
        raise ValueError("Daily labels use lowercase letters, digits and internal hyphens only")
    return label


def normalize_name(value: str) -> str:
    parts = value.strip().lower().split(".")
    if len(parts) != 2 or parts[1] not in {"dly", "day", "daily"}:
        raise ValueError("Use .dly, .day or .daily")
    return f"{normalize_label(parts[0])}.{parts[1]}"


@dataclass(frozen=True)
class DailyPaymentRequest:
    receiving_name: str
    amount: str
    memo: str
    expires_at: int


def daily_payment_uri(receiving_name: str, amount: str, memo: str, expires_at: int) -> str:
    if not _AMOUNT.fullmatch(amount) or Decimal(amount) <= 0:
        raise ValueError("Amount must be a positive native-currency decimal with at most 18 places")
    if not isinstance(expires_at, int) or expires_at <= 0:
        raise ValueError("Expiry must be a positive Unix timestamp")
    return f"daily:{quote(normalize_name(receiving_name))}?amount={quote(amount)}&memo={quote(memo)}&expires={expires_at}"


def parse_daily_payment_uri(uri: str, *, require_unexpired: bool = False) -> DailyPaymentRequest:
    if not uri.startswith("daily:") or "?" not in uri:
        raise ValueError("Invalid Daily payment URI")
    encoded_name, query = uri[6:].split("?", 1)
    values = parse_qs(query, strict_parsing=True)
    amount = values.get("amount", [""])[0]
    memo = values.get("memo", [""])[0]
    try:
        expires_at = int(values.get("expires", [""])[0])
    except ValueError as error:
        raise ValueError("Invalid payment expiry") from error
    if not _AMOUNT.fullmatch(amount) or Decimal(amount) <= 0 or expires_at <= 0:
        raise ValueError("Invalid Daily payment request values")
    if require_unexpired and expires_at <= int(time()):
        raise ValueError("Daily payment request has expired")
    return DailyPaymentRequest(normalize_name(unquote(encoded_name)), amount, memo, expires_at)
