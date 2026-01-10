import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "../../utils/constants";
import { logOut } from "../features/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        api.dispatch(logOut());
    }
    return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Participants", "Programs", "Modules"],
    endpoints: (builder) => ({
        // Participants
        getParticipants: builder.query({
            query: (params) => {
                let url = "/participants";
                if (params) {
                    const searchParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (params[key]) searchParams.append(key, params[key]);
                    });
                    const qString = searchParams.toString();
                    if (qString) url += `?${qString}`;
                }
                return url;
            },
            transformResponse: (response: any) => {
                if (Array.isArray(response)) return response;
                if (response && Array.isArray(response.results)) return response.results;
                return [];
            },
            providesTags: ["Participants"],
        }),
        addParticipant: builder.mutation({
            query: (participant) => ({
                url: "/participants",
                method: "POST",
                body: participant,
            }),
            invalidatesTags: ["Participants"],
        }),
        deleteParticipant: builder.mutation({
            query: (id) => ({
                url: `/participants/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Participants"],
        }),
        updateParticipant: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/participants/${id}`,
                method: "PUT",
                body: patch,
            }),
            invalidatesTags: ["Participants"],
        }),
        enrollParticipant: builder.mutation({
            query: ({ id, data }) => ({
                url: `/participants/${id}/enroll`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Participants"],
        }),

        // Programs
        getPrograms: builder.query({
            query: () => "/programs",
            transformResponse: (response: any) => {
                if (Array.isArray(response)) return response;
                return [];
            },
            providesTags: ["Programs"],
        }),
        addProgram: builder.mutation({
            query: (program) => ({
                url: "/programs",
                method: "POST",
                body: program,
            }),
            invalidatesTags: ["Programs"],
        }),
        deleteProgram: builder.mutation({
            query: (id) => ({
                url: `/programs/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Programs"],
        }),

        // Modules
        getModules: builder.query({
            query: () => "/modules",
            transformResponse: (response: any) => {
                if (Array.isArray(response)) return response;
                return [];
            },
            providesTags: ["Modules"],
        }),
        addModule: builder.mutation({
            query: (module) => ({
                url: "/modules",
                method: "POST",
                body: module,
            }),
            invalidatesTags: ["Modules"],
        }),
        deleteModule: builder.mutation({
            query: (id) => ({
                url: `/modules/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Modules"],
        }),
    }),
});

export const {
    useGetParticipantsQuery,
    useAddParticipantMutation,
    useDeleteParticipantMutation,
    useUpdateParticipantMutation,
    useEnrollParticipantMutation,
    useGetProgramsQuery,
    useAddProgramMutation,
    useDeleteProgramMutation,
    useGetModulesQuery,
    useAddModuleMutation,
    useDeleteModuleMutation,
} = apiSlice;
