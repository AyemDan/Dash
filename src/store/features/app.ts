import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ACTIVE_TAB_KEY } from "../../utils/constants";

type TabType = "import-export" | "modules" | "programs" | "participants" | "enrollments" | "grades";
type ThemeType = "light" | "dark";

interface AppState {
    activeTab: TabType;
    theme: ThemeType;
}

const getInitialState = (): AppState => {
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    const validTabs: TabType[] = ["import-export", "modules", "programs", "participants", "enrollments", "grades"];

    // Check local storage for theme, default to system preference or light
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    // Apply theme immediately to avoid flash
    if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    return {
        activeTab: (savedTab && validTabs.includes(savedTab as TabType)) ? (savedTab as TabType) : "import-export",
        theme: initialTheme
    };
};

const initialState: AppState = getInitialState();

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<TabType>) => {
            state.activeTab = action.payload;
            localStorage.setItem(ACTIVE_TAB_KEY, action.payload);
        },
        toggleTheme: (state) => {
            const newTheme = state.theme === "light" ? "dark" : "light";
            state.theme = newTheme;
            localStorage.setItem("theme", newTheme);

            if (newTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        },
        setTheme: (state, action: PayloadAction<ThemeType>) => {
            state.theme = action.payload;
            localStorage.setItem("theme", action.payload);
            if (action.payload === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    },
});

export const { setActiveTab, toggleTheme, setTheme } = appSlice.actions;
export const selectTheme = (state: any) => state.app.theme;
export default appSlice.reducer;

