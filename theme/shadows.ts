import { Platform } from 'react-native';
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#6B1D2E',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#6B1D2E',
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 5 },
    default: {},
  }),
} as const;
