import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, useTheme, Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebaseApp from '../services/firebase';

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
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d32f2f', height: 80, width: '100%', alignSelf: 'stretch', paddingHorizontal: 24, paddingTop: 16 }}>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>Dashboard</Text>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, paddingVertical: 6, paddingHorizontal: 18 }} onPress={() => setDialogVisible(true)}>
          <MaterialCommunityIcons name="logout" size={26} color="#d32f2f" style={{ marginRight: 8 }} />
          <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.welcome}>
            Welcome, {displayName || user?.email || 'Teacher'}
          </Text>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Card.Title title="Incidents Today" />
              <Card.Content>
                {loading ? <ActivityIndicator /> : <Text style={styles.statNum}>{incidentCount}</Text>}
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Title title="Merits Today" />
              <Card.Content>
                {loading ? <ActivityIndicator /> : <Text style={styles.statNum}>{meritCount}</Text>}
              </Card.Content>
            </Card>
          </View>
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              icon="plus"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('IncidentFormScreen')}
            >
              Log Incident
            </Button>
            <Button
              mode="contained"
              icon="star"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('RecentLogsScreen')}
            >
              View Recent Activity
            </Button>
          </View>
        </ScrollView>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fafafa',
    flexGrow: 1,
    alignItems: 'stretch',
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#d32f2f',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  statNum: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 6,
  },
});
