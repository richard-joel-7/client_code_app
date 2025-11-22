import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:8000/api";

const api = axios.create({
    baseURL: apiUrl,
});

console.log("API Base URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
