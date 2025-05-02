import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, List, Button, Divider } from 'react-native-paper';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function AdminDashboardScreen() {
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [recentMerits, setRecentMerits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const incSnap = await getDocs(query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(10)));
      const meritSnap = await getDocs(query(collection(db, 'merits'), orderBy('createdAt', 'desc'), limit(10)));
      setRecentIncidents(incSnap.docs.map(doc => doc.data()));
      setRecentMerits(meritSnap.docs.map(doc => doc.data()));
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.header}>Admin Analytics Dashboard</Text>
      {loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : (
        <>
          <Text style={styles.sectionHeader}>Recent Incidents</Text>
          {recentIncidents.length === 0 ? <Text style={styles.emptyText}>No incidents found.</Text> : (
            recentIncidents.map((inc, idx) => (
              <List.Item key={idx} title={inc.misdemeanorName || 'Incident'} description={inc.notes || ''} left={props => <List.Icon {...props} icon="alert-circle-outline" color="#d32f2f" />} right={props => <Text style={styles.time}>{inc.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
            ))
          )}
          <Divider style={{ marginVertical: 18 }} />
          <Text style={styles.sectionHeader}>Recent Merits</Text>
          {recentMerits.length === 0 ? <Text style={styles.emptyText}>No merits found.</Text> : (
            recentMerits.map((mer, idx) => (
              <List.Item key={idx} title={mer.meritTypeName || 'Merit'} description={mer.description || ''} left={props => <List.Icon {...props} icon="star-outline" color="#1976d2" />} right={props => <Text style={styles.time}>{mer.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
            ))
          )}
        </>
      )}
      {/* TODO: Add analytics charts and user management */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sectionHeader: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e3e7ef',
    marginBottom: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  time: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
  },
});
