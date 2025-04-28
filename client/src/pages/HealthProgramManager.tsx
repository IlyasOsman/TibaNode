import React, { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { Footer } from "./Footer";

// Define TypeScript interface for our health program data
interface HealthProgram {
	id: number;
	name: string;
	description: string;
	created_at: string;
}

// New program form interface
interface NewProgramForm {
	name: string;
	description: string;
}

const HealthProgramManager: React.FC = () => {
	// State management
	const [programs, setPrograms] = useState<HealthProgram[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState<boolean>(false);
	const [newProgram, setNewProgram] = useState<NewProgramForm>({
		name: "",
		description: "",
	});
	const [editingProgram, setEditingProgram] = useState<HealthProgram | null>(
		null,
	);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const TIBANODE_API = `${import.meta.env.VITE_REACT_APP_TIBANODE_API}healthprograms/`;

	// Fetch all health programs
	const fetchPrograms = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(TIBANODE_API);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			setPrograms(data);
		} catch (err) {
			setError(
				`Failed to fetch health programs: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	// Create a new health program
	const createProgram = async () => {
		if (!newProgram.name.trim() || !newProgram.description.trim()) {
			setError("Name and description are required");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(TIBANODE_API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProgram),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const createdProgram = await response.json();
			setPrograms([...programs, createdProgram]);
			setNewProgram({ name: "", description: "" });
			setShowAddForm(false);
			showSuccess("Program created successfully");
		} catch (err) {
			setError(
				`Failed to create program: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	// Update an existing health program
	const updateProgram = async () => {
		if (!editingProgram) return;

		if (!editingProgram.name.trim() || !editingProgram.description.trim()) {
			setError("Name and description are required");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${TIBANODE_API}${editingProgram.id}/`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: editingProgram.name,
					description: editingProgram.description,
				}),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const updatedProgram = await response.json();

			setPrograms(
				programs.map((program) =>
					program.id === updatedProgram.id ? updatedProgram : program,
				),
			);

			setEditingProgram(null);
			showSuccess("Program updated successfully");
		} catch (err) {
			setError(
				`Failed to update program: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	// Delete a health program
	const deleteProgram = async (id: number) => {
		if (
			!window.confirm("Are you sure you want to delete this health program?")
		) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${TIBANODE_API}${id}/`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			setPrograms(programs.filter((program) => program.id !== id));
			showSuccess("Program deleted successfully");
		} catch (err) {
			setError(
				`Failed to delete program: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	// Start editing a program
	const startEdit = (program: HealthProgram) => {
		// Create a copy to avoid directly modifying state
		setEditingProgram({ ...program });
	};

	// Cancel editing
	const cancelEdit = () => {
		setEditingProgram(null);
	};

	// Handle input changes for new program form
	const handleNewProgramChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setNewProgram((prev) => ({ ...prev, [name]: value }));
	};

	// Handle input changes for editing form
	const handleEditChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		if (!editingProgram) return;

		const { name, value } = e.target;
		setEditingProgram((prev) => ({ ...prev!, [name]: value }));
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Show success message with auto-dismissal
	const showSuccess = (message: string) => {
		setSuccessMessage(message);
		setTimeout(() => {
			setSuccessMessage(null);
		}, 3000);
	};

	// Load programs on component mount
	useEffect(() => {
		fetchPrograms();
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			<DashboardHeader />
			<div className="flex-grow">
				<div className="max-w-4xl mx-auto p-6">
					<div className="flex justify-between items-center mb-6 mt-8">
						<h1 className="text-3xl font-bold text-gray-800">
							Health Programs
						</h1>
						<div className="flex gap-2">
							<button
								onClick={() => setShowAddForm(!showAddForm)}
								className="flex items-center gap-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
							>
								{showAddForm ? "Cancel" : "Add Program"}
							</button>
							<button
								onClick={fetchPrograms}
								className="flex items-center gap-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
								disabled={loading}
							>
								Refresh
							</button>
						</div>
					</div>

					{error && (
						<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
							<p>{error}</p>
						</div>
					)}

					{successMessage && (
						<div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
							<p>{successMessage}</p>
						</div>
					)}

					{showAddForm && (
						<div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
							<h2 className="text-xl font-semibold mb-4">
								Add New Health Program
							</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="new-name"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Program Name
									</label>
									<input
										id="new-name"
										type="text"
										name="name"
										value={newProgram.name}
										onChange={handleNewProgramChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter program name"
									/>
								</div>
								<div>
									<label
										htmlFor="new-description"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Description
									</label>
									<textarea
										id="new-description"
										name="description"
										value={newProgram.description}
										onChange={handleNewProgramChange}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter program description"
									/>
								</div>
								<div className="flex justify-end">
									<button
										onClick={createProgram}
										disabled={loading}
										className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
									>
										Create Program
									</button>
								</div>
							</div>
						</div>
					)}

					<div className="bg-white rounded-lg shadow">
						{loading && programs.length === 0 ? (
							<div className="p-6 text-center">
								<div className="animate-pulse flex justify-center">
									<div className="h-4 w-32 bg-gray-200 rounded"></div>
								</div>
								<p className="mt-4 text-gray-500">Loading health programs...</p>
							</div>
						) : programs.length === 0 ? (
							<div className="p-6 text-center border-t border-gray-200">
								<p className="text-gray-500">
									No health programs found. Create one to get started.
								</p>
							</div>
						) : (
							<div className="overflow-hidden">
								<div className="grid grid-cols-1 divide-y divide-gray-200">
									{programs.map((program) => (
										<div key={program.id} className="p-6">
											{editingProgram && editingProgram.id === program.id ? (
												<div className="space-y-4">
													<div>
														<label
															htmlFor={`edit-name-${program.id}`}
															className="block text-sm font-medium text-gray-700 mb-1"
														>
															Program Name
														</label>
														<input
															id={`edit-name-${program.id}`}
															type="text"
															name="name"
															value={editingProgram.name}
															onChange={handleEditChange}
															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
														/>
													</div>
													<div>
														<label
															htmlFor={`edit-description-${program.id}`}
															className="block text-sm font-medium text-gray-700 mb-1"
														>
															Description
														</label>
														<textarea
															id={`edit-description-${program.id}`}
															name="description"
															value={editingProgram.description}
															onChange={handleEditChange}
															rows={3}
															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
														/>
													</div>
													<div className="flex justify-end gap-2">
														<button
															onClick={cancelEdit}
															className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
														>
															Cancel
														</button>
														<button
															onClick={updateProgram}
															disabled={loading}
															className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
														>
															Save Changes
														</button>
													</div>
												</div>
											) : (
												<div>
													<div className="flex justify-between items-start">
														<div>
															<h3 className="text-xl font-semibold text-gray-800">
																{program.name}
															</h3>
															<p className="text-sm text-gray-500 mt-1">
																Created: {formatDate(program.created_at)}
															</p>
														</div>
														<div className="flex space-x-2">
															<button
																onClick={() => startEdit(program)}
																className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
																title="Edit program"
															>
																Edit
															</button>
															<button
																onClick={() => deleteProgram(program.id)}
																className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
																title="Delete program"
															>
																Delete
															</button>
														</div>
													</div>
													<p className="mt-2 text-gray-600">
														{program.description}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default HealthProgramManager;
