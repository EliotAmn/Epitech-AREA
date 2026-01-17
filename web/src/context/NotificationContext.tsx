/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

export type NotificationType = "success" | "error" | "info";

export type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number; // ms
};

type NotificationContextValue = {
    show: (n: Omit<Notification, "id">) => string;
    showSuccess: (title: string, message?: string, duration?: number) => string;
    showError: (title: string, message?: string, duration?: number) => string;
    dismiss: (id: string) => void;
    notifications: Notification[];
};

const NotificationContext = createContext<NotificationContextValue | null>(
    null
);

export function useNotificationContext() {
    const ctx = useContext(NotificationContext);
    if (!ctx)
        throw new Error("useNotificationContext must be used within provider");
    return ctx;
}

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const show = useCallback(
        (n: Omit<Notification, "id">) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const notif: Notification = { id, ...n };
            setNotifications((prev) => [notif, ...prev]);
            if (notif.duration && notif.duration > 0) {
                setTimeout(() => dismiss(id), notif.duration);
            } else {
                // default 4s
                setTimeout(() => dismiss(id), notif.duration ?? 4000);
            }
            return id;
        },
        [dismiss]
    );

    const showSuccess = useCallback(
        (title: string, message?: string, duration?: number) =>
            show({ type: "success", title, message, duration }),
        [show]
    );

    const showError = useCallback(
        (title: string, message?: string, duration?: number) =>
            show({ type: "error", title, message, duration }),
        [show]
    );

    const value = useMemo(
        () => ({ show, showSuccess, showError, dismiss, notifications }),
        [show, showSuccess, showError, dismiss, notifications]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div id="notification-root" />
        </NotificationContext.Provider>
    );
}
