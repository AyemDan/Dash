export const AUTH_TOKEN_KEY = "token";
export const AUTH_ADMIN_KEY = "admin";
export const ACTIVE_TAB_KEY = "activeTab";
const getProcessEnv = () => {
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
        const proc = (globalThis as any).process;
        if (proc && typeof proc.loadEnvFile === 'function') {
            try { proc.loadEnvFile(); } catch { /* ignore */ }
        }
        return proc?.env || {};
    }
    return {};
};

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? getProcessEnv().VITE_API_BASE_URL;

console.log(API_BASE_URL);