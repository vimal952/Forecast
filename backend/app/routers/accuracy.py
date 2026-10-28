from fastapi import APIRouter, Query
from typing import List, Optional, Any, Dict
from app.services.data_processor import data_processor
from app.services.accuracy_metrics import accuracy_metrics_service
from app.services.elexon_client import elexon_client
from app.models.schemas import (
    ComparisonDataPoint,
    AccuracyMetrics,
    AccuracyTimeseriesPoint,
    HorizonAccuracyPoint,
    ErrorDistributionStats,
    DashboardOverviewResponse,
    PaginatedComparisonResponse
)
from app.config import DEFAULT_START_DATE, DEFAULT_END_DATE

router = APIRouter(prefix="/api", tags=["accuracy-and-comparison"])

@router.get("/comparison", response_model=List[ComparisonDataPoint])
def get_comparison(
    startDate: str = Query(DEFAULT_START_DATE, description="Start date (YYYY-MM-DD) within Jan 2026"),
    endDate: str = Query(DEFAULT_END_DATE, description="End date (YYYY-MM-DD) within Jan 2026"),
    horizon: str = Query("latest", description="Forecast horizon ('latest', 'day_ahead', '1h', '4h', '12h', '24h', '48h')")
):
    """
    Returns aligned time-series of actual wind generation vs forecasted generation
    with computed absolute error, MW error, and percentage error.
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    return aligned

@router.get("/comparison/paginated", response_model=PaginatedComparisonResponse)
def get_comparison_paginated(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    sortBy: str = Query("startTime"),
    sortDir: str = Query("asc")
):
    """
    Returns paginated and sortable raw comparison table data.
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    
    # Sort
    reverse = (sortDir.lower() == "desc")
    if sortBy in ["startTime", "actualGeneration", "forecastGeneration", "error", "absError", "pctError"]:
        aligned.sort(key=lambda x: x.get(sortBy, 0) if x.get(sortBy) is not None else 0, reverse=reverse)

    total = len(aligned)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_data = aligned[start_idx:end_idx]

    return PaginatedComparisonResponse(
        total=total,
        page=page,
        limit=limit,
        data=page_data
    )

@router.get("/accuracy", response_model=AccuracyMetrics)
def get_accuracy_metrics(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest")
):
    """
    Returns summary accuracy KPIs (MAE, RMSE, MAPE, WAPE, Bias/MBE) for the selected date range & horizon.
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    return accuracy_metrics_service.compute_metrics(aligned)

@router.get("/accuracy/timeseries", response_model=List[AccuracyTimeseriesPoint])
def get_accuracy_timeseries(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest")
):
    """
    Returns daily accuracy trend (daily MAE, RMSE, MAPE, WAPE, and average actuals vs forecasts).
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    return accuracy_metrics_service.compute_daily_breakdown(aligned)

@router.get("/accuracy/horizons", response_model=List[HorizonAccuracyPoint])
def get_horizon_comparison(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE)
):
    """
    Returns comparison of forecast accuracy across standard lead-time horizons (1h, 4h, 12h, 24h/Day-Ahead, 48h).
    """
    return accuracy_metrics_service.compute_horizon_breakdown(start_date=startDate, end_date=endDate)

@router.get("/accuracy/distribution", response_model=ErrorDistributionStats)
def get_error_distribution(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest")
):
    """
    Returns forecast error histogram distribution and percentiles (p10, p25, median, p75, p90, stdDev).
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    return accuracy_metrics_service.compute_error_distribution(aligned)

@router.get("/accuracy/hourly")
def get_hourly_accuracy(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest")
):
    """
    Returns accuracy metrics broken down by time of day (0-23h) for diurnal analysis.
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    return accuracy_metrics_service.compute_hourly_breakdown(aligned)

@router.get("/dashboard/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    startDate: str = Query(DEFAULT_START_DATE),
    endDate: str = Query(DEFAULT_END_DATE),
    horizon: str = Query("latest")
):
    """
    Bundled overview endpoint delivering metrics, daily timeseries, horizon breakdown, and distribution.
    """
    aligned = data_processor.get_aligned_data(start_date=startDate, end_date=endDate, horizon=horizon)
    metrics = accuracy_metrics_service.compute_metrics(aligned)
    timeseries = accuracy_metrics_service.compute_daily_breakdown(aligned)
    horizons = accuracy_metrics_service.compute_horizon_breakdown(start_date=startDate, end_date=endDate)
    dist = accuracy_metrics_service.compute_error_distribution(aligned)
    
    actuals = elexon_client.get_actuals(startDate, endDate)
    forecasts = elexon_client.get_forecasts(startDate, endDate)

    return DashboardOverviewResponse(
        metrics=metrics,
        timeseries=timeseries,
        horizonBreakdown=horizons,
        errorDistribution=dist,
        totalActuals=len(actuals),
        totalForecasts=len(forecasts)
    )
