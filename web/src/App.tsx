import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import WidgetDetail from "./pages/WidgetDetail";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Actions from "./pages/Actions";
import Reactions from "./pages/Reactions";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/widget/:id" element={<WidgetDetail />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/explore" element={<Explore />} />
				<Route path="/create" element={<Create />} />
				<Route path="/create/action" element={<Actions />} />
				<Route path="/create/reaction" element={<Reactions />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
