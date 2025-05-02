import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function RecentLogsScreen() {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      const recentIncidents = await getDocs(query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(20)));
      const recentMerits = await getDocs(query(collection(db, 'merits'), orderBy('createdAt', 'desc'), limit(20)));
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
      setActivities(acts.slice(0, 20));
      setLoading(false);
    }
    fetchActivity();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>Recent Activity</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color="#1976d2" />
      ) : activities.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <MaterialCommunityIcons name="history" size={36} color="#d32f2f" style={{ marginBottom: 8 }} />
          <Text style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>No recent activity.</Text>
        </View>
      ) : (
        activities.map(act => (
          <View key={act.id + act.type} style={[styles.logCard, { borderColor: act.type === 'incident' ? '#d32f2f' : '#1976d2' }]}> 
            <MaterialCommunityIcons
              name={act.type === 'incident' ? 'alert-circle-outline' : 'star-outline'}
              size={28}
              color={act.type === 'incident' ? '#d32f2f' : '#1976d2'}
              style={{ marginRight: 14 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#0D1B2A' }}>{act.text}</Text>
              <Text style={{ color: '#888', fontSize: 12 }}>{act.time}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 18,
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 0.2,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#1976d2',
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9fc',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e3e7ef',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginTop: 44,
    marginHorizontal: 12,
  },
});
