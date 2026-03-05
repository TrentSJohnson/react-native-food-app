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
import { SignIn } from '@clerk/expo/web';

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

          <SignIn/>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
