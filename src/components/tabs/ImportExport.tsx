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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
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
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {disabled ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-600 border-t-transparent rounded-full" /> : null}
                    Choose file
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {fileName || "No file chosen"}
                </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        </div>
    );
};

const ImportExport = () => {
    // ... existing state and handlers ...
    const [participantFile, setParticipantFile] = useState<File | null>(null);
    const { previewData, status, previewFile, confirmImport, reset, setFileDetails } = useImport("participant");

    const handlePreview = () => {
        if (participantFile) {
            setFileDetails({
                originalName: participantFile.name,
                size: participantFile.size,
                type: participantFile.type || 'application/octet-stream'
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
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <LuFileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Import Participants
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload CSV, Excel, or ODS file.</p>
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
                                        ${!participantFile || status.loading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-black dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    {status.loading ? 'Processing...' : 'Preview Import'}
                                </button>
                                {status.error && (
                                    <p className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">{status.error}</p>
                                )}
                            </div>
                        </>
                    )}

                    {status.success && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 mb-3">
                                <LuCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-lg font-medium text-green-900 dark:text-green-300">Import Successful!</h4>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Successfully imported {status.importedCount} records.
                            </p>
                            <button
                                onClick={handleCancel}
                                className="mt-4 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 underline"
                            >
                                Import Another File
                            </button>
                        </div>
                    )}
                </div>

                {/* Export Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <LuDownload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Export Participants
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Download current data as CSV.</p>
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
                <ImportPreviewTable
                    data={previewData.fullData}
                    onCancel={handleCancel}
                    onConfirm={(mappedData) => confirmImport(mappedData)}
                    isLoading={status.loading}
                    error={status.error}
                />
            )}
        </div>
    );
};

const PARTICIPANT_FIELDS = [
    { key: "firstName", label: "First Name", required: true },
    { key: "lastName", label: "Last Name", required: true },
    { key: "email", label: "Email", required: true },
    { key: "phoneNumber", label: "Phone Number", required: true },
    { key: "password", label: "Password", required: false },
    { key: "division", label: "Division", required: false },
    { key: "deanery", label: "Deanery", required: false },
    { key: "parish", label: "Parish", required: false },
    { key: "program", label: "Program", required: false },
    { key: "semester", label: "Current Semester", required: false }
];

interface ImportPreviewTableProps {
    data: any[];
    onCancel: () => void;
    onConfirm: (data: any[]) => void;
    isLoading: boolean;
    error: string | null;
}

const ImportPreviewTable = ({ data, onCancel, onConfirm, isLoading, error }: ImportPreviewTableProps) => {
    // Transform original CSV data into System-Matched Editable Data on mount
    const [editableData, setEditableData] = useState<any[]>(() => {
        const csvHeaders = data.length > 0 ? Object.keys(data[0]) : [];
        const initialMapping: Record<string, string> = {};

        // Auto-match headers
        PARTICIPANT_FIELDS.forEach(field => {
            const match = csvHeaders.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, ''))
                || csvHeaders.find(h => h.toLowerCase().includes(field.key.toLowerCase()));
            if (match) initialMapping[field.key] = match;
        });

        // Create normalized data structure
        return data.map(row => {
            const newRow: any = {};
            PARTICIPANT_FIELDS.forEach(field => {
                const mappedHeader = initialMapping[field.key];
                newRow[field.key] = mappedHeader ? row[mappedHeader] : "";
            });
            // Preserve any other original data if needed, or just stick to schema
            return newRow;
        });
    });

    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(data.map((_, i) => i)));
    const [currentPage, setCurrentPage] = useState(1);
    const [validationError, setValidationError] = useState<string | null>(null);
    const rowsPerPage = 10;

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = editableData.slice(startIndex, startIndex + rowsPerPage);

    const validateRow = (row: any) => {
        const missing: string[] = [];
        PARTICIPANT_FIELDS.filter(f => f.required).forEach(field => {
            const val = row[field.key];
            if (!val || String(val).trim() === "") {
                missing.push(field.label);
            }
        });
        return missing;
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIndices(new Set(editableData.map((_, i) => i)));
        } else {
            setSelectedIndices(new Set());
        }
        setValidationError(null);
    };

    const handleSelectRow = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
        setValidationError(null);
    };

    const handleCellChange = (rowIndex: number, fieldKey: string, value: string) => {
        const realIndex = startIndex + rowIndex;
        const newData = [...editableData];
        newData[realIndex] = {
            ...newData[realIndex],
            [fieldKey]: value
        };
        setEditableData(newData);
        setValidationError(null);
    };

    const handleConfirm = () => {
        setValidationError(null);

        const selectedRows = editableData.filter((_, i) => selectedIndices.has(i));

        if (selectedRows.length === 0) {
            setValidationError("Please select at least one row to import.");
            return;
        }

        const invalidRows: number[] = [];
        selectedRows.forEach((row, idx) => {
            const missing = validateRow(row);
            if (missing.length > 0) {
                invalidRows.push(idx);
            }
        });

        if (invalidRows.length > 0) {
            setValidationError(`Cannot confirm: ${invalidRows.length} selected row(s) are missing required fields. Please fill in the empty red cells.`);
            return;
        }

        onConfirm(selectedRows.map(row => ({
            ...row,
            fullName: `${row.firstName} ${row.lastName}`,
            phone: row.phoneNumber
        })));
    };

    const allSelected = editableData.length > 0 && selectedIndices.size === editableData.length;
    const isIndeterminate = selectedIndices.size > 0 && selectedIndices.size < editableData.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in transition-colors">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Review & Edit Import Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Review the data below. Edit any missing fields directly in the table. {selectedIndices.size} rows selected.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedIndices.size === 0}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-colors
                            ${isLoading || selectedIndices.size === 0
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-black dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <LuCheck className="h-4 w-4" />}
                        Confirm Import ({selectedIndices.size})
                    </button>
                </div>
            </div>

            {validationError && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    {validationError}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"
                                />
                            </th>
                            {PARTICIPANT_FIELDS.map((field) => (
                                <th key={field.key} className="px-6 py-3 text-left w-48">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            {field.label}
                                        </span>
                                        {field.required && <span className="text-red-500 text-xs">*</span>}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentData.map((row: any, idx: number) => {
                            const globalIndex = startIndex + idx;
                            const isSelected = selectedIndices.has(globalIndex);
                            const missingFields = validateRow(row);
                            const isRowInvalid = missingFields.length > 0;

                            return (
                                <tr
                                    key={globalIndex}
                                    className={`
                                        transition-colors
                                        ${isRowInvalid && isSelected ? 'bg-red-50 dark:bg-red-900/10' : ''}
                                        ${!isRowInvalid && isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                                    `}
                                    onClick={() => handleSelectRow(globalIndex)}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap w-10">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSelectRow(globalIndex)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"
                                        />
                                    </td>
                                    {PARTICIPANT_FIELDS.map((field) => {
                                        const cellValue = row[field.key] || "";
                                        const isMissing = field.required && !cellValue;

                                        return (
                                            <td key={field.key} className="px-6 py-2 whitespace-nowrap text-sm">
                                                <input
                                                    type="text"
                                                    value={cellValue}
                                                    onChange={(e) => handleCellChange(idx, field.key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder={isMissing ? "Required" : ""}
                                                    className={`
                                                        w-full text-sm px-2 py-1 rounded border transition-colors bg-transparent
                                                        focus:ring-2 focus:ring-black focus:border-transparent dark:focus:ring-white
                                                        ${isMissing
                                                            ? 'border-red-300 dark:border-red-700 placeholder-red-400 bg-red-50/50 dark:bg-red-900/20'
                                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                        }
                                                        text-gray-900 dark:text-white
                                                    `}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + rowsPerPage, data.length)}</span> of <span className="font-medium">{data.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Last
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default ImportExport;
