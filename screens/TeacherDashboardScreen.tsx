import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, ActivityIndicator, useTheme, Dialog, Portal, Button as PaperButton, Surface, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import firebaseApp from '../services/firebase';
import { StatusBar } from 'expo-status-bar';

const db = getFirestore(firebaseApp);

export default function TeacherDashboardScreen() {
  const { user, logout } = useAuth();
  // TODO: Replace 'any' with proper navigation type if available
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [incidentCount, setIncidentCount] = useState(0);
  const [meritCount, setMeritCount] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Fetch teacher's display name from Firestore
  useEffect(() => {
    async function fetchDisplayName() {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || data.name || null);
        } else {
          setDisplayName(null);
        }
      } catch {
        setDisplayName(null);
      }
    }
    fetchDisplayName();
  }, [user]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = Timestamp.fromDate(today);
        const incidentsQuery = query(
          collection(db, 'incidents'),
          where('teacherId', '==', user?.uid),
          where('createdAt', '>=', startOfDay)
        );
        const incidentsSnap = await getDocs(incidentsQuery);
        setIncidentCount(incidentsSnap.size);
        const meritsQuery = query(
          collection(db, 'merits'),
          where('teacherId', '==', user?.uid),
          where('createdAt', '>=', startOfDay)
        );
        const meritsSnap = await getDocs(meritsQuery);
        setMeritCount(meritsSnap.size);
      } catch (e) {
        setIncidentCount(0);
        setMeritCount(0);
      }
      setLoading(false);
    }
    if (user?.uid) fetchStats();
  }, [user]);

  const handleDismiss = () => setDialogVisible(false);
  const handleLogout = () => {
    setDialogVisible(false);
    logout();
  };

  // TODO: Implement role-based routing in AppNavigator for admin/teacher separation

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      {/* Custom Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../assets/mcc.ac.png')} 
              style={styles.headerLogo} 
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => setDialogVisible(true)}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </Surface>
      
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {displayName || 'Teacher'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCardsContainer}>
          <Card style={[styles.statsCard, styles.redCard]}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#fff" />
              <Text style={styles.statsCardValue}>{loading ? '...' : incidentCount}</Text>
              <Text style={styles.statsCardLabel}>Today's Incidents</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statsCard, styles.blueCard]}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons name="star-outline" size={32} color="#fff" />
              <Text style={styles.statsCardValue}>{loading ? '...' : meritCount}</Text>
              <Text style={styles.statsCardLabel}>Today's Merits</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statsCard, styles.whiteCard]}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons name="account-group-outline" size={32} color="#212121" />
              <Text style={[styles.statsCardValue, { color: '#212121' }]}>{loading ? '...' : totalStudents}</Text>
              <Text style={[styles.statsCardLabel, { color: '#212121' }]}>Total Students</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsRow}>
            <Button 
              mode="contained" 
              icon="alert-circle-outline"
              style={[styles.actionButton, { backgroundColor: '#d32f2f' }]}
              onPress={() => navigation.navigate('LogIncident')}
            >
              Log Incident
            </Button>
            <Button 
              mode="contained" 
              icon="star-outline"
              style={[styles.actionButton, { backgroundColor: '#1976d2' }]}
              onPress={() => navigation.navigate('LogMerit')}
            >
              Log Merit
            </Button>
          </View>
          <View style={styles.actionButtonsRow}>
            <Button 
              mode="outlined" 
              icon="magnify"
              style={styles.actionButton}
              onPress={() => navigation.navigate('StudentSearchScreen')}
            >
              Search Students
            </Button>
            <Button 
              mode="outlined" 
              icon="clock-outline"
              style={styles.actionButton}
              onPress={() => navigation.navigate('RecentLogsScreen')}
            >
              Recent Activity
            </Button>
          </View>
        </View>
        
        {/* Recent Students */}
        <View style={styles.recentStudentsContainer}>
          <Text style={styles.sectionTitle}>Recent Student Activity</Text>
          {recentStudents.length === 0 ? (
            <Text style={styles.emptyText}>No recent student activity</Text>
          ) : (
            recentStudents.map((student, index) => (
              <Card 
                key={index} 
                style={styles.studentCard}
                onPress={() => navigation.navigate('StudentProfileScreen', { student: { uid: student.studentId, name: student.name, class: student.class, studentId: student.studentId } })}
              >
                <Card.Content style={styles.studentCardContent}>
                  <View style={styles.studentInfo}>
                    <Avatar.Text 
                      size={40} 
                      label={student.name.split(' ').map(n => n[0]).join('')} 
                      style={{ backgroundColor: student.netScore >= 0 ? '#1976d2' : '#d32f2f' }}
                    />
                    <View style={styles.studentTextInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentClass}>{student.class} • ID: {student.studentId}</Text>
                    </View>
                  </View>
                  <View style={styles.studentStatsContainer}>
                    <View style={styles.studentStatItem}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#d32f2f" />
                      <Text style={styles.studentStatValue}>{student.incidentCount}</Text>
                    </View>
                    <View style={styles.studentStatItem}>
                      <MaterialCommunityIcons name="star-outline" size={16} color="#1976d2" />
                      <Text style={styles.studentStatValue}>{student.meritCount}</Text>
                    </View>
                  </View>
                  <HeatBar 
                    value={student.netScore} 
                    maxValue={10} 
                    label="" 
                    showLabel={false}
                    height={8}
                    style={styles.studentHeatBar}
                  />
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#d32f2f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48, // Adjust for status bar
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  dateText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  // New modern stats cards
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statsCard: {
    width: '31%',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 8,
  },
  redCard: {
    backgroundColor: '#d32f2f',
  },
  blueCard: {
    backgroundColor: '#1976d2',
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statsCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 4,
  },
  statsCardLabel: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  // Recent students section
  recentStudentsContainer: {
    marginBottom: 24,
  },
  emptyText: {
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  studentCardContent: {
    padding: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  studentClass: {
    fontSize: 12,
    color: '#757575',
  },
  studentStatsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  studentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  studentStatValue: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  studentHeatBar: {
    marginTop: 4,
  },
});
