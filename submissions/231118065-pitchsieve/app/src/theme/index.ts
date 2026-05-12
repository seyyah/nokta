import { Platform } from 'react-native';

export const theme = {
  colors: {
    background: '#f4ede1',
    panel: '#fffaf1',
    panelStrong: '#243036',
    paper: '#fffdf8',
    ink: '#1f282b',
    muted: '#5f6967',
    border: '#e2d5c4',
    input: '#f9f2e7',
    inputBorder: '#d8c7b2',
    placeholder: '#927f6d',
    accent: '#bd6230',
    accentWash: '#f2cfb0',
    moss: '#5e7a60',
    mossWash: '#d8e3d3',
    danger: '#ad4637',
    tagBackground: '#efe4d5',
    tagBorder: '#d7c6b2',
    buttonMuted: '#efe3d4',
    noteBackground: '#ede4d8',
    scoreBackground: '#f1e7d7',
  },
  fonts: {
    display: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    heading: Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    body: Platform.select({
      ios: 'Avenir',
      android: 'sans-serif',
      default: 'System',
    }),
    label: Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif-medium',
      default: 'System',
    }),
  },
  shadow: {
    card: {
      shadowColor: '#5a4a2f',
      shadowOpacity: 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  },
} as const;
