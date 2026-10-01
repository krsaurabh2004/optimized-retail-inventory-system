import React, { useState, useEffect } from 'react';
import { productService, saleService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Receipt,
  UserCheck,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalesPOS = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Cart / Selected Product State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ search });
      setProducts(res.data);
      if (res.data.length > 0 && !selectedProduct) {
        setSelectedProduct(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch product list for POS', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const incrementQty = () => {
    if (selectedProduct && quantity < selectedProduct.quantity) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast(`Cannot exceed available stock (${selectedProduct.quantity})`, 'warning');
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      showToast('Please select a product first', 'warning');
      return;
    }

    if (selectedProduct.quantity < quantity) {
      showToast(`Stock limit exceeded. Only ${selectedProduct.quantity} units in stock.`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await saleService.createSale({
        productId: selectedProduct._id,
        quantity: Number(quantity)
      });

      showToast(
        `Sale completed! ${quantity}x ${selectedProduct.name} (Total: ₹${res.data.totalAmount})`,
        'success'
      );

      // Refresh product list and update stock locally
      await fetchProducts();
      setQuantity(1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Sale processing failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalculated = selectedProduct ? selectedProduct.price * quantity : 0;
  const isStockInsufficient = selectedProduct ? selectedProduct.quantity < quantity : false;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-400" />
            Point of Sale (POS) Terminal
          </h1>
          <p className="text-xs text-slate-400">Scan or select items to process customer retail sales instantly.</p>
        </div>

        <button
          onClick={() => navigate('/sales/history')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
        >
          <Receipt className="w-4 h-4 text-indigo-400" />
          <span>View Sales History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <LoadingSpinner label="Loading items..." />
          ) : products.length === 0 ? (
            <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              No products match search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {products.map((p) => {
                const isSelected = selectedProduct?._id === p._id;
                const isOut = p.quantity === 0;

                return (
                  <div
                    key={p._id}
                    onClick={() => !isOut && handleSelectProduct(p)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isOut
                        ? 'bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-[11px] font-mono text-indigo-300">SKU: {p.SKU}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-xs text-slate-400">Stock: </span>
                        <span
                          className={`font-bold text-xs ${
                            p.quantity === 0
                              ? 'text-rose-400'
                              : p.quantity <= p.minimumStock
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {p.quantity} units
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-white">₹{p.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Billing Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-lg tracking-tight">Checkout Summary</h3>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                POS Terminal #01
              </span>
            </div>

            {selectedProduct ? (
              <div className="space-y-4">
                {/* Selected Item Overview */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{selectedProduct.name}</h4>
                      <p className="text-xs text-slate-400">
                        Category: {selectedProduct.category} | SKU: {selectedProduct.SKU}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-indigo-400">₹{selectedProduct.price}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-400">Available Stock:</span>
                    <span className="font-bold text-white">{selectedProduct.quantity} units</span>
                  </div>
                </div>

                {/* Quantity Control Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > selectedProduct.quantity) {
                          showToast(`Maximum available stock is ${selectedProduct.quantity}`, 'warning');
                          setQuantity(selectedProduct.quantity);
                        } else {
                          setQuantity(val > 0 ? val : 1);
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center text-lg font-bold text-white focus:outline-none focus:border-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={quantity >= selectedProduct.quantity}
                      className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Warning Banner */}
                {isStockInsufficient && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Requested quantity exceeds available stock!</span>
                  </div>
                )}

                {/* Calculation Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Unit Price:</span>
                    <span>₹{selectedProduct.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Quantity:</span>
                    <span>x {quantity}</span>
                  </div>
                  <div className="border-t border-slate-800 my-2 pt-2 flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Total Amount Payable:</span>
                    <span className="font-extrabold text-2xl text-emerald-400">
                      ₹{totalCalculated.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                Select an available item from the left catalog to proceed with checkout.
              </div>
            )}
          </div>

          {/* Complete Sale Button */}
          <button
            onClick={handleCompleteSale}
            disabled={!selectedProduct || isStockInsufficient || submitting || selectedProduct.quantity === 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {submitting ? (
              <span>Processing Sale...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Sale (₹{totalCalculated.toLocaleString()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesPOS;
