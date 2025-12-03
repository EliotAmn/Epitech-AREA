import { useContext, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { ThemeContext, type Theme } from "../context/theme";

interface HeaderProps {
    className?: string;
    isLoggedIn: boolean;
    theme?: Theme;
}

export default function Header({
    className = "",
    isLoggedIn,
    theme,
}: HeaderProps) {
    const navigate = useNavigate();
    const ctx = useContext(ThemeContext);
    const appliedTheme = theme ?? ctx.theme;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const toggleRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                (menuRef.current && menuRef.current.contains(target)) ||
                (toggleRef.current && toggleRef.current.contains(target))
            ) {
                return;
            }
            setMenuOpen(false);
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setMenuOpen(false);
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClick);
            document.addEventListener("keydown", handleKey);
        }
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [menuOpen]);

    const themeClasses =
        appliedTheme === "dark"
            ? "bg-[#242424] text-white"
            : "bg-white text-black";

    const hoverTextClass =
        appliedTheme === "dark" ? "hover:text-zinc-300" : "hover:text-zinc-600";

    const itemHoverBg =
        appliedTheme === "dark"
            ? "hover:bg-zinc-700 focus:bg-zinc-700"
            : "hover:bg-zinc-100 focus:bg-zinc-100";

    type NavItem = {
        key: string;
        label: string;
        to?: string;
        aria?: string;
        primary?: boolean;
        icon?: React.ReactNode;
    };

    const loggedInItems: NavItem[] = [
        { key: "explore", label: "Explore", to: "/explore", aria: "Explore" },
        {
            key: "my-areas",
            label: "My AREAS",
            to: "/my-areas",
            aria: "My AREAS",
        },
        {
            key: "create",
            label: "Create",
            to: "/create",
            aria: "Create area",
            primary: true,
        },
        {
            key: "profile",
            label: "Profile",
            to: "/profile",
            aria: "Profile",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.3}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
    ];

    const loggedOutItems: NavItem[] = [
        { key: "explore", label: "Explore", to: "/explore", aria: "Explore" },
        { key: "login", label: "Log in", to: "/login", aria: "Log in" },
        {
            key: "signup",
            label: "Get Started",
            to: "/signup",
            aria: "Get Started",
            primary: true,
        },
    ];

    const renderNavItem = (item: NavItem, variant: "desktop" | "mobile") => {
        const baseMobile = `text-left px-3 py-2 rounded ${itemHoverBg} ${hoverTextClass} focus:outline-none focus:ring-2 focus:ring-blue-400`;
        const baseDesktop = item.primary
            ? "bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 cursor-pointer"
            : "text-xl font-bold hover:cursor-pointer";

        const onClick = () => {
            setMenuOpen(false);
            if (item.to) navigate(item.to);
        };

        if (variant === "mobile") {
            // mobile: stacked buttons
            return (
                <button
                    key={item.key}
                    className={
                        item.primary
                            ? `text-left px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400`
                            : baseMobile
                    }
                    onClick={onClick}
                    type="button"
                    aria-label={item.aria}
                >
                    {item.icon ? (
                        <div className="flex items-center space-x-2">
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ) : (
                        item.label
                    )}
                </button>
            );
        }

        // desktop: inline buttons
        return (
            <button
                key={item.key}
                className={`${baseDesktop} ${!item.primary ? hoverTextClass : ""}`}
                onClick={onClick}
                type="button"
                aria-label={item.aria}
            >
                {item.icon ? item.icon : item.label}
            </button>
        );
    };

    return (
        <div
            className={`relative w-full flex justify-between items-center ${themeClasses} ${className}`}
        >
            <button
                className={`text-3xl font-bold p-4 hover:cursor-pointer ${hoverTextClass}`}
                onClick={() => navigate(isLoggedIn ? "/explore" : "/")}
                type="button"
                aria-label="Home"
            >
                AÉRA
            </button>
            <div className="flex items-center p-4 md:hidden relative">
                <button
                    ref={toggleRef}
                    className={`p-2 rounded-md hover:cursor-pointer ${hoverTextClass}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    type="button"
                    aria-controls="mobile-menu"
                    aria-label="Menu"
                    aria-expanded={menuOpen}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <div
                    id="mobile-menu"
                    ref={menuRef}
                    aria-hidden={!menuOpen}
                    className={`absolute top-full right-4 mt-2 w-48 rounded-md shadow-lg z-50 transform origin-top-right transition ease-out duration-150 ${appliedTheme === "dark" ? "bg-[#242424] text-white" : "bg-white text-black"} ${menuOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-2 scale-95 pointer-events-none"}`}
                >
                    <div className="flex flex-col p-2 space-y-1">
                        {(isLoggedIn ? loggedInItems : loggedOutItems).map(
                            (item) => renderNavItem(item, "mobile")
                        )}
                    </div>
                </div>
            </div>
            <nav
                aria-label="Main navigation"
                className="hidden md:flex items-center space-x-4 p-4"
            >
                {(isLoggedIn ? loggedInItems : loggedOutItems).map((item) =>
                    renderNavItem(item, "desktop")
                )}
            </nav>
        </div>
    );
}
