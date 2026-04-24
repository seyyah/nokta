import { Platform } from 'react-native';

export const palette = {
  background: '#F5F5F2',
  surface: '#FFFFFF',
  surfaceMuted: '#ECEDE7',
  ink: '#1A1C1B',
  inkSoft: '#293340',
  muted: '#626A74',
  blue: '#0055FF',
  blueDeep: '#003DB3',
  blueSoft: '#DCE4FF',
  amber: '#C48A1B',
  amberSoft: '#F4E6BE',
  rust: '#9A4A36',
  rustSoft: '#F5DFD8',
  success: '#2F6B4F',
  successSoft: '#DCEBDF',
};

export const shadows = Platform.select({
  ios: {
    shadowColor: '#1A1C1B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
  },
  android: {
    elevation: 2,
  },
  default: {},
});
