import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/features/authSlice.ts";
import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "../components/Input.tsx";
import ActionButton from "../components/ActionButton.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { LuUser, LuLock, LuShield } from "react-icons/lu";
import { API_BASE_URL } from "../utils/constants";

const API_URL = `${API_BASE_URL}/auth/admin-login`;

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const validationSchema = Yup.object({
        nameId: Yup.string()
            .required("NameId is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            nameId: "",
            password: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setApiError(null);
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 400) {
                        throw new Error("Invalid username or password");
                    } else {
                        throw new Error("Server error. Please try again later.");
                    }
                }

                const data = await response.json();

                // Dispatch credentials to Redux store
                // The reducer will also update localStorage
                dispatch(setCredentials({
                    user: data.admin,
                    token: data.token
                }));

                navigate("/dashboard");
            } catch (error) {
                console.error("Login error:", error);
                if (error instanceof Error) {
                    setApiError(error.message);
                } else {
                    setApiError("An unexpected error occurred");
                }
            } finally {
                setIsLoading(false);
            }
        },
    });

    


        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 transition-colors duration-200">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-md">
                                <LuShield className="text-white text-2xl" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to access the admin dashboard</p>
                            {apiError && (
                                <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                                    {apiError}
                                </div>
                            )}
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-5">
                            <Input
                                label="NameID"
                                labelFor="name"
                                icon={<LuUser />}
                                attributes={{
                                    type: "text",
                                    name: "nameId",
                                    placeholder: "Enter admin username",
                                    value: formik.values.nameId,
                                    onChange: formik.handleChange,
                                    onBlur: formik.handleBlur,
                                }}
                                error={
                                    formik.touched.nameId && formik.errors.nameId
                                        ? formik.errors.nameId
                                        : undefined
                                }
                            />

                            <Input
                                passwordInput
                                label="Password"
                                labelFor="password"
                                icon={<LuLock />}
                                attributes={{
                                    name: "password",
                                    placeholder: "Enter admin password",
                                    value: formik.values.password,
                                    onChange: formik.handleChange,
                                    onBlur: formik.handleBlur,
                                }}
                                error={
                                    formik.touched.password && formik.errors.password
                                        ? formik.errors.password
                                        : undefined
                                }
                            />

                            <ActionButton
                                attributes={{
                                    type: "submit",
                                    disabled: !formik.isValid || isLoading,
                                }}
                                buttonText={isLoading ? "Signing in..." : "Sign In"}
                                loading={isLoading}
                                width="full"
                                backgroundColor="#000000"
                                textColor="#ffffff"
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    export default Login;
