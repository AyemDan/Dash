import { useDispatch, useSelector } from "react-redux";
import { LuSun, LuMoon } from "react-icons/lu";
import { toggleTheme, selectTheme } from "../store/features/app.ts";

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "light" ? <LuMoon className="h-5 w-5" /> : <LuSun className="h-5 w-5" />}
        </button>
    );
};

export default ThemeToggle;
