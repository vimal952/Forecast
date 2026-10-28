import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Brush
} from 'recharts';
import { formatMW, formatPct, formatDateTime } from '../utils/formatters';
import { Activity, Eye, EyeOff, Maximize2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const actual = data.actualGeneration;
    const forecast = data.forecastGeneration;
    const error = data.error;
    const pct = data.pctError;
    const lead = data.horizonHours;

    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-highlight)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '0.8rem',
          color: '#f8fafc',
          minWidth: '220px',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {formatDateTime(label)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--chart-actual)', fontWeight: 600 }}>● Actual Generation:</span>
          <span style={{ fontWeight: 700 }}>{formatMW(actual)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--chart-forecast)', fontWeight: 600 }}>-- Forecast Generation:</span>
          <span style={{ fontWeight: 700 }}>{formatMW(forecast)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: error >= 0 ? 'var(--accent-cyan)' : 'var(--accent-rose)', fontWeight: 600 }}>
            {error >= 0 ? '▲ Over-Forecast:' : '▼ Under-Forecast:'}
          </span>
          <span style={{ fontWeight: 700 }}>{Math.abs(error).toLocaleString()} MW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#94a3b8' }}>Error %:</span>
          <span style={{ fontWeight: 600 }}>{formatPct(pct)}</span>
        </div>
        {lead && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Lead Time:</span>
            <span>{lead} hours</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ForecastVsActualChart = ({ data, horizon }) => {
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showBand, setShowBand] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No comparison data available for the selected filters.
      </div>
    );
  }

  // Pre-process data for shaded error band:
  // We can calculate error band range [min(actual, forecast), max(actual, forecast)]
  const chartData = data.map((d) => ({
    ...d,
    timeLabel: d.startTime.substring(5, 16).replace('T', ' '),
    bandLower: Math.min(d.actualGeneration, d.forecastGeneration),
    bandDiff: Math.abs(d.forecastGeneration - d.actualGeneration),
  }));

  const maxVal = Math.max(...data.map((d) => Math.max(d.actualGeneration, d.forecastGeneration)));
  const yAxisMax = Math.ceil(maxVal / 2000) * 2000 + 1000;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.2px' }}>
              National Wind Power Generation: Forecast vs Actuals
            </h3>
            <span className="badge badge-blue">{chartData.length} Half-Hours Aligned</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Time-series overlay of Elexon FUELHH wind generation (solid) vs WINDFOR forecast (dashed) with error band
          </p>
        </div>

        {/* Legend toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowActual(!showActual)}
            className={`btn ${showActual ? 'btn-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {showActual ? <Eye size={13} /> : <EyeOff size={13} />}
            <span style={{ color: 'var(--chart-actual)', fontWeight: 700 }}>—</span> Actual (FUELHH)
          </button>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`btn ${showForecast ? 'btn-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {showForecast ? <Eye size={13} /> : <EyeOff size={13} />}
            <span style={{ color: 'var(--chart-forecast)', fontWeight: 700 }}>┅</span> Forecast (WINDFOR)
          </button>
          <button
            onClick={() => setShowBand(!showBand)}
            className={`btn ${showBand ? 'btn-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {showBand ? <Eye size={13} /> : <EyeOff size={13} />}
            <span style={{ color: 'rgba(245, 158, 11, 0.4)', fontWeight: 700 }}>■</span> Error Band
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '420px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="errorBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-actual)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--chart-actual)" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />

            <XAxis
              dataKey="startTime"
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getUTCDate()} Jan ${String(d.getUTCHours()).padStart(2, '0')}:00`;
              }}
              stroke="var(--text-muted)"
              fontSize={11}
              minTickGap={40}
            />

            <YAxis
              domain={[0, yAxisMax]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k MW`}
              stroke="var(--text-muted)"
              fontSize={11}
              width={70}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Error Band (stacked area on bandLower) */}
            {showBand && (
              <Area
                type="monotone"
                dataKey="bandLower"
                stackId="band"
                stroke="transparent"
                fill="transparent"
                isAnimationActive={false}
              />
            )}
            {showBand && (
              <Area
                type="monotone"
                dataKey="bandDiff"
                stackId="band"
                stroke="rgba(245, 158, 11, 0.5)"
                fill="url(#errorBandGrad)"
                name="Error Band"
                isAnimationActive={false}
              />
            )}

            {/* Actual generation line & subtle area */}
            {showActual && (
              <Area
                type="monotone"
                dataKey="actualGeneration"
                stroke="var(--chart-actual)"
                strokeWidth={2.2}
                fill="url(#actualAreaGrad)"
                name="Actual Wind (MW)"
                dot={false}
                activeDot={{ r: 5, stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              />
            )}

            {/* Forecast generation line (dashed) */}
            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecastGeneration"
                stroke="var(--chart-forecast)"
                strokeWidth={2}
                strokeDasharray="5 4"
                name="Forecast Wind (MW)"
                dot={false}
                activeDot={{ r: 5, stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              />
            )}

            <Brush
              dataKey="startTime"
              height={28}
              stroke="var(--border-highlight)"
              fill="var(--bg-secondary)"
              tickFormatter={(v) => `${new Date(v).getUTCDate()} Jan`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastVsActualChart;
