import React from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, Theme as NavigationThemeType } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import { Surface, Text, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { theme as paperTheme } from '../theme/theme';
import AuthStack from './AuthStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, IconButton, Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import IncidentFormScreen from '../screens/IncidentFormScreen';
import MeritFormScreen from '../screens/MeritFormScreen';
import StudentSearchScreen from '../screens/StudentSearchScreen';
import RecentLogsScreen from '../screens/RecentLogsScreen';



const Stack = createNativeStackNavigator();

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
          <Stack.Screen 
            name="Drawer" 
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StudentProfileScreen"
            component={require('../screens/StudentProfileScreen').default}
            options={{ title: 'Student Profile', headerShown: true }}
          />
          <Stack.Screen
            name="IncidentFormScreen"
            component={require('../screens/IncidentFormScreen').default}
            options={{ title: 'Log Incident', headerShown: true }}
          />
          <Stack.Screen
            name="MeritFormScreen"
            component={require('../screens/MeritFormScreen').default}
            options={{ title: 'Log Merit', headerShown: true }}
          />
          <Stack.Screen
            name="RecentLogsScreen"
            component={require('../screens/RecentLogsScreen').default}
            options={{ title: 'Recent Activity', headerShown: true }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
