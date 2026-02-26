import { Navigate } from "react-router-dom"
import api from "../api"
import { useState, useEffect } from "react"

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            await api.get("/api/user/me/");
            setIsAuthorized(true);
        } catch {
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        return <div>Učitavanje...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;