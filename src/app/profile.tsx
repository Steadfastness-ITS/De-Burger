import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BurgerImage from '../components/BurgerImage';
import { BURGERS } from '../data/burgers';
import { useApp } from '../data/AppState';
import {
  EMPTY_PROFILE,
  isProfileComplete,
  validateProfile,
  type Profile,
} from '../data/profile';

const NAVY = '#2B2F54';
const ORANGE = '#E56B00';
const INK = '#3B2F2F';
const RED = '#E5383B';
const SIDE = 19;
const AVATAR = 148;

// Fades all four edges of a burger picture to fully transparent, so the
// picture's own background rectangle dissolves into whatever is underneath
// (the blue header gradient) and only the burger stays visible.
// FEATHER = how much of each edge fades out (0.22 = outer 22% on every side).
const FEATHER = 0.22;

function FeatheredBurger({
  source,
  style,
}: {
  source: React.ComponentProps<typeof BurgerImage>['source'];
  style: React.ComponentProps<typeof View>['style'];
}) {
  const stops = [0, FEATHER, 1 - FEATHER, 1] as const;
  const fade = ['rgba(0,0,0,0)', '#000', '#000', 'rgba(0,0,0,0)'] as const;
  const fill = StyleSheet.absoluteFill;
  return (
    <View style={style}>
      {/* top / bottom fade */}
      <MaskedView
        style={fill}
        maskElement={
          <View style={fill}>
            <LinearGradient
              colors={fade}
              locations={stops}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={fill}
            />
          </View>
        }
      >
        {/* left / right fade */}
        <MaskedView
          style={fill}
          maskElement={
            <View style={fill}>
              <LinearGradient
                colors={fade}
                locations={stops}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={fill}
              />
            </View>
          }
        >
          <BurgerImage source={source} emojiSize={80} style={fill} />
        </MaskedView>
      </MaskedView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  editable,
  error,
  keyboardType,
  autoCapitalize,
  multiline,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  editable: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
  autoComplete?: 'name' | 'email' | 'tel' | 'street-address';
}) {
  return (
    <View style={styles.fieldWrap}>
      <View
        style={[styles.field, editable && styles.fieldEdit, !!error && styles.fieldError]}
      >
        <Text style={[styles.fieldLabel, !!error && { color: RED }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          placeholderTextColor="#B5B7C0"
          style={[styles.input, multiline && { paddingVertical: 12 }]}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { profile, saveProfile, logout } = useApp();

  // No complete profile yet = first-time set up (everything editable, Save only).
  const setup = !isProfileComplete(profile);

  const [editing, setEditing] = useState<boolean>(setup);
  const [draft, setDraft] = useState<Profile>(profile ?? EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [photoMenu, setPhotoMenu] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What to open (camera / library) once the photo menu has finished closing.
  const pendingAction = useRef<(() => void) | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  const errors = validateProfile(draft);
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : undefined);
  const set = (k: keyof Profile) => (t: string) => setDraft((d) => ({ ...d, [k]: t }));

  const HEADER_H = 190 + insets.top;
  const sheetTop = HEADER_H - 40;

  // ---- photo (optional) ---------------------------------------------------
  const applyAsset = async (uri: string) => {
    setBusy(true);
    try {
      // Shrink to a small JPEG so it saves quickly and stays tiny on the device.
      const out = await manipulateAsync(uri, [{ resize: { width: 480 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (out.base64) {
        setDraft((d) => ({ ...d, photo: `data:image/jpeg;base64,${out.base64}` }));
      }
    } catch {
      Alert.alert('Photo problem', 'That photo could not be used. Please try another one.');
    } finally {
      setBusy(false);
    }
  };

  // The photo menu is a Modal. A picker cannot open while that Modal is still
  // sliding away (the phone silently ignores it, so "nothing happens"). So we
  // close the menu first and open the camera / library once it has gone.
  const runPending = () => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) action();
  };

  const closeMenuThen = (action: () => void) => {
    pendingAction.current = action;
    setPhotoMenu(false);
    // iPhone: the Modal's onDismiss calls runPending as soon as the menu is
    // gone. This timer is the backup (and is what Android uses).
    pendingTimer.current = setTimeout(runPending, Platform.OS === 'ios' ? 900 : 350);
  };

  const pickFromLibrary = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled && res.assets[0]) await applyAsset(res.assets[0].uri);
    } catch {
      Alert.alert('Could not open your photos', 'Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera access needed',
          'Allow camera access in your phone settings to take a photo, or choose one from your library.'
        );
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled && res.assets[0]) await applyAsset(res.assets[0].uri);
    } catch {
      Alert.alert('Could not open the camera', 'Please try again.');
    }
  };

  const fromLibrary = () => closeMenuThen(pickFromLibrary);
  const fromCamera = () => closeMenuThen(takePhoto);

  const removePhoto = () => {
    setPhotoMenu(false);
    setDraft((d) => ({ ...d, photo: undefined }));
  };

  // ---- actions ------------------------------------------------------------
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const onSave = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    Keyboard.dismiss();
    saveProfile({
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      photo: draft.photo,
    });
    setSubmitted(false);
    if (setup) {
      goBack(); // back to what the user was doing (e.g. checkout)
    } else {
      setEditing(false);
      setSaved(true);
      savedTimer.current = setTimeout(() => setSaved(false), 2200);
    }
  };

  const onCancel = () => {
    Keyboard.dismiss();
    setDraft(profile ?? EMPTY_PROFILE);
    setSubmitted(false);
    setEditing(false);
  };

  const onLogout = () => {
    Alert.alert(
      'Log out?',
      'This removes your profile, favourites and order history from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.dismissAll();
          },
        },
      ]
    );
  };

  const initials = draft.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Gradient header with burger photos on both sides */}
      <LinearGradient
        colors={['#23258A', '#5B3E97', '#23258A']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.header, { height: HEADER_H }]}
        pointerEvents="none"
      >
        <FeatheredBurger
          source={BURGERS[0].image}
          style={{ position: 'absolute', left: -62, top: insets.top + 36, width: 150, height: 130 }}
        />
        <FeatheredBurger
          source={BURGERS[1].image}
          style={{ position: 'absolute', right: -62, top: insets.top + 36, width: 150, height: 130 }}
        />
      </LinearGradient>

      <TouchableOpacity
        style={[styles.back, { top: insets.top + 14 }]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={goBack}
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={[
            styles.sheet,
            { marginTop: sheetTop, minHeight: height - sheetTop, paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          {/* Avatar */}
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!editing}
            onPress={() => setPhotoMenu(true)}
            style={styles.avatarWrap}
            accessibilityLabel="Profile picture"
          >
            <View style={styles.avatar}>
              {draft.photo ? (
                <BurgerImage
                  source={{ uri: draft.photo }}
                  resizeMode="cover"
                  fallback="👤"
                  emojiSize={56}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={[styles.avatarImg, styles.placeholder]}>
                  {initials ? (
                    <Text style={styles.initials}>{initials}</Text>
                  ) : (
                    <Ionicons name="person" size={64} color="#FFFFFF" />
                  )}
                </View>
              )}
              {busy && (
                <View style={styles.busy}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </View>
            {editing && (
              <View style={styles.cam}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.statusLine}>
            {saved ? (
              <View style={styles.savedPill}>
                <Ionicons name="checkmark-circle" size={16} color="#0BAA5E" />
                <Text style={styles.savedText}>Profile saved</Text>
              </View>
            ) : editing ? (
              <Text style={styles.hint}>
                {draft.photo ? 'Tap the picture to change it' : 'Add a picture (optional)'}
              </Text>
            ) : null}
          </View>

          {setup && (
            <View style={styles.banner}>
              <Ionicons name="location" size={22} color={ORANGE} />
              <Text style={styles.bannerText}>
                Set up your profile to place orders. We use these details to deliver to the
                right place. Your picture is optional.
              </Text>
            </View>
          )}

          <Field
            label="Name"
            value={draft.name}
            onChangeText={set('name')}
            editable={editing}
            error={show('name')}
            autoCapitalize="words"
            autoComplete="name"
          />
          <Field
            label="Email"
            value={draft.email}
            onChangeText={set('email')}
            editable={editing}
            error={show('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Phone number"
            value={draft.phone}
            onChangeText={set('phone')}
            editable={editing}
            error={show('phone')}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Field
            label="Delivery address"
            value={draft.address}
            onChangeText={set('address')}
            editable={editing}
            error={show('address')}
            autoCapitalize="words"
            autoComplete="street-address"
            multiline
          />

          {!editing && (
            <View style={styles.links}>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() =>
                  Alert.alert(
                    'Payment details',
                    'Saved cards will appear here once online payments are connected. For now, pick a card at checkout.'
                  )
                }
              >
                <Text style={styles.linkText}>Payment Details</Text>
                <Ionicons name="chevron-forward" size={22} color="#7A7A85" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/orders')}>
                <Text style={styles.linkText}>Order history</Text>
                <Ionicons name="chevron-forward" size={22} color="#7A7A85" />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flex: 1, minHeight: 24 }} />

          {/* Buttons */}
          {editing ? (
            <View style={styles.btnRow}>
              {!setup && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.btn, styles.btnOutlineNavy, { marginRight: 16 }]}
                  onPress={onCancel}
                >
                  <Text style={styles.btnNavyText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.btn, styles.btnOrange]}
                onPress={onSave}
              >
                <Text style={styles.btnOrangeText}>{setup ? 'Save profile' : 'Save changes'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.btn, styles.btnNavy, { marginRight: 16 }]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.btnOrangeText}>Edit Profile</Text>
                <Ionicons name="create-outline" size={24} color="#FFFFFF" style={{ marginLeft: 14 }} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.btn, styles.btnOutline]}
                onPress={onLogout}
              >
                <Text style={styles.logoutText}>Log out</Text>
                <Ionicons name="log-out-outline" size={26} color={ORANGE} style={{ marginLeft: 14 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Photo options */}
      <Modal
        visible={photoMenu}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPhotoMenu(false)}
        onDismiss={runPending}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPhotoMenu(false)} />
          <View style={[styles.menu, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Text style={styles.menuTitle}>Profile picture</Text>
            <TouchableOpacity style={styles.menuRow} onPress={fromCamera}>
              <Ionicons name="camera-outline" size={24} color={NAVY} />
              <Text style={styles.menuText}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={fromLibrary}>
              <Ionicons name="images-outline" size={24} color={NAVY} />
              <Text style={styles.menuText}>Choose from library</Text>
            </TouchableOpacity>
            {!!draft.photo && (
              <TouchableOpacity style={styles.menuRow} onPress={removePhoto}>
                <Ionicons name="trash-outline" size={24} color={RED} />
                <Text style={[styles.menuText, { color: RED }]}>Remove picture</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuCancel} onPress={() => setPhotoMenu(false)}>
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#23258A' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
  },
  back: { position: 'absolute', left: SIDE, zIndex: 5 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: SIDE,
    paddingTop: AVATAR / 2 + 12,
  },
  avatarWrap: {
    position: 'absolute',
    top: -AVATAR / 2 + 10,
    alignSelf: 'center',
    width: AVATAR,
    height: AVATAR,
    zIndex: 3,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#23258A',
    overflow: 'hidden',
    backgroundColor: NAVY,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarImg: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: NAVY },
  initials: { fontFamily: 'Poppins_600SemiBold', fontSize: 52, color: '#FFFFFF' },
  busy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,24,40,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cam: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ORANGE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: { height: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  hint: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#7A7A85' },
  savedPill: { flexDirection: 'row', alignItems: 'center' },
  savedText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#0BAA5E', marginLeft: 6 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF3E8',
    marginBottom: 26,
  },
  bannerText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: INK,
  },
  fieldWrap: { marginBottom: 26 },
  field: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E3E4E8',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  fieldEdit: { borderColor: '#B9BCD0' },
  fieldError: { borderColor: RED },
  fieldLabel: {
    position: 'absolute',
    top: -11,
    left: 16,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#7A7A85',
  },
  input: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#2B2B3A',
    paddingVertical: 0,
    paddingLeft: 4,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    color: RED,
    marginTop: 6,
    marginLeft: 8,
  },
  links: { marginTop: 4, paddingHorizontal: 27 },
  divider: { height: 1, backgroundColor: '#E5E5E8', marginBottom: 8 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  linkText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#7A7A85' },
  btnRow: { flexDirection: 'row', marginTop: 12 },
  btn: {
    flex: 1,
    height: 70,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNavy: {
    backgroundColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnOrange: {
    backgroundColor: ORANGE,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnOutline: { borderWidth: 2, borderColor: ORANGE, backgroundColor: '#FFFFFF' },
  btnOutlineNavy: { borderWidth: 2, borderColor: NAVY, backgroundColor: '#FFFFFF' },
  btnOrangeText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#FFFFFF' },
  btnNavyText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: NAVY },
  logoutText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: ORANGE },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,24,40,0.5)' },
  menu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SIDE,
    paddingTop: 22,
  },
  menuTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: INK, marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: NAVY, marginLeft: 16 },
  menuCancel: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCancelText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#555555' },
});
