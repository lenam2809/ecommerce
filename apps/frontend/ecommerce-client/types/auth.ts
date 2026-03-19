export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RevokeTokenRequest {
    refreshToken: string;
}

export interface AuthState {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}