import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, Menu, IconButton } from 'react-native-paper';
import { useSnackbar } from '../../components/GlobalSnackbar';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('');
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const roleOptions = ['Teacher', 'Student', 'Parent', 'Admin'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

  const handleRegister = async () => {
    setError('');
    setSuccess(false);
    if (!email || !password || !confirm || !role) {
      setError('Please fill in all required fields and select a role.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setSuccess(true);
      showSnackbar('Registration successful!', 3000);
      setTimeout(() => navigation.navigate('Login'), 1000);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
      showSnackbar(e.message || 'Registration failed', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text variant="headlineSmall" style={styles.title}>Create Account</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
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
      <TextInput
        label="Confirm Password"
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
        secureTextEntry
      />
      <Menu
        visible={roleMenuVisible}
        onDismiss={() => setRoleMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setRoleMenuVisible(true)} style={[styles.input, { borderColor: !role && error ? '#D32F2F' : '#ccc', borderWidth: 1, borderRadius: 4 }] }>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: role ? '#000' : '#888' }}>{role || 'Select Role...'}</Text>
              <IconButton icon="chevron-down" size={20} />
            </View>
          </TouchableOpacity>
        }
      >
        {roleOptions.map(option => (
          <Menu.Item key={option} onPress={() => { setRole(option); setRoleMenuVisible(false); }} title={option} />
        ))}
      </Menu>
      {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}
      {success ? <Text style={{ color: theme.colors.primary, marginBottom: 8 }}>Registration successful! Redirecting…</Text> : null}
      <Button mode="contained" style={styles.button} onPress={handleRegister} loading={loading} disabled={loading}>
        Register
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
