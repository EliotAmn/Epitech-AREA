import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import WidgetDetail from "./pages/WidgetDetail";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/widget/:id" element={<WidgetDetail />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/login" element={<Login />} />
				<Route path="/explore" element={<Explore />} />
				<Route path="/create" element={<Create />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/change-password" element={<ChangePassword />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
