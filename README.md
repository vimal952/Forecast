# UK Wind Power Forecast Dashboard

A full-stack, enterprise-grade web application built for a UK energy utility's Day-Ahead power procurement team. The application visualizes national wind power generation forecasts versus actual metered output across **January 2026**, evaluates forecast accuracy using standard industry metrics (MAE, RMSE, MAPE, WAPE, and MBE), and enables power traders to optimize day-ahead position sizing and hedge balancing mechanism risks.

---

## 🎯 Executive Overview & Purpose

In the UK wholesale electricity market (governed by the Balancing and Settlement Code / BSC and operated by National Grid ESO / NESO):
- **Day-Ahead Gate Closure:** Energy suppliers and generators must submit their final physical notifications (FPN) and trade day-ahead contracts prior to market gate closure (typically ~12:00 UTC on D-1).
- **The Challenge:** Wind generation is intermittent and volatile. Large forecast errors lead to imbalance penalties in the Balancing Mechanism:
  - **Over-forecasting:** The utility commits to deliver power it does not generate, incurring expensive system buy price (cashout) penalties.
  - **Under-forecasting:** The utility generates excess uncontracted power that is spilled into the system at depressed system sell prices.
- **The Solution:** This dashboard answers the procurement team's primary question at a glance: **"How much can we trust the national wind forecast?"** across varying lead times, weather regimes (storm ramps vs wind lulls), and delivery hours.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:**
  - React 18 with Vite
  - Recharts for high-performance interactive time-series overlay, error bands, daily trends, and error histograms
  - Lucide React for clean enterprise iconography
  - Pure CSS Design System with dark/light mode toggle, glassmorphic cards, and responsive layout
- **Backend:**
  - Python 3.11 with FastAPI (asynchronous, high-throughput REST API)
  - Pydantic v2 schemas for robust request/response validation
  - In-memory and disk caching of Elexon BMRS datasets for instant sub-millisecond response times
  - Pytest suite covering metrics computation, horizon mapping, and API endpoints
- **Containerization & Deployment:**
  - Docker & Docker Compose with multi-stage production builds
  - Nginx reverse proxy serving the frontend SPA on port 3000 and proxying `/api` requests to backend on port 8000
  - Deployment-ready for Vercel / Heroku / AWS / GCP

---

## 📁 Project Structure

```
wind-power-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point & CORS configuration
│   │   ├── config.py                # Configuration (Elexon URLs, date scope, cache paths)
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic models for API request/response
│   │   ├── services/
│   │   │   ├── elexon_client.py     # Live Elexon BMRS API client with disk & memory cache
│   │   │   ├── data_processor.py    # Temporal alignment, lead-time grouping, & interpolation
│   │   │   └── accuracy_metrics.py  # MAE, RMSE, MAPE, WAPE, MBE & histogram calculations
│   │   └── routers/
│   │       ├── actuals.py           # GET /api/actuals (FUELHH half-hourly actuals)
│   │       ├── forecasts.py         # GET /api/forecasts (WINDFOR generation forecasts)
│   │       └── accuracy.py          # GET /api/comparison, /api/accuracy, /api/dashboard/overview
│   ├── cache/                       # Local disk cache for January 2026 Elexon datasets
│   ├── tests/
│   │   └── test_accuracy.py         # Unit and integration tests for metrics and APIs
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Python 3.11-slim container specification
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Root application component
│   │   ├── main.jsx                 # Vite React DOM bootstrap
│   │   ├── index.css                # Enterprise design system tokens, themes, & utility classes
│   │   ├── components/
│   │   │   ├── Dashboard.jsx               # Main executive dashboard container
│   │   │   ├── ForecastVsActualChart.jsx    # Interactive time-series overlay with error band
│   │   │   ├── AccuracyMetricsPanel.jsx    # Hero KPI cards for MAE, RMSE, MAPE, MBE
│   │   │   ├── DailyAccuracyTrendChart.jsx # Daily MAE/RMSE bars & line composite
│   │   │   ├── ErrorDistributionChart.jsx  # Error histogram & quartile box-plot statistics
│   │   │   ├── HorizonComparisonChart.jsx  # Lead time degradation curve (1h, 4h, 12h, 24h, 48h)
│   │   │   ├── DateRangePicker.jsx         # January 2026 date range filter with presets
│   │   │   ├── ForecastHorizonSelector.jsx # Lead-time selector (Day-Ahead, Intraday, 1h-48h)
│   │   │   └── DataTable.jsx               # Sortable, paginated audit table with CSV export
│   │   ├── services/
│   │   │   └── api.js               # Axios client connected to backend
│   │   ├── hooks/
│   │   │   └── useWindData.js       # React custom data-fetching and state management hook
│   │   └── utils/
│   │       └── formatters.js        # Power MW/GW, percentage, and date/time helpers
│   ├── nginx.conf                   # Nginx reverse proxy routing for Docker production
│   ├── package.json                 # Node dependencies (React, Vite, Recharts, Axios, Lucide)
│   ├── vite.config.js               # Vite config with /api proxy to localhost:8000
│   └── Dockerfile                   # Multi-stage Node build & Nginx production image
├── docker-compose.yml               # Multi-container orchestration (ports 3000 & 8000)
├── .gitignore                       # Git ignore rules
└── README.md                        # Documentation and architecture guide
```

---

## ⚡ Data Sources (Elexon BMRS API)

Data is streamed directly from Elexon BMRS (Balancing Mechanism Reporting Service), the official reporting body for Great Britain's electricity system:

1. **Actual Wind Generation (`FUELHH`):**
   - **Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream`
   - **Parameters:** `fuelType=WIND`, `settlementDateFrom=2026-01-01&settlementDateTo=2026-01-31`
   - **Resolution:** Half-hourly settlement periods (48 periods per day, 1,488 observations for Jan 2026)
   - **Units:** Megawatts (MW)

2. **Forecast Wind Generation (`WINDFOR`):**
   - **Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`
   - **Parameters:** `publishDateTimeFrom=2025-12-31T00:00:00Z&publishDateTimeTo=2026-02-01T00:00:00Z`
   - **Resolution:** Hourly generation forecasts published across rolling 48-hour outlooks (over 18,000 forecast runs)
   - **Units:** Megawatts (MW)

---

## 🚀 How to Run Locally

### Option A: Using Docker & Docker Compose (Recommended)

1. Make sure Docker Desktop is installed and running.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and navigate to:
   - **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Running Without Docker (Manual Local Setup)

#### 1. Backend Setup (Python 3.11)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run unit tests to verify metrics calculations
python -m pytest tests/test_accuracy.py -v

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now accessible at `http://localhost:8000`.

#### 2. Frontend Setup (Node.js & Vite)
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server on port 3000 (with auto proxy to :8000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Key Metrics & Accuracy Formulas

- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |F_i - A_i|$$
  Measures the average expected deviation in MW without considering sign.
- **Root Mean Squared Error (RMSE):**
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (F_i - A_i)^2}$$
  Penalizes large, unhedged outlier swings heavily. A high RMSE/MAE ratio signals tail-risk weather volatility.
- **Mean Absolute Percentage Error (MAPE):**
  $$\text{MAPE} = \frac{1}{N} \sum_{i=1}^{N} \frac{|F_i - A_i|}{A_i} \times 100\%$$
- **Weighted Absolute Percentage Error (WAPE):**
  $$\text{WAPE} = \frac{\sum |F_i - A_i|}{\sum A_i} \times 100\%$$
  The industry gold standard for energy utilities, avoiding division by near-zero generation artifacts during wind lulls.
- **Mean Bias Error (MBE):**
  $$\text{MBE} = \frac{1}{N} \sum_{i=1}^{N} (F_i - A_i)$$
  Indicates systematic over-forecasting ($> 0$) or under-forecasting ($< 0$).

---

## 🌐 Deployment Information

- **Frontend:** Ready for one-click deployment on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) (pointing to `/frontend` with build command `npm run build` and output directory `dist`).
- **Backend:** Ready for deployment on [Render](https://render.com/), [Fly.io](https://fly.io/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/) using the included `Dockerfile`.
- **Live Demo Link:** `https://uk-wind-power-dashboard.vercel.app` *(Placeholder for customer deployment)*

---

## 🤖 Development Disclosure
AI tools (DeepMind / Antigravity Agentic Assistant) were utilized to assist in code generation, statistical architecture, Elexon BMRS endpoint reverse-engineering, and user experience design.
