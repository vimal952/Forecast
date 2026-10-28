import React from 'react';
import { Target, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Percent, ShieldCheck } from 'lucide-react';
import { formatMW, formatPct, formatNumber } from '../utils/formatters';

export const AccuracyMetricsPanel = ({ metrics, totalActuals, totalForecasts, loading }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'MEAN ABSOLUTE ERROR (MAE)',
      value: formatMW(metrics.mae),
      sub: 'Average magnitude of forecast deviation',
      icon: Target,
      color: 'var(--accent-cyan)',
      trend: `${formatPct((metrics.mae / (metrics.totalActualMW / (metrics.count || 1))) * 100)} of avg gen`,
      benchmark: 'Target: < 1,200 MW',
      status: metrics.mae < 1500 ? 'GOOD' : 'ELEVATED'
    },
    {
      title: 'ROOT MEAN SQUARED ERROR (RMSE)',
      value: formatMW(metrics.rmse),
      sub: 'Penalizes large outlier forecast errors',
      icon: TrendingUp,
      color: 'var(--accent-amber)',
      trend: `Ratio to MAE: ${(metrics.rmse / (metrics.mae || 1)).toFixed(2)}x`,
      benchmark: 'Std Deviation Indicator',
      status: metrics.rmse < 1900 ? 'STABLE' : 'VOLATILE'
    },
    {
      title: 'MAPE / WAPE ACCURACY',
      value: `${formatPct(metrics.mape)} MAPE`,
      sub: `Weighted Absolute Error (WAPE): ${formatPct(metrics.wape)}`,
      icon: Percent,
      color: 'var(--accent-emerald)',
      trend: `${formatPct(100 - metrics.wape)} Forecast Accuracy`,
      benchmark: 'Utility Benchmark: < 12%',
      status: metrics.wape < 12 ? 'HIGH ACCURACY' : 'MODERATE'
    },
    {
      title: 'FORECAST BIAS (MBE)',
      value: `${metrics.mbe >= 0 ? '+' : ''}${formatMW(metrics.mbe)}`,
      sub: metrics.mbe >= 0 ? 'Net Over-forecasting (Long position risk)' : 'Net Under-forecasting (Short penalty risk)',
      icon: metrics.mbe >= 0 ? ArrowUpRight : ArrowDownRight,
      color: metrics.mbe >= 0 ? 'var(--accent-indigo)' : 'var(--accent-rose)',
      trend: `${metrics.overForecastCount} Over / ${metrics.underForecastCount} Under`,
      benchmark: 'Target Bias: ± 250 MW',
      status: Math.abs(metrics.mbe) < 300 ? 'BALANCED' : (metrics.mbe > 0 ? 'OVER-PREDICTING' : 'UNDER-PREDICTING')
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="card"
            style={{
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              borderTop: `3px solid ${c.color}`,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  {c.title}
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', background: `${c.color}20`, color: c.color }}>
                  <Icon size={18} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {c.value}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {c.sub}
              </p>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{c.trend}</span>
              <span className={`badge ${c.status === 'GOOD' || c.status === 'HIGH ACCURACY' || c.status === 'BALANCED' ? 'badge-green' : 'badge-amber'}`}>
                {c.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccuracyMetricsPanel;
