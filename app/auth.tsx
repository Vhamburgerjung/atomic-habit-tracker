import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../src/lib/supabase';
import { COLORS, FONTS } from '../src/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Fehler', 'E-Mail und Passwort eingeben.');
      return;
    }
    setLoading(true);
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert('Fehler', error.message);
  }

  const inputStyle = {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    fontFamily: FONTS.body,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{
          fontFamily: FONTS.display, fontSize: 28,
          color: COLORS.text, marginBottom: 6,
        }}>
          {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
        </Text>
        <Text style={{
          fontFamily: FONTS.body, fontSize: 15,
          color: COLORS.muted, marginBottom: 32,
        }}>
          {mode === 'login'
            ? 'Melde dich an, um deine Gewohnheiten zu sehen.'
            : 'Starte deine Reise mit kleinen Gewohnheiten.'}
        </Text>

        <TextInput
          placeholder="E-Mail"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle}
        />
        <TextInput
          placeholder="Passwort"
          placeholderTextColor={COLORS.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: COLORS.accent,
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 14,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ fontFamily: FONTS.medium, color: '#fff', fontSize: 16 }}>
                {mode === 'login' ? 'Anmelden' : 'Registrieren'}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'register' : 'login')}>
          <Text style={{
            textAlign: 'center', color: COLORS.muted,
            fontFamily: FONTS.body, fontSize: 14,
          }}>
            {mode === 'login'
              ? 'Noch kein Konto? Registrieren'
              : 'Schon ein Konto? Anmelden'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}