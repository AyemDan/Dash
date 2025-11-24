import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "../components/Input.tsx";
import ActionButton from "../components/ActionButton.tsx";
import { LuUser, LuLock, LuShield } from "react-icons/lu";

const API_URL = "http://localhost:4000/api/auth/login"; // TODO: Update with actual API URL

const Login = () => {
    const navigate = useNavigate();
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

                localStorage.setItem("token", data.token);
                localStorage.setItem("admin", JSON.stringify(data.admin));

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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white shadow-md">
                            <LuShield className="text-white text-2xl" />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                        <p className="text-sm text-gray-600">Sign in to access the admin dashboard</p>
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
