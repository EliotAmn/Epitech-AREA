import { useState } from "react";

import SearchIcon from "../assets/search_icon.svg";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
}: SearchBarProps) {
    const slugify = (s: string) =>
        s
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[^a-z0-9\s_-]/g, "")
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_");

    const [internalValue, setInternalValue] = useState(value);

    return (
        <div className={`relative w-full ${className}`}>
            <img
                src={SearchIcon}
                alt="search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
            />
            <input
                aria-label="Search"
                value={internalValue}
                onChange={(e) => {
                    const next = e.target.value;
                    setInternalValue(next);
                    onChange(slugify(next));
                }}
                placeholder={placeholder}
                className="w-full h-[50px] pl-12 pr-12 text-[#A7A7A7] font-bold py-2 border-gray-200 border-2 rounded-xl text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}
