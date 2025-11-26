import { useState } from "react";
import logoGoogle from "../assets/logo_google.png";
import Button from "../component/button";
import Input from "../component/input";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

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
					<Button label="Sign up"/>
					<Button
						label="Sign up with Google"
						mode="white"
						icon={logoGoogle}
					/>
				</div>
			</div>
		</div>
	);
}
