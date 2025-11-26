import Button from "../component/button";
import { useNavigate } from "react-router-dom";

export default function Explore() {
    const navigate = useNavigate();

    return (

		<div className="min-h-screen flex flex-col items-center justify-start">
			<div className="flex flex-col items-center w-full h-[530px] bg-[#242424] gap-6">
                <h1 className="text-5xl text-white font-bold m-4">Explore</h1>
                <Button label="Create my own area" mode="white" onClick={() => navigate("/create")} />
            </div>
        </div>
    );
}
