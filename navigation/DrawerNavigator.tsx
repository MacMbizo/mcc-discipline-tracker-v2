import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import IncidentFormScreen from '../screens/IncidentFormScreen';
import RecentLogsScreen from '../screens/RecentLogsScreen';
import StudentSearchScreen from '../screens/StudentSearchScreen';
// Placeholder for profile, add real import when available
const ProfileScreen = () => null; // TODO: Implement ProfileScreen
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#d32f2f',
        drawerLabelStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="view-dashboard-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="IncidentFormScreen" component={IncidentFormScreen} options={{ title: 'Log Incident', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="alert-circle-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="RecentLogsScreen" component={RecentLogsScreen} options={{ title: 'Recent Activity', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="clock-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="StudentSearchScreen" component={StudentSearchScreen} options={{ title: 'Search Students', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="account-search-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="account-circle-outline" color={color} size={size} />) }} />
    </Drawer.Navigator>
  );
}
