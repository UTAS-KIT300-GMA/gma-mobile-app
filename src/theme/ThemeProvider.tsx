import { ReactNode, createContext, useContext } from "react";

/* This file defines a `ThemeProvider` component that provides a theme context to the entire app. 
The theme includes various color properties that can be used throughout the app for consistent styling. 
The `useTheme` hook allows components to easily access the theme values. The `colors` export provides 
a convenient way to access the default theme colors directly. */
export type AppTheme = {
  background: string;
  primary: string;
  secondary: string;
  textOnPrimary: string;
  textOnSecondary: string;
  saveBtnColor: string;
  saveBtnTextColor: string;
  lightGrey: string;
  darkGrey: string;
  black: string;
};

const defaultTheme: AppTheme = {
  background: "#FBF0E4",
  primary: "#A64D79",
  secondary: "#F19021",
  textOnPrimary: "#FFFFFF",
  textOnSecondary: "#A64D79",
  saveBtnColor: "#F1CB5F",
  saveBtnTextColor: "#400F32",
  lightGrey: "#E5E5E5",
  darkGrey: "#B3B3B3",
  black: "#000000",
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * @summary Wraps the app in a theme context so child components can access design tokens via useTheme.
 * @param children - The React subtree that will receive the theme context.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * @summary Returns the current app theme from context, providing access to all design-token color values.
 */
export function useTheme() {
  return useContext(ThemeContext);
}

export const colors = defaultTheme;
