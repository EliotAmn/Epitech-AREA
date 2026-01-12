import React, { useCallback, useState } from "react";

import { ThemeContext, type Theme } from "./theme";

export function ThemeProvider({
    children,
    initialTheme = "light",
}: {
    children: React.ReactNode;
    initialTheme?: Theme;
}) {
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
    }, []);

    const resetTheme = useCallback(
        () => setThemeState(initialTheme),
        [initialTheme]
    );

    return (
        <ThemeContext.Provider
            value={{ theme, setTheme, resetTheme, initialTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
