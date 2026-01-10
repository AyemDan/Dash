import { useFormik } from "formik";
import * as Yup from "yup";
import { LuBookOpen, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import {
    useGetModulesQuery,
    useGetProgramsQuery,
    useAddModuleMutation,
    useDeleteModuleMutation
} from "../../store/api/apiSlice.ts";

const Modules = () => {
    const { data: modulesData = [], isLoading: isModulesLoading } = useGetModulesQuery({});
    const { data: programsData = [], isLoading: isProgramsLoading } = useGetProgramsQuery({});
    const [addModule, { isLoading: isAdding }] = useAddModuleMutation();
    const [deleteModule] = useDeleteModuleMutation();

    const isLoading = isModulesLoading || isProgramsLoading || isAdding;

    const creditsOptions = [1, 2, 3, 4];

    // Transform data
    const modules = Array.isArray(modulesData) ? modulesData.map((m: any) => ({
        ...m,
        id: m._id || m.id,
        // Ensure program is an object if possible or handle it
        program: m.program // The backend seems to populate this or just send ID?
    })) : [];

    const programs = Array.isArray(programsData) ? programsData.map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
    })) : [];


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
            try {
                await addModule({
                    title: values.title,
                    credits: parseInt(values.credits),
                    program: values.program,
                    isActive: values.isActive,
                }).unwrap();
                formik.resetForm();
            } catch (error) {
                console.error("Failed to add module:", error);
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this module?")) return;
        try {
            await deleteModule(id).unwrap();
        } catch (error) {
            console.error("Failed to delete module:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Module Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                    <LuBookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Module</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Add a new module to the catalog that can be assigned to participants
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Module Name *"
                            labelFor="title"
                            attributes={{
                                type: "text",
                                title: "title",
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
                                title: "credits",
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
                                title: "program",
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
                            {programs.map((programs: any) => (
                                <option key={programs.id} value={programs.id}>
                                    {programs.title}
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

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <LuFileText className="h-6 w-6 text-amber-900 dark:text-amber-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Current Module Catalog ({modules.length} {modules.length === 1 ? "module" : "modules"})
                    </h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {modules.map((module: any) => (
                        <div
                            key={module.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent dark:border-gray-600"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white">{module.code}</span>
                                    <span className="text-gray-600 dark:text-gray-400">-</span>
                                    <span className="text-gray-900 dark:text-gray-200">{module.title}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {module.credits} {module.credits === 1 ? "credit" : "credits"} • {module.program && typeof module.program === 'object' ? module.program.title : module.program}
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
