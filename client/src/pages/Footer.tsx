import React from "react";

export const Footer: React.FC = () => {
	return (
		<footer className="bg-white shadow">
			<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-900">
					Tiba
					<span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
						Node
					</span>
				</h1>
				copyright &copy; 2025 TibaNode. All rights reserved.
			</div>
		</footer>
	);
};
