import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const username = localStorage.getItem("username");
        if (token && role && username) {
            setUser({ token, role, username });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const response = await api.post("/auth/login", formData);
        const { access_token, role, username: user_name } = response.data;

        localStorage.setItem("token", access_token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", user_name);

        setUser({ token: access_token, role, username: user_name });
        return role;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
