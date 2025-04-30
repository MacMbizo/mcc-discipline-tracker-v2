import React, { useState } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton } from 'react-native-paper';
import { Image } from 'react-native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

function StatCard({ label, value, color, icon, borderColor = '#1976d2', iconColor = '#1976d2' }: { label: string; value: number; color: string; icon: string; borderColor?: string; iconColor?: string }) {
  return (
    <View style={{
      backgroundColor: color,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 8,
      minWidth: 78,
      alignItems: 'center',
      marginHorizontal: 3,
      flex: 1,
      borderWidth: 2,
      borderColor,
      shadowColor: borderColor,
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      <Text style={{ color: iconColor, fontWeight: 'bold', fontSize: 20, marginTop: 3 }}>{value}</Text>
      <Text style={{ color: '#0D1B2A', fontSize: 13, marginTop: 2, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function ShortcutButton({ label, icon, color, onPress, outline = false }: { label: string; icon: string; color: string; onPress: () => void; outline?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <View style={outline ? {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 12,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: color,
        shadowColor: color,
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
      } : {
        backgroundColor: color,
        borderRadius: 32,
        padding: 12,
        marginBottom: 6,
      }}>
        <MaterialCommunityIcons name={icon} size={28} color={outline ? color : '#fff'} />
      </View>
      <Text style={{ color: outline ? color : '#fff', fontWeight: 'bold', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatsRow() {
  const [counts, setCounts] = React.useState({ users: 0, teachers: 0, students: 0, incidents: 0, merits: 0 });
  React.useEffect(() => {
    async function fetchStats() {
      const usersSnap = await getDocs(collection(db, 'users'));
      let teachers = 0, students = 0;
      usersSnap.forEach(doc => {
        const role = (doc.data() as any).role;
        if (role === 'Teacher') teachers++;
        if (role === 'Student') students++;
      });
      const incidentsSnap = await getDocs(collection(db, 'incidents'));
      const meritsSnap = await getDocs(collection(db, 'merits'));
      setCounts({
        users: usersSnap.size,
        teachers,
        students,
        incidents: incidentsSnap.size,
        merits: meritsSnap.size,
      });
    }
    fetchStats();
  }, []);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
      <StatCard label="Users" value={counts.users} color="#1976d2" icon="account-group" />
      <StatCard label="Teachers" value={counts.teachers} color="#d32f2f" icon="school" />
      <StatCard label="Students" value={counts.students} color="#1976d2" icon="account" />
      <StatCard label="Incidents" value={counts.incidents} color="#ffa000" icon="alert" />
      <StatCard label="Merits" value={counts.merits} color="#388e3c" icon="star" />
    </View>
  );
}

function RecentActivity() {
  const [activities, setActivities] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function fetchActivity() {
      const recentIncidents = await getDocs(query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(5)));
      const recentMerits = await getDocs(query(collection(db, 'merits'), orderBy('createdAt', 'desc'), limit(5)));
      const acts: any[] = [];
      recentIncidents.forEach(doc => {
        const d = doc.data();
        acts.push({
          id: doc.id,
          type: 'incident',
          text: `Incident logged for ${d.studentName || d.studentId || 'Unknown'}`,
          time: d.createdAt?.toDate?.().toLocaleString() || '',
        });
      });
      recentMerits.forEach(doc => {
        const d = doc.data();
        acts.push({
          id: doc.id,
          type: 'merit',
          text: `Merit awarded to ${d.studentName || d.studentId || 'Unknown'}`,
          time: d.createdAt?.toDate?.().toLocaleString() || '',
        });
      });
      acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(acts.slice(0, 5));
    }
    fetchActivity();
  }, []);
  return (
    <View>
      {activities.length === 0 ? <Text>No recent activity.</Text> : activities.map(act => (
        <View key={act.id + act.type} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <MaterialCommunityIcons name={act.type === 'incident' ? 'alert-circle' : 'star'} size={22} color={act.type === 'incident' ? '#d32f2f' : '#388e3c'} style={{ marginRight: 8 }} />
          <Text style={{ flex: 1 }}>{act.text}</Text>
          <Text style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{act.time}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleDismiss = () => setDialogVisible(false);
  const handleLogout = () => {
    setDialogVisible(false);
    logout();
  };

  return (
    <Surface style={[styles.surface, { backgroundColor: theme.colors.background, padding: 0 }]}> 
      <View style={{ flex: 1 }}>
        {/* Slim Red Accent Header */}
        <View style={{ backgroundColor: '#d32f2f', height: 6, width: '100%' }} />
        {/* Greeting and Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 4, marginRight: 12, borderWidth: 2, borderColor: '#1976d2' }}>
              <Image source={require('../assets/mcc.ac.png')} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="contain" />
            </View>
            <Text style={{ color: '#0D1B2A', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>Good evening, Admin</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 28,
              borderWidth: 1,
              borderColor: '#d32f2f',
              paddingVertical: 6,
              paddingHorizontal: 16,
              marginLeft: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 1,
              elevation: 1,
            }}
            onPress={() => setDialogVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Logout"
          >
            <MaterialCommunityIcons name="logout" size={24} color="#d32f2f" style={{ marginRight: 6 }} />
            <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
        {/* Main Content */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Stats Widgets - Outlined, Minimal */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
            <StatCard label="Users" value={0} color="#fff" icon="account-group-outline" borderColor="#1976d2" iconColor="#1976d2" />
            <StatCard label="Teachers" value={0} color="#fff" icon="school-outline" borderColor="#d32f2f" iconColor="#d32f2f" />
            <StatCard label="Students" value={0} color="#fff" icon="account-outline" borderColor="#1976d2" iconColor="#1976d2" />
            <StatCard label="Incidents" value={0} color="#fff" icon="alert-circle-outline" borderColor="#d32f2f" iconColor="#d32f2f" />
            <StatCard label="Merits" value={0} color="#fff" icon="star-outline" borderColor="#1976d2" iconColor="#1976d2" />
          </View>

          {/* Quick Actions - Outlined Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <ShortcutButton label="Log Incident" icon="plus-circle-outline" color="#d32f2f" outline onPress={() => {}} />
            <ShortcutButton label="Register User" icon="account-plus-outline" color="#1976d2" outline onPress={() => {}} />
            <ShortcutButton label="View Users" icon="account-search-outline" color="#1976d2" outline onPress={() => {}} />
          </View>

          {/* Recent Activity Section - Minimal, Outlined */}
          <View style={{ padding: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e3e7ef', marginBottom: 18 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#d32f2f', marginBottom: 8, letterSpacing: 0.5 }}>RECENT ACTIVITY</Text>
            <RecentActivity />
          </View>
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={handleDismiss}>
            <Dialog.Title>Logout</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to log out?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={handleDismiss}>Cancel</PaperButton>
              <PaperButton onPress={handleLogout}>Logout</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

});
