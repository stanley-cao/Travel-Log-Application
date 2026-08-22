export const Colors = {
  sand50:  '#FAF8F5',
  sand100: '#F0EDE6',
  sand200: '#E0DBD0',
  sand300: '#C8C1B0',
  sand400: '#A89E8C',
  sand500: '#8A8270',
  sand700: '#4A4540',
  sand900: '#1E1B17',

  terracotta:      '#C4623A',
  terracottaLight: '#F0D5C8',
  terracottaDark:  '#8C3D1E',

  teal:      '#2A7A6E',
  tealLight: '#C8E8E4',
  tealDark:  '#1A5048',

  gold:      '#C49A2A',
  goldLight: '#F5EAC5',

  white: '#FFFFFF',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  success: '#16A34A',
  successLight: '#F0FDF4',
}

export const Typography = {
  displayFont: undefined, // loaded via expo-font
  bodyFont: undefined,
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 34,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
}

export const Shadow = {
  sm: {
    shadowColor: '#1E1B17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E1B17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1E1B17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
}
