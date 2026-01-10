import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AUTH_TOKEN_KEY } from "../../utils/constants";

interface User {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    // In a real app, you might decode the token here to get user info if allowed
    // or rely on a "getUser" API call on startup. 
    // For now, if token exists, we assume authenticated.
    return {
        user: null,
        token: token,
        isAuthenticated: !!token,
    };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User | null; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem(AUTH_TOKEN_KEY);
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectCurrentToken = (state: any) => state.auth.token;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
