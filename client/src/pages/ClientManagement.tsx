import React, { useState, useEffect } from "react";
import axios from "axios";
import { DashboardHeader } from "./DashboardHeader";
import { Footer } from "./Footer";
import { Search } from "lucide-react";

// Define types for our data
interface Enrollment {
	id: number;
	program: number;
	program_name: string;
	enrollment_date: string;
	active: boolean;
	notes: string;
}

interface Client {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	date_of_birth: string;
	age: number | string;
	gender: string;
	phone_number: string;
	email: string;
	address: string;
	registration_date: string;
	enrollments: Enrollment[];
}

interface HealthProgram {
	id: number;
	name: string;
	description: string;
	created_at: string;
}

const ClientManagement: React.FC = () => {
	const [clients, setClients] = useState<Client[]>([]);
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [healthPrograms, setHealthPrograms] = useState<HealthProgram[]>([]);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [formData, setFormData] = useState<Partial<Client>>({
		first_name: "",
		last_name: "",
		date_of_birth: "",
		gender: "",
		phone_number: "",
		email: "",
		address: "",
	});
	const [enrollmentFormData, setEnrollmentFormData] = useState({
		program_id: 0,
	});
	const [isEditing, setIsEditing] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const TIBANODE_API = import.meta.env.VITE_REACT_APP_TIBANODE_API

	// Fetch clients on component mount
	useEffect(() => {
		fetchClients();
		fetchHealthPrograms();
	}, []);

	// Filter clients when searchQuery or clients change
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredClients(clients);
		} else {
			const query = searchQuery.toLowerCase();
			const filtered = clients.filter(
				(client) =>
					client.full_name.toLowerCase().includes(query) ||
					client.email.toLowerCase().includes(query) ||
					client.phone_number.toLowerCase().includes(query),
			);
			setFilteredClients(filtered);
		}
	}, [searchQuery, clients]);

	const fetchClients = async () => {
		try {
			const response = await axios.get(`${TIBANODE_API}clients/`);
			setClients(response.data);
			setFilteredClients(response.data); // Initialize filtered results with all clients
		} catch (err) {
			setError("Failed to fetch clients");
			console.error(err);
		}
	};

	const fetchHealthPrograms = async () => {
		try {
			const response = await axios.get(`${TIBANODE_API}healthprograms/`);
			setHealthPrograms(response.data);
		} catch (err) {
			setError("Failed to fetch health programs");
			console.error(err);
		}
	};

	const fetchClientProfile = async (id: number) => {
		try {
			const response = await axios.get(`${TIBANODE_API}clients/${id}/profile/`);
			setSelectedClient(response.data);
			setShowProfile(true);
		} catch (err) {
			setError("Failed to fetch client profile");
			console.error(err);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEnrollmentInputChange = (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setEnrollmentFormData({
			...enrollmentFormData,
			program_id: parseInt(e.target.value),
		});
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const resetForm = () => {
		setFormData({
			first_name: "",
			last_name: "",
			date_of_birth: "",
			gender: "",
			phone_number: "",
			email: "",
			address: "",
		});
		setIsEditing(false);
	};

	const createClient = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			await axios.post(`${TIBANODE_API}clients/`, formData);
			fetchClients();
			resetForm();
			setSuccess("Client created successfully");
		} catch (err) {
			setError("Failed to create client");
			console.error(err);
		}
	};

	const updateClient = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedClient) return;
		setError("");
		setSuccess("");

		try {
			await axios.put(`${TIBANODE_API}clients/${selectedClient.id}/`, formData);
			fetchClients();
			resetForm();
			setSuccess("Client updated successfully");
		} catch (err) {
			setError("Failed to update client");
			console.error(err);
		}
	};

	const deleteClient = async (id: number) => {
		if (!window.confirm("Are you sure you want to delete this client?")) return;
		setError("");
		setSuccess("");

		try {
			await axios.delete(`${TIBANODE_API}clients/${id}/`);
			fetchClients();
			setSuccess("Client deleted successfully");
		} catch (err) {
			setError("Failed to delete client");
			console.error(err);
		}
	};

	const enrollClient = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedClient) return;
		setError("");
		setSuccess("");

		try {
			// Send only the program_id in the request body
			await axios.post(`${TIBANODE_API}clients/${selectedClient.id}/enroll/`, {
				program_id: enrollmentFormData.program_id,
			});

			// Refresh the client profile to show the new enrollment
			fetchClientProfile(selectedClient.id);
			setSuccess("Client enrolled successfully");

			// Reset enrollment form
			setEnrollmentFormData({ program_id: 0 });
		} catch (err) {
			setError("Failed to enroll client");
			console.error(err);
		}
	};

	const editClient = (client: Client) => {
		setSelectedClient(client);
		setFormData({
			first_name: client.first_name,
			last_name: client.last_name,
			date_of_birth: client.date_of_birth,
			gender: client.gender,
			phone_number: client.phone_number,
			email: client.email,
			address: client.address,
		});
		setIsEditing(true);
		setShowProfile(false);
	};

	const closeProfile = () => {
		setShowProfile(false);
		setSelectedClient(null);
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<DashboardHeader />
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8 text-center mt-8">
					Client Management System
				</h1>

				{error && (
					<div className="bg-red-100 p-4 mb-4 rounded text-red-700">
						{error}
					</div>
				)}
				{success && (
					<div className="bg-green-100 p-4 mb-4 rounded text-green-700">
						{success}
					</div>
				)}

				{/* Client Form */}
				<div className="bg-white p-6 rounded-lg shadow-md mb-8">
					<h2 className="text-xl font-semibold mb-4">
						{isEditing ? "Edit Client" : "Add New Client"}
					</h2>
					<form onSubmit={isEditing ? updateClient : createClient}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									First Name
								</label>
								<input
									type="text"
									name="first_name"
									value={formData.first_name}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Name
								</label>
								<input
									type="text"
									name="last_name"
									value={formData.last_name}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Date of Birth
								</label>
								<input
									type="date"
									name="date_of_birth"
									value={formData.date_of_birth}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Gender
								</label>
								<select
									name="gender"
									value={formData.gender}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								>
									<option value="">Select Gender</option>
									<option value="M">Male</option>
									<option value="F">Female</option>
									<option value="O">Other</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number
								</label>
								<input
									type="text"
									name="phone_number"
									value={formData.phone_number}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Address
								</label>
								<input
									type="text"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
						</div>
						<div className="mt-4 flex justify-end space-x-2">
							<button
								type="button"
								onClick={resetForm}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								{isEditing ? "Update Client" : "Add Client"}
							</button>
						</div>
					</form>
				</div>

				{/* Client Profile */}
				{showProfile && selectedClient && (
					<div className="bg-white p-6 rounded-lg shadow-md mb-8">
						<div className="flex justify-between mb-4">
							<h2 className="text-xl font-semibold">Client Profile</h2>
							<button
								onClick={closeProfile}
								className="text-gray-500 hover:text-gray-700"
							>
								Close
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							<div>
								<p className="text-sm text-gray-500">Full Name</p>
								<p className="font-medium">{selectedClient.full_name}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Age</p>
								<p className="font-medium">{selectedClient.age} years</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Gender</p>
								<p className="font-medium">
									{selectedClient.gender === "M"
										? "Male"
										: selectedClient.gender === "F"
											? "Female"
											: "Other"}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Date of Birth</p>
								<p className="font-medium">{selectedClient.date_of_birth}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Phone Number</p>
								<p className="font-medium">{selectedClient.phone_number}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Email</p>
								<p className="font-medium">{selectedClient.email}</p>
							</div>
							<div className="md:col-span-2">
								<p className="text-sm text-gray-500">Address</p>
								<p className="font-medium">{selectedClient.address}</p>
							</div>
							<div className="md:col-span-2">
								<p className="text-sm text-gray-500">Registration Date</p>
								<p className="font-medium">
									{new Date(
										selectedClient.registration_date,
									).toLocaleDateString()}
								</p>
							</div>
						</div>

						{/* Enrollments */}
						<div className="mb-6">
							<h3 className="text-lg font-medium mb-2">Enrollments</h3>
							{selectedClient.enrollments.length > 0 ? (
								<table className="min-w-full bg-white">
									<thead>
										<tr>
											<th className="py-2 px-4 border-b text-left">Program</th>
											<th className="py-2 px-4 border-b text-left">
												Enrollment Date
											</th>
											<th className="py-2 px-4 border-b text-left">Status</th>
											<th className="py-2 px-4 border-b text-left">Notes</th>
										</tr>
									</thead>
									<tbody>
										{selectedClient.enrollments.map((enrollment) => (
											<tr key={enrollment.id}>
												<td className="py-2 px-4 border-b">
													{enrollment.program_name}
												</td>
												<td className="py-2 px-4 border-b">
													{enrollment.enrollment_date}
												</td>
												<td className="py-2 px-4 border-b">
													<span
														className={`px-2 py-1 rounded text-xs ${enrollment.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
													>
														{enrollment.active ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="py-2 px-4 border-b">
													{enrollment.notes}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="text-gray-500">No enrollments found.</p>
							)}
						</div>

						{/* Enroll Client Form */}
						<div>
							<h3 className="text-lg font-medium mb-2">
								Enroll in Health Program
							</h3>
							<form
								onSubmit={enrollClient}
								className="flex items-end space-x-2"
							>
								<div className="flex-grow">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Health Program
									</label>
									<select
										value={enrollmentFormData.program_id || ""}
										onChange={handleEnrollmentInputChange}
										className="w-full p-2 border rounded"
										required
									>
										<option value="">Select Health Program</option>
										{healthPrograms.map((program) => (
											<option key={program.id} value={program.id}>
												{program.name}
											</option>
										))}
									</select>
								</div>
								<button
									type="submit"
									className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
									disabled={!enrollmentFormData.program_id}
								>
									Enroll
								</button>
							</form>
						</div>
					</div>
				)}

				{/* Search Bar */}
				<div className="bg-white p-6 rounded-lg shadow-md mb-8">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<Search size={18} className="text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search clients by name, email or phone number..."
							value={searchQuery}
							onChange={handleSearchChange}
							className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					{searchQuery && (
						<div className="mt-2 text-sm text-gray-600">
							Found {filteredClients.length}{" "}
							{filteredClients.length === 1 ? "client" : "clients"} matching "
							{searchQuery}"
						</div>
					)}
				</div>

				{/* Clients Table */}
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">Clients</h2>
					{filteredClients.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full bg-white">
								<thead>
									<tr>
										<th className="py-2 px-4 border-b text-left">Name</th>
										<th className="py-2 px-4 border-b text-left">Age</th>
										<th className="py-2 px-4 border-b text-left">Gender</th>
										<th className="py-2 px-4 border-b text-left">Phone</th>
										<th className="py-2 px-4 border-b text-left">Email</th>
										<th className="py-2 px-4 border-b text-left">
											Registration Date
										</th>
										<th className="py-2 px-4 border-b text-left">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredClients.map((client) => (
										<tr key={client.id}>
											<td className="py-2 px-4 border-b">{client.full_name}</td>
											<td className="py-2 px-4 border-b">{client.age}</td>
											<td className="py-2 px-4 border-b">
												{client.gender === "M"
													? "Male"
													: client.gender === "F"
														? "Female"
														: "Other"}
											</td>
											<td className="py-2 px-4 border-b">
												{client.phone_number}
											</td>
											<td className="py-2 px-4 border-b">{client.email}</td>
											<td className="py-2 px-4 border-b">
												{new Date(
													client.registration_date,
												).toLocaleDateString()}
											</td>
											<td className="py-2 px-4 border-b">
												<div className="flex space-x-2">
													<button
														onClick={() => fetchClientProfile(client.id)}
														className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
													>
														View
													</button>
													<button
														onClick={() => editClient(client)}
														className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
													>
														Edit
													</button>
													<button
														onClick={() => deleteClient(client.id)}
														className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500">
							{searchQuery
								? "No clients match your search criteria."
								: "No clients found."}
						</p>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default ClientManagement;
