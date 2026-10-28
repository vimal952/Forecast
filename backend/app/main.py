import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import actuals, forecasts, accuracy
from app.config import CORS_ORIGINS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("wind_forecast_dashboard")

app = FastAPI(
    title="UK Wind Power Forecast Dashboard API",
    description="API for Day-Ahead Power Procurement & Wind Generation Forecast Evaluation (Elexon BMRS Data)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(actuals.router)
app.include_router(forecasts.router)
app.include_router(accuracy.router)

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "UK Wind Power Forecast Dashboard API",
        "scope": "January 2026 National Wind Generation"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to UK Wind Power Forecast Dashboard API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
