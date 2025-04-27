import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/FormInput";
import { Footer } from "./Footer";
import { Header } from "./Header";

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			setError("Please enter both email and password");
			toast.warning("Please enter both email and password");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await login(email, password);
			navigate("/healthmanagement");
		} catch (err) {
			setError("Invalid email or password");
			console.error("Login error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			{/* Main content */}
			<Header />
			<div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<h1 className="text-center text-3xl font-extrabold text-gray-900">
						Welcome Back
					</h1>

					<div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						<form onSubmit={handleLogin} className="space-y-6">
							<h2 className="text-2xl font-bold text-center">Sign In</h2>

							{error && (
								<div
									className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
									role="alert"
								>
									<p>{error}</p>
								</div>
							)}

							<FormInput
								label="Email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>

							<FormInput
								label="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									{loading ? "Signing In..." : "Sign In"}
								</button>
							</div>
						</form>

						<div className="mt-6">
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Don't have an account?
								</span>
							</div>

							<div className="mt-6">
								<Link
									to="/register"
									className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
								>
									Create an account
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer at bottom */}
			<Footer />
		</div>
	);
};
