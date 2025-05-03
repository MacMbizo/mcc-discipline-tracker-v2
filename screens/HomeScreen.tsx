import React, { useState, useEffect, useRef } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton, Card, Avatar } from 'react-native-paper';
import { Image, Animated, Easing } from 'react-native';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HeatBar from '../components/HeatBar';

import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Import icons from Expo vector icons that match the design
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

function StatCard({ label, value, color, icon, gradientFrom, gradientTo }: { label: string; value: number; color: string; icon: string; gradientFrom?: string; gradientTo?: string }) {
  // Use gradient colors if provided, otherwise use the color prop
  const from = gradientFrom || (color === '#1976d2' ? '#1976d2' : color);
  const to = gradientTo || (color === '#1976d2' ? '#64b5f6' : color);
  
  return (
    <View style={{
      backgroundColor: from, // Fallback for when linear gradient isn't available
      borderRadius: 24, // More rounded corners like in the design
      paddingVertical: 16,
      paddingHorizontal: 10,
      minWidth: 90,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
      flex: 1,
      position: 'relative',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color="#fff" 
        style={{ position: 'absolute', top: 8, right: 8 }}
      />
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 24, marginTop: 3 }}>{value}</Text>
      <Text style={{ color: '#fff', fontSize: 14, marginTop: 2, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function ShortcutButton({ label, icon, color, onPress, outline = false }: { label: string; icon: string; color: string; onPress: () => void; outline?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <View style={{
        backgroundColor: color,
        borderRadius: 28, // More rounded for the modern look
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: color,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
      <Text style={{ color: '#0D47A1', fontWeight: '600', fontSize: 12 }}>{label}</Text>
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
      {activities.length === 0 ? (
        <View style={styles.emptyActivity}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#888" />
          <Text style={{ color: '#888', marginTop: 8 }}>No recent activity</Text>
        </View>
      ) : activities.map(act => (
        <Card
          key={act.id + act.type}
          style={styles.activityCard}
        >
          <View style={styles.activityItem}>
            <View style={[styles.activityIconContainer, { backgroundColor: act.type === 'incident' ? '#ffebee' : '#e8f5e9' }]}>
              <MaterialCommunityIcons 
                name={act.type === 'incident' ? 'alert-circle' : 'star'} 
                size={18} 
                color={act.type === 'incident' ? '#d32f2f' : '#388e3c'} 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{act.text}</Text>
              <Text style={styles.activityTime}>{act.time}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#bbb" />
          </View>
        </Card>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { logout, user } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [netHeat, setNetHeat] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ users: 0, teachers: 0, students: 0, incidents: 0, merits: 0 });
  
  // Animation values for cascading effect
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current; // For welcome message slide-in
  
  // Calculate heat score from incidents and merits
  useEffect(() => {
    async function fetchHeatScore() {
      try {
        if (!user) return;
        
        const incidentsSnap = await getDocs(query(collection(db, 'incidents'), where('studentId', '==', user.uid)));
        const meritsSnap = await getDocs(query(collection(db, 'merits'), where('studentId', '==', user.uid)));
        
        const totalMeritPoints = meritsSnap.docs.reduce((acc, doc) => {
          const points = doc.data().points || 0;
          return acc + points;
        }, 0);
        
        const totalSanctionPoints = incidentsSnap.docs.reduce((acc, doc) => {
          let points = 0;
          const sanctionValue = doc.data().sanctionValue;
          if (typeof sanctionValue === 'number') {
            points = sanctionValue;
          } else if (typeof sanctionValue === 'string') {
            const parsed = parseInt(sanctionValue, 10);
            if (!isNaN(parsed)) points = parsed;
          }
          return acc + points;
        }, 0);
        
        setNetHeat(totalMeritPoints - totalSanctionPoints);
      } catch (error) {
        console.error('Error fetching heat score:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHeatScore();
  }, [user]);

  // Fetch stats data for counts
  useEffect(() => {
    async function fetchStats() {
      try {
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
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  // Start animations
  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  const handleLogout = async () => {
    hideDialog();
    await logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderAdminContent = () => (
    <>
      <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <StatCard 
              label="Users" 
              value={counts.users} 
              color="#1976d2" 
              icon="account-group" 
              gradientFrom="#1976d2" 
              gradientTo="#64b5f6" 
            />
            <StatCard 
              label="Teachers" 
              value={counts.teachers} 
              color="#d32f2f" 
              icon="school" 
              gradientFrom="#d32f2f" 
              gradientTo="#ef5350" 
            />
            <StatCard 
              label="Students" 
              value={counts.students} 
              color="#1976d2" 
              icon="account" 
              gradientFrom="#1976d2" 
              gradientTo="#64b5f6" 
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StatCard 
              label="Incidents" 
              value={counts.incidents} 
              color="#d32f2f" 
              icon="alert" 
              gradientFrom="#d32f2f" 
              gradientTo="#ef5350" 
            />
            <StatCard 
              label="Merits" 
              value={counts.merits} 
              color="#388e3c" 
              icon="star" 
              gradientFrom="#388e3c" 
              gradientTo="#66bb6a" 
            />
          </View>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim2 }}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsContainer}>
          <ShortcutButton label="Add User" icon="account-plus" color="#1976d2" onPress={() => { /* Navigate to Add User */ }} />
          <ShortcutButton label="Log Incident" icon="alert-circle" color="#d32f2f" onPress={() => { /* Navigate to Incident Form */ }} />
          <ShortcutButton label="Award Merit" icon="star" color="#388e3c" onPress={() => { /* Navigate to Merit Form */ }} />
          <ShortcutButton label="Reports" icon="chart-bar" color="#ffa000" onPress={() => { /* Navigate to Reports */ }} />
        </ScrollView>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim3, marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RecentActivity />
      </Animated.View>
    </>
  );

  const renderTeacherContent = () => (
    <>
      <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <StatCard 
              label="Students" 
              value={counts.students} 
              color="#1976d2" 
              icon="account" 
              gradientFrom="#1976d2" 
              gradientTo="#64b5f6" 
            />
            <StatCard 
              label="Incidents" 
              value={counts.incidents} 
              color="#d32f2f" 
              icon="alert" 
              gradientFrom="#d32f2f" 
              gradientTo="#ef5350" 
            />
            <StatCard 
              label="Merits" 
              value={counts.merits} 
              color="#388e3c" 
              icon="star" 
              gradientFrom="#388e3c" 
              gradientTo="#66bb6a" 
            />
          </View>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim2 }}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsContainer}>
          <ShortcutButton label="Log Incident" icon="alert-circle" color="#d32f2f" onPress={() => { /* Navigate to Incident Form */ }} />
          <ShortcutButton label="Award Merit" icon="star" color="#388e3c" onPress={() => { /* Navigate to Merit Form */ }} />
          <ShortcutButton label="Search Student" icon="account-search" color="#1976d2" onPress={() => { /* Navigate to Student Search */ }} />
          <ShortcutButton label="View Logs" icon="clipboard-list" color="#757575" onPress={() => { /* Navigate to Logs */ }} />
        </ScrollView>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim3, marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RecentActivity />
      </Animated.View>
    </>
  );

  const renderStudentContent = () => (
    <>
      <Animated.View style={{ opacity: fadeAnim1, transform: [{ translateY: slideAnim }] }}>
        <Card style={styles.heatCard}>
          <Card.Title title="Discipline Score" titleStyle={styles.heatTitle} />
          <Card.Content>
            <HeatBar score={netHeat} />
            <Text style={styles.heatScoreText}>Net Score: {netHeat}</Text>
          </Card.Content>
        </Card>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim2 }}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsContainer}>
          <ShortcutButton label="My Profile" icon="account-circle" color="#1976d2" onPress={() => { /* Navigate to Profile */ }} />
          <ShortcutButton label="View Logs" icon="clipboard-list" color="#388e3c" onPress={() => { /* Navigate to Logs */ }} />
          {/* Add more student-specific links if needed */}
        </ScrollView>
      </Animated.View>
      {/* Add Recent Activity or other relevant sections for students */}
    </>
  );

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="menu" size={24} color="#1976d2" />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Home</Text>
          </View>
          <TouchableOpacity onPress={showDialog} style={styles.headerRight}>
            <MaterialCommunityIcons name="cog" size={24} color="#1976d2" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.greetingContainer}>
          <Animated.Text style={[styles.greeting, { transform: [{ translateY: slideAnim }] }]}>
            {getGreeting()},
          </Animated.Text>
          <Animated.Text style={[styles.userName, { transform: [{ translateY: slideAnim }] }]}>
            {user?.displayName || user?.email || 'User'}!
          </Animated.Text>
        </View>

        {loading ? (
          <Text>Loading dashboard...</Text>
        ) : (
          <>
            {user?.role === 'Admin' && renderAdminContent()}
            {user?.role === 'Teacher' && renderTeacherContent()}
            {user?.role === 'Student' && renderStudentContent()}
            {/* Fallback or default view if role is not defined or recognized */}
            {!user?.role && <Text>Loading user role...</Text>}
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="#0D47A1" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color="#90CAF9" />
          <Text style={[styles.navText, { color: '#90CAF9' }]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="theme-light-dark" size={24} color="#90CAF9" />
          <Text style={[styles.navText, { color: '#90CAF9' }]}>Theme</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={hideDialog}>Cancel</PaperButton>
            <PaperButton onPress={handleLogout}>Logout</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background for modern look
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 80, // Ensure space at the bottom for navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D47A1',
  },
  greetingContainer: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '400',
    color: '#0D47A1',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#0D47A1',
  },
  shortcutsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingLeft: 4,
    paddingRight: 16,
  },
  activityCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: '#f0f0f0',
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  activityIconContainer: {
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0D47A1',
  },
  activityTime: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 4,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  heatCard: {
    marginBottom: 32,
    elevation: 2,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  heatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  heatScoreText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#1976d2',
    marginTop: 24,
    fontSize: 18,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#0D47A1',
    fontWeight: '500',
  },
});
