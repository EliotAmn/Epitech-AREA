import { useState } from "react";
import Button from "../component/button";
import Input from "../component/input";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md p-6">
				<h1 className="text-2xl text-[#000000] font-bold mb-6 text-center">
					Login
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
					<Button label="Login" onClick={() => navigate("/explore")} />
				</div>
			</div>
		</div>
	);
}
