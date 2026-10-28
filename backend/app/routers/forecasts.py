from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import datetime
from app.services.elexon_client import elexon_client
from app.models.schemas import ForecastDataPoint
from app.config import DEFAULT_START_DATE, DEFAULT_END_DATE

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])

@router.get("", response_model=List[ForecastDataPoint])
def get_forecasts(
    startDate: str = Query(DEFAULT_START_DATE, description="Start date (YYYY-MM-DD) within Jan 2026"),
    endDate: str = Query(DEFAULT_END_DATE, description="End date (YYYY-MM-DD) within Jan 2026"),
    horizonHours: Optional[float] = Query(None, description="Optional lead time filter (hours)")
):
    """
    Returns wind generation forecasts from Elexon BMRS (WINDFOR dataset).
    """
    raw = elexon_client.get_forecasts(start_date=startDate, end_date=endDate)
    results = []
    for item in raw:
        st = item.get("startTime")
        pt = item.get("publishTime")
        lead = None
        if st and pt:
            try:
                st_dt = datetime.fromisoformat(st.replace("Z", "+00:00"))
                pt_dt = datetime.fromisoformat(pt.replace("Z", "+00:00"))
                lead = round((st_dt - pt_dt).total_seconds() / 3600.0, 1)
            except Exception:
                pass

        if horizonHours is not None and lead is not None:
            if abs(lead - horizonHours) > 3.0:
                continue

        results.append(ForecastDataPoint(
            startTime=st,
            publishTime=pt,
            generation=float(item.get("generation", 0.0)),
            horizonHours=lead
        ))
    return results
