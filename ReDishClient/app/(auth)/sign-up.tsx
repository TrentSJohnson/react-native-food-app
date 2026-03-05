import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStyles as s, burntPeach, cream, mauveBark, sharedStyles as ss } from '@/constants/authStyles';
import { SignUp } from '@clerk/expo/web'


export default function SignUpScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SignUp appearance={styles.centered} />
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 32,
  },
  verifySubtitle: {
    fontSize: 14,
    color: `${mauveBark}99`,
    lineHeight: 20,
  },
  verifyEmail: {
    color: burntPeach,
    fontWeight: '600',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: burntPeach,
    fontWeight: '600',
  },
  checkingText: {
    fontSize: 12,
    color: `${mauveBark}80`,
    marginTop: 2,
  },
  centered: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center'
  },
});
