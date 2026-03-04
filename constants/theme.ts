import { Platform } from 'react-native';

// Your New Palette Constants
export const cream = '#fdffd6';
export const navajoWhite = '#fcd99c';
export const lightBlue = '#acd5d8';
export const burntPeach = '#ec7357';
export const mauveBark = '#754f44';

const tintColorLight = burntPeach; 
const tintColorDark = cream;

export const Colors = {
  light: {
    text: mauveBark,
    background: cream,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    accent: lightBlue,
    secondary: navajoWhite,
  },
  dark: {
    text: cream,
    background: mauveBark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    accent: lightBlue,
    secondary: burntPeach,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});