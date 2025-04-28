import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Types
export interface User {
	id: number;
	email: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		password_confirm: string,
	) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

// API configuration
const TIBANODE_API = import.meta.env.VITE_REACT_APP_TIBANODE_API

// Configure axios defaults
const api = axios.create({
	baseURL: TIBANODE_API,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add interceptor for automatic token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't already tried to refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const tokens = JSON.parse(localStorage.getItem("tokens") || "{}");
				if (!tokens.refresh) {
					throw new Error("No refresh token available");
				}

				const response = await axios.post(`${TIBANODE_API}/user/login/refresh/`, {
					refresh: tokens.refresh,
				});

				const newTokens = response.data;
				localStorage.setItem("tokens", JSON.stringify(newTokens));

				// Update auth header and retry
				originalRequest.headers["Authorization"] = `Bearer ${newTokens.access}`;
				return axios(originalRequest);
			} catch (refreshError) {
				// Refresh token failed - logout user
				localStorage.removeItem("tokens");
				toast.error("Session expired. Please log in again.");
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

// Helper to check if tokens exist in storage
const hasTokensInStorage = (): boolean => {
	try {
		const tokens = JSON.parse(localStorage.getItem("tokens") || "{}");
		return Boolean(tokens.access && tokens.refresh);
	} catch (e) {
		return false;
	}
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// Check for tokens immediately to set initial auth state
	const initialAuthState = hasTokensInStorage();

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);

	// Load user from token on mount
	useEffect(() => {
		const loadUser = async () => {
			// Don't attempt to load if we know there are no tokens
			if (!hasTokensInStorage()) {
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const tokens = JSON.parse(localStorage.getItem("tokens") || "{}");

				const response = await api.get("/user/me/", {
					headers: {
						Authorization: `Bearer ${tokens.access}`,
					},
				});

				setUser(response.data);
				setIsAuthenticated(true);
			} catch (err) {
				console.error("Failed to load user:", err);
				// Only clear auth state if it's an auth error (401)
				if (axios.isAxiosError(err) && err.response?.status === 401) {
					localStorage.removeItem("tokens");
					setUser(null);
					setIsAuthenticated(false);
				}
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	// Login function
	const login = async (email: string, password: string) => {
		setLoading(true);
		setError(null);

		try {
			const response = await api.post("/user/login/", { email, password });
			const tokens = response.data;
			localStorage.setItem("tokens", JSON.stringify(tokens));

			// Get user data
			const userResponse = await api.get("/user/me/", {
				headers: {
					Authorization: `Bearer ${tokens.access}`,
				},
			});

			setUser(userResponse.data);
			setIsAuthenticated(true);
			toast.success("Login successful!");
		} catch (err) {
			setError("Invalid email or password");
			toast.error("Login failed. Please check your credentials.");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Register function
	const register = async (
		email: string,
		password: string,
		password_confirm: string,
	) => {
		setLoading(true);
		setError(null);

		try {
			await api.post("/user/register/", {
				email,
				password,
				password_confirm,
			});
			toast.success("Registration successful! Please log in.");
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || "Registration failed";
			setError(errorMessage);
			toast.error(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = () => {
		localStorage.removeItem("tokens");
		setUser(null);
		setIsAuthenticated(false);
		toast.info("You have been logged out");
	};

	// Context value
	const value = {
		user,
		loading,
		error,
		login,
		register,
		logout,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
