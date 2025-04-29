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
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>Recent Activity</Text>
      {loading ? <ActivityIndicator /> : activities.length === 0 ? <Text>No recent activity.</Text> : (
        activities.map(act => (
          <View key={act.id + act.type} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10 }}>
            <MaterialCommunityIcons name={act.type === 'incident' ? 'alert-circle' : 'star'} size={26} color={act.type === 'incident' ? '#d32f2f' : '#388e3c'} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{act.text}</Text>
              <Text style={{ color: '#888', fontSize: 12 }}>{act.time}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
