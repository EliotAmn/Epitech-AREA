import React from "react";

interface ButtonProps {
	label: string;
	onClick?: () => void;
	icon?: string | React.ReactNode;
	mode?: "white" | "black";
	className?: string;
}

export default function Button({ label, onClick, icon, mode = "black", className = "" }: ButtonProps) {
	const base = "inline-flex items-center justify-center px-4 py-2 w-full sm:w-[300px] md:w-[340px] h-12 sm:h-14 rounded-full border focus:ring-2 focus:ring-offset-2";

	const modeClasses = (() => {
		switch (mode) {
			case "white":
				return "bg-white text-black border-gray-300 hover:bg-gray-50 focus:ring-gray-200";
			case "black":
				return "bg-black text-white border-transparent hover:bg-gray-900 focus:ring-gray-700";
		}
	})();

	return (
		<button
			type="button"
			className={`${base} ${modeClasses} ${className}`}
			onClick={onClick}
		>
			{icon ? (
				typeof icon === "string" ? (
					<img src={icon} alt="" className="w-4 h-4 object-contain mr-3" />
				) : (
					<span className="mr-3 flex items-center">{icon}</span>
				)
			) : null}
			<span>{label}</span>
		</button>
	);
}
