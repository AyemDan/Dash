import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuBookOpen, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";

interface Module {
    id: string;
    moduleId: string;
    moduleName: string;
    credits: number;
    program: string;
}

const Modules = () => {
    const [modules, setModules] = useState<Module[]>([
        {
            id: "1",
            moduleId: "CS101",
            moduleName: "Introduction to Computer Science",
            credits: 3,
            program: "Computer Science",
        },
        {
            id: "2",
            moduleId: "CS201",
            moduleName: "Object-Oriented Programming",
            credits: 4,
            program: "Computer Science",
        },
        {
            id: "3",
            moduleId: "CS301",
            moduleName: "Data Structures & Algorithms",
            credits: 4,
            program: "Computer Science",
        },
        {
            id: "4",
            moduleId: "CS302",
            moduleName: "Database Systems",
            credits: 3,
            program: "Computer Science",
        },
    ]);

    const creditsOptions = [1, 2, 3, 4, 5, 6];
    const programs = [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Engineering",
    ];

    const validationSchema = Yup.object({
        moduleId: Yup.string()
            .required("Module ID is required")
            .matches(/^[A-Z]{2}\d{3}$/, "Module ID must be in format like CS501"),
        moduleName: Yup.string()
            .required("Module Name is required")
            .min(3, "Module Name must be at least 3 characters"),
        credits: Yup.string()
            .required("Credits is required"),
        program: Yup.string()
            .required("Department is required"),
    });

    const formik = useFormik({
        initialValues: {
            moduleId: "",
            moduleName: "",
            credits: "",
            program: "",
        },
        validationSchema,
        onSubmit: (values) => {
            const newModule: Module = {
                id: Date.now().toString(),
                moduleId: values.moduleId,
                moduleName: values.moduleName,
                credits: parseInt(values.credits),
                program: values.program,
            };
            setModules([...modules, newModule]);
            formik.resetForm();
            console.log("Module added:", newModule);
        },
    });

    const handleDelete = (id: string) => {
        setModules(modules.filter((module) => module.id !== id));
        console.log("Module deleted:", id);
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
                            labelFor="moduleName"
                            attributes={{
                                type: "text",
                                name: "moduleName",
                                placeholder: "Advanced Programming",
                                value: formik.values.moduleName,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.moduleName && formik.errors.moduleName
                                    ? formik.errors.moduleName
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
                            {programs.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
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
                                disabled: !formik.isValid,
                            }}
                            width="full"
                            paddingX="px-4"
                            backgroundColor="#6B7280"
                            textColor="#ffffff"
                        />
                    </div>
                </form>
            </div>

            {/* Current Module Catalog Section */}
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
                                    <span className="font-bold text-gray-900">{module.moduleId}</span>
                                    <span className="text-gray-600">-</span>
                                    <span className="text-gray-900">{module.moduleName}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {module.credits} {module.credits === 1 ? "credit" : "credits"} • {module.program}
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
