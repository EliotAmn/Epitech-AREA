import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
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
        <div className="min-h-screen flex flex-col items-center mt-4">
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
            <h1 className="text-4xl text-black font-bold mt-4">User Profile</h1>
            <div className="w-lg h-1 bg-zinc-300 rounded-full mt-8" />
            <div className="w-full max-w-md mt-6">
                <p className="text-2xl text-black font-semibold mb-4">Email</p>
                <div className="flex flex-col items-center mb-4">
                    <Input value={user.email} isFixed={true} />
                </div>
                {user.name && (
                    <>
                        <p className="text-2xl text-black font-semibold mb-4">
                            Name
                        </p>
                        <div className="flex flex-col items-center mb-4">
                            <Input value={user.name} isFixed={true} />
                        </div>
                    </>
                )}
                <p className="text-2xl text-black font-semibold mb-4">
                    Password
                </p>
                <div className="flex flex-col items-center mb-4">
                    <Input value="••••••••" isFixed={true} isHidden={true} />
                    <div className="mt-4">
                        <Button
                            label="Change Password"
                            onClick={() => navigate("/change-password")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
