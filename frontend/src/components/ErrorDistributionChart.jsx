import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { formatMW, formatPct } from '../utils/formatters';
import { BarChart3, Gauge, Layers } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-highlight)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '0.8rem',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Range: {data.label}</div>
        <div style={{ color: 'var(--accent-cyan)' }}>Count: {data.count} periods</div>
        <div style={{ color: 'var(--text-secondary)' }}>Percentage: {data.percentage}% of month</div>
      </div>
    );
  }
  return null;
};

export const ErrorDistributionChart = ({ distribution }) => {
  if (!distribution || !distribution.buckets || distribution.buckets.length === 0) return null;

  const getBucketColor = (label) => {
    if (label.includes('0 to +500') || label.includes('-500 to 0')) {
      return 'var(--accent-emerald)'; // Optimal accuracy
    }
    if (label.includes('500 to 1000') || label.includes('-1000 to -500')) {
      return 'var(--accent-cyan)';
    }
    if (label.includes('1000 to 2000') || label.includes('-2000 to -1000')) {
      return 'var(--accent-amber)';
    }
    return 'var(--accent-rose)'; // Large deviation
  };

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Forecast Error Distribution (MW)
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Histogram of forecast errors (Forecast − Actual) and statistical percentiles
          </p>
        </div>
      </div>

      {/* Statistical Box Plot / Percentile Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          background: 'var(--bg-input)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P10 (10th percentile)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{formatMW(distribution.p10)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P25 (Q1 lower quartile)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{formatMW(distribution.p25)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>MEDIAN (P50)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{formatMW(distribution.median)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P75 (Q3 upper quartile)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{formatMW(distribution.p75)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>P90 (90th percentile)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{formatMW(distribution.p90)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>STD DEVIATION (σ)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>{formatMW(distribution.stdDev)}</span>
        </div>
      </div>

      {/* Histogram Chart */}
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution.buckets} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />

            <XAxis
              dataKey="label"
              stroke="var(--text-muted)"
              fontSize={10}
              angle={-20}
              textAnchor="end"
              height={45}
            />

            <YAxis
              tickFormatter={(v) => `${v}`}
              stroke="var(--text-muted)"
              fontSize={11}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distribution.buckets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBucketColor(entry.label)} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>◀ Negative Error: Under-Forecast (Short Balancing Penalty Risk)</span>
        <span>Positive Error: Over-Forecast (Curtailment / Spill Risk) ▶</span>
      </div>
    </div>
  );
};

export default ErrorDistributionChart;
