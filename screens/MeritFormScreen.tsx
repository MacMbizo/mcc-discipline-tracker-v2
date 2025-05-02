import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { Text, Button, TextInput, HelperText, Menu, ActivityIndicator, List } from 'react-native-paper';
import HeatBar from '../components/HeatBar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSnackbar } from '../components/GlobalSnackbar';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

interface Student {
  uid: string;
  name: string;
  class: string;
  studentId: string;
}

interface MeritType {
  id: string;
  name: string;
  description?: string;
  points: number;
}

export default function MeritFormScreen() {
  // --- Collapsible Student Summary State ---
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [merits, setMerits] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch incidents and merits for student summary
  useEffect(() => {
    if (!student) return;
    let didCancel = false;
    async function fetchSummaryRecords() {
      setSummaryLoading(true);
      try {
        const incSnap = await getDocs(collection(db, 'incidents'));
        const meritSnap = await getDocs(collection(db, 'merits'));
        if (!didCancel) {
          setIncidents(incSnap.docs.filter(doc => doc.data().studentId === student.uid).map(doc => doc.data()));
          setMerits(meritSnap.docs.filter(doc => doc.data().studentId === student.uid).map(doc => doc.data()));
        }
      } catch (e) {
        if (!didCancel) {
          setIncidents([]);
          setMerits([]);
        }
      }
      setSummaryLoading(false);
    }
    fetchSummaryRecords();
    return () => { didCancel = true; };
  }, [student]);

  // Calculate net heat score: sum of merit points - sum of sanction points
  const totalMeritPoints = merits.reduce((acc, m) => acc + (typeof m.points === 'number' ? m.points : 0), 0);
  const totalSanctionPoints = incidents.reduce((acc, inc) => {
    // Sanction value may be -1, -2, etc. or string; try to parse
    let points = 0;
    if (typeof inc.sanctionValue === 'number') {
      points = inc.sanctionValue;
    } else if (typeof inc.sanctionValue === 'string') {
      const parsed = parseInt(inc.sanctionValue, 10);
      if (!isNaN(parsed)) points = parsed;
    }
    return acc + points;
  }, 0);
  const netHeat = totalMeritPoints - totalSanctionPoints;
  const maxHeat = 10;
  const heatPercent = Math.min(1, Math.abs(netHeat) / maxHeat);
  const heatBarColor = netHeat >= 0 ? '#1976d2' : '#d32f2f';
  const heatLabel = `Heat: ${netHeat >= 0 ? '+' : ''}${netHeat} / ${maxHeat}`;

  // --- Heat Bar Component will handle animations ---

  // --- Highlight recent activity ---
  const [highlightedMeritIdx, setHighlightedMeritIdx] = useState<number | null>(null);
  const [highlightedIncidentIdx, setHighlightedIncidentIdx] = useState<number | null>(null);
  useEffect(() => {
    if (highlightedMeritIdx !== null) {
      const t = setTimeout(() => setHighlightedMeritIdx(null), 1200);
      return () => clearTimeout(t);
    }
  }, [highlightedMeritIdx]);
  useEffect(() => {
    if (highlightedIncidentIdx !== null) {
      const t = setTimeout(() => setHighlightedIncidentIdx(null), 1200);
      return () => clearTimeout(t);
    }
  }, [highlightedIncidentIdx]);

  // Auto-expand summary if user pauses on form for 3 seconds
  useEffect(() => {
    if (summaryCollapsed) {
      const timer = setTimeout(() => setSummaryCollapsed(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [summaryCollapsed]);

  console.log('MeritFormScreen route.params:', route?.params);

  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showSnackbar } = useSnackbar();

  const [student, setStudent] = useState<Student | null>(route?.params?.student || route?.params?.selectedStudent || null);
  useEffect(() => { console.log('MeritFormScreen student state:', student); }, [student]);
  const [meritTypes, setMeritTypes] = useState<MeritType[]>([]);
  const [selectedMerit, setSelectedMerit] = useState<MeritType | null>(null);
  const [meritMenuVisible, setMeritMenuVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch merit types
  useEffect(() => {
    async function fetchMeritTypes() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'merit_types'));
        const list: MeritType[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as MeritType);
        });
        // Sort by bronze, silver, gold order
        const order = ['bronze', 'silver', 'gold'];
        list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        setMeritTypes(list);
      } catch (e) {
        setMeritTypes([]);
      }
      setLoading(false);
    }
    fetchMeritTypes();
  }, []);

  // Listen for student param changes from navigation
  useEffect(() => {
    if (route.params?.student) {
      setStudent(route.params.student);
      navigation.setParams({ student: undefined });
    } else if (route.params?.selectedStudent) {
      setStudent(route.params.selectedStudent);
      navigation.setParams({ selectedStudent: undefined });
    }
  }, [route.params?.student, route.params?.selectedStudent, navigation]);

  const handleSelectStudent = () => {
    navigation.getParent()?.navigate('StudentSearchScreen', { returnScreen: 'MeritFormScreen' });
  };


  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    if (!student || !selectedMerit) {
      setError('Please fill all required fields.');
      if (!student) {
        console.error('MeritFormScreen: No student selected when submitting.');
      }
      setSubmitting(false);
      return;
    }
    try {
      await addDoc(collection(db, 'merits'), {
        studentId: student.uid,
        studentName: student.name,
        studentClass: student.class,
        meritTypeId: selectedMerit.id,
        meritTypeName: selectedMerit.name,
        points: selectedMerit.points,
        description,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || null,
        createdByName: user?.displayName || user?.uid || '',
        createdByRole: user?.role || '',
      });
      setSubmitting(false);
      // Highlight the most recent merit in summary
      setHighlightedMeritIdx(0);
      // Show snackbar with quick actions
      showSnackbar(
        'Merit submitted!',
        5000,
        [
          {
            label: 'Log Another',
            onPress: () => {
              setDescription('');
              setSelectedMerit(null);
              // Optionally reset student if desired
            },
          },
          {
            label: 'Return to Dashboard',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
      // Optionally refresh summary data here if needed
    } catch (e) {
      setError('Failed to submit merit.');
      setSubmitting(false);
      showSnackbar('Failed to submit merit.', 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Collapsible Student Summary */}
        {student && (
          <View style={[styles.card, { marginBottom: 18 }]}>
            <Button
              mode="text"
              icon={summaryCollapsed ? 'chevron-down' : 'chevron-up'}
              onPress={() => setSummaryCollapsed(c => !c)}
              style={{ alignSelf: 'flex-end', marginBottom: summaryCollapsed ? 0 : 8 }}
              compact
            >
              {summaryCollapsed ? 'Show Student Summary' : 'Hide Student Summary'}
            </Button>
            <Button mode="text" onPress={handleSelectStudent} style={styles.studentItem}>Change</Button>
          </View>
        )}
        {!student && (
          <Button mode="outlined" onPress={handleSelectStudent} style={styles.selectButton} icon="account-search">
            Select Student
          </Button>
        )}
        {/* Merit Type Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Merit Tier</Text>
          {meritTypes.length === 0 && !loading ? (
            <HelperText type="error">No merit tiers found. Please contact admin.</HelperText>
          ) : (
            <Menu
              visible={meritMenuVisible}
              onDismiss={() => setMeritMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMeritMenuVisible(true)}
                  style={{ marginBottom: 12 }}
                  icon={selectedMerit ? 'star' : 'star-outline'}
                  contentStyle={{ flexDirection: 'row-reverse' }}
                  labelStyle={{ color: selectedMerit ? (selectedMerit.id === 'gold' ? '#ffd700' : selectedMerit.id === 'silver' ? '#c0c0c0' : '#cd7f32') : undefined }}
                >
                  {selectedMerit ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <List.Icon
                        icon="star"
                        color={selectedMerit.id === 'gold' ? '#ffd700' : selectedMerit.id === 'silver' ? '#c0c0c0' : '#cd7f32'}
                        style={{ margin: 0, marginRight: 6 }}
                      />
                      <Text style={{ fontWeight: 'bold' }}>{selectedMerit.name} ({selectedMerit.points}{selectedMerit.points === 1 ? 'pt' : 'pts'})</Text>
                    </View>
                  ) : 'Select Merit Tier'}
                </Button>
              }
            >
              {meritTypes.map(m => (
                <Menu.Item
                  key={m.id}
                  onPress={() => {
                    setSelectedMerit(m);
                    setMeritMenuVisible(false);
                  }}
                  title={(
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <List.Icon
                        icon="star"
                        color={m.id === 'gold' ? '#ffd700' : m.id === 'silver' ? '#c0c0c0' : '#cd7f32'}
                        style={{ margin: 0, marginRight: 6 }}
                      />
                      <Text style={{ fontWeight: selectedMerit?.id === m.id ? 'bold' : 'normal' }}>
                        {m.name} ({m.points}{m.points === 1 ? 'pt' : 'pts'})
                      </Text>
                    </View>
                  )}
                />
              ))}
            </Menu>
          )}
          {selectedMerit && selectedMerit.description && (
            <HelperText type="info">{selectedMerit.description}</HelperText>
          )}
        </View>

        {/* Points Display */}
        {selectedMerit && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Points</Text>
            <Text style={{ fontSize: 20, color: '#1976d2', fontWeight: 'bold', marginBottom: 4 }}>{selectedMerit.points} pts</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Description</Text>
          <TextInput
            mode="outlined"
            label="Reason for merit (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.notesInput}
          />
        </View>

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || loading || !student || !selectedMerit}
          style={styles.containedButton}
        >
          Submit Merit
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 4,
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 0.2,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e3e7ef',
    padding: 14,
    marginBottom: 18,
    shadowColor: '#1976d2',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  outlinedButton: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  containedButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    marginTop: 12,
  },
  selectButton: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  studentItem: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  notesInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#e3e7ef',
    borderWidth: 2,
  },
});
