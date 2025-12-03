import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import UserIcon from "../component/icons/UserIcon";
import Input from "../component/input";

export default function Profile() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-md p-6">
                <div className="flex flex-col items-center">
                    <UserIcon className="h-24 w-24" />

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
