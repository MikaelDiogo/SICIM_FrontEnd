import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Verde institucional — escala construída a partir de --brand-deep/--brand do protótipo HTML.
const brandGreen: MantineColorsTuple = [
  '#e8f3eb',
  '#d3e8d8',
  '#a8e6b2',
  '#7ad48c',
  '#5fcf72',
  '#3aab50',
  '#2d8a3e',
  '#236f32',
  '#1a5c2a',
  '#0f4a1e',
];

// Dourado institucional — a partir de --gold / --gold-vibrant do protótipo.
const brandGold: MantineColorsTuple = [
  '#fbf6dc',
  '#f5ecc0',
  '#f0e6b0',
  '#f5d000',
  '#e0bb1a',
  '#c8a84b',
  '#a08838',
  '#7a6418',
  '#5c4c12',
  '#40350c',
];

export const theme = createTheme({
  primaryColor: 'brandGreen',
  primaryShade: 6,
  colors: {
    brandGreen,
    brandGold,
  },
  fontFamily: "'Inter', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', monospace",
  lineHeights: {
    xs: '1.5',
    sm: '1.55',
    md: '1.65',
    lg: '1.7',
    xl: '1.75',
  },
  headings: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
  },
  defaultRadius: 'md',
  black: '#333333',
  white: '#ffffff',
  components: {
    Card: {
      defaultProps: { radius: 'md', withBorder: true, shadow: 'xs' },
    },
    Paper: {
      defaultProps: { radius: 'md', withBorder: true, shadow: 'xs' },
    },
    Button: {
      defaultProps: { radius: 'md' },
    },
  },
  other: {
    brandDeep: '#1A5C2A',
    brandFlag: '#3AAB50',
    brandMint: '#A8E6B2',
    brandSoft: '#E8F3EB',
    goldVibrant: '#F5D000',
    goldSoft: '#F0E6B0',
    goldBg: '#FBF6DC',
    grayLight: '#F2F2F2',
    grayMid: '#999999',
    grayDark: '#333333',
    blueAccess: '#2A6DB5',
    blueMid: '#4A90D9',
    danger: '#9c3838',
    warning: '#B8860B',
  },
});
