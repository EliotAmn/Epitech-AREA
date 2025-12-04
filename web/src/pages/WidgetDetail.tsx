import { useLocation } from "react-router-dom";

import Button from "../component/button";

type WidgetLocationState = {
    title?: string;
    color?: string;
};

export default function WidgetDetail() {
    const location = useLocation() as { state?: WidgetLocationState };
    const state = location.state ?? {};
    const title = state.title ?? "Widget without title";
    const color = typeof state.color === "string" ? state.color : "#ffffff";

    return (
        <div className="text-center justify-center">
            <div
                className="w-full h-[530px]"
                style={{ backgroundColor: color }}
            >
                <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
            </div>
            <Button label="Click Me" onClick={() => alert("Button clicked!")} />
        </div>
    );
}
