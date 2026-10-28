import React from 'react';
import { Clock, Info } from 'lucide-react';

export const ForecastHorizonSelector = ({ horizon, onHorizonChange }) => {
  const options = [
    {
      id: 'day_ahead',
      label: 'Day-Ahead (24h Gate)',
      sub: 'Wholesale Market Gate (D-1 ~12:00)',
      color: 'var(--accent-blue)',
    },
    {
      id: 'latest',
      label: 'Latest Available',
      sub: 'Most recent run before delivery',
      color: 'var(--accent-cyan)',
    },
    {
      id: '1h',
      label: '1h Ahead',
      sub: 'Near real-time dispatch',
      color: 'var(--accent-teal)',
    },
    {
      id: '4h',
      label: '4h Ahead',
      sub: 'Balancing Mechanism window',
      color: 'var(--accent-indigo)',
    },
    {
      id: '12h',
      label: '12h Ahead',
      sub: 'Intraday power auctions',
      color: 'var(--accent-amber)',
    },
    {
      id: '48h',
      label: '48h Ahead',
      sub: 'Medium-term thermal commitment',
      color: 'var(--accent-rose)',
    },
  ];

  return (
    <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Clock size={16} color="var(--accent-cyan)" />
          <span>FORECAST HORIZON / LEAD TIME:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Info size={13} />
          <span>Elexon WINDFOR dataset lead times relative to delivery period</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {options.map((opt) => {
          const isSelected = horizon === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onHorizonChange(opt.id)}
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                border: `1.5px solid ${isSelected ? opt.color : 'var(--border-color)'}`,
                boxShadow: isSelected ? `0 0 10px ${opt.color}33` : 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? opt.color : 'var(--text-primary)' }}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastHorizonSelector;
