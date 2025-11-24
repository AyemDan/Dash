import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuGraduationCap, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import { api } from "../../utils/api.ts";

interface Program {
    id: any;
    title: string;
    code: string,
    modules: any[];
    duration: number;
    credits: number;
    semester: number;
    isActive: any;
    participants : any[];
}

const Programs = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPrograms();
    }, []); 

    const fetchPrograms = async () => {
        try {
            const data = await api.get("/programs");
            if (Array.isArray(data)) {
                const mappedPrograms = data.map((p: any) => ({
                    id: p._id,
                    title: p.title,
                    code: p.code,
                    modules: p.modules,
                    credits: p.credits,
                    duration: p.duration,
                    semester: p.semester,
                    isActive: p.isActive,
                    participants: p.participants
                }));
                setPrograms(mappedPrograms);
            } else {
                setPrograms([]);
            }
        } catch (error) {
            console.error("Failed to fetch programs:", error);
            setPrograms([]);
        }
    };

    const semesters = [1, 2];

    const durationOptions = [3, 4, 6, 8, 12];

    const validationSchema = Yup.object({
        title: Yup.string()
            .required("Program Name is required")
            .min(3, "Program Name must be at least 3 characters"),
        semester: Yup.string()
            .required("Department is required"),
        duration: Yup.string()
            .required("Duration is required"),
    });

    const formik = useFormik({
        initialValues: {
            title: "",
            semester: "",
            duration: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const newProgram = await api.post("/programs", {
                    title: values.title,
                    semester: values.semester,
                    duration: parseInt(values.duration),
                    participants: [],
                });
                // setPrograms([...programs, newProgram]);
                formik.resetForm();
                console.log("Program added:", newProgram);
            } catch (error) {
                console.error("Failed to add programs:", error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this programs?")) return;
        try {
            await api.delete(`/programs/${id}`);
            setPrograms(programs.filter((programs) => programs.id !== id));
            console.log("Program deleted:", id);
        } catch (error) {
            console.error("Failed to delete programs:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Program Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <LuGraduationCap className="h-6 w-6 text-amber-900" />
                    <h2 className="text-xl font-bold text-gray-900">Create New Program</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Add a new academic programs that participants can enroll in
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Program Name *"
                            labelFor="title"
                            attributes={{
                                type: "text",
                                title: "title",
                                placeholder: "Computer Science",
                                value: formik.values.title,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.title && formik.errors.title
                                    ? formik.errors.title
                                    : undefined
                            }
                            note="(e.g., Computer Science)"
                        />

                        <Select
                            label="Semester*"
                            labelFor="semester"
                            attributes={{
                                title: "semester",
                                value: formik.values.semester,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.semester && formik.errors.semester
                                    ? formik.errors.semester
                                    : undefined
                            }
                        >
                            <option value="">Select semester</option>
                            {semesters.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Duration (Years) *"
                            labelFor="duration"
                            attributes={{
                                title: "duration",
                                value: formik.values.duration,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.duration && formik.errors.duration
                                    ? formik.errors.duration
                                    : undefined
                            }
                        >
                            <option value="">Select duration</option>
                            {durationOptions.map((months) => (
                                <option key={months} value={months}>
                                    {months} {months === 1 ? "Month" : "Months"}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="pt-2">
                        <ActionButton
                            buttonText={
                                <span className="flex items-center gap-2">
                                    <LuPlus className="h-4 w-4" />
                                    Add Program
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

            {/* Current Programs Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <LuFileText className="h-6 w-6 text-amber-900" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Current Programs ({programs.length} {programs.length === 1 ? "programs" : "programs"})
                    </h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {programs.map((programs) => (
                        <div
                            key={programs.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{programs.code}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {programs.title} • {programs.duration}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Participants enrolled: {programs.participants}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                    {programs.duration} {programs.duration === 1 ? "month" : "months"}
                                </span>
                                <button
                                    onClick={() => handleDelete(programs.id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    aria-label="Delete programs"
                                >
                                    <LuTrash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Programs;
