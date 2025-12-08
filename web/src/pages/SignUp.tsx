import { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import logoGoogle from "@/assets/logo_google.svg";
import Button from "@/component/button";
import Input from "@/component/input";
import { ThemeContext } from "@/context/ThemeContext";
import { ApiClientError, authService } from "@/services/api";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { setTheme, resetTheme } = useContext(ThemeContext);

    useEffect(() => {
        setTheme("light");
        return () => {
            resetTheme();
        };
    }, [setTheme, resetTheme]);

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await authService.register({ email, password, name });

            navigate("/explore");
        } catch (err) {
            if (err instanceof ApiClientError) {
                if (err.statusCode === 409) {
                    setError(
                        "Email already exists. Please use a different email."
                    );
                } else if (err.statusCode === 400 && err.errors) {
                    const validationErrors = Object.values(err.errors).flat();
                    setError(validationErrors.join(", "));
                } else if (err.statusCode === 0) {
                    setError("Cannot connect to server. Please try again.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-4xl text-[#000000] font-bold mb-6 text-center">
                    Sign Up
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4 justify-center items-center">
                    <Input placeholder="Name" value={name} onChange={setName} />
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
                    <button
                        className="text-sm text-gray-600 underline cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Already have an account? Log in
                    </button>
                    <Button
                        label={loading ? "Creating account..." : "Sign up"}
                        onClick={handleSignUp}
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
