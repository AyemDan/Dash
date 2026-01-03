import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuUsers, LuPlus, LuUserX } from "react-icons/lu";
import Input from "../Input.tsx";
import Select from "../Select.tsx";
import ActionButton from "../ActionButton.tsx";
import { useParticipants } from "../../hooks/useParticipants.ts";

const Participants = () => {
    const {
        participants,
        programs,
        isLoading,
        fetchParticipantsAndPrograms,
        addParticipant,
        deleteParticipant
    } = useParticipants();

    useEffect(() => {
        fetchParticipantsAndPrograms();
    }, [fetchParticipantsAndPrograms]);

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
        password: Yup.string(),
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
            let generatedPassword = values.password;
            if (!generatedPassword) {
                const firstName = values.firstName.toLowerCase();
                const lastThreeDigits = values.phoneNumber.toString().slice(-3);
                generatedPassword = firstName + lastThreeDigits;
            }

            try {
                await addParticipant({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    password: generatedPassword,
                    division: values.division,
                    deanery: values.deanery,
                    parish: values.parish,
                    program: values.program,
                    modulesCount: 0,
                });
                formik.resetForm();
                // Toaster success?
            } catch (error) {
                // Toaster error?
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this participant?")) return;
        await deleteParticipant(id);
    };

    return (
        <div className="space-y-6">
            {/* Current Participants Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <LuUsers className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Current Participants ({participants.length})
                    </h2>
                </div>

                <div className="space-y-3">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{participant.firstName} {participant.lastName}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {participant.participantId} • {participant.program} • {participant.graduationYear}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">{participant.email}</p>
                                <p className="text-sm text-blue-600 underline cursor-pointer">
                                    Password: {participant.password}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                                    {participant.modulesCount} {participant.modulesCount === 1 ? "module" : "modules"}
                                </span>
                                <button
                                    onClick={() => handleDelete(participant.id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    aria-label="Remove participant"
                                >
                                    <LuUserX className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add New Participant Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Participant</h2>

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
                            label="Password (optional)"
                            labelFor="password"
                            attributes={{
                                name: "password",
                                placeholder: "Auto-generated if empty",
                                value: formik.values.password,
                                onChange: formik.handleChange,
                                onBlur: formik.handleBlur,
                            }}
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
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
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
