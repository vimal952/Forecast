from fastapi import APIRouter, Query
from typing import List
from app.services.elexon_client import elexon_client
from app.models.schemas import ActualDataPoint
from app.config import DEFAULT_START_DATE, DEFAULT_END_DATE

router = APIRouter(prefix="/api/actuals", tags=["actuals"])

@router.get("", response_model=List[ActualDataPoint])
def get_actuals(
    startDate: str = Query(DEFAULT_START_DATE, description="Start date (YYYY-MM-DD) within Jan 2026"),
    endDate: str = Query(DEFAULT_END_DATE, description="End date (YYYY-MM-DD) within Jan 2026"),
    forceRefresh: bool = Query(False, description="Bypass cache and fetch directly from Elexon")
):
    """
    Returns actual national wind generation from Elexon BMRS (FUELHH dataset, fuelType=WIND)
    at half-hourly settlement resolution.
    """
    raw = elexon_client.get_actuals(start_date=startDate, end_date=endDate, force_refresh=forceRefresh)
    results = []
    for item in raw:
        results.append(ActualDataPoint(
            startTime=item["startTime"],
            settlementDate=item.get("settlementDate"),
            settlementPeriod=item.get("settlementPeriod"),
            generation=float(item.get("generation", 0.0))
        ))
    return results
