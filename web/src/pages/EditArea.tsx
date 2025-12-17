import { useLocation, useNavigate } from "react-router-dom";

import Edit from "../component/Edit";

export default function EditArea() {
    const location = useLocation();
    const navigate = useNavigate();
    const { area } = location.state || {};

    if (!area) {
        setTimeout(() => navigate("/my-areas"), 0);
        return null;
    }

    return (
        <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-white p-4 overflow-y-auto">
            <Edit area={area} />
        </div>
    );
}
