import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import Input from "@/component/input";
import { ApiClientError, userService } from "@/services/api";
import { validatePassword, validatePasswordsMatch } from "@/utils/validation";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChangePassword = async () => {
        setError("");
        setSuccess(false);

        if (!currentPassword) {
            setError("Please enter your current password");
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || "Invalid password");
            return;
        }

        const matchValidation = validatePasswordsMatch(
            newPassword,
            confirmNewPassword
        );
        if (!matchValidation.isValid) {
            setError(matchValidation.error || "Passwords do not match");
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
        <div className="min-h-screen flex justify-center items-start">
            <div className="w-full max-w-4xl p-8">
                <h1 className="text-2xl sm:text-4xl text-black font-bold mb-4 text-center">
                    Change Password
                </h1>
                <div className="w-full h-1 bg-zinc-300 rounded-full my-4" />

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

                <div className="flex flex-col gap-4 justify-center items-center">
                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Current Password
                        </p>
                        <Input
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            showToggle={true}
                            fullWidth
                            className="text-lg"
                        />
                    </div>

                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            New Password
                        </p>
                        <Input
                            value={newPassword}
                            onChange={setNewPassword}
                            showToggle={true}
                            fullWidth
                            className="text-lg"
                        />
                    </div>

                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Confirm New Password
                        </p>
                        <Input
                            value={confirmNewPassword}
                            onChange={setConfirmNewPassword}
                            showToggle={true}
                            fullWidth
                            className="text-lg"
                        />
                    </div>

                    <div className="w-full flex justify-center mt-4">
                        <Button
                            label={
                                loading
                                    ? "Changing..."
                                    : success
                                      ? "Success!"
                                      : "Confirm"
                            }
                            onClick={handleChangePassword}
                            disabled={loading || success}
                        />
                    </div>
                    <p
                        className="cursor-pointer text-black hover:underline mt-2"
                        onClick={() => navigate("/profile")}
                    >
                        Cancel
                    </p>
                </div>
            </div>
        </div>
    );
}
