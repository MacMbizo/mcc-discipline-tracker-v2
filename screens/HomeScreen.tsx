import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton, Card, Avatar } from 'react-native-paper';
import { Image, Animated, Easing, RefreshControl } from 'react-native';
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



const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const theme = useTheme();
  const { user } = useAuth(); // Use the hook to get the user object
  const [stats, setStats] = useState({ totalIncidents: 0, meritsAwarded: 0, uniqueStudents: 0 });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [merits, setMerits] = useState<Merit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const incidentsQuery = query(collection(db, 'incidents'), where('teacherId', '==', user.uid));
      const meritsQuery = query(collection(db, 'merits'), where('teacherId', '==', user.uid));

      const [incidentsSnapshot, meritsSnapshot] = await Promise.all([
        getDocs(incidentsQuery),
        getDocs(meritsQuery),
      ]);

      const incidentsData = incidentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Incident[];
      const meritsData = meritsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Merit[];

      setIncidents(incidentsData);
      setMerits(meritsData);
    } catch (error) {
      console.error("Error fetching data: ", error);
      // Handle error appropriately, maybe show a snackbar
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  

  // const currentUser = auth.currentUser; // Remove this line

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
        />
      }
    >
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#FFA726', '#FB8C00']} // Example gradient colors
              style={styles.cardGradient}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <Avatar.Icon size={40} icon="alert-circle-outline" style={styles.cardIcon} />
                  <View>
                    <Title style={styles.cardTitle}>Total Incidents</Title>
                    <Paragraph style={styles.cardValue}>{stats.totalIncidents}</Paragraph>
                  </View>
                </Card.Content>
              </Card>
            </LinearGradient>

            <LinearGradient
              colors={['#66BB6A', '#4CAF50']} // Example gradient colors
              style={styles.cardGradient}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <Avatar.Icon size={40} icon="star-circle-outline" style={styles.cardIcon} />
                  <View>
                    <Title style={styles.cardTitle}>Merits Awarded</Title>
                    <Paragraph style={styles.cardValue}>{stats.meritsAwarded}</Paragraph>
                  </View>
                </Card.Content>
              </Card>
            </LinearGradient>

            <LinearGradient
              colors={['#42A5F5', '#2196F3']} // Example gradient colors
              style={styles.cardGradient}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <Avatar.Icon size={40} icon="account-group-outline" style={styles.cardIcon} />
                  <View>
                    <Title style={styles.cardTitle}>Students Involved</Title>
                    <Paragraph style={styles.cardValue}>{stats.uniqueStudents}</Paragraph>
                  </View>
                </Card.Content>
              </Card>
            </LinearGradient>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              icon="plus-circle-outline"
              mode="contained"
              onPress={() => navigation.navigate('CreateRecord')}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]} // Use theme color
              labelStyle={styles.buttonLabel}
            >
              New Incident
            </Button>
            <Button
              icon="star-plus-outline"
              mode="contained"
              onPress={() => navigation.navigate('CreateMerit')}
              style={[styles.actionButton, { backgroundColor: theme.colors.accent }]} // Use theme color
              labelStyle={styles.buttonLabel}
            >
              Award Merit
            </Button>
          </View>

          {/* Add other sections like Recent Activity if needed */}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5', // Lighter background
  },
  loader: {
    marginTop: 50,
  },
  statsContainer: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
  },
  cardGradient: {
    borderRadius: 12, // Match card's border radius
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: 'transparent', // Make card background transparent to show gradient
    // borderRadius: 12, // Removed as it's handled by LinearGradient
    // marginBottom: 15,
    // elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // Increased padding
    paddingHorizontal: 15,
  },
  cardIcon: {
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly transparent white background for icon
  },
  cardTitle: {
    fontSize: 16, // Slightly smaller title
    // fontWeight: 'bold',
    color: '#fff', // White text for contrast on gradient
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // White text
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff', // White background for action area
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20, // More rounded buttons
    paddingVertical: 8,
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
