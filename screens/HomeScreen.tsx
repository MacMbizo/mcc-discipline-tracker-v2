import React, { useState } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton } from 'react-native-paper';
import { Image } from 'react-native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <View style={{ backgroundColor: color, borderRadius: 12, padding: 14, minWidth: 80, alignItems: 'center', marginHorizontal: 3, flex: 1 }}>
      <MaterialCommunityIcons name={icon} size={28} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{value}</Text>
      <Text style={{ color: '#fff', fontSize: 13, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ShortcutButton({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <View style={{ backgroundColor: color, borderRadius: 32, padding: 12, marginBottom: 6 }}>
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
      </View>
      <Text style={{ color, fontWeight: 'bold', fontSize: 14 }}>{label}</Text>
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
        {/* Custom Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d32f2f', height: 90, width: '100%', alignSelf: 'stretch', paddingHorizontal: 16, paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 4, marginRight: 12 }}>
              <Image source={require('../assets/mcc.ac.png')} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="contain" />
            </View>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: 1 }}>MCC Dashboard</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 28,
              paddingVertical: 6,
              paddingHorizontal: 18,
              marginLeft: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={() => setDialogVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Logout"
          >
            <MaterialCommunityIcons name="logout" size={26} color="#d32f2f" style={{ marginRight: 8 }} />
            <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View>
        {/* Main Content */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Stats Cards */}
          <StatsRow />

          {/* Quick Actions Grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
            <ShortcutButton label="Log Incident" icon="plus-circle" color="#d32f2f" onPress={() => {}} />
            <ShortcutButton label="Register User" icon="account-plus" color="#1976d2" onPress={() => {}} />
            <ShortcutButton label="View Users" icon="account-search" color="#388e3c" onPress={() => {}} />
          </View>

          {/* Recent Activity Section */}
          <Surface style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, elevation: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#d32f2f', marginBottom: 8 }}>Recent Activity</Text>
            <RecentActivity />
          </Surface>
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
