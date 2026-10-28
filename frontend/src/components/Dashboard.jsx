import React, { useState } from 'react';
import { useWindData } from '../hooks/useWindData';
import { AccuracyMetricsPanel } from './AccuracyMetricsPanel';
import { ForecastVsActualChart } from './ForecastVsActualChart';
import { DailyAccuracyTrendChart } from './DailyAccuracyTrendChart';
import { ErrorDistributionChart } from './ErrorDistributionChart';
import { HorizonComparisonChart } from './HorizonComparisonChart';
import { DateRangePicker } from './DateRangePicker';
import { ForecastHorizonSelector } from './ForecastHorizonSelector';
import { DataTable } from './DataTable';
import {
  Wind,
  Sun,
  Moon,
  RefreshCw,
  BarChart2,
  Table as TableIcon,
  Shield,
  Activity,
  Layers,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const {
    startDate,
    endDate,
    horizon,
    activePreset,
    overview,
    comparison,
    loading,
    error,
    setStartDate,
    setEndDate,
    setHorizon,
    applyPreset,
    refetch,
  } = useWindData();

  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'charts', 'distribution', 'table'

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 32px' }}>
      {/* Top Header */}
      <header
        className="card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Wind size={26} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                UK Wind Power Forecast Dashboard
              </h1>
              <span className="badge badge-green">LIVE ELEXON BMRS</span>
              <span className="badge badge-blue">JANUARY 2026</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              National Grid ESO Day-Ahead Power Procurement & Forecast Accuracy Verification Desk
            </p>
          </div>
        </div>

        {/* Right header actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={refetch}
            disabled={loading}
            className="btn"
            style={{ fontSize: '0.82rem' }}
            title="Refresh data from Elexon"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} color="var(--accent-amber)" /> : <Moon size={15} color="var(--accent-blue)" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* Error Banner if any */}
      {error && (
        <div
          className="card"
          style={{
            padding: '14px 20px',
            borderColor: 'rgba(244, 63, 94, 0.5)',
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle color="var(--accent-rose)" size={20} />
            <span style={{ fontSize: '0.85rem', color: '#fecdd3' }}>{error}</span>
          </div>
          <button onClick={refetch} className="btn" style={{ fontSize: '0.75rem', borderColor: 'var(--accent-rose)' }}>
            Retry Sync
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          activePreset={activePreset}
          onPresetSelect={applyPreset}
        />

        <ForecastHorizonSelector
          horizon={horizon}
          onHorizonChange={setHorizon}
        />
      </div>

      {/* Loading state indicator */}
      {loading && !overview && (
        <div className="card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Querying Elexon BMRS FUELHH actuals & WINDFOR forecasts for January 2026...
          </span>
        </div>
      )}

      {/* Dashboard Main Content */}
      {overview && (
        <>
          {/* Section 1: Hero KPI Cards */}
          <section>
            <AccuracyMetricsPanel
              metrics={overview.metrics}
              totalActuals={overview.totalActuals}
              totalForecasts={overview.totalForecasts}
              loading={loading}
            />
          </section>

          {/* View Mode Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`btn ${activeTab === 'all' ? 'btn-active' : ''}`}
            >
              <Layers size={14} /> Full Dashboard View
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`btn ${activeTab === 'charts' ? 'btn-active' : ''}`}
            >
              <Activity size={14} /> Time-Series & Trends
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`btn ${activeTab === 'distribution' ? 'btn-active' : ''}`}
            >
              <BarChart2 size={14} /> Error Distribution & Horizons
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`btn ${activeTab === 'table' ? 'btn-active' : ''}`}
            >
              <TableIcon size={14} /> Audit Data Table
            </button>
          </div>

          {/* Section 2: Time-series overlay */}
          {(activeTab === 'all' || activeTab === 'charts') && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ForecastVsActualChart
                data={comparison}
                horizon={horizon}
              />

              <DailyAccuracyTrendChart
                data={overview.timeseries}
              />
            </section>
          )}

          {/* Section 3: Error distribution & Horizon comparison */}
          {(activeTab === 'all' || activeTab === 'distribution') && (
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
              <ErrorDistributionChart
                distribution={overview.errorDistribution}
              />

              <HorizonComparisonChart
                data={overview.horizonBreakdown}
              />
            </section>
          )}

          {/* Section 4: Data Table */}
          {(activeTab === 'all' || activeTab === 'table') && (
            <section>
              <DataTable data={comparison} />
            </section>
          )}
        </>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '16px 0',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          <span>UK Wind Power Forecast Dashboard • Power Procurement Day-Ahead Analytics</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Source: Elexon BMRS API (FUELHH & WINDFOR Streams)</span>
          <span>Scope: Strictly January 2026 National Wind</span>
          <span>Resolution: Half-Hourly Settlement Periods</span>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
