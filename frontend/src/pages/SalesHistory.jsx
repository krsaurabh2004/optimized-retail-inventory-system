import React, { useState, useEffect } from 'react';
import { saleService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Receipt,
  Search,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      const res = await saleService.getSales({
        search,
        startDate,
        endDate
      });
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, [search, startDate, endDate]);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Title & Stats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            Sales Transaction History
          </h1>
          <p className="text-xs text-slate-400">Complete log of all completed retail sales orders.</p>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            Revenue: ₹{totalSalesRevenue.toLocaleString()}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            Orders: {sales.length} ({totalUnits} units)
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, SKU, or cashier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Start Date */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Fetching sales history..." />
      ) : sales.length === 0 ? (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
          No sales transactions found for the selected criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Purchased</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4">Cashier / Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {sales.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        <p>{s.product?.name || 'Unknown Product'}</p>
                        <p className="text-[11px] font-mono text-indigo-300">
                          SKU: {s.product?.SKU || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {s.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      ₹{s.unitPrice}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      ₹{s.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.soldBy?.name || 'Employee'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
