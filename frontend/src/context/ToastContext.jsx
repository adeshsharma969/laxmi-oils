import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastCtx = createContext(null);

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = "success") => {
    const id = ++_id;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), 3200);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return (
    <ToastCtx.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  return ctx?.toast || { success: () => {}, error: () => {}, info: () => {} };
};

export const useToastCtx = () => useContext(ToastCtx);
