import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loading = fetchStatus === 'fetching';

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => router.replace('/(tabs)'),
      });
    }
  };

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
          <Text style={styles.appName}>ReDish</Text>
          <Text style={styles.tagline}>Your favorite dishes, saved.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.fields.identifier && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor={`${mauveBark}60`}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.fields.identifier && (
              <Text style={styles.fieldError}>{errors.fields.identifier.message}</Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.fields.password && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={`${mauveBark}60`}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {errors.fields.password && (
              <Text style={styles.fieldError}>{errors.fields.password.message}</Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={cream} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(auth)/sign-up" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
