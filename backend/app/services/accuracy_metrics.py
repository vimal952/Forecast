import math
from typing import List, Dict, Any
from app.services.data_processor import data_processor

class AccuracyMetricsService:
    def __init__(self):
        pass

    def compute_metrics(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes MAE, RMSE, MAPE, WAPE, MBE, and summary stats.
        """
        if not data:
            return {
                "mae": 0.0,
                "rmse": 0.0,
                "mape": 0.0,
                "wape": 0.0,
                "mbe": 0.0,
                "count": 0,
                "totalActualMW": 0.0,
                "totalForecastMW": 0.0,
                "overForecastCount": 0,
                "underForecastCount": 0,
                "maxError": 0.0,
                "minError": 0.0,
            }

        count = len(data)
        total_abs_error = sum(d["absError"] for d in data)
        total_sq_error = sum(d["error"] ** 2 for d in data)
        total_actual = sum(d["actualGeneration"] for d in data)
        total_forecast = sum(d["forecastGeneration"] for d in data)
        total_bias = sum(d["error"] for d in data)

        mae = total_abs_error / count
        rmse = math.sqrt(total_sq_error / count)
        mbe = total_bias / count

        # WAPE: Weighted Absolute Percentage Error
        wape = (total_abs_error / total_actual * 100.0) if total_actual > 0 else 0.0

        # MAPE: average percentage error for points where actual > 10 MW
        mape_points = [d["pctError"] for d in data if d["actualGeneration"] > 10.0]
        mape = (sum(mape_points) / len(mape_points)) if mape_points else 0.0

        over_count = sum(1 for d in data if d["error"] > 0)
        under_count = sum(1 for d in data if d["error"] < 0)
        max_err = max(d["error"] for d in data)
        min_err = min(d["error"] for d in data)

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2),
            "wape": round(wape, 2),
            "mbe": round(mbe, 2),
            "count": count,
            "totalActualMW": round(total_actual, 1),
            "totalForecastMW": round(total_forecast, 1),
            "overForecastCount": over_count,
            "underForecastCount": under_count,
            "maxError": round(max_err, 2),
            "minError": round(min_err, 2),
        }

    def compute_daily_breakdown(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups data by settlement date and computes daily metrics.
        """
        by_date: Dict[str, List[Dict[str, Any]]] = {}
        for d in data:
            dt = d.get("date") or d["startTime"][:10]
            if dt not in by_date:
                by_date[dt] = []
            by_date[dt].append(d)

        results = []
        for dt in sorted(by_date.keys()):
            items = by_date[dt]
            metrics = self.compute_metrics(items)
            avg_act = sum(x["actualGeneration"] for x in items) / len(items)
            avg_fc = sum(x["forecastGeneration"] for x in items) / len(items)
            results.append({
                "date": dt,
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "mape": metrics["mape"],
                "wape": metrics["wape"],
                "mbe": metrics["mbe"],
                "count": len(items),
                "avgActual": round(avg_act, 1),
                "avgForecast": round(avg_fc, 1)
            })
        return results

    def compute_hourly_breakdown(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups data by hour of day (0-23) to assess diurnal patterns in forecast accuracy.
        """
        by_hour: Dict[int, List[Dict[str, Any]]] = {h: [] for h in range(24)}
        for d in data:
            try:
                hour = int(d["startTime"][11:13])
                by_hour[hour].append(d)
            except Exception:
                continue

        results = []
        for h in range(24):
            items = by_hour[h]
            if items:
                metrics = self.compute_metrics(items)
                avg_act = sum(x["actualGeneration"] for x in items) / len(items)
                avg_fc = sum(x["forecastGeneration"] for x in items) / len(items)
                results.append({
                    "hour": h,
                    "timeLabel": f"{h:02d}:00",
                    "mae": metrics["mae"],
                    "rmse": metrics["rmse"],
                    "mape": metrics["mape"],
                    "count": len(items),
                    "avgActual": round(avg_act, 1),
                    "avgForecast": round(avg_fc, 1)
                })
        return results

    def compute_horizon_breakdown(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Evaluates forecast performance across standard lead time horizons: 1h, 4h, 12h, 24h, 48h.
        """
        horizons = [
            ("1h Ahead", "1h", 1.5),
            ("4h Ahead", "4h", 4.0),
            ("12h Ahead", "12h", 12.0),
            ("Day-Ahead (24h)", "day_ahead", 24.0),
            ("48h Ahead", "48h", 48.0),
        ]
        results = []
        for label, h_key, hours in horizons:
            aligned = data_processor.get_aligned_data(start_date=start_date, end_date=end_date, horizon=h_key)
            metrics = self.compute_metrics(aligned)
            results.append({
                "horizon": label,
                "horizonHours": hours,
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "mape": metrics["mape"],
                "count": metrics["count"]
            })
        return results

    def compute_error_distribution(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes histogram buckets and percentiles (p10, p25, median, p75, p90) for forecast errors.
        """
        if not data:
            return {
                "buckets": [],
                "p10": 0.0,
                "p25": 0.0,
                "median": 0.0,
                "p75": 0.0,
                "p90": 0.0,
                "stdDev": 0.0
            }

        errors = sorted([d["error"] for d in data])
        n = len(errors)

        def percentile(p: float) -> float:
            idx = int(p * (n - 1))
            return errors[idx]

        mean_err = sum(errors) / n
        variance = sum((x - mean_err) ** 2 for x in errors) / n
        std_dev = math.sqrt(variance)

        # Histogram bins (MW)
        # Bins: <-3000, [-3000,-2000), [-2000,-1000), [-1000,-500), [-500,0), [0,500), [500,1000), [1000,2000), [2000,3000), >=3000
        bin_specs = [
            (-float("inf"), -3000, "< -3000 MW"),
            (-3000, -2000, "-3000 to -2000"),
            (-2000, -1000, "-2000 to -1000"),
            (-1000, -500, "-1000 to -500"),
            (-500, 0, "-500 to 0"),
            (0, 500, "0 to +500"),
            (500, 1000, "+500 to +1000"),
            (1000, 2000, "+1000 to +2000"),
            (2000, 3000, "+2000 to +3000"),
            (3000, float("inf"), "> +3000 MW"),
        ]

        buckets = []
        for b_start, b_end, label in bin_specs:
            if b_start == -float("inf"):
                count = sum(1 for e in errors if e < b_end)
            elif b_end == float("inf"):
                count = sum(1 for e in errors if e >= b_start)
            else:
                count = sum(1 for e in errors if b_start <= e < b_end)
            
            buckets.append({
                "binStart": -9999.0 if b_start == -float("inf") else b_start,
                "binEnd": 9999.0 if b_end == float("inf") else b_end,
                "label": label,
                "count": count,
                "percentage": round((count / n) * 100.0, 1) if n > 0 else 0.0
            })

        return {
            "buckets": buckets,
            "p10": round(percentile(0.10), 1),
            "p25": round(percentile(0.25), 1),
            "median": round(percentile(0.50), 1),
            "p75": round(percentile(0.75), 1),
            "p90": round(percentile(0.90), 1),
            "stdDev": round(std_dev, 1)
        }

accuracy_metrics_service = AccuracyMetricsService()
