type Props = { className?: string; title?: string; ariaHidden?: boolean };

export function EyeOffIcon({
    className = "w-5 h-5",
    title,
    ariaHidden = true,
}: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden={ariaHidden}
            role={title ? "img" : undefined}
        >
            {title ? <title>{title}</title> : null}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.223-3.555M6.1 6.1A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-2.045 3.468M3 3l18 18"
            />
        </svg>
    );
}

export default EyeOffIcon;
