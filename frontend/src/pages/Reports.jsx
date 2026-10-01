import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart3,
  Calendar,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  XCircle,
  PieChart as PieIcon,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Reports = () => {
  const [range, setRange] = useState('30days'); // 'today' | '7days' | '30days'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReportData({ range });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner label="Generating store report analytics..." />;
  }

  const { metrics, charts } = reportData;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Executive Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400">Comprehensive sales breakdown, revenue, and stock health audits.</p>
        </div>

        {/* Timeframe selector buttons & Print */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === t.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Print Summary Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Products</span>
          <p className="text-xl font-extrabold text-white">{metrics.totalProducts}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Sales Orders</span>
          <p className="text-xl font-extrabold text-white">{metrics.totalSalesCount} orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Total Revenue</span>
          <p className="text-xl font-extrabold text-emerald-400">₹{metrics.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase">Low Stock Count</span>
          <p className="text-xl font-extrabold text-amber-400">{metrics.lowStockCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-1">
          <span className="text-[11px] font-semibold text-rose-400 uppercase">Out of Stock Count</span>
          <p className="text-xl font-extrabold text-rose-400">{metrics.outOfStockCount}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Sales Revenue Breakdown ({range})</h3>
            <p className="text-xs text-slate-400">Revenue generated per day in selected period</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailySales}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff'
                  }}
                  formatter={(val) => [`₹${val}`, 'Daily Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#reportGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Inventory Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Category-Wise Inventory Distribution</h3>
            <p className="text-xs text-slate-400">Physical unit stock per product category</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.categoryInventory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff'
                  }}
                  formatter={(val) => [val, 'Total Units']}
                />
                <Bar dataKey="totalQuantity" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
