import { useContext, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { AuthService } from "@/services/api";
import { ThemeContext, type Theme } from "../context/theme";
import { MenuIcon } from "./icons/MenuIcon";
import { UserIcon } from "./icons/UserIcon";

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

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

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

    const handleLogout = () => {
        AuthService.logout();
        setShowProfileMenu(false);
        setMenuOpen(false);
        navigate("/");
    };

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showProfileMenu]);

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
        const baseMobile = `text-left px-3 py-2 rounded ${itemHoverBg} ${hoverTextClass} focus:outline-none focus:ring-2`;
        const baseDesktop = item.primary
            ? item.key === "create"
                ? "bg-black text-white px-4 py-2 rounded-3xl hover:bg-zinc-800 cursor-pointer"
                : "bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 cursor-pointer"
            : "text-xl font-bold hover:cursor-pointer";

        const onClick = () => {
            setMenuOpen(false);
            if (item.to) navigate(item.to);
        };

        if (variant === "mobile") {
            return (
                <button
                    key={item.key}
                    className={
                        item.primary
                            ? item.key === "create"
                                ? `text-left px-3 py-2 rounded bg-black text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black`
                                : `text-left px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400`
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

    const mobileMenuClass = [
        "absolute top-full right-4 mt-2 w-48 rounded-md shadow-lg z-50 transform origin-top-right transition ease-out duration-150",
        appliedTheme === "dark"
            ? "bg-[#242424] text-white"
            : "bg-white text-black",
        menuOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none",
    ].join(" ");

    return (
        <div
            className={`relative w-full flex justify-between items-center ${themeClasses} ${className}`}
        >
            <button
                className={`text-4xl font-bold p-4 hover:cursor-pointer ${hoverTextClass}`}
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
                    <MenuIcon className="h-8 w-8" />
                </button>
                <div
                    id="mobile-menu"
                    ref={menuRef}
                    aria-hidden={!menuOpen}
                    className={mobileMenuClass}
                >
                    <div className="flex flex-col p-2 space-y-1">
                        {(isLoggedIn ? loggedInItems : loggedOutItems).map(
                            (item) => renderNavItem(item, "mobile")
                        )}
                        {isLoggedIn && (
                            <>
                                <hr
                                    className={`my-1 ${appliedTheme === "dark" ? "border-zinc-700" : "border-gray-200"}`}
                                />
                                <button
                                    className={`text-left px-3 py-2 rounded ${itemHoverBg} ${hoverTextClass} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                    type="button"
                                    aria-label="Profile"
                                >
                                    Profile
                                </button>
                                <button
                                    className="text-left px-3 py-2 rounded text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    onClick={handleLogout}
                                    type="button"
                                    aria-label="Logout"
                                >
                                    Logout
                                </button>
                            </>
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
                {isLoggedIn && (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            className={`hover:cursor-pointer ${hoverTextClass}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            type="button"
                            aria-label="Profile menu"
                        >
                            <UserIcon className="h-12 w-12" />
                        </button>

                        {showProfileMenu && (
                            <div
                                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${themeClasses} border ${appliedTheme === "dark" ? "border-zinc-700" : "border-gray-200"} z-50`}
                            >
                                <div className="py-1">
                                    <button
                                        className={`block w-full text-left px-4 py-2 text-sm ${hoverTextClass}`}
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowProfileMenu(false);
                                        }}
                                        type="button"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        className={`block w-full text-left px-4 py-2 text-sm ${hoverTextClass}`}
                                        onClick={() => {
                                            navigate("/change-password");
                                            setShowProfileMenu(false);
                                        }}
                                        type="button"
                                    >
                                        Change Password
                                    </button>
                                    {AuthService.isAdmin() && (
                                        <button
                                            className={`block w-full text-left px-4 py-2 text-sm ${hoverTextClass}`}
                                            onClick={() => {
                                                navigate("/dashboard");
                                                setShowProfileMenu(false);
                                            }}
                                            type="button"
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    <hr
                                        className={`my-1 ${appliedTheme === "dark" ? "border-zinc-700" : "border-gray-200"}`}
                                    />
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-700"
                                        onClick={handleLogout}
                                        type="button"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
}
