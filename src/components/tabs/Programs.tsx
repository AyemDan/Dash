import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuGraduationCap, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";

interface Program {
    id: string;
    programName: string;
    semester: string;
    duration: number;
    participantsEnrolled: number;
}

const Programs = () => {
    const [programs, setPrograms] = useState<Program[]>([
        {
            id: "1",
            programName: "Computer Science",
            semester: "Engineering Department",
            duration: 4,
            participantsEnrolled: 1,
        },
        {
            id: "2",
            programName: "Information Technology",
            semester: "Engineering Department",
            duration: 4,
            participantsEnrolled: 1,
        },
        {
            id: "3",
            programName: "Data Science",
            semester: "Engineering Department",
            duration: 4,
            participantsEnrolled: 1,
        },
    ]);

    const semesters = [
        "Engineering Department",
        "Business Department",
        "Science Department",
        "Arts Department",
        "Medical Department",
    ];

    const durationOptions = [1, 2, 3, 4, 5, 6];

    const validationSchema = Yup.object({
        programName: Yup.string()
            .required("Program Name is required")
            .min(3, "Program Name must be at least 3 characters"),
        semester: Yup.string()
            .required("Department is required"),
        duration: Yup.string()
            .required("Duration is required"),
    });

    const formik = useFormik({
        initialValues: {
            programName: "",
            semester: "",
            duration: "",
        },
        validationSchema,
        onSubmit: (values) => {
            const newProgram: Program = {
                id: Date.now().toString(),
                programName: values.programName,
                semester: values.semester,
                duration: parseInt(values.duration),
                participantsEnrolled: 0,
            };
            setPrograms([...programs, newProgram]);
            formik.resetForm();
            console.log("Program added:", newProgram);
        },
    });

    const handleDelete = (id: string) => {
        setPrograms(programs.filter((program) => program.id !== id));
        console.log("Program deleted:", id);
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
                    Add a new academic program that participants can enroll in
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Program Name *"
                            labelFor="programName"
                            attributes={{
                                type: "text",
                                name: "programName",
                                placeholder: "Computer Science",
                                value: formik.values.programName,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.programName && formik.errors.programName
                                    ? formik.errors.programName
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
                            {durationOptions.map((years) => (
                                <option key={years} value={years}>
                                    {years} {years === 1 ? "Year" : "Years"}
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

            {/* Current Programs Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <LuFileText className="h-6 w-6 text-amber-900" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Current Programs ({programs.length} {programs.length === 1 ? "program" : "programs"})
                    </h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {programs.map((program) => (
                        <div
                            key={program.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{program.programName}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {program.semester} • {program.duration} {program.duration === 1 ? "year" : "years"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Participants enrolled: {program.participantsEnrolled}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                    {program.duration} {program.duration === 1 ? "year" : "years"}
                                </span>
                                <button
                                    onClick={() => handleDelete(program.id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    aria-label="Delete program"
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
