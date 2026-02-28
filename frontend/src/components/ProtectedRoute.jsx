import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
    try {
      await api.get("/api/user/me/");
      setIsAuthorized(true);
    } catch (err) {
      try {
        await api.post("/api/token/refresh/");
        await api.get("/api/user/me/");
        setIsAuthorized(true);
      } catch {
        setIsAuthorized(false);
      }
    }
  };
  checkAuth();
  }, []);

  if (isAuthorized === null) {
  return <div>Loading...</div>;
}

if (!isAuthorized) {
  return <Navigate to="/login" />;
}

  return children;
}

export default ProtectedRoute;