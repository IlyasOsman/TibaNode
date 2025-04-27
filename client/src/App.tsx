import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthProvider } from "./contexts/AuthContext";
import ClientManagement from "./pages/ClientManagement";
import ProtectedRoute from "./pages/ProtectedRoute";
import HealthProgramManager from "./pages/HealthProgramManager";
import { Profile } from "./pages/Profile";

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />

					{/* Healthmangement Routes */}
					<Route
						path="/healthmanagement"
						element={
							<ProtectedRoute>
								<HealthProgramManager />
							</ProtectedRoute>
						}
					/>

					{/* Client Management Route */}
					<Route
						path="/clients"
						element={
							<ProtectedRoute>
								<ClientManagement />
							</ProtectedRoute>
						}
					/>

					{/* Doctor profile Route */}
					<Route
						path="/doctor"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>

					{/* Redirect to dashboard if logged in, otherwise to login */}
					<Route
						path="/"
						element={<Navigate to="/healthmanagement" replace />}
					/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default App;
