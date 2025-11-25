interface WidgetProps {
    titre: string;
    color?: string;
    onClick?: () => void;
  }

export default function Widget({ titre, color = "#ffffff", onClick }: WidgetProps) {
    return (
        <div
            className="w-[340px] h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color }}
            onClick={onClick}
            >
            <h2 className="text-xl text-[#ffffff] font-semibold mb-2 text-center">
                {titre}
            </h2>
        </div>
    );
}
