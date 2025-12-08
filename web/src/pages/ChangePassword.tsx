import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import Input from "@/component/input";
import { ApiClientError, userService } from "@/services/api";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const isPasswordValid = (): boolean => {
        // require current password to be provided and validate new password
        return (
            currentPassword.length > 0 &&
            newPassword === confirmNewPassword &&
            newPassword.length >= 8
        );
    };

    const handleChangePassword = async () => {
        setError("");
        setSuccess(false);

        if (!isPasswordValid()) {
            setError(
                "Passwords do not match or new password is less than 8 characters."
            );
            return;
        }

        setLoading(true);

        try {
            await userService.changePassword({
                currentPassword,
                newPassword,
            });

            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate("/profile");
            }, 2000);
        } catch (err) {
            if (err instanceof ApiClientError) {
                if (err.statusCode === 401) {
                    setError("Current password is incorrect");
                } else if (err.statusCode === 404) {
                    setError(
                        "Password change endpoint not available. Please contact support."
                    );
                } else {
                    setError(err.message);
                }
            } else {
                setError("Failed to change password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center mt-4">
            <h1 className="text-4xl text-black font-bold mt-4">
                Change Password
            </h1>
            <div className="w-lg h-1 bg-zinc-300 rounded-full mt-8" />

            {error && (
                <div className="w-full max-w-md mt-4 p-3 bg-red-100 text-red-700 rounded text-center">
                    {error}
                </div>
            )}

            {success && (
                <div className="w-full max-w-md mt-4 p-3 bg-green-100 text-green-700 rounded text-center">
                    Password changed successfully! Redirecting...
                </div>
            )}

            <div className="w-full max-w-md mt-6">
                <p className="text-2xl text-black font-semibold mb-4">
                    Current Password
                </p>
                <div className="flex flex-col items-center mb-4">
                    <Input
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        showToggle={true}
                    />
                </div>
                <p className="text-2xl text-black font-semibold mb-4">
                    New Password
                </p>
                <div className="flex flex-col items-center mb-4">
                    <Input
                        value={newPassword}
                        onChange={setNewPassword}
                        showToggle={true}
                    />
                </div>
                <p className="text-2xl text-black font-semibold mb-4">
                    Confirm New Password
                </p>
                <div className="flex flex-col items-center mb-4">
                    <Input
                        value={confirmNewPassword}
                        onChange={setConfirmNewPassword}
                        showToggle={true}
                    />

                    <div className="mt-4">
                        <Button
                            label={
                                loading
                                    ? "Changing..."
                                    : success
                                      ? "Success!"
                                      : "Confirm"
                            }
                            onClick={handleChangePassword}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
