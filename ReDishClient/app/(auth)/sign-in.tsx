import { authStyles as s } from '@/constants/authStyles';
import { SignIn } from '@clerk/expo/web';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 32 }}
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

          <View style={{ alignItems: 'center' }}>
            <SignIn />
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
