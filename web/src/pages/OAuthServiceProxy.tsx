import { useEffect, useRef, useState } from "react";

import {
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import { apiClient } from "@/services/api/apiClient";

export default function OAuthServiceProxy() {
    const { service_name } = useParams<{ service_name: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const hasProcessed = useRef(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            // Prevent duplicate calls (React StrictMode runs effects twice)
            if (hasProcessed.current) {
                return;
            }
            hasProcessed.current = true;

            if (!service_name) {
                setError("Service name is missing");
                setIsProcessing(false);
                return;
            }

            try {
                // Convert URLSearchParams to plain object
                const queryParams: Record<string, string> = {};
                searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });

                // Also extract parameters from URL fragment/hash (for services like Trello that use client-side token flow)
                // Fragment looks like: #token=xxxxx or #access_token=xxxxx&token_type=bearer
                if (location.hash) {
                    const hashParams = new URLSearchParams(
                        location.hash.substring(1)
                    ); // Remove the leading #
                    hashParams.forEach((value, key) => {
                        queryParams[key] = value;
                    });
                }

                console.log("OAuth params being sent:", queryParams);

                // Send all query parameters to the backend
                await apiClient.get(
                    `/services/${service_name}/redirect`,
                    queryParams
                );

                if (
                    window.opener &&
                    typeof window.opener.postMessage === "function"
                ) {
                    try {
                        // Try to notify the opener using a restricted targetOrigin (window.origin)
                        window.opener.postMessage(
                            {
                                type: "oauth:service_connected",
                                service: service_name,
                            },
                            window.origin
                        );

                        try {
                            window.close();
                            return;
                        } catch {
                            // ignore
                        }
                    } catch (err) {
                        console.warn(
                            "Could not postMessage to opener with restricted origin; not falling back to permissive '*' for security reasons.",
                            err
                        );
                    }
                }

                try {
                    sessionStorage.setItem(
                        "oauth:toast",
                        JSON.stringify({
                            status: "success",
                            service: service_name,
                        })
                    );
                } catch {
                    void 0;
                }

                setIsProcessing(false);
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } catch (err) {
                console.error("OAuth callback failed:", err);
                try {
                    sessionStorage.setItem(
                        "oauth:toast",
                        JSON.stringify({
                            status: "failure",
                            service: service_name,
                            message:
                                err instanceof Error ? err.message : undefined,
                        })
                    );
                } catch {
                    void 0;
                }
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to complete OAuth authentication"
                );
                setIsProcessing(false);
            }
        };

        handleOAuthCallback();
    }, [service_name, searchParams, navigate, location.hash]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                {isProcessing ? (
                    <>
                        <div className="flex flex-col items-center">
                            {/* Loading Spinner */}
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Connecting {service_name}...
                            </h1>
                            <p className="text-gray-600 text-center">
                                Please wait while we complete the authentication
                                process.
                            </p>
                        </div>
                    </>
                ) : error ? (
                    <>
                        <div className="flex flex-col items-center">
                            {/* Error Icon */}
                            <div className="w-20 h-20 mb-6 flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-red-600 mb-2">
                                Connection Failed
                            </h1>
                            <p className="text-gray-700 text-center mb-6">
                                {error}
                            </p>

                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Return to Home
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 mb-6 flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-green-600 mb-2">
                                Successfully Connected!
                            </h1>
                            <p className="text-gray-600 text-center">
                                Redirecting to home page...
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
