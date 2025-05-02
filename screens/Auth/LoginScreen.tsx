import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useSnackbar } from '../../components/GlobalSnackbar';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSnackbar('Login successful!', 2000);
      // Navigation will be handled by auth state in AppNavigator
    } catch (e: any) {
      setError(e.message || 'Login failed');
      showSnackbar(e.message || 'Login failed', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Surface style={styles.logoContainer}>
            <Image 
              source={require('../../assets/mcc.ac.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </Surface>
          
          <Text variant="headlineMedium" style={styles.title}>Midlands Christian College</Text>
          <Text variant="titleMedium" style={styles.subtitle}>Discipline Tracker</Text>
          
          <Surface style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              outlineColor={theme.colors.secondary}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="email" color={theme.colors.secondary} />}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              mode="outlined"
              outlineColor={theme.colors.secondary}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="lock" color={theme.colors.secondary} />}
            />
            {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}
            
            <Button 
              mode="contained" 
              style={styles.button} 
              onPress={handleLogin} 
              loading={loading} 
              disabled={loading}
              buttonColor={theme.colors.primary}
              contentStyle={styles.buttonContent}
            >
              LOGIN
            </Button>
            
            <TouchableOpacity onPress={() => {}} style={styles.linkContainer}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>New user?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.link, styles.registerLink]}>Register</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  title: {
    color: '#D32F2F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#1976D2',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 30,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  link: {
    color: '#1976D2',
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    marginRight: 8,
  },
  registerLink: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
