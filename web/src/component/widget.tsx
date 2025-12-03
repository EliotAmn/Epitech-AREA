interface WidgetProps {
	title: string;
	platform: string;
	color?: string;
	onClick?: () => void;
}

export default function Widget({
	title,
	color = "#ffffff",
	platform,
	onClick,
}: WidgetProps) {
	return (
		<div
			className="w-full sm:w-[340px] h-auto sm:h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-start justify-start flex-shrink-0"
			style={{ backgroundColor: color }}
			onClick={onClick}
		>
			<h2 className="text-3xl text-left text-[#ffffff] font-semibold mb-2">
				{title}
			</h2>
			<p className="text-sm sm:text-md text-[#ffffff]">{platform}</p>
		</div>
	);
}
