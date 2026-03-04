import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStyles as s, cream, mauveBark, sharedStyles as ss } from '@/constants/authStyles';

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loading = fetchStatus === 'fetching';

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      console.log('Sign in error:', error);
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize();
    }
  };

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
          <Text style={s.appName}>ReDish</Text>
          <Text style={s.tagline}>Your favorite dishes, saved.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>

          <View style={s.inputWrapper}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={{...ss.fieldBorder, ...s.input, ...(errors.fields.identifier ? s.inputError : undefined)}}
              placeholder="you@example.com"
              placeholderTextColor={`${mauveBark}60`}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.fields.identifier && (
              <Text style={s.fieldError}>{errors.fields.identifier.message}</Text>
            )}
          </View>

          <View style={s.inputWrapper}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={{...ss.fieldBorder, ...s.input, ...(errors.fields.password ? s.inputError : undefined)}}
              placeholder="••••••••"
              placeholderTextColor={`${mauveBark}60`}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {errors.fields.password && (
              <Text style={s.fieldError}>{errors.fields.password.message}</Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [ss.centeredButton, s.button, pressed && s.buttonPressed]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={cream} />
            ) : (
              <Text style={s.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={{...ss.row, ...s.divider}}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <Link href="/(auth)/sign-up" asChild>
            <Pressable style={{...ss.centeredButton, ...s.secondaryButton}}>
              <Text style={s.secondaryButtonText}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
