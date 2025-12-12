import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

const lightTheme = {
  colors: {
    background: '#FFFFFF',
    primary: '#4A90E2',
    secondary: '#E8F4F8',
    card: '#F5F5F5',
    text: '#000000',
    textSecondary: '#7F8C8D',
    accent: '#F39C12',
    tipBackground: '#E8F4F8',
    tipTitle: '#4A90E2',
    tipText: '#2C3E50',
  },
};

const darkTheme = {
  colors: {
    background: '#1A1A1A',
    primary: '#5DADE2',
    secondary: '#2C3E50',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#BDC3C7',
    accent: '#F39C12',
    tipBackground: '#2C3E50',
    tipTitle: '#5DADE2',
    tipText: '#BDC3C7',
  },
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const ThemeContextProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  const getTheme = () => {
    return themes[currentTheme];
  };

  return (
    <ThemeContext.Provider value={{ getTheme, themes, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};
