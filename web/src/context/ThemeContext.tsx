import React, { createContext, useCallback, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextShape = {
	theme: Theme;
	setTheme: (t: Theme) => void;
	resetTheme: () => void;
	initialTheme: Theme;
};

export const ThemeContext = createContext<ThemeContextShape>({
	theme: "light",
	setTheme: () => {},
	resetTheme: () => {},
	initialTheme: "light",
});

export function ThemeProvider({
	children,
	initialTheme = "light",
}: {
	children: React.ReactNode;
	initialTheme?: Theme;
}) {
	const [theme, setTheme] = useState<Theme>(initialTheme);

	const resetTheme = useCallback(
		() => setTheme(initialTheme),
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
