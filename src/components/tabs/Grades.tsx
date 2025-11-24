import { useState, useEffect } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
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
    semester?: string;
}

interface Participant {
    id: string;
    name: string;
    participantId: string;
}

const Grades = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollmentsData, participantsData] = await Promise.all([
                api.get("/enrollments"),
                api.get("/participants")
            ]);

            setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);

            if (Array.isArray(participantsData)) {
                setParticipants(participantsData.map((p: any) => ({
                    id: p.id,
                    name: p.fullName,
                    participantId: p.participantId
                })));
            } else {
                setParticipants([]);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setEnrollments([]);
            setParticipants([]);
        }
    };

    const [openSections, setOpenSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>("");

    const gradeOptions = [
        { value: "", label: "-" },
        { value: "A+", label: "A+" },
        { value: "A", label: "A" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B", label: "B" },
        { value: "B-", label: "B-" },
        { value: "C+", label: "C+" },
        { value: "C", label: "C" },
        { value: "C-", label: "C-" },
        { value: "D+", label: "D+" },
        { value: "D", label: "D" },
        { value: "D-", label: "D-" },
        { value: "F", label: "F" },
    ];

    const toggleSection = (participantId: string) => {
        setOpenSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(participantId)) {
                newSet.delete(participantId);
            } else {
                newSet.add(participantId);
            }
            return newSet;
        });
    };

    const handleGradeChange = (enrollmentId: string, newGrade: string) => {
        setEnrollments(
            enrollments.map((enrollment) =>
                enrollment.id === enrollmentId
                    ? { ...enrollment, grade: newGrade || null }
                    : enrollment
            )
        );
        console.log("Grade updated:", enrollmentId, newGrade || null);
    };

    const getStatusBadgeClass = (status: Enrollment["status"]) => {
        switch (status) {
            case "Completed":
                return "bg-gray-200 text-gray-700";
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

    const enrollmentsByParticipant = participants.map((participant) => {
        const participantEnrollments = enrollments.filter(
            (enrollment) => enrollment.participantId === participant.id
        );
        return {
            participant,
            enrollments: participantEnrollments,
        };
    });

    const filteredEnrollmentsByParticipant = enrollmentsByParticipant.filter(
        ({ participant }) => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase().trim();
            return (
                participant.name.toLowerCase().includes(query) ||
                participant.participantId.toLowerCase().includes(query)
            );
        }
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Update Grades</h2>
                    <div className="relative max-w-[300px] w-full">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                        />
                    </div>
                </div>

                {filteredEnrollmentsByParticipant.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {searchQuery.trim() ? "No participants found matching your search." : "No participants found."}
                    </p>
                ) : (
                    filteredEnrollmentsByParticipant.map(({ participant, enrollments: participantEnrollments }) => {
                        const isOpen = openSections.has(participant.id);

                        return (
                            <div key={participant.id} className={participant.id !== "1" ? "mt-8 pt-8 border-t border-gray-200" : ""}>
                                <button
                                    onClick={() => toggleSection(participant.id)}
                                    className="w-full flex items-center justify-between text-left mb-4 hover:opacity-80 transition-opacity"
                                >
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {participant.name} ({participant.participantId}) - {participantEnrollments.length} {participantEnrollments.length === 1 ? "module" : "modules"}
                                    </h3>
                                    <LuChevronDown
                                        className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="space-y-0 transition-all duration-200">
                                        {participantEnrollments.map((enrollment, index) => (
                                            <div
                                                key={enrollment.id}
                                                className={`flex items-center justify-between py-4 ${index !== participantEnrollments.length - 1 ? "border-b border-gray-200" : ""
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-900">{enrollment.moduleCode}</span>
                                                        <span className="text-gray-900">{enrollment.moduleName}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {enrollment.semester || "N/A"} • {enrollment.credits} {enrollment.credits === 1 ? "credit" : "credits"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 ml-6">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(enrollment.status)}`}
                                                    >
                                                        {enrollment.status}
                                                    </span>
                                                    <div className="relative">
                                                        <select
                                                            value={enrollment.grade || ""}
                                                            onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                                                            className="appearance-none px-3 py-1 pr-8 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {gradeOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <svg
                                                                className="w-4 h-4 text-gray-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 9l-7 7-7-7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Grades;
