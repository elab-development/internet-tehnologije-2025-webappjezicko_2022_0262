import { createContext, useContext, useState } from "react";
import Toast from "../components/Toast.jsx";
const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export default ToastProvider;