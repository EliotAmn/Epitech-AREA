import { useEffect, useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./component/header";
import { ProtectedRoute, PublicOnlyRoute } from "./component/ProtectedRoute";
import ThemeProvider from "./context/ThemeContext";
import Areas from "./pages/Areas";
import ChangePassword from "./pages/ChangePassword";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OAuthServiceProxy from "./pages/OAuthServiceProxy";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import WidgetDetail from "./pages/WidgetDetail";
import { AuthService } from "./services/api";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
        AuthService.isAuthenticated()
    );

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "authToken") {
                setIsLoggedIn(AuthService.isAuthenticated());
            }
        };

        const handleAuthChange = () => {
            setIsLoggedIn(AuthService.isAuthenticated());
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("authStateChanged", handleAuthChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("authStateChanged", handleAuthChange);
        };
    }, []);

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Header isLoggedIn={isLoggedIn} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/widget/:id" element={<WidgetDetail />} />
                    <Route
                        path="/oauth-service-proxy/:service_name"
                        element={
                            <ProtectedRoute>
                                <OAuthServiceProxy />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PublicOnlyRoute>
                                <SignUp />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/my-areas"
                        element={
                            <ProtectedRoute>
                                <Areas />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <Create />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
