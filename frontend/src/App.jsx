import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import MarketingDashboard from "./pages/MarketingDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />; // Or unauthorized page
    }

    return children;
};

const TeamPlaceholder = ({ team }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{team} Dashboard</h1>
            <p className="text-gray-600">Coming Soon...</p>
        </div>
    </div>
);

import HubSelection from "./pages/HubSelection";
import BusinessDashboard from "./pages/BusinessDashboard";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Hub Selection (CEO Only) */}
            <Route
                path="/hub-selection"
                element={
                    <ProtectedRoute allowedRoles={["ceo"]}>
                        <HubSelection />
                    </ProtectedRoute>
                }
            />

            {/* Business Dashboard (CEO Only) */}
            <Route
                path="/business"
                element={
                    <ProtectedRoute allowedRoles={["ceo"]}>
                        <BusinessDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Marketing Dashboard (Marketing + CEO) */}
            <Route
                path="/marketing"
                element={
                    <ProtectedRoute allowedRoles={["marketing", "ceo"]}>
                        <MarketingDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team2"
                element={
                    <ProtectedRoute allowedRoles={["team2"]}>
                        <TeamPlaceholder team="Team 2" />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team3"
                element={
                    <ProtectedRoute allowedRoles={["team3"]}>
                        <TeamPlaceholder team="Team 3" />
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}
