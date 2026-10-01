import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Calendar,
  Layers
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

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Fetching live store metrics..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-rose-200 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, charts, lowStockAlerts, recentSales } = data;

  const metricCards = [
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      icon: Package,
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'Active SKU Catalog'
    },
    {
      title: 'Total Inventory Qty',
      value: metrics.totalInventoryQuantity.toLocaleString(),
      icon: Boxes,
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'In-Store Physical Stock'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockProducts,
      icon: AlertTriangle,
      gradient: 'from-amber-600 to-orange-600',
      badge: 'Action Required',
      highlight: metrics.lowStockProducts > 0
    },
    {
      title: 'Out of Stock Items',
      value: metrics.outOfStockProducts,
      icon: XCircle,
      gradient: 'from-rose-600 to-pink-600',
      badge: 'Depleted Stock',
      highlight: metrics.outOfStockProducts > 0
    },
    {
      title: "Today's Sales Count",
      value: metrics.todaysSalesCount,
      subValue: `₹${metrics.todaysRevenue.toLocaleString()}`,
      icon: ShoppingCart,
      gradient: 'from-violet-600 to-purple-600',
      badge: "Today's Volume"
    },
    {
      title: 'Total Sales Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-cyan-600 to-blue-600',
      badge: 'All-Time Sales'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Retail Performance Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time inventory tracking, sales metrics, and low-stock detection.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/optimization"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Optimization Engine</span>
          </Link>
          <Link
            to="/sales/pos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl p-6 bg-slate-900 border transition-all duration-300 hover:border-slate-700 ${
                card.highlight ? 'border-amber-500/40 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">{card.value}</h3>
                  {card.subValue && (
                    <p className="text-xs font-semibold text-emerald-400 mt-1">Revenue: {card.subValue}</p>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales over the last 7 days */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Sales Trend (Last 7 Days)</h3>
                <p className="text-xs text-slate-400">Daily revenue and transaction totals</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesLast7Days}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff'
                  }}
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory by Category */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Inventory by Category</h3>
                <p className="text-xs text-slate-400">Stock quantities across product categories</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} interval={0} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff'
                  }}
                  formatter={(val, name) => [val, name === 'totalQuantity' ? 'Quantity Units' : name]}
                />
                <Bar dataKey="totalQuantity" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Low Stock Alerts</h3>
            </div>
            <Link
              to="/optimization"
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Reorder Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              ✨ All products have sufficient stock levels!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Current Stock</th>
                    <th className="py-2.5 px-3 text-center">Min Stock</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {lowStockAlerts.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {item.SKU}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">
                        {item.minimumStock}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Sales Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Recent Sales Feed</h3>
            </div>
            <Link
              to="/sales/history"
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Sales</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No sales recorded yet. Use the POS page to record a sale!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {recentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {sale.productName}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-300">
                        {sale.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        ₹{sale.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-400">
                        {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
