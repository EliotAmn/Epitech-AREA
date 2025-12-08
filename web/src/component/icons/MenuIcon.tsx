type Props = { className?: string; title?: string; ariaHidden?: boolean };

export function MenuIcon({
    className = "h-8 w-8",
    title,
    ariaHidden = true,
}: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden={ariaHidden}
            role={title ? "img" : undefined}
        >
            {title ? <title>{title}</title> : null}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    );
}

export default MenuIcon;
