import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export interface Participant {
    id: string;
    participantId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    division: string;
    deanery: string;
    parish: string;
    password: string;
    program: string;
    graduationYear: number;
    modulesCount: number;
}

export interface Program {
    id: string;
    title: string;
}

export const useParticipants = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipantsAndPrograms = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [participantsData, programsData] = await Promise.all([
                api.get("/participants"),
                api.get("/programs")
            ]);

            const participantsArray = Array.isArray(participantsData) ? participantsData : (Array.isArray(participantsData.results) ? participantsData.results : []);

            if (participantsArray.length > 0) {
                setParticipants(participantsArray.map((p: any) => ({
                    ...p,
                    id: p._id || p.id,
                    firstName: p.firstName || p.fullName?.split(' ')[0] || "",
                    lastName: p.lastName || p.fullName?.split(' ').slice(1).join(' ') || "",
                    // Ensure backward compatibility fields
                    participantId: p.regNo || p.participantId || "P-???",
                    password: p.passwordHash ? "******" : (p.password || "N/A"), // Don't show actual hash
                    modulesCount: p.modules?.length || 0,
                    program: p.enrolledPrograms?.[0]?.title || "N/A",
                    graduationYear: p.metadata?.graduationYear || new Date().getFullYear() + 3
                })));
            } else {
                setParticipants([]);
            }

            if (Array.isArray(programsData)) {
                setPrograms(programsData.map((p: any) => ({ id: p._id || p.id, title: p.title })))
            } else {
                setPrograms([]);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to fetch data");
            setParticipants([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addParticipant = async (data: any) => {
        setIsLoading(true);
        try {
            const newParticipant = await api.post("/participants", data);
            // We can either refetch or append. Appending is faster.
            // But we need to map the new participant to the UI model.
            const mapped: Participant = {
                ...newParticipant,
                id: newParticipant._id || newParticipant.id,
                firstName: data.firstName,
                lastName: data.lastName,
                participantId: newParticipant.regNo || "PENDING",
                password: data.password || "******",
                modulesCount: 0,
                program: data.program, // We only have ID here maybe, but simple display usually fine
                graduationYear: new Date().getFullYear() + 3 // Default
            };

            setParticipants(prev => [...prev, mapped]);
            return mapped;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteParticipant = async (id: string) => {
        try {
            await api.delete(`/participants/${id}`);
            setParticipants(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        participants,
        programs,
        isLoading,
        error,
        fetchParticipantsAndPrograms,
        addParticipant,
        deleteParticipant
    };
};
