import { useContext, useLayoutEffect } from "react";

import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import { ThemeContext } from "../context/ThemeContext";

export default function Explore() {
	const navigate = useNavigate();
	const { setTheme, resetTheme } = useContext(ThemeContext);

	useLayoutEffect(() => {
		setTheme("dark");
		return () => resetTheme();
	}, [setTheme, resetTheme]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-start">
			<div className="flex flex-col items-center w-full h-[530px] bg-[#242424] gap-6">
				<h1 className="text-5xl text-white font-bold m-4">Explore</h1>
				<Button
					label="Create my own area"
					mode="white"
					onClick={() => navigate("/create")}
				/>
			</div>
		</div>
	);
}
