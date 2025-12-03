import React from "react";

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
    return (
        <div className={`relative w-full ${className}`}>
            <img
                src={SearchIcon}
                alt="search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
            />
            <input
                aria-label="Search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-[50px] pl-12 pr-12 text-[#A7A7A7] font-bold py-2 border-gray-200 border-2 rounded-xl text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {value ? (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                    ×
                </button>
            ) : null}
        </div>
    );
}
