import type { SelectHTMLAttributes, ReactNode } from "react";

export interface SelectProps {
    label?: string;
    labelFor?: string;
    icon?: ReactNode;
    attributes?: SelectHTMLAttributes<HTMLSelectElement>;
    error?: string;
    note?: string;
    children: ReactNode;
}

const Select = ({
    label,
    labelFor,
    icon,
    attributes,
    error,
    note,
    children,
}: SelectProps) => {
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
                    <span className="text-[#A4A7AE] dark:text-gray-400 text-lg absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {icon}
                    </span>
                )}

                <select
                    className={`w-full px-3 py-2.5 border text-[15px] border-[#D5D7DA] dark:border-gray-600 rounded-lg outline-none transition-all duration-300 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        ${icon ? "pl-9" : ""}
                        ${error ? "border-[#D95959]" : ""}
                    `}
                    id={labelFor}
                    {...attributes}
                >
                    {children}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {error && <span className="text-xs text-[#D95959] mt-[2px]">{error}</span>}

            {note && (
                <span className="mt-2 flex items-center gap-2 text-xs text-[#5C5C5C]">
                    <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {note}
                </span>
            )}
        </div>
    );
};

export default Select;

