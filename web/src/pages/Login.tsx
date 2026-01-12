import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import Input from "@/component/input";
import { ApiClientError, authService } from "@/services/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const logoGoogle =
        "https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol-700x394.png";

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await authService.login({ email, password });

            navigate("/explore");
        } catch (err) {
            if (err instanceof ApiClientError) {
                if (err.statusCode === 401) {
                    setError("Invalid email or password");
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

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await authService.oauthSignIn("google");
            navigate("/explore");
        } catch (err) {
            if (err instanceof ApiClientError) {
                setError("Google login failed: " + err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Google login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-4xl text-[#000000] font-bold mb-6 text-center">
                    Login
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
                        {error}
                    </div>
                )}

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
                    <button
                        className="text-sm text-gray-600 underline cursor-pointer"
                        onClick={() => navigate("/signup")}
                    >
                        Don't have an account? Sign up
                    </button>
                    <Button
                        label={loading ? "Loading..." : "Login"}
                        onClick={handleLogin}
                        disabled={loading}
                    />
                    <Button
                        label="Login with Google"
                        mode="white"
                        onClick={handleGoogleLogin}
                        icon={
                            <img
                                src={logoGoogle}
                                alt="Google"
                                className="w-8 h-8 object-contain"
                            />
                        }
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
