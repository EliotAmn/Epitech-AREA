import { useRef } from "react";

import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import Input from "../component/input";

export default function Profile() {
	const navigate = useNavigate();
	const passwordInputRef = useRef<HTMLInputElement>(null);

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
					<Input
						value="valeriepecresse@pipi.com"
						isFixed={true}
					></Input>
				</div>
				<p className="text-2xl text-black font-semibold mb-4">
					Password
				</p>
				<div className="flex flex-col items-center mb-4">
					<Input
						ref={passwordInputRef}
						value="valouz"
						isFixed={true}
						isVisible={false}
					/>
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
