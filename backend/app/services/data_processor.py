import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.services.elexon_client import elexon_client

logger = logging.getLogger(__name__)

HORIZON_MAP = {
    "1h": 1.5,
    "4h": 4.0,
    "12h": 12.0,
    "24h": 24.0,
    "48h": 48.0,
    "day_ahead": 24.0,
}

class DataProcessor:
    def __init__(self):
        pass

    def parse_iso(self, ts_str: str) -> datetime:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))

    def get_aligned_data(
        self,
        start_date: str = "2026-01-01",
        end_date: str = "2026-01-31",
        horizon: str = "latest",
        interpolate_half_hour: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Aligns actuals and forecasts by startTime within [start_date, end_date].
        Matches forecasts based on the specified horizon mode:
        - 'latest': latest forecast published before gate closure / startTime
        - 'day_ahead': forecast available at D-1 gate closure (~24h ahead)
        - '1h', '4h', '12h', '24h', '48h': nearest forecast to specified lead time
        - 'all': includes all available horizon selections
        """
        actuals = elexon_client.get_actuals(start_date, end_date)
        forecasts = elexon_client.get_forecasts(start_date, end_date)

        # Build a map of actuals keyed by startTime
        actual_map: Dict[str, Dict[str, Any]] = {}
        for a in actuals:
            st = a["startTime"]
            actual_map[st] = {
                "startTime": st,
                "generation": float(a.get("generation", 0.0)),
                "settlementDate": a.get("settlementDate", st[:10]),
                "settlementPeriod": a.get("settlementPeriod"),
            }

        # Group forecasts by target startTime
        forecast_by_target: Dict[str, List[Dict[str, Any]]] = {}
        for f in forecasts:
            st = f.get("startTime")
            if not st:
                continue
            pt = f.get("publishTime")
            if not pt:
                continue
            
            try:
                st_dt = self.parse_iso(st)
                pt_dt = self.parse_iso(pt)
                lead_hours = (st_dt - pt_dt).total_seconds() / 3600.0
                
                # Only consider forecasts issued before the target delivery period
                if lead_hours <= 0:
                    continue

                if st not in forecast_by_target:
                    forecast_by_target[st] = []
                
                forecast_by_target[st].append({
                    "publishTime": pt,
                    "startTime": st,
                    "generation": float(f.get("generation", 0.0)),
                    "leadHours": lead_hours,
                    "st_dt": st_dt,
                    "pt_dt": pt_dt
                })
            except Exception:
                continue

        # For each target hour in forecast_by_target, pick the best forecast based on horizon
        selected_forecast_by_target: Dict[str, Dict[str, Any]] = {}
        for st, f_list in forecast_by_target.items():
            selected = self._pick_forecast_for_horizon(f_list, horizon)
            if selected:
                selected_forecast_by_target[st] = selected

        # Now align with actuals
        aligned_results: List[Dict[str, Any]] = []
        sorted_actual_times = sorted(actual_map.keys())

        for st in sorted_actual_times:
            act_info = actual_map[st]
            act_gen = act_info["generation"]
            
            # Check if direct match exists
            fc = selected_forecast_by_target.get(st)
            
            # If no direct match and interpolate_half_hour is true, try to interpolate for :30
            if not fc and interpolate_half_hour and st.endswith(":30:00Z"):
                fc = self._interpolate_half_hour(st, selected_forecast_by_target)

            if fc:
                fc_gen = fc["generation"]
                error = round(fc_gen - act_gen, 2)
                abs_error = round(abs(error), 2)
                
                # Percentage error: safeguard low actual values
                if act_gen > 10.0:
                    pct_error = round((abs_error / act_gen) * 100.0, 2)
                else:
                    pct_error = 0.0

                aligned_results.append({
                    "startTime": st,
                    "actualGeneration": round(act_gen, 1),
                    "forecastGeneration": round(fc_gen, 1),
                    "error": error,
                    "absError": abs_error,
                    "pctError": pct_error,
                    "publishTime": fc.get("publishTime"),
                    "horizonHours": round(fc.get("leadHours", 0.0), 1),
                    "settlementPeriod": act_info.get("settlementPeriod"),
                    "date": act_info.get("settlementDate") or st[:10]
                })

        return aligned_results

    def _pick_forecast_for_horizon(self, f_list: List[Dict[str, Any]], horizon: str) -> Optional[Dict[str, Any]]:
        if not f_list:
            return None

        if horizon == "latest":
            # Smallest positive lead time (at least 1h before delivery)
            valid = [f for f in f_list if f["leadHours"] >= 1.0]
            if not valid:
                valid = f_list
            return min(valid, key=lambda x: x["leadHours"])

        if horizon == "day_ahead":
            # For UK day-ahead, gate closure is D-1 ~12:00. Target lead is ~24h (range 12h-36h)
            target_lead = 24.0
            return min(f_list, key=lambda x: abs(x["leadHours"] - target_lead))

        if horizon in HORIZON_MAP:
            target_lead = HORIZON_MAP[horizon]
            return min(f_list, key=lambda x: abs(x["leadHours"] - target_lead))

        # Default fallback: latest
        return min(f_list, key=lambda x: x["leadHours"])

    def _interpolate_half_hour(self, half_hour_st: str, forecasts: Dict[str, Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Interpolates a :30 timestamp using the :00 before and :00 after.
        """
        try:
            dt = self.parse_iso(half_hour_st)
            before_dt = dt - timedelta(minutes=30)
            after_dt = dt + timedelta(minutes=30)
            
            before_st = before_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            after_st = after_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            
            fc_before = forecasts.get(before_st)
            fc_after = forecasts.get(after_st)
            
            if fc_before and fc_after:
                avg_gen = (fc_before["generation"] + fc_after["generation"]) / 2.0
                avg_lead = (fc_before["leadHours"] + fc_after["leadHours"]) / 2.0
                return {
                    "publishTime": fc_before["publishTime"],
                    "startTime": half_hour_st,
                    "generation": avg_gen,
                    "leadHours": avg_lead
                }
            elif fc_before:
                return {
                    "publishTime": fc_before["publishTime"],
                    "startTime": half_hour_st,
                    "generation": fc_before["generation"],
                    "leadHours": fc_before["leadHours"] + 0.5
                }
            elif fc_after:
                return {
                    "publishTime": fc_after["publishTime"],
                    "startTime": half_hour_st,
                    "generation": fc_after["generation"],
                    "leadHours": max(0.5, fc_after["leadHours"] - 0.5)
                }
        except Exception:
            pass
        return None

data_processor = DataProcessor()
