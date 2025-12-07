import { useState, useRef } from "react";
import { LuDownload } from "react-icons/lu";
import ActionButton from "../ActionButton.tsx";
import { api } from "../../utils/api.ts";

interface FileInputProps {
    label: string;
    hint: string;
    fileName: string;
    onFileChange: (file: File | null) => void;
}

const FileInput = ({ label, hint, fileName, onFileChange }: FileInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileChange(file);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-input-${label}`}
                />
                <label
                    htmlFor={`file-input-${label}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    Choose file
                </label>
                <span className="text-sm text-gray-500">
                    {fileName || "No file chosen"}
                </span>
            </div>
            <p className="text-xs text-gray-500">{hint}</p>
        </div>
    );
};

interface ImportCardProps {
    title: string;
    description: string;
    onDownloadTemplate: () => void;
    onImport: () => void;
    fileName: string;
    onFileChange: (file: File | null) => void;
}

const ImportCard = ({
    title,
    description,
    fileName,
    onFileChange,
}: ImportCardProps) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>

            <FileInput
                label="Upload CSV File"
                hint="File must be in CSV format with the correct headers"
                fileName={fileName}
                onFileChange={onFileChange}
            />
            <p className="text-xs text-gray-500 pt-2">
                Note: Existing records with the same ID will be updated
            </p>
        </div>
    );
};

interface ExportCardProps {
    title: string;
    description: string;
    exportFileName: string;
    onExport: () => void;
}

const ExportCard = ({ title, description, exportFileName, onExport }: ExportCardProps) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>

            <div className="pt-2">
                <ActionButton
                    buttonText={
                        <span className="flex items-center gap-2">
                            <LuDownload className="h-4 w-4" />
                            Export to {exportFileName}
                        </span>
                    }
                    attributes={{
                        onClick: onExport,
                        type: "button",
                    }}
                    width="full"
                    paddingX="px-4"
                    backgroundColor="#000000"
                    textColor="#ffffff"
                />
            </div>
        </div>
    );
};

const ImportExport = () => {
    const [participantFile, setParticipantFile] = useState<File | null>(null);

    const handleDownloadParticipantTemplate = () => {
        console.log("Download participant template");
        // Add download logic here
    };

    const handleImportParticipants = () => {
        console.log("Import participants", participantFile);
        // Add import logic here
    };



    const handleExportParticipants = async () => {
        console.log("Export participants");
        try {
            const data = await api.get("/participants");
            const participantsArray = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);

            if (participantsArray.length === 0) {
                alert("No participants to export.");
                return;
            }

            // Define headers
            const headers = [
                "ID",
                "First Name",
                "Last Name",
                "Email",
                "Phone Number",
                "Division",
                "Deanery",
                "Parish",
                "Program",
                "Modules Count"
            ];

            // Map data to CSV rows
            const rows = participantsArray.map((p: any) => {
                const firstName = p.firstName || p.fullName?.split(' ')[0] || "";
                const lastName = p.lastName || p.fullName?.split(' ').slice(1).join(' ') || "";

                return [
                    p._id || p.id || "",
                    firstName,
                    lastName,
                    p.email || "",
                    p.phoneNumber || "",
                    p.division || "",
                    p.deanery || "",
                    p.parish || "",
                    typeof p.program === 'object' ? p.program?.title : (p.program || ""),
                    p.modules?.length || 0
                ];
            });

            // Convert to CSV string
            const csvContent = [
                headers.join(","),
                ...rows.map((row: any[]) => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
            ].join("\n");

            // Create and trigger download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "participants_export.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to export participants:", error);
            alert("Failed to export participants. Please try again.");
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImportCard
                title="Import Participants"
                description="Upload a CSV file with participant data"
                onDownloadTemplate={handleDownloadParticipantTemplate}
                onImport={handleImportParticipants}
                fileName={participantFile?.name || ""}
                onFileChange={setParticipantFile}
            />

            <ExportCard
                title="Export Participants"
                description="Download all participant data as CSV"
                exportFileName="participants-export.csv"
                onExport={handleExportParticipants}
            />

        </div>
    );
};

export default ImportExport;
