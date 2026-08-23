import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { ToastType } from '../../contexts/ToastContext';

export interface ToastItemData {
  id: string;
  type: ToastType;
  message: string;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
};

export const ToastItem: React.FC<{
  toast: ToastItemData;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full ${bgMap[toast.type]} animate-in slide-in-from-right`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts?: ToastItemData[];
  onRemove?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts = [],
  onRemove = () => {},
}) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
