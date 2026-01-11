import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuUsers, LuPlus, LuUserX } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import {
    useGetParticipantsQuery,
    useGetProgramsQuery,
    useAddParticipantMutation,
    useDeleteParticipantMutation
} from "../../store/api/apiSlice.ts";


const Participants = () => {
    const [searchQuery, setSearchQuery] = useState("");
    // Simple debounce
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: participants = [], isLoading: isParticipantsLoading } = useGetParticipantsQuery({ q: debouncedQuery });
    const { data: programs = [], isLoading: isProgramsLoading } = useGetProgramsQuery({});
    const [addParticipant, { isLoading: isAdding }] = useAddParticipantMutation();
    const [deleteParticipant] = useDeleteParticipantMutation();

    const isLoading = isParticipantsLoading || isProgramsLoading || isAdding;

    const semesters = ["1st", "2nd"];

    const validationSchema = Yup.object({
        firstName: Yup.string()
            .required("First Name is required")
            .min(2, "First Name must be at least 2 characters"),
        lastName: Yup.string()
            .required("Last Name is required")
            .min(2, "Last Name must be at least 2 characters"),
        email: Yup.string()
            .email("Please enter a valid email address"),
        password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
        phoneNumber: Yup.number()
            .required("Phone Number is required"),
        program: Yup.string()
            .required("Program is required"),
        currentSemester: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phoneNumber: "",
            division: "",
            deanery: "",
            parish: "",
            program: "",
            currentSemester: "1st",
        },
        validationSchema,
        onSubmit: async (values) => {
            const generatedPassword = values.password;

            try {
                await addParticipant({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    password: generatedPassword,
                    phoneNumber: values.phoneNumber,
                    division: values.division,
                    deanery: values.deanery,
                    parish: values.parish,
                    program: values.program,
                    modulesCount: 0,
                    semester: values.currentSemester
                }).unwrap();
                formik.resetForm();
                // Toaster success?
            } catch (error) {
                console.error("Failed to add participant", error);
                // Toaster error?
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this participant?")) return;
        try {
            await deleteParticipant(id).unwrap();
        } catch (error) {
            console.error("Failed to delete participant", error);
        }
    };

    // Helper to format participant data for display if needed
    // The query hook's transformResponse can also handle this centrally
    const displayParticipants = participants.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        firstName: p.firstName || p.fullName?.split(' ')[0] || "",
        lastName: p.lastName || p.fullName?.split(' ').slice(1).join(' ') || "",
        email: p.email,
        participantId: p.participantId || p.regNo || "P-???",
        // Mask password if it looks like a hash, otherwise show it (dev mainly)
        password: p.passwordHash ? "******" : (p.password || "N/A"),
        modulesCount: p.modules?.length || 0,
        program: p.enrolledPrograms?.[0]?.title || p.program || "N/A", // robust check
        graduationYear: p.metadata?.graduationYear || new Date().getFullYear() + 3
    }));

    return (
        <div className="space-y-6">
            {/* Current Participants Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <LuUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Current Participants ({isParticipantsLoading ? "..." : displayParticipants.length})
                        </h2>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Name, Email, or Reg No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-4 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                {[
                                    "ID", "First Name", "Last Name", "Email", "Phone",
                                    "Division", "Deanery", "Parish", "Program", "Sem", "Grad Year", "Modules", "Actions"
                                ].map((header) => (
                                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isParticipantsLoading ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Loading participants...
                                    </td>
                                </tr>
                            ) : displayParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No participants found.
                                    </td>
                                </tr>
                            ) : (
                                displayParticipants.map((participant: any) => (
                                    <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            {participant.participantId}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            {participant.firstName}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            {participant.lastName}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.email}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.phoneNumber || "-"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.division || "-"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.deanery || "-"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.parish || "-"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {participant.program}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.semester || "-"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {participant.graduationYear}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                                {participant.modulesCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                                            <button
                                                onClick={() => handleDelete(participant.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Delete participant"
                                            >
                                                <LuUserX className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Participant Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Participant</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="First Name *"
                            labelFor="firstName"
                            attributes={{
                                type: "text",
                                name: "firstName",
                                placeholder: "John",
                                value: formik.values.firstName,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.firstName && formik.errors.firstName
                                    ? formik.errors.firstName
                                    : undefined
                            }
                        />

                        <Input
                            label="Last Name *"
                            labelFor="lastName"
                            attributes={{
                                type: "text",
                                name: "lastName",
                                placeholder: "Doe",
                                value: formik.values.lastName,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.lastName && formik.errors.lastName
                                    ? formik.errors.lastName
                                    : undefined
                            }
                        />

                        <Input
                            label="Email"
                            labelFor="email"
                            attributes={{
                                type: "email",
                                name: "email",
                                placeholder: "participant@university.edu",
                                value: formik.values.email,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.email && formik.errors.email
                                    ? formik.errors.email
                                    : undefined
                            }
                        />

                        <Input
                            label="Password *"
                            labelFor="password"
                            attributes={{
                                type: "password",
                                name: "password",
                                placeholder: "Enter password",
                                value: formik.values.password,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.password && formik.errors.password
                                    ? formik.errors.password
                                    : undefined
                            }
                        />

                        <Input
                            label="Division"
                            labelFor="division"
                            attributes={{
                                name: "division",
                                placeholder: "",
                                value: formik.values.division,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                        />
                        <Input
                            label="Deanery"
                            labelFor="deanery"
                            attributes={{
                                name: "deanery",
                                placeholder: "",
                                value: formik.values.deanery,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                        />
                        <Input
                            label="Parish "
                            labelFor="parish"
                            attributes={{
                                name: "parish",
                                placeholder: "",
                                value: formik.values.parish,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                        />
                        <Input
                            label="Phone Number"
                            labelFor="phoneNumber"
                            attributes={{
                                type: "tel",
                                name: "phoneNumber",
                                placeholder: "123-456-7890",
                                value: formik.values.phoneNumber,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
                            error={
                                formik.touched.phoneNumber && formik.errors.phoneNumber
                                    ? formik.errors.phoneNumber
                                    : undefined
                            }
                        />

                        <Select
                            label="Program *"
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
                            <option value="">Select a program</option>
                            {programs.map((program: any) => (
                                <option key={program.id || program._id} value={program.id || program._id}>
                                    {program.title}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Current Semester"
                            labelFor="currentSemester"
                            attributes={{
                                name: "currentSemester",
                                value: formik.values.currentSemester,
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
                                    Add Participant
                                </span>
                            }
                            attributes={{
                                type: "button",
                                onClick: () => formik.handleSubmit(),
                                disabled: isLoading,
                            }}
                            loading={isLoading}
                            width="full"
                            paddingX="px-4"
                            backgroundColor="#000000"
                            textColor="#ffffff"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Participants;

