import { useLocation } from "react-router-dom";

import Button from "../component/button";

export default function WidgetDetail() {
	const location = useLocation();
	const state = (location.state as any) ?? {};
	const titre = state.titre ?? "Widget sans titre";
	const color = typeof state.color === "string" ? state.color : "#ffffff";

	return (
		<div className="text-center justify-center">
			<div
				className="w-full h-[530px]"
				style={{ backgroundColor: color }}
			>
				<h1 className="text-2xl font-bold mb-4">{titre}</h1>
			</div>
			<Button label="Click Me" onClick={() => alert("Button clicked!")} />
		</div>
	);
}
