import axios, { type AxiosError, type AxiosInstance } from "axios";

import { env } from "@/config/env";
import type { ApiError } from "@/types/api.types";

export class ApiClientError extends Error {
    statusCode: number;
    errors?: Record<string, string[]>;

    constructor(
        message: string,
        statusCode: number,
        errors?: Record<string, string[]>
    ) {
        super(message);
        this.name = "ApiClientError";
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

class ApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("authToken");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response) {
                    const apiError = error.response.data as ApiError;
                    throw new ApiClientError(
                        apiError.message || "An error occurred",
                        error.response.status,
                        apiError.errors
                    );
                } else if (error.request) {
                    throw new ApiClientError(
                        "Cannot connect to server. Please check your connection.",
                        0
                    );
                } else {
                    throw new ApiClientError(
                        error.message || "An unexpected error occurred",
                        0
                    );
                }
            }
        );
    }

    async get<T>(
        endpoint: string,
        params?: Record<string, string | number>
    ): Promise<T> {
        const response = await this.client.get<T>(endpoint, { params });
        return response.data;
    }

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.client.post<T>(endpoint, body);
        return response.data;
    }

    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.client.put<T>(endpoint, body);
        return response.data;
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.client.patch<T>(endpoint, body);
        return response.data;
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await this.client.delete<T>(endpoint);
        return response.data;
    }

    getAxiosInstance(): AxiosInstance {
        return this.client;
    }
}

export const apiClient = new ApiClient(env.apiUrl);
