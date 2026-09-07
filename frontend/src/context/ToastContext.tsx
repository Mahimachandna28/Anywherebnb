"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
  success: (
    message: string,
    options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
  ) => string;
  error: (
    message: string,
    options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
  ) => string;
  info: (
    message: string,
    options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
  ) => string;
  warning: (
    message: string,
    options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
  ) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message,
      title,
      type = "info",
      duration = 4000,
      action,
    }: Omit<ToastItem, "id">): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = {
        id,
        message,
        title,
        type,
        duration,
        action,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
    ) => {
      return showToast({ message, type: "success", ...options });
    },
    [showToast]
  );

  const error = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
    ) => {
      return showToast({ message, type: "error", ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
    ) => {
      return showToast({ message, type: "info", ...options });
    },
    [showToast]
  );

  const warning = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastItem, "id" | "message" | "type">>
    ) => {
      return showToast({ message, type: "warning", ...options });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
