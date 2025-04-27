import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/FormInput";
import { Footer } from "./Footer";
import { Header } from "./Header";

export const RegisterPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();
	const { register } = useAuth();

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Email is invalid";
			toast.warning("Please enter a valid email address");
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
			toast.warning("Password must be at least 8 characters");
		} else if (/^\d+$/.test(password)) {
			newErrors.password = "This password is entirely numeric.";
			toast.warning("Password cannot be entirely numeric");
		}

		if (password !== passwordConfirm) {
			newErrors.passwordConfirm = "Passwords do not match";
			toast.warning("Passwords do not match");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			await register(email, password, passwordConfirm);
			setSuccess(true);
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (err) {
			setErrors({ form: "Registration failed. Please try again." });
			console.error("Registration error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			{/* Main Content */}
			<Header />
			<div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<h1 className="text-center text-3xl font-extrabold text-gray-900">
						Create New Account
					</h1>

					<div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						<form onSubmit={handleRegister} className="space-y-6">
							<h2 className="text-2xl font-bold text-center">Register</h2>

							{success && (
								<div
									className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
									role="alert"
								>
									<p>Registration successful! Redirecting to login page...</p>
								</div>
							)}

							{errors.form && (
								<div
									className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
									role="alert"
								>
									<p>{errors.form}</p>
								</div>
							)}

							<FormInput
								label="Email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								error={errors.email}
							/>

							<FormInput
								label="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={errors.password}
							/>

							<FormInput
								label="Confirm Password"
								type="password"
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.target.value)}
								error={errors.passwordConfirm}
							/>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									{loading ? "Creating Account..." : "Create Account"}
								</button>
							</div>
						</form>

						<div className="mt-6">
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Already have an account?
								</span>
							</div>

							<div className="mt-6">
								<Link
									to="/login"
									className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
								>
									Sign in
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer at the bottom */}
			<Footer />
		</div>
	);
};
