// Theme configuration for the application
const fonts = {
  family: {
    primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    mono: `'Courier New', Courier, monospace`,
  },
  size: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    mini: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const theme = {
  fonts,
  colors: {
    primary: {
      main: "#3b82f6",
      hover: "#2563eb",
      disabled: "#9ca3af",
      bg: "#eff6ff",
      border: "#3b82f6",
      text: "#ffffff",
    },
    secondary: {
      main: "#e5e7eb",
      hover: "#d1d5db",
      text: "#1f2937",
      bg: "#f8f8ff",
    },
    error: {
      bg: "#fee2e2",
      border: "#dc2626",
      text: "#991b1b",
      solidBg: "#dc2626",
      solidText: "#ffffff",
    },
    info: {
      bg: "#eff6ff",
      border: "#3b82f6",
      text: "#1e40af",
      solidBg: "#3b82f6",
      solidText: "#ffffff",
    },
    success: {
      bg: "#dcfce7",
      border: "#16a34a",
      text: "#15803d",
      solidBg: "#16a34a",
      solidText: "#ffffff",
    },
    warning: {
      bg: "#fff7a3",
      border: "#facc15",
      text: "#ca8a04",
      solidBg: "#facc15",
      solidText: "#ffffff",
    },
    accent: {
      bg: "#f3e8ff",
      border: "#6a5ac7",
      text: "#4c1d95",
      solidBg: "#6a5ac7",
      solidText: "#ffffff",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    text: {
      primary: "#1f2937",
      secondary: "#4b5563",
      tertiary: "#6b7280",
      placeholder: "#9ca3af",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f3f4f6",
      tertiary: "#f9fafb",
      overlay: "rgba(0, 0, 0, 0.5)",
    },
    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
    },
    table: {
      headerBg: "#3b82f6",
      headerText: "#ffffff",
      rowEvenBg: "#ffffff",
      rowOddBg: "#f8f8ff",
      rowText: "#1f2937",
      border: "#e5e7eb",
    },
    palette: {
      primary: "#2d8cf0",
      primaryDark: "#1f5fad",
      secondary: "#27b3c7",
      tertiary: "#8bd5ff",
      background: "#0f2c59",
      surface: "#e5f4ff",
      textPrimary: "#0f172a",
      textSecondary: "#1f3b57",
      accent: "#6a5ac7",
    },
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem", // 32px
  },
  size: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem", // 32px
    "4xl": "3rem", // 48px
  },
  size_pixels: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 48,
  },
  radius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    fast: "0.15s ease",
    base: "0.2s ease",
    slow: "0.3s ease",
  },
  zIndex: {
    hide: -1,
    base: 0,
    overlay: 30,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  toasterDuration: {
    success: 2000,
    error: 4000,
    info: 3000,
  },
  typography: {
    h1: {
      font: `${fonts.weight.bold} ${fonts.size["4xl"]}/${fonts.lineHeight.tight} ${fonts.family.primary}`,
    },
    h2: {
      font: `${fonts.weight.semibold} ${fonts.size["2xl"]}/${fonts.lineHeight.tight} ${fonts.family.primary}`,
    },
    h3: {
      font: `${fonts.weight.semibold} ${fonts.size.xl}/${fonts.lineHeight.tight} ${fonts.family.primary}`,
    },
    h4: {
      font: `${fonts.weight.semibold} ${fonts.size.lg}/${fonts.lineHeight.tight} ${fonts.family.primary}`,
    },
    body: {
      font: `${fonts.weight.normal} ${fonts.size.base}/${fonts.lineHeight.normal} ${fonts.family.primary}`,
    },
    bodyMedium: {
      font: `${fonts.weight.medium} ${fonts.size.base}/${fonts.lineHeight.normal} ${fonts.family.primary}`,
    },
    caption: {
      font: `${fonts.weight.normal} ${fonts.size.sm}/${fonts.lineHeight.normal} ${fonts.family.primary}`,
    },
    small: {
      font: `${fonts.weight.normal} ${fonts.size.xs}/${fonts.lineHeight.tight} ${fonts.family.primary}`,
    },
    code_small: {
      font: `${fonts.weight.normal} ${fonts.size.sm}/${fonts.lineHeight.relaxed} ${fonts.family.mono}`,
    },
    code_medium: {
      font: `${fonts.weight.normal} ${fonts.size.base}/${fonts.lineHeight.relaxed} ${fonts.family.mono}`,
    },
  },
  interactions: {
    disabledOpacity: 0.6,
    activeScale: "0.98",
  },
};

export const darkTheme: Theme = {
  ...theme,
  colors: {
    primary: {
      main: "#60a5fa",
      hover: "#93bbfd",
      disabled: "#6b7280",
      bg: "#1e2a3a",
      border: "#60a5fa",
      text: "#ffffff",
    },
    secondary: {
      main: "#374151",
      hover: "#4b5563",
      text: "#e5e7eb",
      bg: "#1f2937",
    },
    error: {
      bg: "#3b1c1c",
      border: "#ef4444",
      text: "#fca5a5",
      solidBg: "#dc2626",
      solidText: "#ffffff",
    },
    info: {
      bg: "#1e2a3a",
      border: "#60a5fa",
      text: "#93c5fd",
      solidBg: "#3b82f6",
      solidText: "#ffffff",
    },
    success: {
      bg: "#1a2e1a",
      border: "#22c55e",
      text: "#86efac",
      solidBg: "#16a34a",
      solidText: "#ffffff",
    },
    warning: {
      bg: "#2e2a1a",
      border: "#facc15",
      text: "#fde68a",
      solidBg: "#eab308",
      solidText: "#1f2937",
    },
    accent: {
      bg: "#2a1f3d",
      border: "#8b7cf7",
      text: "#c4b5fd",
      solidBg: "#6a5ac7",
      solidText: "#ffffff",
    },
    gray: {
      50: "#111827",
      100: "#1f2937",
      200: "#374151",
      300: "#4b5563",
      400: "#6b7280",
      500: "#9ca3af",
      600: "#d1d5db",
      700: "#e5e7eb",
      800: "#f3f4f6",
      900: "#f9fafb",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
      placeholder: "#6b7280",
    },
    background: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#171f2e",
      overlay: "rgba(0, 0, 0, 0.7)",
    },
    border: {
      light: "#374151",
      medium: "#4b5563",
      dark: "#6b7280",
    },
    table: {
      headerBg: "#1e3a5f",
      headerText: "#e5e7eb",
      rowEvenBg: "#111827",
      rowOddBg: "#1a2332",
      rowText: "#e5e7eb",
      border: "#374151",
    },
    palette: {
      primary: "#60a5fa",
      primaryDark: "#3b82f6",
      secondary: "#34d399",
      tertiary: "#67e8f9",
      background: "#0f172a",
      surface: "#1e293b",
      textPrimary: "#f1f5f9",
      textSecondary: "#cbd5e1",
      accent: "#8b7cf7",
    },
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    base: "0 1px 3px rgba(0, 0, 0, 0.4)",
    md: "0 4px 6px rgba(0, 0, 0, 0.4)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.4)",
  },
};

export type Theme = typeof theme;
