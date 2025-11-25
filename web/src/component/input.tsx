interface InputProps {
	placeholder?: string;
	value: string;
	onChange: (newValue: string) => void;
}

export default function Input({
	placeholder = "",
	value,
	onChange,
}: InputProps) {
	return (
		<input
			type="text"
			className="w-[480px] h-[50px] px-[15px] text-[#A7A7A7] font-bold  py-2 border-gray-200 border-2 rounded-xl text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
