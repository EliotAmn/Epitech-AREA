import { Navigate } from "react-router-dom";

import { AuthService } from "@/services/api";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!AuthService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

interface PublicOnlyRouteProps {
    children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    if (AuthService.isAuthenticated()) {
        return <Navigate to="/explore" replace />;
    }

    return <>{children}</>;
}
