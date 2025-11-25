interface ButtonProps {
	label: string;
	onClick?: () => void;
	icon?: string | React.ReactNode;
}

export default function Button({ label, onClick, icon }: ButtonProps) {
	return (
		<button className="text-white" onClick={onClick}>
			{icon ? (
				typeof icon === "string" ? (
					<img src={icon} alt="" className="w-4 h-4 object-contain" />
				) : (
					<span className="mr-3 flex items-center">{icon}</span>
				)
			) : null}
			<span>{label}</span>
		</button>
	);
}
