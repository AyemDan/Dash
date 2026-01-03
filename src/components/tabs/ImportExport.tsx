import { useState, useRef } from "react";
import { LuDownload, LuFileText, LuCheck, } from "react-icons/lu";
import ActionButton from "../ActionButton.tsx";
import { api } from "../../utils/api.ts";
import { useImport } from "../../hooks/useImport.ts";

interface FileInputProps {
    label: string;
    hint: string;
    fileName: string;
    onFileChange: (file: File | null) => void;
    disabled?: boolean;
}

const FileInput = ({ label, hint, fileName, onFileChange, disabled }: FileInputProps) => {
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
                    accept=".csv, .xlsx, .xls, .ods"
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-input-${label}`}
                    disabled={disabled}
                />
                <label
                    htmlFor={`file-input-${label}`}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {disabled ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-600 border-t-transparent rounded-full" /> : null}
                    Choose file
                </label>
                <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    {fileName || "No file chosen"}
                </span>
            </div>
            <p className="text-xs text-gray-500">{hint}</p>
        </div>
    );
};

const ImportExport = () => {
    const [participantFile, setParticipantFile] = useState<File | null>(null);
    const { previewData, status, previewFile, confirmImport, reset, setFileDetails } = useImport("participant");

    const handlePreview = () => {
        if (participantFile) {
            // Pass file details to hook so confirm can use them
            setFileDetails({
                originalName: participantFile.name,
                size: participantFile.size,
                type: participantFile.type || 'application/octet-stream' // fallback
            });
            previewFile(participantFile);
        }
    };

    const handleConfirm = () => {
        confirmImport();
    };

    const handleCancel = () => {
        reset();
        setParticipantFile(null);
    };

    const handleExportParticipants = async () => {
        try {
            const data: any = await api.get("/participants");
            const participantsArray = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);

            if (participantsArray.length === 0) {
                alert("No participants to export.");
                return;
            }

            const headers = ["ID", "First Name", "Last Name", "Email", "Phone Number", "Division", "Deanery", "Parish", "Program", "Modules Count"];
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

            const csvContent = [
                headers.join(","),
                ...rows.map((row: any[]) => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "participants_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to export participants:", error);
            alert("Failed to export participants.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <LuFileText className="h-5 w-5 text-indigo-600" /> Import Participants
                        </h3>
                        <p className="text-sm text-gray-600">Upload CSV, Excel, or ODS file.</p>
                    </div>

                    {!previewData && !status.success && (
                        <>
                            <FileInput
                                label="Select File"
                                hint="Supported: .csv, .xlsx, .xls, .ods"
                                fileName={participantFile?.name || ""}
                                onFileChange={setParticipantFile}
                                disabled={status.loading}
                            />
                            <div className="pt-2">
                                <button
                                    onClick={handlePreview}
                                    disabled={!participantFile || status.loading}
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors
                                        ${!participantFile || status.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}
                                    `}
                                >
                                    {status.loading ? 'Processing...' : 'Preview Import'}
                                </button>
                                {status.error && (
                                    <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{status.error}</p>
                                )}
                            </div>
                        </>
                    )}

                    {status.success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                                <LuCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="text-lg font-medium text-green-900">Import Successful!</h4>
                            <p className="text-sm text-green-700 mt-1">
                                Successfully imported {status.importedCount} records.
                            </p>
                            <button
                                onClick={handleCancel}
                                className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 underline"
                            >
                                Import Another File
                            </button>
                        </div>
                    )}
                </div>

                {/* Export Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <LuDownload className="h-5 w-5 text-indigo-600" /> Export Participants
                        </h3>
                        <p className="text-sm text-gray-600">Download current data as CSV.</p>
                    </div>
                    <div className="pt-8">
                        {/* Spacer to align buttons visually if needed, or just keep top align */}
                        <ActionButton
                            buttonText={
                                <span className="flex items-center gap-2 justify-center">
                                    <LuDownload className="h-4 w-4" /> Export CSV
                                </span>
                            }
                            attributes={{ onClick: handleExportParticipants, type: "button" }}
                            width="full"
                            paddingX="px-4"
                            backgroundColor="#000000"
                            textColor="#ffffff"
                        />
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            {previewData && !status.success && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">Preview Import Data</h3>
                            <p className="text-sm text-gray-500">
                                Showing first {previewData.preview.length} of {previewData.totalRows} rows.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={status.loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 flex items-center gap-2"
                            >
                                {status.loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <LuCheck className="h-4 w-4" />}
                                Confirm Import
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {previewData.preview.length > 0 && Object.keys(previewData.preview[0]).map((header) => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.preview.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {Object.values(row).map((val: any, cellIdx: number) => (
                                            <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {status.error && (
                        <div className="p-4 bg-red-50 border-t border-red-100 text-red-600 text-sm">
                            Error: {status.error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportExport;
