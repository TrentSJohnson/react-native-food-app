import { authStyles as s } from '@/constants/authStyles';
import { burntPeach, cream, mauveBark, navajoWhite } from '@/constants/theme';
import { SignIn } from '@clerk/expo/web';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function DemoModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.badge}>DEMO</Text>
          <Text style={m.title}>Welcome to ReDish</Text>
          <Text style={m.body}>
            This is a live demo of the app. Feel free to explore using the sample account below.
          </Text>

          <View style={m.credBox}>
            <Text style={m.credLabel}>Demo Login</Text>
            <Text style={m.credRow}>
              <Text style={m.credKey}>Email  </Text>
              <Text style={m.credVal}>demo_test+clerk@demo.com</Text>
            </Text>
            <Text style={m.credRow}>
              <Text style={m.credKey}>Password  </Text>
              <Text style={m.credVal}>redishdemo</Text>
            </Text>
          </View>

          <View style={m.divider} />

          <Text style={m.secNote}>
            Normal sign-up & login is fully functional and{' '}
            <Text style={{ fontWeight: '700' }}>SOC 2 compliant</Text> — your data is safe.
          </Text>

          <Pressable style={m.btn} onPress={onClose}>
            <Text style={m.btnText}>Got it, let me in</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(117,79,68,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: cream,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    gap: 14,
    shadowColor: mauveBark,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: burntPeach,
    color: cream,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: mauveBark,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    color: `${mauveBark}cc`,
    lineHeight: 20,
  },
  credBox: {
    backgroundColor: navajoWhite,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: burntPeach,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  credRow: {
    fontSize: 13,
    color: mauveBark,
  },
  credKey: {
    fontWeight: '600',
    color: `${mauveBark}99`,
  },
  credVal: {
    fontWeight: '700',
    color: mauveBark,
  },
  divider: {
    height: 1,
    backgroundColor: `${mauveBark}22`,
  },
  secNote: {
    fontSize: 13,
    color: `${mauveBark}99`,
    lineHeight: 18,
  },
  btn: {
    backgroundColor: burntPeach,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: cream,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default function SignInScreen() {
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <SafeAreaView style={s.safeArea}>
      <DemoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
