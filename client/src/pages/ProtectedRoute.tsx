import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		// Redirect to login if not authenticated
		return <Navigate to="/login" replace />;
	}

	// Return children if authenticated
	return <>{children}</>;
};

export default ProtectedRoute;
