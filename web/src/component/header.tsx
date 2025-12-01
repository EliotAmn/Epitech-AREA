import { useContext } from "react";

import { useNavigate } from "react-router-dom";

import { ThemeContext, type Theme } from "../context/ThemeContext";

interface HeaderProps {
	className?: string;
	isLoggedIn: boolean;
	theme?: Theme;
}

export default function Header({
	className = "",
	isLoggedIn,
	theme,
}: HeaderProps) {
	const navigate = useNavigate();
	const ctx = useContext(ThemeContext);
	const appliedTheme = theme ?? ctx.theme;

	const themeClasses =
		appliedTheme === "dark"
			? "bg-[#242424] text-white"
			: "bg-white text-black";

	const hoverTextClass =
		appliedTheme === "dark" ? "hover:text-zinc-300" : "hover:text-zinc-600";

	return (
		<div
			className={`relative w-full flex justify-between items-center ${themeClasses} ${className}`}
		>
			<button
				className={`text-3xl font-bold p-4 hover:cursor-pointer ${hoverTextClass}`}
				onClick={() => navigate(isLoggedIn ? "/explore" : "/")}
				type="button"
				aria-label="Home"
			>
				AÉRA
			</button>
			<nav
				aria-label="Main navigation"
				className="flex items-center space-x-4 p-4"
			>
				{isLoggedIn ? (
					<>
						<button
							className={`text-xl hover:cursor-pointer ${hoverTextClass}`}
							onClick={() => navigate("/explore")}
							type="button"
							aria-label="Explore"
						>
							Explore
						</button>
						<button
							className={`text-xl hover:cursor-pointer ${hoverTextClass}`}
							onClick={() => navigate("/my-areas")}
							type="button"
							aria-label="My AREAS"
						>
							My AREAS
						</button>
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 cursor-pointer"
							onClick={() => navigate("/create")}
							type="button"
							aria-label="Create area"
						>
							Create
						</button>
						<button
							className={`hover:cursor-pointer ${hoverTextClass}`}
							onClick={() => navigate("/profile")}
							type="button"
							aria-label="Profile"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.3}
									d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</button>
					</>
				) : (
					<>
						<button
							className={`text-xl hover:cursor-pointer ${hoverTextClass}`}
							onClick={() => navigate("/explore")}
							type="button"
							aria-label="Explore"
						>
							Explore
						</button>
						<button
							className={`text-xl hover:cursor-pointer ${hoverTextClass}`}
							onClick={() => navigate("/login")}
							type="button"
							aria-label="Log in"
						>
							Log in
						</button>
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 cursor-pointer"
							onClick={() => navigate("/signup")}
							type="button"
							aria-label="Get Started"
						>
							Get Started
						</button>
					</>
				)}
			</nav>
		</div>
	);
}
