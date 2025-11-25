interface ButtonProps {
    label: string;
    onClick?: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
    return (
        <button
            className="w-[150px] h-[80px] hpx-4 py-2 bg-blue-500 text-[#ffffff] mb-4 rounded-full hover:bg-blue-600 transition-colors"
            onClick={onClick}
        >
            {label}
        </button>
    );
}
