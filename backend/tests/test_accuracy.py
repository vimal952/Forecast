import pytest
from app.services.accuracy_metrics import AccuracyMetricsService
from app.services.data_processor import DataProcessor
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def sample_aligned_data():
    return [
        {
            "startTime": "2026-01-01T00:00:00Z",
            "actualGeneration": 10000.0,
            "forecastGeneration": 10500.0,
            "error": 500.0,
            "absError": 500.0,
            "pctError": 5.0,
            "publishTime": "2025-12-31T20:00:00Z",
            "horizonHours": 4.0,
            "settlementPeriod": 1,
            "date": "2026-01-01"
        },
        {
            "startTime": "2026-01-01T00:30:00Z",
            "actualGeneration": 12000.0,
            "forecastGeneration": 11000.0,
            "error": -1000.0,
            "absError": 1000.0,
            "pctError": 8.33,
            "publishTime": "2025-12-31T20:00:00Z",
            "horizonHours": 4.5,
            "settlementPeriod": 2,
            "date": "2026-01-01"
        },
        {
            "startTime": "2026-01-02T12:00:00Z",
            "actualGeneration": 8000.0,
            "forecastGeneration": 8200.0,
            "error": 200.0,
            "absError": 200.0,
            "pctError": 2.5,
            "publishTime": "2026-01-01T12:00:00Z",
            "horizonHours": 24.0,
            "settlementPeriod": 25,
            "date": "2026-01-02"
        }
    ]

def test_empty_metrics():
    service = AccuracyMetricsService()
    res = service.compute_metrics([])
    assert res["count"] == 0
    assert res["mae"] == 0.0
    assert res["rmse"] == 0.0
    assert res["mape"] == 0.0

def test_compute_metrics_accuracy(sample_aligned_data):
    service = AccuracyMetricsService()
    res = service.compute_metrics(sample_aligned_data)
    assert res["count"] == 3
    # absErrors: 500, 1000, 200 => sum=1700, mean=1700/3 = 566.67
    assert res["mae"] == pytest.approx(566.67, 0.01)
    # sqErrors: 250000 + 1000000 + 40000 = 1290000 => sqrt(1290000 / 3) = 655.74
    assert res["rmse"] == pytest.approx(655.74, 0.01)
    # bias: 500 - 1000 + 200 = -300 => -100.0
    assert res["mbe"] == pytest.approx(-100.0, 0.01)
    # over / under counts
    assert res["overForecastCount"] == 2
    assert res["underForecastCount"] == 1
    assert res["maxError"] == 500.0
    assert res["minError"] == -1000.0

def test_daily_breakdown(sample_aligned_data):
    service = AccuracyMetricsService()
    res = service.compute_daily_breakdown(sample_aligned_data)
    assert len(res) == 2
    # Day 1: 2026-01-01 has 2 points
    assert res[0]["date"] == "2026-01-01"
    assert res[0]["count"] == 2
    assert res[0]["mae"] == 750.0 # (500 + 1000) / 2
    # Day 2: 2026-01-02 has 1 point
    assert res[1]["date"] == "2026-01-02"
    assert res[1]["count"] == 1
    assert res[1]["mae"] == 200.0

def test_hourly_breakdown(sample_aligned_data):
    service = AccuracyMetricsService()
    res = service.compute_hourly_breakdown(sample_aligned_data)
    hours = [r["hour"] for r in res]
    assert 0 in hours
    assert 12 in hours

def test_error_distribution(sample_aligned_data):
    service = AccuracyMetricsService()
    dist = service.compute_error_distribution(sample_aligned_data)
    assert "buckets" in dist
    assert "median" in dist
    assert "stdDev" in dist
    total_pct = sum(b["percentage"] for b in dist["buckets"])
    assert total_pct == pytest.approx(100.0, 0.5)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_accuracy():
    res = client.get("/api/accuracy?startDate=2026-01-01&endDate=2026-01-02&horizon=latest")
    assert res.status_code == 200
    data = res.json()
    assert "mae" in data
    assert "rmse" in data
    assert "mape" in data
    assert data["count"] > 0

def test_api_comparison():
    res = client.get("/api/comparison?startDate=2026-01-01&endDate=2026-01-02&horizon=latest")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "actualGeneration" in first
    assert "forecastGeneration" in first
    assert "error" in first
