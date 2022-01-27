export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface UserAPIRes {
    access_token: string;
    refresh_token: string;
}