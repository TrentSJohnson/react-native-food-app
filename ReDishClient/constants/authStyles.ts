import { StyleSheet } from 'react-native';
import { cream, mauveBark } from '@/constants/theme';

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cream,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: mauveBark,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: `${mauveBark}99`,
  },
});
