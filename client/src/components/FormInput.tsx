import React from "react";

interface FormInputProps {
	label: string;
	type: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
	label,
	type,
	value,
	onChange,
	error,
}) => {
	return (
		<div className="mb-4">
			<label className="block text-gray-700 text-sm font-bold mb-2">
				{label}
			</label>
			<input
				type={type}
				value={value}
				onChange={onChange}
				className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			/>
			{error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
		</div>
	);
};
