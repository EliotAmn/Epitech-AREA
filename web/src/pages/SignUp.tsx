import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import logoGoogle from "../assets/logo_google.svg";
import Button from "../component/button";
import Input from "../component/input";
import { ThemeContext } from "../context/ThemeContext";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { setTheme, resetTheme } = useContext(ThemeContext);

    useEffect(() => {
      setTheme("light");
      return () => {
        resetTheme();
      };
    }, [setTheme, resetTheme]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-4xl text-[#000000] font-bold mb-6 text-center">
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
                        showToggle={true}
                    />
					<button className="text-sm text-gray-600 underline cursor-pointer"
						onClick={() => navigate("/login")}>
							Already have an account? Log in
					</button>
                    <Button
                        label="Sign up"
                        onClick={() => navigate("/explore")}
                    />
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
