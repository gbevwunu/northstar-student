import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../utils/auth-store';
import { authApi } from '../utils/api';

const UNIVERSITIES = [
  { key: 'UNIVERSITY_OF_MANITOBA', label: 'University of Manitoba' },
  { key: 'UNIVERSITY_OF_WINNIPEG', label: 'University of Winnipeg' },
  { key: 'RED_RIVER_COLLEGE', label: 'Red River College' },
  { key: 'BRANDON_UNIVERSITY', label: 'Brandon University' },
  { key: 'OTHER', label: 'Other' },
];

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUni, setSelectedUni] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res: any = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        university: UNIVERSITIES[selectedUni].key,
      });
      await login(res.user, res.token);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.logo}>⭐</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join NorthStar Student</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>University</Text>
            <View style={styles.uniPicker}>
              {UNIVERSITIES.map((uni, i) => (
                <TouchableOpacity
                  key={uni.key}
                  style={[styles.uniOption, selectedUni === i && styles.uniSelected]}
                  onPress={() => setSelectedUni(i)}
                >
                  <Text style={[styles.uniText, selectedUni === i && styles.uniTextSelected]}>
                    {uni.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#64748B"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkBold}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logo: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94A3B8' },
  form: {},
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFF',
  },
  uniPicker: { gap: 6 },
  uniOption: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
  },
  uniSelected: { borderColor: '#3B82F6', backgroundColor: '#1E3A5F' },
  uniText: { color: '#94A3B8', fontSize: 14 },
  uniTextSelected: { color: '#FFF' },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#94A3B8', fontSize: 14 },
  linkBold: { color: '#3B82F6', fontWeight: '600' },
});
