import React, { useState, useEffect, useRef } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton, Card } from 'react-native-paper';
import { Image, Animated, Easing } from 'react-native';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HeatBar from '../components/HeatBar';

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
      {activities.length === 0 ? (
        <View style={styles.emptyActivity}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#888" />
          <Text style={{ color: '#888', marginTop: 8 }}>No recent activity</Text>
        </View>
      ) : activities.map(act => (
        <View key={act.id + act.type} style={styles.activityItem}>
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
        </View>
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
  
  // Animation values for cascading effect
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  
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
  
  // Start cascading animations when component mounts
  useEffect(() => {
    const startAnimations = () => {
      Animated.sequence([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim3, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ]).start();
    };
    
    startAnimations();
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

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
        {/* Header with Logo, Greeting and Logout */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/mcc.ac.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello, {user?.displayName?.split(' ')[0] || 'User'}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setDialogVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="Logout"
            >
              <MaterialCommunityIcons name="logout" size={20} color="#d32f2f" style={{ marginRight: 6 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Main Content - Scrollable */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          
          {/* Stats Widgets - First Animated Card */}
          <Animated.View style={{
            opacity: fadeAnim1,
            transform: [{ translateY: fadeAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}],
            marginTop: 16
          }}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>School Statistics</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ width: '48%', marginBottom: 8, flexDirection: 'row' }}>
                    <StatCard label="Users" value={0} color="#fff" icon="account-group-outline" borderColor="#1976d2" iconColor="#1976d2" />
                    <StatCard label="Teachers" value={0} color="#fff" icon="school-outline" borderColor="#d32f2f" iconColor="#d32f2f" />
                  </View>
                  <View style={{ width: '48%', marginBottom: 8, flexDirection: 'row' }}>
                    <StatCard label="Students" value={0} color="#fff" icon="account-outline" borderColor="#1976d2" iconColor="#1976d2" />
                    <StatCard label="Incidents" value={0} color="#fff" icon="alert-circle-outline" borderColor="#d32f2f" iconColor="#d32f2f" />
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Quick Actions - Second Animated Card */}
          <Animated.View style={{
            opacity: fadeAnim2,
            transform: [{ translateY: fadeAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}],
            marginTop: 16
          }}>
            <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#1976d2' }]}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#1976d2" />
                  <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Quick Actions</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingVertical: 8 }}>
                  <ShortcutButton 
                    label="Log Incident" 
                    icon="clipboard-plus-outline" 
                    color="#d32f2f" 
                    outline 
                    onPress={() => {}} 
                  />
                  <ShortcutButton 
                    label="Award Merit" 
                    icon="medal-outline" 
                    color="#1976d2" 
                    outline 
                    onPress={() => {}} 
                  />
                  <ShortcutButton 
                    label="View Students" 
                    icon="account-search-outline" 
                    color="#388e3c" 
                    outline 
                    onPress={() => {}} 
                  />
                  <ShortcutButton 
                    label="Reports" 
                    icon="chart-bar" 
                    color="#f57c00" 
                    outline 
                    onPress={() => {}} 
                  />
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Recent Activity Section - Third Animated Card */}
          <Animated.View style={{
            opacity: fadeAnim3,
            transform: [{ translateY: fadeAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}],
            marginTop: 16,
            marginBottom: 16
          }}>
            <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#d32f2f' }]}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <MaterialCommunityIcons name="clock-outline" size={22} color="#d32f2f" />
                  <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Recent Activity</Text>
                </View>
                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 }}>
                  <RecentActivity />
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>
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
    padding: 0,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 3,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  greetingContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  greetingText: {
    color: '#0D1B2A',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d32f2f',
    paddingVertical: 5,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e3e7ef',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
