import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./component/header";
import ThemeProvider from "./context/ThemeContext";
import Areas from "./pages/Areas";
import ChangePassword from "./pages/ChangePassword";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import WidgetDetail from "./pages/WidgetDetail";

function App() {
    const isLoggedIn = false; // Replace with actual authentication logic

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Header isLoggedIn={isLoggedIn} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/widget/:id" element={<WidgetDetail />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/my-areas" element={<Areas />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                        path="/change-password"
                        element={<ChangePassword />}
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
