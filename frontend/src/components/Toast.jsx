import { useEffect } from "react";

export default function Toast({
  type = "info",
  message,
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: "#4caf50", text: "white" },
    error: { bg: "#f44336", text: "white" },
    info: { bg: "#2196f3", text: "white" },
  };

  const style = {
    position: "fixed",
    bottom: 20,
    right: 20,
    minWidth: 250,
    padding: "12px 16px",
    backgroundColor: colors[type].bg,
    color: colors[type].text,
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 9999,
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    animation: "toastFadeIn 0.3s",
  };

  const btnStyle = {
    background: "transparent",
    border: "none",
    color: colors[type].text,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: 12,
  };

  return (
    <div style={style}>
      <span>{message}</span>
      <button style={btnStyle} onClick={onClose}>
      </button>
    </div>
  );
}