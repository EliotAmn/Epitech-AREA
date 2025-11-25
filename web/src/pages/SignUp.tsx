import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import logoGoogle from "../assets/logo_google.png";
import Button from "../component/button";
import Input from "../component/input";

export default function SignUp() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md p-6">
				<h1 className="text-2xl text-[#000000] font-bold mb-6 text-center">
					Sign Up
				</h1>

				<div className="flex flex-col gap-4 justify-center items-center">
					<Input
						placeholder="Example@mail.com"
						value={email}
						onChange={setEmail}
					/>
					<Input
						placeholder="Password"
						value={password}
						onChange={setPassword}
					/>
					<Button label="Sign up" size="515px" />
					<Button
						label="Sign up with Google"
						size="515px"
						variant="white"
						icon={logoGoogle}
					/>
				</div>
			</div>
		</div>
	);
}
