interface ConfigWidgetProps {
    color?: string;
    plateform?: string;
}

export default function ConfigWidget({ color, plateform }: ConfigWidgetProps) {
    return (
        <div className="p-8 w-full flex-1" style={{ backgroundColor: color }}>
            <h3 className="text-[45px] font-semibold text-white mb-2">
                Connect your {plateform} account{" "}
            </h3>
        </div>
    );
}
