import { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";

interface Enrollment {
    id: string;
    participantId: string;
    moduleCode: string;
    moduleName: string;
    credits: number;
    progress: number;
    grade: string | null;
    status: "Registered" | "In Progress" | "Completed" | "Dropped";
}

const Enrollments = () => {
    const enrollmentIdCounter = useRef(14); // Start after existing enrollments

    const participants = [
        { id: "1", name: "John Smith", participantId: "ST001" },
        { id: "2", name: "Emily Johnson", participantId: "ST002" },
        { id: "3", name: "Michael Brown", participantId: "ST003" },
        { id: "4", name: "Sarah Davis", participantId: "ST004" },
    ];

    const [enrollments, setEnrollments] = useState<Enrollment[]>([
        // Sarah Davis (ST004) - 4 enrollments
        {
            id: "1",
            participantId: "4",
            moduleCode: "SE101",
            moduleName: "Introduction to Programming",
            credits: 4,
            progress: 100,
            grade: "A-",
            status: "Completed",
        },
        {
            id: "2",
            participantId: "4",
            moduleCode: "SE102",
            moduleName: "Software Design Principles",
            credits: 3,
            progress: 70,
            grade: "B+",
            status: "In Progress",
        },
        {
            id: "3",
            participantId: "4",
            moduleCode: "MATH101",
            moduleName: "Calculus I",
            credits: 4,
            progress: 40,
            grade: null,
            status: "Registered",
        },
        {
            id: "4",
            participantId: "4",
            moduleCode: "ENG101",
            moduleName: "Technical Writing",
            credits: 3,
            progress: 20,
            grade: null,
            status: "Registered",
        },
        // John Smith (ST001) - 3 enrollments
        {
            id: "5",
            participantId: "1",
            moduleCode: "CS101",
            moduleName: "Introduction to Computer Science",
            credits: 3,
            progress: 85,
            grade: "A",
            status: "In Progress",
        },
        {
            id: "6",
            participantId: "1",
            moduleCode: "CS201",
            moduleName: "Object-Oriented Programming",
            credits: 4,
            progress: 60,
            grade: "B",
            status: "In Progress",
        },
        {
            id: "7",
            participantId: "1",
            moduleCode: "MATH101",
            moduleName: "Calculus I",
            credits: 4,
            progress: 30,
            grade: null,
            status: "Registered",
        },
        // Emily Johnson (ST002) - 3 enrollments
        {
            id: "8",
            participantId: "2",
            moduleCode: "CS301",
            moduleName: "Data Structures & Algorithms",
            credits: 4,
            progress: 90,
            grade: "A+",
            status: "Completed",
        },
        {
            id: "9",
            participantId: "2",
            moduleCode: "CS302",
            moduleName: "Database Systems",
            credits: 3,
            progress: 50,
            grade: null,
            status: "In Progress",
        },
        {
            id: "10",
            participantId: "2",
            moduleCode: "ENG101",
            moduleName: "Technical Writing",
            credits: 3,
            progress: 15,
            grade: null,
            status: "Registered",
        },
        {
            id: "11",
            participantId: "3",
            moduleCode: "CS101",
            moduleName: "Introduction to Computer Science",
            credits: 3,
            progress: 75,
            grade: "B+",
            status: "In Progress",
        },
        {
            id: "12",
            participantId: "3",
            moduleCode: "MATH101",
            moduleName: "Calculus I",
            credits: 4,
            progress: 55,
            grade: "B-",
            status: "In Progress",
        },
        {
            id: "13",
            participantId: "3",
            moduleCode: "CS201",
            moduleName: "Object-Oriented Programming",
            credits: 4,
            progress: 25,
            grade: null,
            status: "Registered",
        },
    ]);

    const modules = [
        { id: "1", moduleId: "CS101", moduleName: "Introduction to Computer Science" },
        { id: "2", moduleId: "CS201", moduleName: "Object-Oriented Programming" },
        { id: "3", moduleId: "CS301", moduleName: "Data Structures & Algorithms" },
        { id: "4", moduleId: "CS302", moduleName: "Database Systems" },
    ];

    const statusOptions = ["Registered", "In Progress", "Completed", "Dropped"];
    const semesters = ["1Qtr", "2Qtr", "3Qtr", "4Qtr"];

    const validationSchema = Yup.object({
        participant: Yup.string()
            .required("Participant is required"),
        module: Yup.string()
            .required("Module is required"),
        status: Yup.string(),
        semester: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            participant: "",
            module: "",
            status: "Registered",
            semester: "1Qtr",
        },
        validationSchema,
        onSubmit: (values) => {
            const selectedModule = modules.find((m) => m.id === values.module);
            if (selectedModule) {
                enrollmentIdCounter.current += 1;
                const newEnrollment: Enrollment = {
                    id: enrollmentIdCounter.current.toString(),
                    participantId: values.participant,
                    moduleCode: selectedModule.moduleId,
                    moduleName: selectedModule.moduleName,
                    credits: 3, // Default, would come from module data
                    progress: 0,
                    grade: null,
                    status: values.status as Enrollment["status"],
                };
                setEnrollments([...enrollments, newEnrollment]);
                console.log("Enrollment created:", newEnrollment);
            }
            formik.resetForm({
                values: {
                    participant: formik.values.participant, // Keep selected participant
                    module: "",
                    status: "Registered",
                    semester: "1Qtr",
                },
            });
        },
    });

    const selectedParticipant = participants.find((p) => p.id === formik.values.participant);
    const filteredEnrollments = enrollments.filter(
        (enrollment) => enrollment.participantId === formik.values.participant
    );

    const handleDelete = (enrollmentId: string) => {
        setEnrollments(enrollments.filter((enrollment) => enrollment.id !== enrollmentId));
        console.log("Enrollment deleted:", enrollmentId);
    };

    const getStatusBadgeClass = (status: Enrollment["status"]) => {
        switch (status) {
            case "Completed":
                return "bg-black text-white";
            case "In Progress":
                return "bg-gray-200 text-gray-700";
            case "Registered":
                return "bg-gray-200 text-gray-700";
            case "Dropped":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-200 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Enroll Participant in Module Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Enroll Participant in Module
                    </h2>
                    <p className="text-sm text-gray-600">
                        Assign modules from the catalog to participants
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Select Participant *"
                            labelFor="participant"
                            attributes={{
                                name: "participant",
                                value: formik.values.participant,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.participant && formik.errors.participant
                                    ? formik.errors.participant
                                    : undefined
                            }
                        >
                            <option value="">Choose a participant</option>
                            {participants.map((participant) => (
                                <option key={participant.id} value={participant.id}>
                                    {participant.participantId} - {participant.name}
                                </option>
                            ))}
                        </Select>
                        
                        <Select
                            label="Module *"
                            labelFor="module"
                            attributes={{
                                name: "module",
                                value: formik.values.module,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.module && formik.errors.module
                                    ? formik.errors.module
                                    : undefined
                            }
                        >
                            <option value="">Select module</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id}>
                                    {module.moduleId} - {module.moduleName}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Status"
                            labelFor="status"
                            attributes={{
                                name: "status",
                                value: formik.values.status,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Semester"
                            labelFor="semester"
                            attributes={{
                                name: "semester",
                                value: formik.values.semester,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                        >
                            {semesters.map((semester) => (
                                <option key={semester} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="pt-2">
                        <ActionButton
                            buttonText={
                                <span className="flex items-center gap-2">
                                    <LuPlus className="h-4 w-4" />
                                    Enroll Participant
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

            {/* Current Enrollments Section */}
            {formik.values.participant && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Current Enrollments for {selectedParticipant?.name} ({filteredEnrollments.length})
                        </h2>
                    </div>

                    {/* Enrollments List */}
                    <div className="space-y-3">
                        {filteredEnrollments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No enrollments found for this participant.</p>
                        ) : (
                            filteredEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">
                                                {enrollment.moduleCode} {enrollment.moduleName}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {enrollment.credits} {enrollment.credits === 1 ? "credit" : "credits"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Progress: {enrollment.progress}% • Grade: {enrollment.grade || "-"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(enrollment.status)}`}
                                        >
                                            {enrollment.status}
                                        </span>
                                        {enrollment.grade && (
                                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
                                                {enrollment.grade}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDelete(enrollment.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                            aria-label="Delete enrollment"
                                        >
                                            <LuTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enrollments;
