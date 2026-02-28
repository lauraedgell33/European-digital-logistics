import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  LightThemeColors,
  DarkThemeColors,
  type ThemeColors,
} from '@/lib/theme';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightThemeColors,
  isDark: false,
  colorScheme: 'light',
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors: ThemeColors = isDark ? DarkThemeColors : LightThemeColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme: (colorScheme === 'dark' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export default ThemeContext;
