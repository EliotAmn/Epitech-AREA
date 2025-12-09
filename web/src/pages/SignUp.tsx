import { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import logoGoogle from "@/assets/logo_google.svg";
import Button from "@/component/button";
import Input from "@/component/input";
import { ThemeContext } from "@/context/theme";
import { ApiClientError, authService } from "@/services/api";
import { validateEmail, validatePassword } from "@/utils/validation";

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

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error || "Invalid email");
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || "Invalid password");
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

    const handleGoogleSignUp = async () => {
        setError("");
        setLoading(true);
        try {
            await authService.oauthSignIn("google");
            navigate("/explore");
        } catch (err) {
            if (err instanceof ApiClientError) setError(err.message);
            else if (err instanceof Error) setError(err.message);
            else setError("Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center">
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
                        disabled={loading}
                    />
                    <Button
                        label="Sign up with Google"
                        mode="white"
                        onClick={handleGoogleSignUp}
                        icon={logoGoogle}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}
