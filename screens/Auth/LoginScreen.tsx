import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by auth state in AppNavigator
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text variant="headlineSmall" style={styles.title}>Midlands Christian College</Text>
      <Text variant="titleMedium" style={styles.subtitle}>Discipline Tracker</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}
      <Button mode="contained" style={styles.button} onPress={handleLogin} loading={loading} disabled={loading}>
        Login
      </Button>
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>New user? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#1976D2',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  link: {
    color: '#1976D2',
    marginTop: 8,
  },
});
