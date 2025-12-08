export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    access_token: string;
    token?: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
