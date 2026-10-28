import React from 'react';
import { Calendar, Zap, AlertTriangle, CloudRain, Wind } from 'lucide-react';

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  activePreset,
  onPresetSelect
}) => {
  const presets = [
    { id: 'full', label: 'Full Jan 2026', icon: Calendar },
    { id: 'w1', label: 'Week 1 (1-7)', icon: Wind },
    { id: 'w2', label: 'Week 2 (8-14)', icon: Wind },
    { id: 'w3', label: 'Week 3 (15-21)', icon: Wind },
    { id: 'w4', label: 'Week 4 (22-28)', icon: Wind },
    { id: 'storm', label: 'Storm Peak (1-4)', icon: CloudRain, highlight: true },
    { id: 'lull', label: 'Wind Lull (16-19)', icon: AlertTriangle, highlight: true },
  ];

  return (
    <div className="card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Calendar size={16} color="var(--accent-cyan)" />
          <span>DATE RANGE (JAN 2026):</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            min="2026-01-01"
            max="2026-01-31"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            min="2026-01-01"
            max="2026-01-31"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Preset pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>PRESETS:</span>
        {presets.map((p) => {
          const Icon = p.icon;
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPresetSelect(p.id)}
              className={`btn ${isActive ? 'btn-active' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderColor: p.highlight && !isActive ? 'rgba(244, 63, 94, 0.4)' : undefined,
                color: p.highlight && !isActive ? 'var(--accent-rose)' : undefined,
              }}
            >
              <Icon size={12} />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateRangePicker;
