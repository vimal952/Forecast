// Formatting utility functions for UK Wind Power Forecast Dashboard

export const formatMW = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 MW';
  return `${Math.round(val).toLocaleString()} MW`;
};

export const formatGW = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00 GW';
  return `${(val / 1000).toFixed(2)} GW`;
};

export const formatPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(1)}%`;
};

export const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
};

export const formatHour = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
};

export const getErrorBadgeClass = (pctError) => {
  const p = Math.abs(pctError);
  if (p < 5) return 'badge-green';
  if (p < 15) return 'badge-amber';
  return 'badge-red';
};
