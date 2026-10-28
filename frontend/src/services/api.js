import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

export const windApi = {
  getActuals: async (startDate = '2026-01-01', endDate = '2026-01-31') => {
    const res = await api.get('/actuals', { params: { startDate, endDate } });
    return res.data;
  },

  getForecasts: async (startDate = '2026-01-01', endDate = '2026-01-31', horizonHours) => {
    const res = await api.get('/forecasts', { params: { startDate, endDate, horizonHours } });
    return res.data;
  },

  getComparison: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/comparison', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getComparisonPaginated: async (params) => {
    const res = await api.get('/comparison/paginated', { params });
    return res.data;
  },

  getAccuracy: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/accuracy', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getTimeseries: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/accuracy/timeseries', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getHorizons: async (startDate = '2026-01-01', endDate = '2026-01-31') => {
    const res = await api.get('/accuracy/horizons', { params: { startDate, endDate } });
    return res.data;
  },

  getDistribution: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/accuracy/distribution', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getHourly: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/accuracy/hourly', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getOverview: async (startDate = '2026-01-01', endDate = '2026-01-31', horizon = 'latest') => {
    const res = await api.get('/dashboard/overview', { params: { startDate, endDate, horizon } });
    return res.data;
  },

  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  }
};

export default windApi;
