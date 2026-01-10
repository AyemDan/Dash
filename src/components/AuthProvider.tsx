import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "../store/features/authSlice.ts";

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If not authenticated and not on login page, redirect to login
        if (!isAuthenticated && location.pathname !== "/login") {
            navigate("/login", { replace: true });
        }

        // If authenticated and on login page, redirect to dashboard
        if (isAuthenticated && location.pathname === "/login") {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, location.pathname, navigate]);

    // Optionally show a loading spinner here while checking auth state 
    // if you implement async auth checking. 
    // For now, since it's synchronous from localStorage, we can render immediately 
    // or return null for a split second to avoid flash.

    // Return children only if authenticated or if on public route (login)
    // This prevents protected content from flashing before redirect
    if (!isAuthenticated && location.pathname !== "/login") {
        return null;
    }

    return <>{children}</>;
};

export default AuthProvider;
