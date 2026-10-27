import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from '../components/BurgerImage';
import { useApp, type Order } from '../data/AppState';
import {
  addSupportMessage,
  addSupportMessageLater,
  useSupportMessages,
} from '../data/supportChat';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const SIDE = 19;

function botReply(text: string, order?: Order): string {
  const t = text.toLowerCase();
  if (/(order|arriv|deliver|late|long|where|track|time)/.test(t)) {
    if (!order) {
      return "I can't see an active order on your account yet. Place an order and I'll check it for you.";
    }
    return order.status === 'delivered'
      ? `Your order ${order.id} (${order.name}) has been delivered. Enjoy your meal!`
      : `Your order ${order.id} (${order.name}) is confirmed and on its way. It should arrive in about 25 minutes.`;
  }
  if (/thank/.test(t)) return "You're welcome! Anything else I can help with?";
  return 'Thanks for your message. Could you tell me a bit more so I can help?';
}

function BotAvatar() {
  return (
    <View style={styles.botAvatar}>
      <Ionicons name="person-outline" size={26} color="#FFFFFF" />
    </View>
  );
}

function MyAvatar() {
  const { profile } = useApp();
  return (
    <View style={styles.myAvatar}>
      <BurgerImage
        source={profile?.photo ? { uri: profile.photo } : undefined}
        resizeMode="cover"
        fallback="👤"
        emojiSize={24}
        style={{ width: 46, height: 46 }}
      />
    </View>
  );
}

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();

  // Messages are kept outside this screen (see data/supportChat.ts), so they
  // stay when you leave and come back. They start empty: the user speaks first.
  const messages = useSupportMessages();
  const [draft, setDraft] = useState<string>('');
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const order = orders[0];
    addSupportMessage('me', text);
    setDraft('');
    // Still saved if you leave the screen; dropped if you log out meanwhile.
    addSupportMessageLater('bot', botReply(text, order), 900);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={INK} />
        </TouchableOpacity>
        <View style={styles.menuLines}>
          <View style={[styles.menuLine, { width: 24 }]} />
          <View style={[styles.menuLine, { width: 16, marginTop: 5 }]} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => {
          if (m.kind === 'stamp') {
            return (
              <Text key={m.id} style={styles.stamp}>
                {m.text}
              </Text>
            );
          }
          if (m.kind === 'bot') {
            return (
              <View key={m.id} style={styles.rowBot}>
                <BotAvatar />
                <View style={[styles.bubble, styles.bubbleBot]}>
                  <Text style={styles.textBot}>{m.text}</Text>
                </View>
              </View>
            );
          }
          return (
            <View key={m.id} style={styles.rowMe}>
              <View style={[styles.bubble, styles.bubbleMe]}>
                <Text style={styles.textMe}>{m.text}</Text>
              </View>
              <MyAvatar />
            </View>
          );
        })}
      </ScrollView>

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.inputBox}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type here..."
            placeholderTextColor="#C4C5CC"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
          />
        </View>
        <TouchableOpacity activeOpacity={0.9} style={styles.sendBtn} onPress={send}>
          <Ionicons name="paper-plane-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 5,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    paddingBottom: 14,
  },
  menuLines: {
    alignItems: 'flex-end',
  },
  menuLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: INK,
  },
  messages: {
    paddingHorizontal: SIDE,
    paddingTop: 12,
    paddingBottom: 16,
  },
  rowBot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  rowMe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B2C2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  myAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: ORANGE,
    overflow: 'hidden',
    marginLeft: 14,
    backgroundColor: '#D9B99B',
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 20,
  },
  bubbleBot: {
    backgroundColor: '#F2F3F5',
  },
  bubbleMe: {
    backgroundColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  textBot: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#2B2B3A',
  },
  textMe: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  stamp: {
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#B5B7C0',
    marginTop: -14,
    marginBottom: 22,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  inputBox: {
    flex: 1,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 26,
    marginRight: 0,
    ...shadow,
  },
  input: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 17,
    color: '#1F2037',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -22,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
