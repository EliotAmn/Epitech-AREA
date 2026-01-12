import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import UserIcon from "@/component/icons/UserIcon";
import Input from "@/component/input";
import { ApiClientError, userService } from "@/services/api";
import type { User } from "@/types/api.types";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await userService.getCurrentUser();
                setUser(userData);
            } catch (err) {
                if (err instanceof ApiClientError) {
                    setError(err.message);
                } else {
                    setError("Failed to load user profile");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading profile...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-600 mb-4">
                        {error || "Failed to load profile"}
                    </p>
                    <Button
                        label="Try Again"
                        onClick={() => window.location.reload()}
                    />
                </div>
            </div>
        );
    }

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

                <div className="flex flex-col gap-4 justify-center">
                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Email
                        </p>
                        <Input value={user.email} isFixed={true} />
                    </div>

                    {user.name && (
                        <>
                            <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                                Name
                            </p>
                            <Input value={user.name} isFixed={true} />
                        </>
                    )}

                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Password
                        </p>
                        <Input
                            value="••••••••"
                            isFixed={true}
                            isHidden={true}
                        />

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
