import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { formatMW, formatDate } from '../utils/formatters';
import { CalendarDays } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-highlight)',
          backdropFilter: 'blur(10px)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '0.8rem',
          color: '#f8fafc',
          minWidth: '190px',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {formatDate(label)}
        </div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ fontWeight: 700 }}>{formatMW(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DailyAccuracyTrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Daily Accuracy Trend (January 2026)
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Daily breakdown of Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) across delivery dates
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => {
                const parts = v.split('-');
                return `${parseInt(parts[2], 10)} Jan`;
              }}
              stroke="var(--text-muted)"
              fontSize={11}
            />

            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k MW`}
              stroke="var(--text-muted)"
              fontSize={11}
              width={65}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />

            <Bar
              dataKey="mae"
              name="Daily MAE (MW)"
              fill="var(--accent-cyan)"
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />

            <Line
              type="monotone"
              dataKey="rmse"
              name="Daily RMSE (MW)"
              stroke="var(--accent-amber)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'var(--accent-amber)' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyAccuracyTrendChart;
