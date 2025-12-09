import { createContext } from "react";

export type Theme = "light" | "dark";

export type ThemeContextShape = {
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

export default ThemeContext;
