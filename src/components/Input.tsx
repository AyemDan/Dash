import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { LuEye, LuEyeOff } from "react-icons/lu";

export interface InputProps {
    label?: string;
    labelFor?: string;
    icon?: ReactNode;
    attributes?: InputHTMLAttributes<HTMLInputElement>;
    passwordInput?: boolean;
    error?: string;
    note?: string;
}

const Input = ({
    label,
    labelFor,
    icon,
    attributes,
    passwordInput,
    error,
    note,
}: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = passwordInput
        ? showPassword
            ? "text"
            : "password"
        : attributes?.type || "text";

    return (
        <div>
            {label && (
                <label
                    className="text-[#414651] dark:text-gray-300 text-sm font-medium"
                    htmlFor={labelFor}
                >
                    {label}
                </label>
            )}

            <div className="relative mt-1">
                {icon && (
                    <span className="text-[#A4A7AE] dark:text-gray-400 text-lg absolute left-2.5 top-1/2 -translate-y-1/2">
                        {icon}
                    </span>
                )}

                <input
                    className={`w-full px-3 py-2.5 border text-[15px] border-[#D5D7DA] dark:border-gray-600 rounded-lg outline-none transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            ${passwordInput ? "pr-10" : ""}
            ${icon ? "pl-9" : ""}`}
                    type={inputType}
                    id={labelFor}
                    {...attributes}
                />

                {passwordInput && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute text-theme text-lg right-3 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                )}
            </div>

            {error && <span className="text-xs text-[#D95959] mt-[2px]">{error}</span>}

            {note && (
                <span className="mt-2 flex items-center gap-2 text-xs text-[#5C5C5C]">
                    <BsInfoCircle />
                    {note}
                </span>
            )}
        </div>
    );
};

export default Input;
