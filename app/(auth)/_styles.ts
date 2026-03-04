import { StyleSheet } from 'react-native';
import { burntPeach, cream, lightBlue, mauveBark, navajoWhite } from '@/constants/theme';

export { burntPeach, cream, lightBlue, mauveBark, navajoWhite };

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cream,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    gap: 16,
    shadowColor: mauveBark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: mauveBark,
    marginBottom: 4,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: mauveBark,
    letterSpacing: 0.2,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: navajoWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: mauveBark,
    backgroundColor: `${cream}80`,
  },
  inputError: {
    borderColor: burntPeach,
  },
  fieldError: {
    fontSize: 12,
    color: burntPeach,
    marginTop: 2,
  },
  button: {
    height: 52,
    backgroundColor: burntPeach,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: burntPeach,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: cream,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: navajoWhite,
  },
  dividerText: {
    fontSize: 13,
    color: `${mauveBark}80`,
    fontWeight: '500',
  },
  secondaryButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: lightBlue,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${lightBlue}20`,
  },
  secondaryButtonText: {
    color: mauveBark,
    fontSize: 16,
    fontWeight: '600',
  },
});
