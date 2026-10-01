import React, { useState, useEffect } from 'react';
import { optimizationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Boxes,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw
} from 'lucide-react';

const Optimization = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      const res = await optimizationService.getOptimization();
      setData(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory optimization specs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const handleGenerateRecommendations = async () => {
    try {
      setGenerating(true);
      const res = await optimizationService.generateRecommendations();
      showToast(res.data.message || 'Purchase recommendations generated!', 'success');
      navigate('/recommendations');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate recommendations', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const reorderRequiredList = data.filter((item) => item.isReorderRequired);
  const sufficientList = data.filter((item) => !item.isReorderRequired);

  return (
    <div className="space-y-6">
      {/* Title & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
              Core Feature P_191
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            Inventory Optimization Engine
          </h1>
          <p className="text-xs text-slate-300">
            Rule-Based Optimization Logic: Recommended Order = Maximum Stock - Current Stock (when Current Stock ≤ Minimum Stock).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleGenerateRecommendations}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 shrink-0"
          >
            {generating ? (
              <span>Syncing Spec...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Purchase Recommendation</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Reorder Required Items
          </span>
          <h3 className="text-2xl font-extrabold text-white">{reorderRequiredList.length} Products</h3>
          <p className="text-[11px] text-slate-400">Stock ≤ Minimum threshold</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Stock Sufficient Items
          </span>
          <h3 className="text-2xl font-extrabold text-white">{sufficientList.length} Products</h3>
          <p className="text-[11px] text-slate-400">Normal operating levels</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Monitored SKUs
          </span>
          <h3 className="text-2xl font-extrabold text-white">{data.length} Products</h3>
          <p className="text-[11px] text-slate-400">Automated stock calculations</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Running optimization rule-based calculations..." />
      ) : (
        <div className="space-y-8">
          {/* Section 1: REORDER REQUIRED CARDS */}
          {reorderRequiredList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">⚠️ Action Required: Reorder Alerts</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reorderRequiredList.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-white text-base">{item.productName}</h4>
                          <p className="text-xs text-slate-400">SKU: {item.SKU} | {item.category}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                          REORDER REQUIRED
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Current</span>
                          <span className="text-sm font-extrabold text-amber-400">{item.currentStock}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Minimum</span>
                          <span className="text-sm font-semibold text-slate-300">{item.minimumStock}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Maximum</span>
                          <span className="text-sm font-semibold text-slate-300">{item.maximumStock}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-200">Recommended Order:</span>
                        <span className="text-base font-extrabold text-amber-400">
                          {item.recommendedOrder} units
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.supplier?.companyName || item.supplier?.name || 'Supplier N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Complete Rule Optimization Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Full Inventory Rule Optimization Table</h3>
              <button
                onClick={fetchOptimizationData}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Rule Calculations</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Min Stock</th>
                      <th className="py-3 px-4 text-center">Max Stock</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Recommended Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {data.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <p>{row.productName}</p>
                          <p className="text-[11px] font-mono text-indigo-300">SKU: {row.SKU}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-white">
                          {row.currentStock}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                          {row.minimumStock}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                          {row.maximumStock}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              row.isReorderRequired
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`font-extrabold text-sm ${
                              row.recommendedOrder > 0 ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            {row.recommendedOrder > 0 ? `${row.recommendedOrder} units` : '0 units'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimization;
