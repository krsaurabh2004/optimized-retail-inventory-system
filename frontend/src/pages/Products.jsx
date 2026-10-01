import React, { useState, useEffect } from 'react';
import { productService, supplierService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Boxes,
  Building2,
  DollarSign
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  // Form State
  const initialForm = {
    name: '',
    SKU: '',
    category: 'Grains & Pulses',
    brand: '',
    description: '',
    price: '',
    costPrice: '',
    quantity: 0,
    minimumStock: 10,
    maximumStock: 100,
    supplier: '',
    image: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const categories = [
    'All',
    'Grains & Pulses',
    'Dairy & Bakery',
    'Beverages',
    'Snacks & Biscuits',
    'Oil & Spices',
    'Groceries & Essentials'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        search,
        category,
        status,
        sortBy
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await supplierService.getSuppliers();
      setSuppliers(res.data);
      if (res.data.length > 0 && !formData.supplier) {
        setFormData((prev) => ({ ...prev, supplier: res.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, status, sortBy]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setFormData({
      ...initialForm,
      supplier: suppliers[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      SKU: prod.SKU,
      category: prod.category,
      brand: prod.brand || '',
      description: prod.description || '',
      price: prod.price,
      costPrice: prod.costPrice,
      quantity: prod.quantity,
      minimumStock: prod.minimumStock,
      maximumStock: prod.maximumStock,
      supplier: prod.supplier?._id || prod.supplier || '',
      image: prod.image || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (prod) => {
    setSelectedProduct(prod);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.SKU || !formData.price || !formData.supplier) {
      showToast('Please fill out all required fields (*)', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct._id, formData);
        showToast(`Product "${formData.name}" updated!`, 'success');
      } else {
        await productService.createProduct(formData);
        showToast(`Product "${formData.name}" created!`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      await productService.deleteProduct(selectedProduct._id);
      showToast(`Product "${selectedProduct.name}" deleted!`, 'success');
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Product Management
          </h1>
          <p className="text-xs text-slate-400">Manage catalog, pricing, SKU codes, and supplier linkages.</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <Boxes className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white">Stock: All Statuses</option>
            <option value="In Stock" className="bg-slate-900 text-white">In Stock</option>
            <option value="Low Stock" className="bg-slate-900 text-white">Low Stock</option>
            <option value="Out of Stock" className="bg-slate-900 text-white">Out of Stock</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-slate-900 text-white">Sort: Newest First</option>
            <option value="name_asc" className="bg-slate-900 text-white">Sort: Name (A-Z)</option>
            <option value="price_low" className="bg-slate-900 text-white">Sort: Price (Low to High)</option>
            <option value="price_high" className="bg-slate-900 text-white">Sort: Price (High to Low)</option>
            <option value="quantity_low" className="bg-slate-900 text-white">Sort: Stock (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      {loading ? (
        <LoadingSpinner label="Loading products list..." />
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting search keywords or filters. If you are an Admin, add a new product!
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Product Info</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Stock / Threshold</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-mono text-indigo-300">SKU: {p.SKU}</span>
                            <span>•</span>
                            <span>{p.brand || 'Generic'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{p.supplier?.companyName || p.supplier?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-bold text-white">₹{p.price}</p>
                      <p className="text-[11px] text-slate-500">Cost: ₹{p.costPrice}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-white text-base">{p.quantity}</span>
                      <span className="text-xs text-slate-500 block">
                        Min: {p.minimumStock} | Max: {p.maximumStock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? 'Edit Product Specification' : 'Add New Product to Catalog'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Coca Cola 750ml"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.SKU}
                onChange={(e) => setFormData({ ...formData, SKU: e.target.value.toUpperCase() })}
                placeholder="BEV-COKE-005"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Britannia"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="40.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="30.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Initial / Current Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Supplier Link *
              </label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id} className="bg-slate-900">
                    {sup.companyName} ({sup.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Minimum Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Maximum Stock Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.maximumStock}
                onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description or packaging specs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              {submitting ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default Products;
