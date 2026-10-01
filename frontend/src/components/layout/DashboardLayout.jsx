import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Store Dashboard',
  '/products': 'Product Management',
  '/inventory': 'Inventory Tracking',
  '/sales/pos': 'Point of Sale (POS)',
  '/sales/history': 'Sales Transaction History',
  '/suppliers': 'Supplier Management',
  '/optimization': 'Inventory Optimization Engine',
  '/recommendations': 'Purchase Recommendations',
  '/reports': 'Analytics & Reports'
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Inventory System';

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar title={title} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
