import { useEffect, useState, lazy } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./component/header";
import { ProtectedRoute, PublicOnlyRoute } from "./component/ProtectedRoute";
import ThemeProvider from "./context/ThemeContext";
const AreaDetail = lazy(() => import('./pages/AreaDetail'));
const Areas = lazy(() => import('./pages/Areas'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Create = lazy(() => import('./pages/Create'));
const EditArea = lazy(() => import('./pages/EditArea'));
const Explore = lazy(() => import('./pages/Explore'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
import OAuthServiceProxy from "./pages/OAuthServiceProxy";
const Profile = lazy(() => import('./pages/Profile'));
const SignUp = lazy(() => import('./pages/SignUp'));
const WidgetDetail = lazy(() => import('./pages/WidgetDetail'));
import { AuthService } from "./services/api";
import "./styles/responsiveGrids.css";


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
                <div className="flex flex-col h-screen overflow-hidden">
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
                            path="/area/:id"
                            element={
                                <ProtectedRoute>
                                    <AreaDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-areas/edit"
                            element={
                                <ProtectedRoute>
                                    <EditArea />
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
                        <Route
                            path="/reaction/:name"
                            element={
                                <ProtectedRoute>
                                    <WidgetDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/service/:name"
                            element={
                                <ProtectedRoute>
                                    <WidgetDetail />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
