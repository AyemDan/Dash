const API_BASE_URL = "http://localhost:4000/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Token is invalid or expired
            localStorage.removeItem("token");
            localStorage.removeItem("admin");
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Request failed: ${response.statusText}`);
    }
    return response.json();
};

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    patch: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    delete: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};
