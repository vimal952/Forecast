import React, { useState, useMemo } from 'react';
import {
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatMW, formatPct, formatDateTime, getErrorBadgeClass } from '../utils/formatters';

export const DataTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchSearch =
        item.startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.settlementPeriod).includes(searchTerm);
      return matchSearch;
    });
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['Delivery Period (UTC)', 'Settlement Date', 'Settlement Period', 'Actual Generation (MW)', 'Forecast Generation (MW)', 'Error (MW)', 'Abs Error (MW)', 'Percentage Error (%)', 'Lead Time (Hours)'];
    const rows = sortedData.map((d) => [
      d.startTime,
      d.date,
      d.settlementPeriod || '',
      d.actualGeneration,
      d.forecastGeneration,
      d.error,
      d.absError,
      d.pctError,
      d.horizonHours || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UK_Wind_Forecast_vs_Actual_Jan2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} color="var(--text-muted)" />;
    return sortDirection === 'asc' ? <ArrowUp size={12} color="var(--accent-cyan)" /> : <ArrowDown size={12} color="var(--accent-cyan)" />;
  };

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Raw Delivery Period Data & Audit Table
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Aligned half-hourly settlement data with raw generation values and forecast variances
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', gap: '6px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by date, time..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '150px' }}
            />
          </div>

          {/* Export CSV */}
          <button onClick={exportCSV} className="btn" style={{ fontSize: '0.8rem' }}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <th onClick={() => handleSort('startTime')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  DELIVERY PERIOD (UTC) <SortIcon field="startTime" />
                </div>
              </th>
              <th onClick={() => handleSort('settlementPeriod')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  PERIOD <SortIcon field="settlementPeriod" />
                </div>
              </th>
              <th onClick={() => handleSort('actualGeneration')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ACTUAL (FUELHH) <SortIcon field="actualGeneration" />
                </div>
              </th>
              <th onClick={() => handleSort('forecastGeneration')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  FORECAST (WINDFOR) <SortIcon field="forecastGeneration" />
                </div>
              </th>
              <th onClick={() => handleSort('error')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  VARIANCE (MW) <SortIcon field="error" />
                </div>
              </th>
              <th onClick={() => handleSort('pctError')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  % ERROR <SortIcon field="pctError" />
                </div>
              </th>
              <th onClick={() => handleSort('horizonHours')} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  LEAD TIME <SortIcon field="horizonHours" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{formatDateTime(row.startTime)}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>SP {row.settlementPeriod || '-'}</td>
                <td style={{ padding: '10px 12px', color: 'var(--chart-actual)', fontWeight: 600 }}>{formatMW(row.actualGeneration)}</td>
                <td style={{ padding: '10px 12px', color: 'var(--chart-forecast)', fontWeight: 600 }}>{formatMW(row.forecastGeneration)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${row.error >= 0 ? 'badge-blue' : 'badge-amber'}`}>
                    {row.error >= 0 ? '+' : ''}{Math.round(row.error).toLocaleString()} MW
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${getErrorBadgeClass(row.pctError)}`}>
                    {formatPct(row.pctError)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {row.horizonHours ? `${row.horizonHours}h` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '10px' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10 / page</option>
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn"
            style={{ padding: '4px 8px', opacity: page === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn"
            style={{ padding: '4px 8px', opacity: page === totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
