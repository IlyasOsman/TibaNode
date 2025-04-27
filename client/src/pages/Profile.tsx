import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { DashboardHeader } from "./DashboardHeader";
import { Footer } from "./Footer";

export const Profile: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			<DashboardHeader />
			<main className="flex-grow">
				<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<div className="px-4 py-6 sm:px-0">
						<div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
							<h2 className="text-2xl font-bold mb-4">
								Welcome, {user?.email || "User"}!
							</h2>
							<p className="text-gray-600">You are now logged in.</p>
							<div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
								<div className="px-4 py-5 sm:px-6">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										User Information
									</h3>
									<p className="mt-1 max-w-2xl text-sm text-gray-500">
										Personal details from your account.
									</p>
								</div>
								<div className="border-t border-gray-200">
									<dl>
										<div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Email address
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{user?.email || "Not available"}
											</dd>
										</div>
										<div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												User ID
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{user?.id || "Not available"}
											</dd>
										</div>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
};
