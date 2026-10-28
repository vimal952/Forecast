import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"
try:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

# Elexon BMRS API endpoints
ELEXON_BASE_URL = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
FUELHH_ENDPOINT = f"{ELEXON_BASE_URL}/datasets/FUELHH/stream"
WINDFOR_ENDPOINT = f"{ELEXON_BASE_URL}/datasets/WINDFOR/stream"

# Dataset Date Scope - strictly January 2026
DEFAULT_START_DATE = "2026-01-01"
DEFAULT_END_DATE = "2026-01-31"

# Cache filenames
ACTUALS_CACHE_FILE = CACHE_DIR / "fuelhh_jan2026.json"
FORECASTS_CACHE_FILE = CACHE_DIR / "windfor_jan2026.json"

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]
