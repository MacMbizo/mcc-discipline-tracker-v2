import React from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, Theme as NavigationThemeType } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Surface, Text, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { theme as paperTheme } from '../theme/theme';
import AuthStack from './AuthStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => {
  const theme = useTheme();
  return (
    <Surface style={[styles.surface, { backgroundColor: theme.colors.background }]}> 
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{title}</Text>
    </Surface>
  );
};

// Sync navigation theme with Paper theme
const navigationTheme: NavigationThemeType = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.primary, // header background
    text: paperTheme.colors.onPrimary, // header text
    border: paperTheme.colors.primary,
    notification: paperTheme.colors.secondary,
  },
};

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Surface style={[styles.surface, { backgroundColor: paperTheme.colors.background }]}> 
        <ActivityIndicator animating color={paperTheme.colors.primary} />
      </Surface>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: paperTheme.colors.primary },
            headerTintColor: paperTheme.colors.onPrimary,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Home" options={{ title: 'MCC Home' }}>
            {() => <PlaceholderScreen title="Welcome to MCC!" />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
