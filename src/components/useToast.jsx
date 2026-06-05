"use client";

import { useState, useCallback, useEffect } from "react";

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    info:    (msg) => addToast(msg, "info"),
  };

  return { toasts, toast };
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          pointer-events: none;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.1rem;
          border: 1px solid var(--border);
          background: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          min-width: 260px;
          max-width: 380px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          animation: toastIn 0.25s ease forwards;
        }
        .toast-success { border-left: 4px solid #16a34a; }
        .toast-error   { border-left: 4px solid #dc2626; }
        .toast-info    { border-left: 4px solid var(--primary); }
        .toast-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .toast-success .toast-dot { background: #16a34a; }
        .toast-error   .toast-dot { background: #dc2626; }
        .toast-info    .toast-dot { background: var(--primary); }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-dot" />
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
