from typing import List, Optional
from pydantic import BaseModel, Field

class ActualDataPoint(BaseModel):
    startTime: str
    settlementDate: Optional[str] = None
    settlementPeriod: Optional[int] = None
    generation: float

class ForecastDataPoint(BaseModel):
    startTime: str
    publishTime: str
    generation: float
    horizonHours: Optional[float] = None

class ComparisonDataPoint(BaseModel):
    startTime: str
    actualGeneration: float
    forecastGeneration: float
    error: float = Field(description="forecastGeneration - actualGeneration (MW)")
    absError: float
    pctError: float
    publishTime: Optional[str] = None
    horizonHours: Optional[float] = None
    settlementPeriod: Optional[int] = None
    date: str

class AccuracyMetrics(BaseModel):
    mae: float = Field(description="Mean Absolute Error in MW")
    rmse: float = Field(description="Root Mean Squared Error in MW")
    mape: float = Field(description="Mean Absolute Percentage Error (%)")
    wape: float = Field(description="Weighted Absolute Percentage Error (%)")
    mbe: float = Field(description="Mean Bias Error (MW)")
    count: int
    totalActualMW: float
    totalForecastMW: float
    overForecastCount: int
    underForecastCount: int
    maxError: float
    minError: float

class AccuracyTimeseriesPoint(BaseModel):
    date: str
    mae: float
    rmse: float
    mape: float
    wape: float
    mbe: float
    count: int
    avgActual: float
    avgForecast: float

class HorizonAccuracyPoint(BaseModel):
    horizon: str
    horizonHours: float
    mae: float
    rmse: float
    mape: float
    count: int

class HourlyAccuracyPoint(BaseModel):
    hour: int
    timeLabel: str
    mae: float
    rmse: float
    mape: float
    count: int
    avgActual: float
    avgForecast: float

class ErrorDistributionBucket(BaseModel):
    binStart: float
    binEnd: float
    label: str
    count: int
    percentage: float

class ErrorDistributionStats(BaseModel):
    buckets: List[ErrorDistributionBucket]
    p10: float
    p25: float
    median: float
    p75: float
    p90: float
    stdDev: float

class PaginatedComparisonResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[ComparisonDataPoint]

class DashboardOverviewResponse(BaseModel):
    metrics: AccuracyMetrics
    timeseries: List[AccuracyTimeseriesPoint]
    horizonBreakdown: List[HorizonAccuracyPoint]
    errorDistribution: ErrorDistributionStats
    totalActuals: int
    totalForecasts: int
