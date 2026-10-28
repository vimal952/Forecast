import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { formatMW, formatPct } from '../utils/formatters';
import { GitCompare } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
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
          minWidth: '180px',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '6px' }}>{data.horizon}</div>
        <div style={{ color: 'var(--accent-cyan)' }}>MAE: {formatMW(data.mae)}</div>
        <div style={{ color: 'var(--accent-amber)' }}>RMSE: {formatMW(data.rmse)}</div>
        <div style={{ color: 'var(--accent-emerald)' }}>MAPE: {formatPct(data.mape)}</div>
      </div>
    );
  }
  return null;
};

export const HorizonComparisonChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={18} color="var(--accent-teal)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Forecast Degradation by Lead Time (Horizons)
          </h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Evaluating how forecast accuracy deteriorates from near real-time (1h) to Day-Ahead (24h) and 48h
        </p>
      </div>

      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />

            <XAxis dataKey="horizon" stroke="var(--text-muted)" fontSize={11} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k MW`}
              stroke="var(--text-muted)"
              fontSize={11}
              width={65}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />

            <Bar dataKey="mae" name="MAE (MW)" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="rmse" name="RMSE (MW)" fill="var(--accent-rose)" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorizonComparisonChart;
