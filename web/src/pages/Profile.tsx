import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import Input from "../component/input";

export default function Profile() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-md p-6">
                <div className="flex flex-col items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>

                    <h1 className="text-2xl sm:text-4xl text-black font-bold mt-4">
                        User Profile
                    </h1>
                </div>

                <div className="w-full h-1 bg-zinc-300 rounded-full my-4" />

                <div className="flex flex-col gap-4 justify-center items-center">
                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Email
                        </p>
                        <Input
                            value="valeriepecresse@pipi.com"
                            isFixed={true}
                        />
                    </div>

                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Password
                        </p>
                        <Input value="valouz" isFixed={true} isHidden={true} />

                        <div className="w-full flex justify-center mt-4">
                            <Button
                                label="Change Password"
                                onClick={() => navigate("/change-password")}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
