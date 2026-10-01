import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShoppingCart } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;

  switch (status) {
    case 'In Stock':
    case 'STOCK SUFFICIENT':
    case 'Completed':
      badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      Icon = CheckCircle2;
      break;
    case 'Low Stock':
    case 'REORDER REQUIRED':
    case 'Pending':
      badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      Icon = AlertTriangle;
      break;
    case 'Ordered':
      badgeStyle = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      Icon = ShoppingCart;
      break;
    case 'Out of Stock':
      badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      Icon = XCircle;
      break;
    default:
      badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
      Icon = Clock;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
