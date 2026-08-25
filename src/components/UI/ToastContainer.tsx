import React from 'react';
import { useToast } from '@/context/ToastContext';
import { Toast } from './Toast';
import './ToastContainer.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
