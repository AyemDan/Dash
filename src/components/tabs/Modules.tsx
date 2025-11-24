import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuBookOpen, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import { api } from "../../utils/api.ts";

interface Module {
    id: string;
    code: string;
    title: string;
    credits: number;
    isActive: boolean;
    program: string | any;
}

interface Program {
    id: string;
    name: string;
}
const Modules = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const creditsOptions = [1, 2, 3, 4];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch Modules
        try {
            const modulesData = await api.get("/modules");
            setModules(Array.isArray(modulesData) ? modulesData : []);
        } catch (error) {
            console.error("Failed to fetch modules:", error);
            setModules([]);
        }

        try {
            const programsData = await api.get("/programs");
            console.log("Raw programs data:", programsData);
            if (Array.isArray(programsData)) {
                setPrograms(programsData.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    // duration: p.duration,
                    // credits: p.credits,
                    // _v: p._v,
                    // modules: p.modules,
                    // isActive: p.isActive,
                    // createdAt: p.createdAt,
                    // updatedAt: p.updatedAt,
                })));
            } else {
                console.log("Programs data is not an array:", programsData);
                setPrograms([]);
            }
        } catch (error) {
            console.error("Failed to fetch programs:", error);
            setPrograms([]);
        }
    };

    const validationSchema = Yup.object({
        title: Yup.string()
            .required("Module Name is required")
            .min(3, "Module Name must be at least 3 characters"),
        credits: Yup.string()
            .required("Credits is required"),
        program: Yup.string()
            .required("Program is required"),
    });

    const formik = useFormik({
        initialValues: {
            title: "",
            isActive: false,
            credits: "",
            program: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const newModule = await api.post("/modules", {
                    title: values.title,
                    credits: parseInt(values.credits),
                    program: values.program,
                    isActive: values.isActive,
                });
                setModules([...modules, newModule]);
                formik.resetForm();
                console.log("Module added:", newModule);
            } catch (error) {
                console.error("Failed to add module:", error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this module?")) return;
        try {
            await api.delete(`/modules/${id}`);
            setModules(modules.filter((module) => module.id !== id));
            console.log("Module deleted:", id);
        } catch (error) {
            console.error("Failed to delete module:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Module Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <LuBookOpen className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Create New Module</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Add a new module to the catalog that can be assigned to participants
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Module Name *"
                            labelFor="title"
                            attributes={{
                                type: "text",
                                name: "title",
                                placeholder: "",
                                value: formik.values.title,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.title && formik.errors.title
                                    ? formik.errors.title
                                    : undefined
                            }
                            note="(e.g., Advanced Programming)"
                        />

                        <Select
                            label="Credits *"
                            labelFor="credits"
                            attributes={{
                                name: "credits",
                                value: formik.values.credits,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.credits && formik.errors.credits
                                    ? formik.errors.credits
                                    : undefined
                            }
                        >
                            <option value="">Select credits</option>
                            {creditsOptions.map((credit) => (
                                <option key={credit} value={credit}>
                                    {credit} {credit === 1 ? "Credit" : "Credits"}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Program"
                            labelFor="program"
                            attributes={{
                                name: "program",
                                value: formik.values.program,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.program && formik.errors.program
                                    ? formik.errors.program
                                    : undefined
                            }
                        >
                            <option value="">Select program</option>
                            {programs.map((programs) => (
                                <option key={programs.id} value={programs.id}>
                                    {programs.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="pt-2">
                        <ActionButton
                            buttonText={
                                <span className="flex items-center gap-2">
                                    <LuPlus className="h-4 w-4" />
                                    Add Module to Catalog
                                </span>
                            }
                            attributes={{
                                type: "submit",
                                disabled: !formik.isValid || isLoading,
                            }}
                            loading={isLoading}
                            width="full"
                            paddingX="px-4"
                            backgroundColor="#6B7280"
                            textColor="#ffffff"
                        />
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <LuFileText className="h-6 w-6 text-amber-900" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Current Module Catalog ({modules.length} {modules.length === 1 ? "module" : "modules"})
                    </h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {modules.map((module) => (
                        <div
                            key={module.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{module.code}</span>
                                    <span className="text-gray-600">-</span>
                                    <span className="text-gray-900">{module.title}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {module.credits} {module.credits === 1 ? "credit" : "credits"} • {typeof module.program === 'object' ? module.program.name : module.program}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(module.id)}
                                className="ml-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                aria-label="Delete module"
                            >
                                <LuTrash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modules;
