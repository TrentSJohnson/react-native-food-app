import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cream = '#fdffd6';
const navajoWhite = '#fcd99c';
const lightBlue = '#acd5d8';
const burntPeach = '#ec7357';
const mauveBark = '#754f44';

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const loading = fetchStatus === 'fetching';

  const needsVerification =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: () => router.replace('/(tabs)'),
      });
    }
  };

  if (needsVerification) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Check your email</Text>
            <Text style={styles.verifySubtitle}>
              We sent a code to{' '}
              <Text style={styles.verifyEmail}>{email}</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput, errors.fields.code && styles.inputError]}
                placeholder="000000"
                placeholderTextColor={`${mauveBark}60`}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.fields.code && (
                <Text style={styles.fieldError}>{errors.fields.code.message}</Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cream} />
              ) : (
                <Text style={styles.buttonText}>Verify Email</Text>
              )}
            </Pressable>

            <Pressable onPress={() => signUp.verifications.sendEmailCode()} style={styles.resendButton}>
              <Text style={styles.resendText}>Resend code</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>ReDish</Text>
            <Text style={styles.tagline}>Start saving your favorites</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create account</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.fields.emailAddress && styles.inputError]}
                placeholder="you@example.com"
                placeholderTextColor={`${mauveBark}60`}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {errors.fields.emailAddress && (
                <Text style={styles.fieldError}>{errors.fields.emailAddress.message}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.fields.password && styles.inputError]}
                placeholder="Min. 8 characters"
                placeholderTextColor={`${mauveBark}60`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              {errors.fields.password && (
                <Text style={styles.fieldError}>{errors.fields.password.message}</Text>
              )}
            </View>

            {/* Required for bot protection */}
            <View nativeID="clerk-captcha" />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cream} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sign in instead</Text>
              </Pressable>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 32,
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
    marginBottom: 8,
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
  verifySubtitle: {
    fontSize: 14,
    color: `${mauveBark}99`,
    lineHeight: 20,
  },
  verifyEmail: {
    color: burntPeach,
    fontWeight: '600',
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
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: '700',
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
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: burntPeach,
    fontWeight: '600',
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
