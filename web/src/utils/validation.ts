export interface PasswordValidationResult {
    isValid: boolean;
    error?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
    const minLength = 8;

    if (!password) {
        return {
            isValid: false,
            error: "Password is required",
        };
    }

    if (password.length < minLength) {
        return {
            isValid: false,
            error: `Password must be at least ${minLength} characters`,
        };
    }

    return { isValid: true };
}

export function validatePasswordsMatch(
    password: string,
    confirmPassword: string
): PasswordValidationResult {
    if (password !== confirmPassword) {
        return {
            isValid: false,
            error: "Passwords do not match",
        };
    }

    return { isValid: true };
}

export function validateEmail(email: string): PasswordValidationResult {
    if (!email) {
        return {
            isValid: false,
            error: "Email is required",
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: "Please enter a valid email address",
        };
    }

    return { isValid: true };
}
