import type { RouteObject } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import RootLayout from "./layouts/RootLayout.tsx";
import AuthProvider from "./components/AuthProvider.tsx";
import { Outlet } from "react-router-dom";

export const appRoutes: RouteObject[] = [
    {
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/",
                element: <RootLayout />,
                children: [
                    {
                        path: "dashboard",
                        element: <Dashboard />,
                    },
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                ],
            },
        ]
    }
];