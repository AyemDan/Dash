import { useFormik } from "formik";
import * as Yup from "yup";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import {
    useGetParticipantsQuery,
    useGetModulesQuery,
    useGetProgramsQuery,
    useEnrollParticipantMutation,
    useUpdateParticipantMutation
} from "../../store/api/apiSlice.ts";

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
    const { data: participantsData = [], isLoading: isParticipantsLoading } = useGetParticipantsQuery({});
    const { data: modulesData = [], isLoading: isModulesLoading } = useGetModulesQuery({});
    const { data: programsData = [], isLoading: isProgramsLoading } = useGetProgramsQuery({});

    const [enrollParticipant, { isLoading: isEnrolling }] = useEnrollParticipantMutation();
    const [updateParticipant, { isLoading: isUpdating }] = useUpdateParticipantMutation();

    const isLoading = isParticipantsLoading || isModulesLoading || isProgramsLoading || isEnrolling || isUpdating;

    // Transform Data
    const participants = Array.isArray(participantsData) ? participantsData.map((p: any) => ({
        id: p._id || p.id,
        firstName: p.firstName || p.fullName?.split(' ')[0] || p.name?.split(' ')[0] || "",
        lastName: p.lastName || p.fullName?.split(' ').slice(1).join(' ') || p.name?.split(' ').slice(1).join(' ') || "",
        modules: p.modules || [],
        enrolledPrograms: p.enrolledPrograms || []
    })) : [];

    const modules = Array.isArray(modulesData) ? modulesData.map((m: any) => ({
        id: m.id || m._id,
        code: m.code,
        title: m.title,
        credits: m.credits,
        programId: typeof m.program === 'object' ? m.program._id : m.program
    })) : [];

    const programs = Array.isArray(programsData) ? programsData.map((p: any) => ({
        id: p.id || p._id,
        title: p.title
    })) : [];


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
            const selectedParticipant = participants.find((p: any) => p.id === values.participant);
            const selectedModule = modules.find((m: any) => m.id === values.module);

            if (selectedParticipant && selectedModule) {
                try {
                    // Check if already enrolled
                    const isAlreadyEnrolled = selectedParticipant.modules.some(
                        (m: any) => (typeof m.module === 'object' ? m.module._id : m.module) === values.module
                    );

                    if (isAlreadyEnrolled) {
                        alert("Participant is already enrolled in this module.");
                        return;
                    }

                    await enrollParticipant({
                        id: selectedParticipant.id,
                        data: { moduleIds: [values.module] }
                    }).unwrap();

                    console.log("Enrollment updated for participant:", selectedParticipant.firstName);

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
                }
            }
        },
    });

    const selectedParticipant = participants.find((p: any) => p.id === formik.values.participant);

    const filteredEnrollments: Enrollment[] = selectedParticipant?.modules.map((m: any) => {
        const moduleId = typeof m.module === 'object' ? m.module._id : m.module;
        const moduleDetails = modules.find((mod: any) => mod.id === moduleId);
        return {
            id: moduleId,
            participantId: selectedParticipant.id,
            moduleCode: moduleDetails?.code || (typeof m.module === 'object' ? m.module.code : 'N/A'),
            moduleName: moduleDetails?.title || (typeof m.module === 'object' ? m.module.title : 'Unknown'),
            credits: moduleDetails?.credits || (typeof m.module === 'object' ? m.module.credits : 0),
            progress: 0,
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

            await updateParticipant({
                id: selectedParticipant.id,
                modules: payloadModules
            }).unwrap();

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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Enroll Participant in Module
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                            {participants.map((participants: any) => (
                                <option key={participants.id} value={participants.id}>
                                    {participants.firstName} {participants.lastName}
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
                            {programs.map((programs: any) => (
                                <option key={programs.id} value={programs.id}>
                                    {programs.title}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Module *"
                            labelFor="module"
                            attributes={{
                                name: "module",
                                value: formik.values.module,
                                onChange: (e) => {
                                    formik.handleChange(e);
                                    const selectedModuleId = e.target.value;
                                    const selectedModule = modules.find((m: any) => m.id === selectedModuleId);
                                    if (selectedModule && selectedModule.programId) {
                                        formik.setFieldValue("program", selectedModule.programId);
                                    }
                                },
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.module && formik.errors.module
                                    ? formik.errors.module
                                    : undefined
                            }
                        >
                            <option value="">Select module</option>
                            {modules
                                .filter((m: any) => !formik.values.program || m.programId === formik.values.program)
                                .map((modules: any) => (
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
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Current Enrollments for {selectedParticipant?.firstName} {selectedParticipant?.lastName} ({filteredEnrollments.length})
                        </h2>
                    </div>

                    {/* Enrollments List */}
                    <div className="space-y-3">
                        {filteredEnrollments.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No enrollments found for this participant.</p>
                        ) : (
                            filteredEnrollments.map((enrollment: Enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent dark:border-gray-600"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {enrollment.moduleCode} {enrollment.moduleName}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                            {enrollment.credits} {enrollment.credits === 1 ? "credit" : "credits"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
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
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full">
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
