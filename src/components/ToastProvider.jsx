import React from "react";

// Minimal toast system (no external libraries)
// - Used for "Copied to clipboard!" notifications
// - Bottom-right placement
// - Auto-dismiss after 2 seconds

const ToastContext = React.createContext(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Keep errors developer-friendly while avoiding hard crashes in prod
    return { pushToast: () => {} };
  }
  return ctx;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const pushToast = React.useCallback((message) => {
    // Add a toast and remove it after 2 seconds
    try {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = { id, message: String(message || "") };
      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2000);
    } catch {
      // No-op
    }
  }, []);

  const value = React.useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast viewport */}
      <div className="devtoolbox-toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="devtoolbox-toast">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

