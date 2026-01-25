import * as React from "react";

interface Toast {
  id: number;
  title: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const addToast = (toast: Omit<Toast, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: Date.now() + Math.random() },
    ]);
  };
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-neutral-900 text-white px-4 py-3 rounded shadow flex flex-col gap-1 min-w-55"
            onClick={() => removeToast(toast.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="font-semibold">{toast.title}</div>
            {toast.description && <div className="text-xs opacity-80">{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

export function useToast() {
  const { addToast } = useToastContext();
  return {
    toast: addToast,
  };
}
