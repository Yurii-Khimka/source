"""Fetcher configuration. Every value can be overridden by an environment
variable of the same name (e.g. in the GitHub Actions workflow)."""

import os


def _int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    return int(raw) if raw not in (None, "") else default


# --- Display counters (like_count / bookmark_count on articles) ---
# On every fetcher run each visible article gets a new random value in
# [COUNTER_MIN, COUNTER_MAX] (inclusive). Raise these later as needed.
COUNTER_MIN = _int("COUNTER_MIN", 30)
COUNTER_MAX = _int("COUNTER_MAX", 200)
# Set to 0 to switch randomisation off.
RANDOMIZE_COUNTERS = _int("RANDOMIZE_COUNTERS", 1) == 1

# --- Retention ---
# Articles published more than RETENTION_DAYS ago are cleaned up.
RETENTION_DAYS = _int("RETENTION_DAYS", 30)
# "hide"   -> set is_hidden = true (reversible, rows stay in the DB)
# "delete" -> delete rows (frees space; likes + article_tags cascade)
# "off"    -> do nothing
# Bookmarked articles are ALWAYS kept and visible, whatever the mode.
RETENTION_MODE = os.environ.get("RETENTION_MODE", "hide").strip().lower()

if COUNTER_MIN > COUNTER_MAX:
    raise ValueError(f"COUNTER_MIN ({COUNTER_MIN}) must be <= COUNTER_MAX ({COUNTER_MAX})")
if RETENTION_MODE not in ("hide", "delete", "off"):
    raise ValueError(f"RETENTION_MODE must be hide|delete|off, got {RETENTION_MODE!r}")
