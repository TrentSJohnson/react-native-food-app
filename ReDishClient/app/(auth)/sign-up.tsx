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
import { authStyles as s, burntPeach, cream, mauveBark, sharedStyles as ss } from '@/constants/authStyles';

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
      <SafeAreaView style={s.safeArea}>
        <KeyboardAvoidingView
          style={s.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={s.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Check your email</Text>
            <Text style={styles.verifySubtitle}>
              We sent a code to{' '}
              <Text style={styles.verifyEmail}>{email}</Text>
            </Text>

            <View style={s.inputWrapper}>
              <Text style={s.label}>Verification Code</Text>
              <TextInput
                style={{...ss.fieldBorder, ...s.input, ...styles.codeInput, ...(errors.fields.code ? s.inputError : undefined)}}
                placeholder="000000"
                placeholderTextColor={`${mauveBark}60`}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.fields.code && (
                <Text style={s.fieldError}>{errors.fields.code.message}</Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [ss.centeredButton, s.button, pressed && s.buttonPressed]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cream} />
              ) : (
                <Text style={s.buttonText}>Verify Email</Text>
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
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{...s.logoContainer, marginBottom: 8}}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.appName}>ReDish</Text>
            <Text style={s.tagline}>Start saving your favorites</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Create account</Text>

            <View style={s.inputWrapper}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={{...ss.fieldBorder, ...s.input, ...(errors.fields.emailAddress ? s.inputError : undefined)}}
                placeholder="you@example.com"
                placeholderTextColor={`${mauveBark}60`}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {errors.fields.emailAddress && (
                <Text style={s.fieldError}>{errors.fields.emailAddress.message}</Text>
              )}
            </View>

            <View style={s.inputWrapper}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={{...ss.fieldBorder, ...s.input, ...(errors.fields.password ? s.inputError : undefined)}}
                placeholder="Min. 8 characters"
                placeholderTextColor={`${mauveBark}60`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              {errors.fields.password && (
                <Text style={s.fieldError}>{errors.fields.password.message}</Text>
              )}
            </View>

            {/* Required for bot protection */}
            <View nativeID="clerk-captcha" />

            <Pressable
              style={({ pressed }) => [ss.centeredButton, s.button, pressed && s.buttonPressed]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cream} />
              ) : (
                <Text style={s.buttonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={{...ss.row, ...s.divider}}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={{...ss.centeredButton, ...s.secondaryButton}}>
                <Text style={s.secondaryButtonText}>Sign in instead</Text>
              </Pressable>
            </Link>
          </View>
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
});
