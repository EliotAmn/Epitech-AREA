import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./component/header";
import ThemeProvider from "./context/ThemeContext";
import Actions from "./pages/Actions";
import Areas from "./pages/Areas";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Reactions from "./pages/Reactions";
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
					<Route path="/explore" element={<Explore />} />
					<Route path="/create" element={<Create />} />
					<Route path="/create/action" element={<Actions />} />
					<Route path="/create/reaction" element={<Reactions />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
