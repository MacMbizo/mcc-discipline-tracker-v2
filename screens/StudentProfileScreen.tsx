import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, List, Button, ProgressBar } from 'react-native-paper';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface Student {
  uid: string;
  name: string;
  class: string;
  studentId: string;
}

export default function StudentProfileScreen({ route, navigation }: any) {
  console.log('StudentProfileScreen route.params:', route?.params);
  
  const student: Student | undefined = route?.params?.student;
  const [incidents, setIncidents] = useState<any[]>([]);
  const [merits, setMerits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge" style={{ color: '#d32f2f', marginBottom: 12 }}>No student selected</Text>
        <Text style={{ color: '#888', marginBottom: 20 }}>Please select a student from the search screen.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('StudentSearchScreen', { returnScreen: 'StudentProfileScreen' })}>
          Go to Student Search
        </Button>
      </View>
    );
  }

  useEffect(() => {
    let didCancel = false;
    let timeout: NodeJS.Timeout;
    async function fetchRecords() {
      console.log('Fetching records for student:', student);

      setLoading(true);
      try {
        if (!student || !student.uid) {
          console.error('No valid student provided to profile screen.');
          setLoading(false);
          return;
        }
        const incSnap = await getDocs(query(collection(db, 'incidents'), where('studentId', '==', student.uid), orderBy('createdAt', 'desc'), limit(20)));
        const meritSnap = await getDocs(query(collection(db, 'merits'), where('studentId', '==', student.uid), orderBy('createdAt', 'desc'), limit(20)));
        if (!didCancel) {
          setIncidents(incSnap.docs.map(doc => doc.data()));
          setMerits(meritSnap.docs.map(doc => doc.data()));
          setLoading(false);
          console.log('Fetched incidents:', incSnap.docs.length, 'Fetched merits:', meritSnap.docs.length);
        }
      } catch (e) {
        console.error('Error fetching records:', e);
        if (!didCancel) {
          setIncidents([]);
          setMerits([]);
          setLoading(false);
        }
      }
    }
    fetchRecords();
    // Fallback timeout in case Firestore hangs
    timeout = setTimeout(() => {
      if (!didCancel) setLoading(false);
    }, 7000);
    return () => {
      didCancel = true;
      clearTimeout(timeout);
    };
  }, [student]);

  // Calculate net heat score: merits - incidents
  const netHeat = merits.length - incidents.length;
  const maxHeat = 10;
  const heatPercent = Math.min(1, Math.abs(netHeat) / maxHeat);
  const heatBarColor = netHeat >= 0 ? '#1976d2' : '#d32f2f';
  const heatLabel = `Heat: ${netHeat >= 0 ? '+' : ''}${netHeat} / ${maxHeat}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Button
          mode="outlined"
          icon="alert-circle-outline"
          style={{ marginRight: 8 }}
          onPress={() => navigation.navigate('IncidentFormScreen', { student })}
        >
          Log Incident
        </Button>
        <Button
          mode="contained"
          icon="star-outline"
          onPress={() => navigation.navigate('MeritFormScreen', { student })}
        >
          Log Merit
        </Button>
      </View>
      <Text variant="titleLarge" style={styles.header}>{student?.name ?? ''} ({student?.studentId ?? ''})</Text>
      <Text style={styles.subheader}>{student?.class ?? ''}</Text>
      <View style={styles.heatBarContainer}>
        <Text style={styles.heatLabel}>Behavior Heat Bar</Text>
        <ProgressBar progress={heatPercent} color={heatBarColor} style={styles.heatBar} />
        <Text style={[styles.heatScore, { color: heatBarColor, fontWeight: 'bold' }]}>{heatLabel}</Text>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <>
          <Text style={styles.sectionHeader}>Recent Incidents</Text>
          {incidents.length === 0 ? <Text style={styles.emptyText}>No incidents recorded.</Text> : (
            incidents.map((inc, idx) => (
              <List.Item key={idx} title={inc.misdemeanorName || 'Incident'} description={inc.notes || ''} left={props => <List.Icon {...props} icon="alert-circle-outline" color="#d32f2f" />} right={props => <Text style={styles.time}>{inc.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
            ))
          )}
          <Text style={styles.sectionHeader}>Recent Merits</Text>
          {merits.length === 0 ? <Text style={styles.emptyText}>No merits awarded.</Text> : (
            merits.map((mer, idx) => (
              <List.Item key={idx} title={mer.meritTypeName || 'Merit'} description={mer.description || ''} left={props => <List.Icon {...props} icon="star-outline" color="#1976d2" />} right={props => <Text style={styles.time}>{mer.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 4,
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 22,
  },
  subheader: {
    color: '#888',
    marginBottom: 16,
    fontSize: 15,
  },
  heatBarContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  heatLabel: {
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  heatBar: {
    width: '90%',
    height: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  heatScore: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionHeader: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
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
