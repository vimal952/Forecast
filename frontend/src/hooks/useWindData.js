import { useState, useEffect, useCallback } from 'react';
import { windApi } from '../services/api';

export const useWindData = () => {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [horizon, setHorizon] = useState('day_ahead');
  const [activePreset, setActivePreset] = useState('full');

  const [overview, setOverview] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, comparisonData, hourlyData] = await Promise.all([
        windApi.getOverview(startDate, endDate, horizon),
        windApi.getComparison(startDate, endDate, horizon),
        windApi.getHourly(startDate, endDate, horizon),
      ]);

      setOverview(overviewData);
      setComparison(comparisonData);
      setHourly(hourlyData);
    } catch (err) {
      console.error('Failed to fetch wind power data:', err);
      setError(err?.response?.data?.detail || err.message || 'Error communicating with Elexon data server.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, horizon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'full':
        setStartDate('2026-01-01');
        setEndDate('2026-01-31');
        break;
      case 'w1':
        setStartDate('2026-01-01');
        setEndDate('2026-01-07');
        break;
      case 'w2':
        setStartDate('2026-01-08');
        setEndDate('2026-01-14');
        break;
      case 'w3':
        setStartDate('2026-01-15');
        setEndDate('2026-01-21');
        break;
      case 'w4':
        setStartDate('2026-01-22');
        setEndDate('2026-01-28');
        break;
      case 'storm':
        setStartDate('2026-01-01');
        setEndDate('2026-01-04');
        break;
      case 'lull':
        setStartDate('2026-01-16');
        setEndDate('2026-01-19');
        break;
      default:
        break;
    }
  };

  return {
    startDate,
    endDate,
    horizon,
    activePreset,
    overview,
    comparison,
    hourly,
    loading,
    error,
    setStartDate,
    setEndDate,
    setHorizon,
    applyPreset,
    refetch: fetchData,
  };
};

export default useWindData;
