# Optimized Retail Inventory Management System (P_191)

> **College / Academic Project ID**: P_191  
> A simple, modern, and practical full-stack retail inventory management web application for small to medium-sized retail stores. Built with Node.js, Express.js, MongoDB (Mongoose), React.js (Vite), and Tailwind CSS.

---

## 📌 Project Overview

The **Optimized Retail Inventory Management System** streamlines retail store operations by providing:
1. **Real-time Inventory Tracking**: Automatic stock level updates and audit transaction logging on every sale or stock adjustment.
2. **POS Sales System**: Point-of-Sale checkout interface that validates available stock, calculates order totals, prevents over-selling, and updates dashboard metrics automatically.
3. **Rule-Based Inventory Optimization Engine**: Automatic low-stock detection ($\text{Current Stock} \le \text{Minimum Stock}$) and reorder calculation ($\text{Recommended Order} = \text{Maximum Stock} - \text{Current Stock}$).
4. **Purchase Order Recommendations**: Workflow allowing store managers to generate and transition purchase recommendations (`Pending` $\rightarrow$ `Ordered` $\rightarrow$ `Completed`) with automatic inventory restocking upon order completion.
5. **Role-Based Access Control (RBAC)**: Admin and Employee roles with protected frontend routes and backend JWT security.

---

## ✨ Features

- 🔐 **Authentication & Authorization**: JWT token auth, bcrypt password hashing, role-based protection (Admin vs Employee).
- 📊 **Interactive Dashboard**: Real-time sales metrics, 7-day sales trend line chart, inventory category distribution bar chart, low stock alerts, and recent sales feed.
- 📦 **Product Management**: Full CRUD operations, SKU generation, search, category filtering, stock status filters (`In Stock`, `Low Stock`, `Out of Stock`), and sorting options.
- 🏬 **Supplier Directory**: Supplier contact info, company details, address management, and product association counters.
- 🛒 **Point of Sale (POS)**: Instant product search, stock validation warnings, live total calculations, and instant database stock deductions.
- 🔄 **Stock Audit & Transactions**: Complete history log of stock changes (`PURCHASE`, `SALE`, `ADJUSTMENT`, `DAMAGED`) capturing previous and updated stock.
- 💡 **Inventory Optimization Engine**: Rule-based reorder logic with zero ML bloat.
- 📝 **Purchase Recommendations**: Status pipeline for order restocks.
- 📈 **Analytics & Reports**: Timeframe-filtered summaries (Today, Last 7 Days, Last 30 Days) with printable layout support.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router DOM v6, Tailwind CSS, Lucide Icons, Recharts, Axios.
- **Backend**: Node.js, Express.js, RESTful APIs, JWT (`jsonwebtoken`), Password hashing (`bcryptjs`), CORS.
- **Database**: MongoDB & Mongoose schemas (`User`, `Supplier`, `Product`, `Sale`, `InventoryTransaction`, `PurchaseRecommendation`). Fallback support to `mongodb-memory-server` if local MongoDB daemon is offline.

---

## 📁 Folder Structure

```
retail-inventory-system/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection with MongoMemoryServer fallback
│   │   ├── controllers/     # Route logic handlers (auth, product, supplier, sale, inventory, optimization, dashboard, report)
│   │   ├── middleware/      # JWT authentication and error handling
│   │   ├── models/          # Mongoose Schemas (User, Supplier, Product, Sale, InventoryTransaction, PurchaseRecommendation)
│   │   ├── routes/          # Express route definitions
│   │   ├── seed/            # Seed script with realistic sample data
│   │   └── app.js           # Express app setup
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Node server listener (Port 5000)
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI components & layout (Sidebar, Navbar, DashboardLayout, Modal, Toast, StatusBadge)
│   │   ├── context/         # AuthContext & ToastContext
│   │   ├── pages/           # Dashboard, Products, Inventory, SalesPOS, SalesHistory, Suppliers, Optimization, Recommendations, Reports
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Router & guarded paths
│   │   ├── main.jsx         # Vite entry
│   │   └── index.css        # Tailwind & glassmorphic styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔑 Sample Credentials & Seeding

Run the seed script to populate demo users, suppliers, products, and 7-day sales records:

```bash
cd backend
npm run seed
```

### Seeded User Accounts:
- **Admin**: `admin@retail.com` / `admin123`
- **Employee**: `employee@retail.com` / `employee123`

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/retail_inventory
JWT_SECRET=super_secret_jwt_key_p191_retail_system_2026
NODE_ENV=development
```

---

## 🚀 How to Run Locally

### 1. Backend Setup & Run
```bash
cd backend
npm install
npm run seed     # Populate database with 12 products, 5 suppliers, 25 sales records
npm start        # Starts Express backend at http://localhost:5000
```

### 2. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

Access the application in your browser at: **`http://localhost:5173`**

---

## 🔌 API Documentation Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET  /api/auth/me` - Get current user profile (Protected)

### Products (`/api/products`)
- `GET    /api/products` - List products with search, category, status, & sort filters
- `POST   /api/products` - Add new product (Admin)
- `GET    /api/products/:id` - Get product details
- `PUT    /api/products/:id` - Update product & log stock changes (Admin)
- `DELETE /api/products/:id` - Remove product (Admin)

### Suppliers (`/api/suppliers`)
- `GET    /api/suppliers` - List suppliers with product association counts
- `POST   /api/suppliers` - Add supplier (Admin)
- `PUT    /api/suppliers/:id` - Update supplier (Admin)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Sales (`/api/sales`)
- `POST /api/sales` - Record POS sale, deduct stock, log transaction
- `GET  /api/sales` - Get historical sales list (with date filters)

### Inventory (`/api/inventory`)
- `GET  /api/inventory` - Get complete inventory list
- `GET  /api/inventory/low-stock` - Get low stock items
- `GET  /api/inventory/out-of-stock` - Get depleted items
- `GET  /api/inventory/transactions` - Get transaction audit log
- `POST /api/inventory/adjust` - Manual stock adjustment (PURCHASE, ADJUSTMENT, DAMAGED) (Admin)

### Optimization & Recommendations (`/api/optimization`)
- `GET  /api/optimization` - Get rule-based reorder analysis for all products
- `POST /api/optimization/generate-recommendations` - Auto-generate purchase recommendations for low stock products (Admin)
- `GET  /api/optimization/recommendations` - List purchase order recommendations
- `PUT  /api/optimization/recommendations/:id` - Update recommendation status (`Pending` $\rightarrow$ `Ordered` $\rightarrow$ `Completed`) (Admin)

### Dashboard & Reports (`/api/dashboard`, `/api/reports`)
- `GET /api/dashboard` - Get real-time metric cards, chart data, low stock alerts, & recent sales feed
- `GET /api/reports` - Get timeframe analytics (`today`, `7days`, `30days`)

---

## 🔮 Future Improvements

1. Barcode scanner support for fast POS checkout.
2. Export reports to PDF and CSV formats.
3. Automated email alerts to suppliers when purchase recommendations are generated.
4. Multi-location / multi-branch store inventory management.
