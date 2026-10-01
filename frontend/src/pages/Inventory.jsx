import React, { useState, useEffect } from 'react';
import { inventoryService, productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Boxes,
  History,
  Sliders,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'transactions'
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [transactionType, setTransactionType] = useState('All');

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [adjustData, setAdjustData] = useState({
    productId: '',
    type: 'PURCHASE',
    quantity: 10,
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventory({ status: statusFilter });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getTransactions({ type: transactionType });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load transaction audit history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchInventory();
    } else {
      fetchTransactions();
    }
  }, [activeTab, statusFilter, transactionType]);

  const handleOpenAdjustModal = async () => {
    try {
      const res = await productService.getProducts();
      setProductsList(res.data);
      if (res.data.length > 0) {
        setAdjustData({
          productId: res.data[0]._id,
          type: 'PURCHASE',
          quantity: 10,
          note: ''
        });
      }
      setIsAdjustModalOpen(true);
    } catch (err) {
      showToast('Failed to load product list', 'error');
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustData.productId || adjustData.quantity === '' || Number(adjustData.quantity) < 0) {
      showToast('Please select a product and valid quantity', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await inventoryService.adjustStock(adjustData);
      showToast('Inventory stock adjusted successfully!', 'success');
      setIsAdjustModalOpen(false);
      if (activeTab === 'stock') fetchInventory();
      else fetchTransactions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to adjust stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-400" />
            Inventory & Stock Audit
          </h1>
          <p className="text-xs text-slate-400">Monitor stock levels, min/max thresholds, and complete transaction logs.</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleOpenAdjustModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adjust Stock</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stock'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Levels</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction Audit History</span>
        </button>
      </div>

      {/* Tab Content 1: Stock Levels */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === filter
                    ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner label="Loading current inventory stock..." />
          ) : inventory.length === 0 ? (
            <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No inventory items match the selected filter.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3 px-4">Product / SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Min Stock</th>
                      <th className="py-3 px-4 text-center">Max Stock</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[11px] font-mono text-indigo-300">SKU: {item.SKU}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300">{item.category}</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-base text-white">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                          {item.minimumStock}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                          {item.maximumStock}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.supplier?.companyName || item.supplier?.name || 'Unassigned'}</span>
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
      )}

      {/* Tab Content 2: Transaction Audit History */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Transaction Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'PURCHASE', 'SALE', 'ADJUSTMENT', 'DAMAGED'].map((t) => (
              <button
                key={t}
                onClick={() => setTransactionType(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  transactionType === t
                    ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner label="Loading audit transactions..." />
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No transaction audit records found for this type.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Type</th>
                      <th className="py-3 px-4 text-center">Qty Change</th>
                      <th className="py-3 px-4 text-center">Prev $\rightarrow$ New</th>
                      <th className="py-3 px-4">Logged By / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {tx.product?.name || 'Unknown Product'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                              tx.type === 'SALE'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                : tx.type === 'PURCHASE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : tx.type === 'DAMAGED'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-white">
                          {tx.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-300">
                          {tx.previousStock} $\rightarrow$ <span className="font-bold text-indigo-300">{tx.newStock}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300">
                          <p className="font-medium text-slate-200">{tx.createdBy?.name || 'System'}</p>
                          {tx.note && <p className="text-[11px] text-slate-500">{tx.note}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Record Stock Adjustment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={adjustData.productId}
              onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {productsList.map((p) => (
                <option key={p._id} value={p._id} className="bg-slate-900">
                  {p.name} (Current Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'PURCHASE', label: 'Inward Purchase' },
                { id: 'ADJUSTMENT', label: 'Inventory Count' },
                { id: 'DAMAGED', label: 'Damaged / Lost' }
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setAdjustData({ ...adjustData, type: t.id })}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    adjustData.type === t.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {adjustData.type === 'ADJUSTMENT' ? 'New Target Quantity' : 'Quantity Units'} *
            </label>
            <input
              type="number"
              min="0"
              required
              value={adjustData.quantity}
              onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Adjustment Note / Reason
            </label>
            <input
              type="text"
              value={adjustData.note}
              onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })}
              placeholder="e.g. Received shipment #402 from supplier"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              {submitting ? 'Applying Adjustment...' : 'Save Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
