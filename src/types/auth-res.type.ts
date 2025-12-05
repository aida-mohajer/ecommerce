export interface AuthResponse {
    accessToken?: string;
    refreshToken?: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role?:string
    };
}