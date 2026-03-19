import { ReactNode, createContext, useContext } from "react";

export type AppTheme = {
  primary: string;
  secondary: string;
  textOnPrimary: string;
  textOnSecondary: string;
  saveBtnColor: string;
  saveBtnTextColor: string;
};

const defaultTheme: AppTheme = {
  primary: "#a64d79",
  secondary: "#FAF0E4",
  textOnPrimary: "#ffffff",
  textOnSecondary: "#25292e",
  saveBtnColor: "#F1CB5F",
  saveBtnTextColor: "#410F33",
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const colors = defaultTheme;

