import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import IncidentFormScreen from '../screens/IncidentFormScreen';
import RecentLogsScreen from '../screens/RecentLogsScreen';
import StudentSearchScreen from '../screens/StudentSearchScreen';
import MeritFormScreen from '../screens/MeritFormScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
// Placeholder for profile, add real import when available
const ProfileScreen = () => null; // TODO: Implement ProfileScreen
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#0D1B2A', width: 260 }, // Deep blue
        drawerActiveTintColor: '#d32f2f', // Red for active icon/text
        drawerInactiveTintColor: '#fff', // White for inactive
        drawerActiveBackgroundColor: '#fff', // White background for active
        drawerLabelStyle: { fontWeight: 'bold', fontSize: 16 },
        drawerItemStyle: { borderRadius: 8, marginVertical: 2, marginHorizontal: 6, paddingVertical: 2 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="view-dashboard-outline" color={color} size={size} />) }} />

      <Drawer.Screen name="RecentLogsScreen" component={RecentLogsScreen} options={{ title: 'Recent Activity', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="clock-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="StudentSearchScreen" component={StudentSearchScreen} options={{ title: 'Search Students', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="magnify" color={color} size={size} />) }} />
      <Drawer.Screen name="LogMerit" component={StudentSearchScreen} initialParams={{ logType: 'merit' }} options={{ title: 'Log Merit', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="star-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="LogIncident" component={StudentSearchScreen} initialParams={{ logType: 'incident' }} options={{ title: 'Log Incident', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="alert-circle-outline" color={color} size={size} />) }} />
            <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="account-circle-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard', drawerIcon: ({color, size}: {color: string; size: number}) => (<Icon name="chart-bar" color={color} size={size} />) }} />
    </Drawer.Navigator>
  );
}
