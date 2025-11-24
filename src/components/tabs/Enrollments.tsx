import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import { api } from "../../utils/api.ts";

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

interface Participant {
    id: string;
    name: string;
    modules: any[];
    enrolledPrograms: string[];
}

interface Module {
    id: string;
    code: string;
    title: string;
    credits: number;
    programId: any;
}

interface Program {
    id: string;
    name: string;
}

const Enrollments = () => {
    // enrollmentIdCounter removed as backend handles IDs


    const [participants, setParticipants] = useState<Participant[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [participantsData, modulesData, programsData] = await Promise.all([
                api.get("/participants"),
                api.get("/modules"),
                api.get("/programs")
            ]);

            console.log(participantsData.results);
            if (Array.isArray(participantsData.results)) {
                setParticipants(participantsData.results.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    modules: p.modules || [],
                    enrolledPrograms: p.enrolledPrograms || []
                })));
            } else {
                setParticipants([]);
            }

            if (Array.isArray(modulesData)) {
                setModules(modulesData.map((m: any) => ({
                    id: m.id || m._id,
                    code: m.code,
                    title: m.title,
                    credits: m.credits,
                    programId: typeof m.program === 'object' ? m.program._id : m.program
                })));
            } else {
                setModules([]);
            }

            if (Array.isArray(programsData)) {
                setPrograms(programsData.map((p: any) => ({
                    id: p.id || p._id,
                    name: p.name
                })));
            } else {
                setPrograms([]);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    const statusOptions = ["Registered", "In Progress", "Completed", "Dropped"];
    const semesters = ["1st", "2nd"];

    const validationSchema = Yup.object({
        participant: Yup.string()
            .required("Participant is required"),
        program: Yup.string()
            .required("Program is required"),
        module: Yup.string()
            .required("Module is required"),
        status: Yup.string(),
        semester: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            participant: "",
            program: "",
            module: "",
            status: "Registered",
            semester: "1st",
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            const selectedParticipant = participants.find((p) => p.id === values.participant);
            const selectedModule = modules.find((m) => m.id === values.module);

            if (selectedParticipant && selectedModule) {
                try {
                    // Check if already enrolled
                    const isAlreadyEnrolled = selectedParticipant.modules.some(
                        (m: any) => (typeof m.module === 'object' ? m.module._id : m.module) === values.module
                    );

                    if (isAlreadyEnrolled) {
                        alert("Participant is already enrolled in this module.");
                        setIsLoading(false);
                        return;
                    }

                    const newModuleEntry = {
                        module: values.module,
                        enrolledAt: new Date(),
                        status: values.status,
                        grades: [],
                        finalScore: null,
                        gradePoint: 0,
                        gradeLetter: null
                    };

                    const updatedModules = [...selectedParticipant.modules, newModuleEntry];

                    // Update enrolledPrograms if needed
                    const updatedPrograms = selectedParticipant.enrolledPrograms.includes(values.program)
                        ? selectedParticipant.enrolledPrograms
                        : [...selectedParticipant.enrolledPrograms, values.program];

                    // We need to send IDs for modules in the update payload if the backend expects IDs
                    // But if we send the whole array, we must ensure existing populated modules are converted back to IDs if the backend requires it.
                    // Assuming backend handles mixed or we should map to IDs. Safest is to map to IDs.
                    const payloadModules = updatedModules.map((m: any) => ({
                        ...m,
                        module: typeof m.module === 'object' ? m.module._id : m.module
                    }));

                    await api.put(`/participants/${selectedParticipant.id}`, {
                        modules: payloadModules,
                        enrolledPrograms: updatedPrograms
                    });

                    // Update local state
                    const updatedParticipant = {
                        ...selectedParticipant,
                        modules: updatedModules,
                        enrolledPrograms: updatedPrograms
                    };

                    setParticipants(participants.map(p => p.id === selectedParticipant.id ? updatedParticipant : p));

                    console.log("Enrollment updated for participant:", selectedParticipant.name);

                    formik.resetForm({
                        values: {
                            participant: formik.values.participant,
                            program: formik.values.program,
                            module: "",
                            status: "Registered",
                            semester: "1st",
                        },
                    });
                } catch (error) {
                    console.error("Failed to enroll participant:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        },
    });

    const selectedParticipant = participants.find((p) => p.id === formik.values.participant);

    const filteredEnrollments: Enrollment[] = selectedParticipant?.modules.map((m: any) => {
        const moduleId = typeof m.module === 'object' ? m.module._id : m.module;
        const moduleDetails = modules.find(mod => mod.id === moduleId);
        return {
            id: moduleId, // Using module ID as enrollment ID for display since it's embedded
            participantId: selectedParticipant.id,
            moduleCode: moduleDetails?.code || (typeof m.module === 'object' ? m.module.code : 'N/A'),
            moduleName: moduleDetails?.title || (typeof m.module === 'object' ? m.module.title : 'Unknown'),
            credits: moduleDetails?.credits || (typeof m.module === 'object' ? m.module.credits : 0),
            progress: 0, // Not in schema
            grade: m.gradeLetter,
            status: m.status
        };
    }) || [];

    const handleDelete = async (moduleId: string) => {
        if (!selectedParticipant) return;
        if (!window.confirm("Are you sure you want to delete this enrollment?")) return;

        try {
            const updatedModules = selectedParticipant.modules.filter((m: any) => {
                const mId = typeof m.module === 'object' ? m.module._id : m.module;
                return mId !== moduleId;
            });

            const payloadModules = updatedModules.map((m: any) => ({
                ...m,
                module: typeof m.module === 'object' ? m.module._id : m.module
            }));

            await api.put(`/participants/${selectedParticipant.id}`, {
                modules: payloadModules
            });

            // Update local state
            const updatedParticipant = {
                ...selectedParticipant,
                modules: updatedModules
            };
            setParticipants(participants.map(p => p.id === selectedParticipant.id ? updatedParticipant : p));

            console.log("Enrollment deleted for module:", moduleId);
        } catch (error) {
            console.error("Failed to delete enrollment:", error);
        }
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
                            {participants.map((participants) => (
                                <option key={participants.id} value={participants.id}>
                                    {participants.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Program *"
                            labelFor="program"
                            attributes={{
                                name: "program",
                                value: formik.values.program,
                                onChange: (e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue("module", ""); // Reset module when program changes
                                },
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.program && formik.errors.program
                                    ? formik.errors.program
                                    : undefined
                            }
                        >
                            <option value="">Select program</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
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
                                disabled: !formik.values.program
                            }}
                            error={
                                formik.touched.module && formik.errors.module
                                    ? formik.errors.module
                                    : undefined
                            }
                        >
                            <option value="">Select module</option>
                            {modules
                                .filter(m => !formik.values.program || m.programId === formik.values.program)
                                .map((modules) => (
                                    <option key={modules.id} value={modules.id}>
                                        {modules.code} - {modules.title}
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
                            filteredEnrollments.map((enrollment: Enrollment) => (
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
