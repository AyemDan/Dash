import { useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";

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

const Grades = () => {
    const participants = [
        { id: "1", name: "John Smith", participantId: "ST001" },
        { id: "2", name: "Emily Johnson", participantId: "ST002" },
        { id: "3", name: "Michael Brown", participantId: "ST003" },
        { id: "4", name: "Sarah Davis", participantId: "ST004" },
    ];

    const [enrollments, setEnrollments] = useState<Enrollment[]>([
        // John Smith (ST001) - 5 enrollments
        {
            id: "1",
            participantId: "1",
            moduleCode: "CS301",
            moduleName: "Data Structures & Algorithms",
            credits: 4,
            progress: 100,
            grade: "A",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "2",
            participantId: "1",
            moduleCode: "CS302",
            moduleName: "Database Systems",
            credits: 3,
            progress: 100,
            grade: "A-",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "3",
            participantId: "1",
            moduleCode: "CS401",
            moduleName: "Machine Learning",
            credits: 4,
            progress: 75,
            grade: "B+",
            status: "In Progress",
            semester: "1Qtr",
        },
        {
            id: "4",
            participantId: "1",
            moduleCode: "CS402",
            moduleName: "Software Engineering",
            credits: 3,
            progress: 20,
            grade: null,
            status: "Registered",
            semester: "1Qtr",
        },
        {
            id: "5",
            participantId: "1",
            moduleCode: "MATH301",
            moduleName: "Statistics",
            credits: 3,
            progress: 100,
            grade: "A",
            status: "Completed",
            semester: "2Qtr",
        },
        // Emily Johnson (ST002) - 4 enrollments
        {
            id: "6",
            participantId: "2",
            moduleCode: "IT201",
            moduleName: "Network Fundamentals",
            credits: 3,
            progress: 100,
            grade: "A",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "7",
            participantId: "2",
            moduleCode: "IT202",
            moduleName: "Web Development",
            credits: 4,
            progress: 100,
            grade: "A-",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "8",
            participantId: "2",
            moduleCode: "IT301",
            moduleName: "Cybersecurity",
            credits: 3,
            progress: 70,
            grade: "B+",
            status: "In Progress",
            semester: "1Qtr",
        },
        {
            id: "9",
            participantId: "2",
            moduleCode: "IT302",
            moduleName: "Cloud Computing",
            credits: 3,
            progress: 15,
            grade: null,
            status: "Registered",
            semester: "1Qtr",
        },
        // Michael Brown (ST003) - 4 enrollments
        {
            id: "10",
            participantId: "3",
            moduleCode: "DS401",
            moduleName: "Advanced Machine Learning",
            credits: 4,
            progress: 100,
            grade: "A",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "11",
            participantId: "3",
            moduleCode: "DS402",
            moduleName: "Big Data Analytics",
            credits: 3,
            progress: 100,
            grade: "A",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "12",
            participantId: "3",
            moduleCode: "DS403",
            moduleName: "Deep Learning",
            credits: 4,
            progress: 65,
            grade: "A-",
            status: "In Progress",
            semester: "1Qtr",
        },
        {
            id: "13",
            participantId: "3",
            moduleCode: "DS404",
            moduleName: "Data Visualization",
            credits: 3,
            progress: 25,
            grade: null,
            status: "Registered",
            semester: "1Qtr",
        },
        // Sarah Davis (ST004) - 4 enrollments
        {
            id: "14",
            participantId: "4",
            moduleCode: "SE101",
            moduleName: "Introduction to Programming",
            credits: 4,
            progress: 100,
            grade: "A-",
            status: "Completed",
            semester: "2Qtr",
        },
        {
            id: "15",
            participantId: "4",
            moduleCode: "SE102",
            moduleName: "Software Design Principles",
            credits: 3,
            progress: 70,
            grade: "B+",
            status: "In Progress",
            semester: "1Qtr",
        },
        {
            id: "16",
            participantId: "4",
            moduleCode: "MATH101",
            moduleName: "Calculus I",
            credits: 4,
            progress: 40,
            grade: null,
            status: "Registered",
            semester: "1Qtr",
        },
        {
            id: "17",
            participantId: "4",
            moduleCode: "ENG101",
            moduleName: "Technical Writing",
            credits: 3,
            progress: 20,
            grade: null,
            status: "Registered",
            semester: "1Qtr",
        },
    ]);

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
