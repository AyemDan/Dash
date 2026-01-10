import { useFormik } from "formik";
import * as Yup from "yup";
import { LuGraduationCap, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import {
    useGetProgramsQuery,
    useAddProgramMutation,
    useDeleteProgramMutation
} from "../../store/api/apiSlice.ts";

const Programs = () => {
    const { data: programsData = [], isLoading: isProgramsLoading } = useGetProgramsQuery({});
    const [addProgram, { isLoading: isAdding }] = useAddProgramMutation();
    const [deleteProgram] = useDeleteProgramMutation();

    const isLoading = isProgramsLoading || isAdding;

    // Transform data to match the component's expected structure if needed
    // Assuming backend returns array of program objects
    const programs = Array.isArray(programsData) ? programsData.map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
        code: p.code,
        modules: p.modules,
        credits: p.credits,
        duration: p.duration,
        semester: p.semester,
        isActive: p.isActive,
        participants: p.participants?.length || 0 // Assuming we just want count based on prev code
    })) : [];

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
            try {
                await addProgram({
                    title: values.title,
                    semester: values.semester,
                    duration: parseInt(values.duration),
                    participants: [],
                }).unwrap();
                formik.resetForm();
            } catch (error) {
                console.error("Failed to add programs:", error);
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this programs?")) return;
        try {
            await deleteProgram(id).unwrap();
        } catch (error) {
            console.error("Failed to delete programs:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Program Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                    <LuGraduationCap className="h-6 w-6 text-amber-900 dark:text-amber-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Program</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Add a new academic programs that participants can enroll in
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Program Name *"
                            labelFor="title"
                            attributes={{
                                type: "text",
                                name: "title",
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
                                name: "semester",
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
                                name: "duration",
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <LuFileText className="h-6 w-6 text-amber-900 dark:text-amber-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Current Programs ({programs.length} {programs.length === 1 ? "programs" : "programs"})
                    </h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {programs.map((programs: any) => (
                        <div
                            key={programs.id}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white">{programs.code}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    {programs.title} • {programs.duration}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Participants enrolled: {programs.participants}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full">
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
