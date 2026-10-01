import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3500, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
      iconColor: 'text-emerald-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
      iconColor: 'text-rose-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
      iconColor: 'text-amber-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-sky-950/90 border-sky-500/50 text-sky-200',
      iconColor: 'text-sky-400'
    }
  };

  const { icon: Icon, bgColor, iconColor } = config[type] || config.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-2xl ${bgColor} max-w-md`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
        <span className="text-sm font-medium leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
