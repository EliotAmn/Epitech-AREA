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
		<div className="min-h-screen flex flex-col items-center mt-4">
			<h1 className="text-4xl text-black font-bold mt-4">
				Change Password
			</h1>
			<div className="w-lg h-1 bg-zinc-300 rounded-full mt-8" />
			<div className="w-full max-w-md mt-6">
				<p className="text-2xl text-black font-semibold mb-4">
					Current Password
				</p>
				<div className="flex flex-col items-center mb-4">
					<Input
						value={currentPassword}
						onChange={setCurrentPassword}
						showToggle={true}
					></Input>
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
