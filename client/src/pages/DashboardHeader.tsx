import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const DashboardHeader: React.FC = () => {
	const { logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header className="bg-white shadow">
			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/clients">
					<h1 className="text-3xl font-bold text-gray-900">
						Tiba
						<span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
							Node
						</span>
					</h1>
				</Link>

				<div className="flex items-center space-x-4">
					<Link
						to="/healthmanagement"
						className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
					>
						Health Program Management
					</Link>
					<Link
						to="/clients"
						className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
					>
						Client Management
					</Link>
					<Link
						to="/doctor"
						className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
					>
						Doctor Profile
					</Link>
					<button
						onClick={handleLogout}
						className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
};
