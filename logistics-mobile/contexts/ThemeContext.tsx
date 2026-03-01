import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LightThemeColors,
  DarkThemeColors,
  type ThemeColors,
} from '@/lib/theme';
import { getStatusColors, getColors, StatusColors, DarkStatusColors } from '@/constants/theme';

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = '@logimarket_theme_mode';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  statusColors: typeof StatusColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightThemeColors,
  isDark: false,
  colorScheme: 'light',
  statusColors: StatusColors,
  themeMode: 'system',
  setThemeMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved);
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  // Resolve effective color scheme
  const effectiveScheme: 'light' | 'dark' =
    themeMode === 'system'
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const isDark = effectiveScheme === 'dark';
  const colors: ThemeColors = isDark ? DarkThemeColors : LightThemeColors;
  const statusColors = isDark ? DarkStatusColors : StatusColors;

  // Avoid rendering before theme is loaded to prevent flash
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme: effectiveScheme, statusColors, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export default ThemeContext;
