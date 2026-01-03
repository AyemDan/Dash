import { useState } from 'react';
import { api } from '../utils/api';

export interface ImportPreviewResult {
    model: string;
    totalRows: number;
    preview: any[];
    fullData: any[];
}

export interface ImportStatus {
    loading: boolean;
    error: string | null;
    success: boolean;
    importedCount: number;
}

export const useImport = (modelName: string) => {
    const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
    const [fileDetails, setFileDetails] = useState<{
        originalName: string;
        size: number;
        type: string;
    } | null>(null);

    const [status, setStatus] = useState<ImportStatus>({
        loading: false,
        error: null,
        success: false,
        importedCount: 0
    });

    const reset = () => {
        setPreviewData(null);
        setFileDetails(null);
        setStatus({ loading: false, error: null, success: false, importedCount: 0 });
    };

    const previewFile = async (file: File) => {
        setStatus(prev => ({ ...prev, loading: true, error: null, success: false }));
        try {
            const formData = new FormData();
            formData.append('file', file);

            // api.post now handles FormData automatically
            const res = await api.post(`/import/preview/${modelName}`, formData);

            setPreviewData(res);
            setStatus(prev => ({ ...prev, loading: false }));
        } catch (err: any) {
            console.error("Preview failed", err);
            setStatus(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || err.message || "Failed to preview file"
            }));
        }
    };

    const confirmImport = async () => {
        if (!previewData) return;

        setStatus(prev => ({ ...prev, loading: true, error: null }));
        try {
            const payload = {
                data: previewData.fullData,
                originalName: fileDetails?.originalName || "Imported File",
                size: fileDetails?.size || 0,
                type: fileDetails?.type || 'unknown'
            };

            const res = await api.post(`/import/confirm/${modelName}`, payload);

            setStatus({
                loading: false,
                error: null,
                success: true,
                importedCount: res.imported || 0
            });
            setPreviewData(null);
        } catch (err: any) {
            console.error("Confirm failed", err);
            setStatus(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || err.message || "Failed to confirm import"
            }));
        }
    };

    return {
        previewData,
        status,
        previewFile,
        confirmImport,
        reset,
        setFileDetails
    };
};
