import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Edit from "@/component/Edit";

export default function AreaDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { area } = location.state || {};

    useEffect(() => {
        if (!area) {
            const t = setTimeout(() => navigate("/my-areas"), 0);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [area, navigate]);

    if (!area) return null;

    return (
        <div className="w-full h-full">
            <Edit area={area} />
        </div>
    );
}
