interface WidgetProps {
	titre: string;
	plateforme: string;
	color?: string;
	onClick?: () => void;
}

export default function Widget({
	titre,
	color = "#ffffff",
	plateforme,
	onClick,
}: WidgetProps) {
	return (
		<div
			className="w-full sm:w-[340px] h-auto sm:h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-start justify-start flex-shrink-0"
			style={{ backgroundColor: color }}
			onClick={onClick}
		>
			<h2 className="text-3xl text-[#ffffff] font-semibold mb-2">
				{titre}
			</h2>
			<p className="text-sm sm:text-md text-[#ffffff]">{plateforme}</p>
		</div>
	);
}
