import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Button from "@/component/button";
import UserIcon from "@/component/icons/UserIcon";
import Input from "@/component/input";
import { ApiClientError, AuthService, userService } from "@/services/api";
import type { User } from "@/types/api.types";
import { validateEmail } from "@/utils/validation";

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit state
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const hasChanges =
        !!user &&
        (editEmail !== (user.email ?? "") || editName !== (user.name ?? ""));

    // Password redirect handled on separate page

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await userService.getCurrentUser();
                setUser(userData);
                setEditName(userData.name ?? "");
                setEditEmail(userData.email ?? "");
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

        // If navigated here to change password, redirect to the dedicated page
        type LocationState =
            | { openChangePassword?: boolean }
            | null
            | undefined;
        const state = (location.state as LocationState) ?? {};
        if (state.openChangePassword) {
            navigate("/change-password");
        }
    }, [location.state, navigate]);

    const handleSave = async () => {
        setEditError("");
        setEditSuccess("");
        const emailValidation = validateEmail(editEmail);
        if (!emailValidation.isValid) {
            setEditError(emailValidation.error || "Invalid email");
            return;
        }

        if (editName && editName.length < 2) {
            setEditError("Username must be at least 2 characters");
            return;
        }

        setEditLoading(true);
        try {
            const updated = await userService.updateCurrentUser({
                name: editName || undefined,
                email: editEmail || undefined,
            });
            setUser(updated);
            setEditSuccess("Profile updated");
            setEditName(updated.name ?? "");
            setEditEmail(updated.email ?? "");
        } catch (err) {
            if (err instanceof ApiClientError) {
                setEditError(err.message);
            } else {
                setEditError("Failed to update profile");
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm("Delete your account? This action is irreversible.")
        )
            return;
        try {
            setLoading(true);
            await userService.deleteCurrentUser();
            AuthService.logout();
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen flex justify-center items-start">
            <div className="w-full max-w-4xl">
                <div className="flex flex-col items-center">
                    <UserIcon className="h-24 w-24" />

                    <h1 className="text-2xl sm:text-4xl text-black font-bold mt-4">
                        User Profile
                    </h1>
                </div>

                <div className="w-full h-1 bg-zinc-300 rounded-full my-4" />

                {/* Alerts */}
                {editError && (
                    <div className="w-full max-w-md mx-auto mb-2 p-3 bg-red-100 text-red-700 rounded text-center">
                        {editError}
                    </div>
                )}
                {editSuccess && (
                    <div className="w-full max-w-md mx-auto mb-2 p-3 bg-green-100 text-green-700 rounded text-center">
                        {editSuccess}
                    </div>
                )}

                <div className="flex flex-col gap-6 justify-center w-full">
                    {/* Profile info card */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-3xl font-semibold mb-4">Account</h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xl font-medium text-black mb-2">
                                    Username
                                </label>
                                <Input
                                    value={editName}
                                    onChange={setEditName}
                                    fullWidth
                                    className="text-lg sm:text-xl text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xl font-medium text-black mb-2">
                                    Email
                                </label>
                                <Input
                                    value={editEmail}
                                    onChange={setEditEmail}
                                    fullWidth
                                    className="text-lg sm:text-xl text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xl font-medium text-black   mb-2">
                                    Password
                                </label>
                                <Input
                                    value="----hidden----"
                                    isFixed={true}
                                    isHidden={true}
                                    fullWidth
                                />
                            </div>

                            <p
                                className="cursor-pointer text-blue-600 hover:underline"
                                onClick={() => navigate("/change-password")}
                            >
                                Change Password
                            </p>

                            <div className="flex gap-3 mt-2 items-center">
                                <Button
                                    height="normal"
                                    label={
                                        editLoading ? "Updating..." : "Update"
                                    }
                                    onClick={handleSave}
                                    disabled={editLoading || !hasChanges}
                                    className="w-full sm:w-full md:w-full"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Danger zone */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-red-600 border">
                        <h2 className="text-3xl font-semibold mb-4">
                            Danger zone
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Delete your account. This action is irreversible.
                        </p>
                        <div className="flex">
                            <Button
                                mode="white"
                                className="w-full text-red-600 hover:bg-red-100 sm:w-full md:w-full"
                                label="Delete account"
                                onClick={handleDelete}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
