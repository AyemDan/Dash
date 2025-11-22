import type { ComponentType } from "react";
import {
    LuBookOpen,
    LuGraduationCap,
    LuUsers,
    LuFileCheck,
} from "react-icons/lu";
import ImportExport from "../components/tabs/ImportExport.tsx";
import Modules from "../components/tabs/Modules.tsx";
import Programs from "../components/tabs/Programs.tsx";
import Participants from "../components/tabs/Participants.tsx";
import Enrollments from "../components/tabs/Enrollments.tsx";
import Grades from "../components/tabs/Grades.tsx";
import { AiTwotonePieChart } from "react-icons/ai";
import { FaRegFileLines } from "react-icons/fa6";
import { useAppSelector, useAppDispatch } from "../store/hooks.ts";
import { setActiveTab } from "../store/features/app.ts";
import type { RootState } from "../store/store.ts";

type TabType = "import-export" | "modules" | "programs" | "participants" | "enrollments" | "grades";

interface TabConfig {
    id: TabType;
    label: string;
    icon: ComponentType<{ className?: string }>;
    color?: string;
}

const Dashboard = () => {
    const { activeTab } = useAppSelector((state: RootState) => state.app);
    const dispatch = useAppDispatch();

    const tabs: TabConfig[] = [
        {
            id: "import-export",
            label: "Import/Export",
            icon: FaRegFileLines,
            color: "text-gray-900",
        },
        {
            id: "modules",
            label: "Modules",
            icon: LuBookOpen,
            color: "text-green-600",
        },
        {
            id: "programs",
            label: "Programs",
            icon: LuGraduationCap,
            color: "text-amber-900",
        },
        {
            id: "participants",
            label: "Participants",
            icon: LuUsers,
            color: "text-blue-600",
        },
        {
            id: "enrollments",
            label: "Enrollments",
            icon: LuFileCheck,
            color: "text-yellow-600",
        },
        {
            id: "grades",
            label: "Grades",
            icon: AiTwotonePieChart,
            color: "text-purple-600",
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "import-export":
                return <ImportExport />;
            case "modules":
                return <Modules />;
            case "programs":
                return <Programs />;
            case "participants":
                return <Participants />;
            case "enrollments":
                return <Enrollments />;
            case "grades":
                return <Grades />;
            default:
                return <ImportExport />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Participant Data Management
                </h1>
                <p className="text-sm text-gray-600">
                    Add participants, create modules, and manage enrollments
                </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-2">
                <div className="max-lg:flex max-lg:items-center max-lg:gap-2 max-lg:overflow-x-auto grid grid-cols-6 gap-3">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => dispatch(setActiveTab(tab.id))}
                                className={`
                                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[13px]
                                    transition-all duration-200 whitespace-nowrap cursor-pointer
                                    ${isActive
                                        ? "bg-white"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? tab.color : "text-gray-500"}`} />
                                <span className={`${isActive ? tab.color : "text-gray-500"}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Dashboard;
