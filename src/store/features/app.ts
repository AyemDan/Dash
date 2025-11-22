import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type TabType = "import-export" | "modules" | "programs" | "participants" | "enrollments" | "grades";

interface AppState {
    activeTab: TabType;
}

const getInitialState = (): AppState => {
    const savedTab = localStorage.getItem("activeTab");
    const validTabs: TabType[] = ["import-export", "modules", "programs", "participants", "enrollments", "grades"];
    
    if (savedTab && validTabs.includes(savedTab as TabType)) {
        return { activeTab: savedTab as TabType };
    }
    
    return { activeTab: "import-export" };
};

const initialState: AppState = getInitialState();

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<TabType>) => {
            state.activeTab = action.payload;
            localStorage.setItem("activeTab", action.payload);
        },
    },
});

export const { setActiveTab } = appSlice.actions;
export default appSlice.reducer;

