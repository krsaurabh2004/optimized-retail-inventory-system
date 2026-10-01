import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Shield, User, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ title = 'Dashboard', onToggleSidebar }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-16 sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">Retail Inventory Optimization Engine</p>
        </div>
      </div>

      {/* Right section: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* Quick POS Sale Button */}
        <Link
          to="/sales/pos"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New POS Sale</span>
        </Link>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <User className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="font-medium text-slate-200">{user?.name || 'User'}</span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              isAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
            }`}
          >
            {user?.role || 'Staff'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
