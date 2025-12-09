import { useState } from "react";

import Button from "../component/button";
import Input from "../component/input";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const isPasswordValid = (): boolean => {
        // require current password to be provided and validate new password
        return (
            currentPassword.length > 0 &&
            newPassword === confirmNewPassword &&
            newPassword.length >= 8
        );
    };

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-2xl sm:text-4xl text-black font-bold mb-4 text-center">
                    Change Password
                </h1>
                <div className="w-full h-1 bg-zinc-300 rounded-full my-4" />

                <div className="flex flex-col gap-4 justify-center items-center">
                    <div className="w-full">
                        <p className="text-xl sm:text-2xl text-black font-semibold mb-2">
                            Current Password
                        </p>
                        <Input
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            showToggle={true}
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
                        />
                    </div>

                    <div className="w-full flex justify-center mt-4">
                        <Button
                            label="Confirm"
                            onClick={() =>
                                isPasswordValid()
                                    ? alert("Password changed successfully!")
                                    : alert(
                                          "Passwords do not match or are less than 8 characters."
                                      )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
