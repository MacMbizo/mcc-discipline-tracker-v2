import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, HelperText, Menu, ActivityIndicator, List, Avatar, ProgressBar } from 'react-native-paper';
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

interface Misdemeanor {
  id: string;
  name: string;
  description?: string;
  sanctions?: string[] | { [key: string]: string };
}

type LocationType = 'Hostel' | 'Main School' | 'Both';

export default function IncidentFormScreen() {
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

  // Auto-expand summary if user pauses on form for 3 seconds
  useEffect(() => {
    if (summaryCollapsed) {
      const timer = setTimeout(() => setSummaryCollapsed(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [summaryCollapsed]);

  console.log('IncidentFormScreen route.params:', route?.params);

  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showSnackbar } = useSnackbar();

  const [student, setStudent] = useState<Student | null>(route?.params?.student || route?.params?.selectedStudent || null);
  useEffect(() => { console.log('IncidentFormScreen student state:', student); }, [student]);

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

  const [location, setLocation] = useState<LocationType | null>(null);
  const [misdemeanors, setMisdemeanors] = useState<Misdemeanor[]>([]);
  const [selectedMisdemeanor, setSelectedMisdemeanor] = useState<Misdemeanor | null>(null);
  const [misdemeanorMenuVisible, setMisdemeanorMenuVisible] = useState(false);
  const [sanctionMenuVisible, setSanctionMenuVisible] = useState(false);
  const [sanction, setSanction] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch misdemeanors
  useEffect(() => {
    async function fetchMisdemeanors() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'misdemeanors'));
        const list: Misdemeanor[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Misdemeanor);
        });
        setMisdemeanors(list);
      } catch (e) {
        console.error('Error fetching misdemeanors:', e);
        setMisdemeanors([]);
      }
      setLoading(false);
    }

    fetchMisdemeanors();
  }, []);

  // Filter misdemeanors by location
  const filteredMisdemeanors = React.useMemo(() => {
    if (!location) return [];
    return misdemeanors.filter(m => {
      const loc = (m as any).Location || (m as any).location || '';
      if (location === 'Both') return true;
      if (typeof loc === 'string') {
        return loc.toLowerCase() === location.toLowerCase() || loc.toLowerCase() === 'both';
      }
      return false;
    });
  }, [misdemeanors, location]);

  // Handle student selection callback
  const handleSelectStudent = () => {
    navigation.navigate('StudentSearchScreen', { returnScreen: 'IncidentFormScreen' });
  };


  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    if (!student || !selectedMisdemeanor || !selectedSanction) {
      setError('Please fill all required fields.');
      setSubmitting(false);
      return;
    }
    try {
      await addDoc(collection(db, 'incidents'), {
        studentId: student.uid,
        studentName: student.name,
        studentClass: student.class,
        misdemeanorId: selectedMisdemeanor.id,
        misdemeanorName: selectedMisdemeanor.name,
        sanctionKey: selectedSanction.key,
        sanctionValue: selectedSanction.value,
        notes,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || null, // Track the teacher/admin who created the incident
        createdByName: user?.displayName || user?.uid || '',
        createdByRole: user?.role || '',
      });
      setSubmitting(false);
      showSnackbar('Incident submitted!', 3000);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to submit incident:', e);
      setError('Failed to submit incident.');
      setSubmitting(false);
      showSnackbar('Failed to submit incident.', 3000);
    }
  };

  // Robustly extract sanctions from the selected misdemeanor
  let sanctions: { key: string; value: string }[] = [];
  let sanctionsDebug = '';

  if (selectedMisdemeanor) {
    const fieldsToTry = ['sanctions', 'Sanctions', 'sanction', 'Sanction'];
    for (const field of fieldsToTry) {
      const value = (selectedMisdemeanor as any)[field];
      if (Array.isArray(value)) {
        sanctions = value.map((v, idx) => ({ key: String(idx), value: String(v) }));
        sanctionsDebug = `Found array in field '${field}': ${JSON.stringify(value)}`;
        break;
      } else if (typeof value === 'string') {
        sanctions = [{ key: '0', value }];
        sanctionsDebug = `Found string in field '${field}': ${value}`;
        break;
      } else if (value && typeof value === 'object') {
        // Sort the entries by key (e.g. 1st, 2nd, 3rd, ...)
        sanctions = Object.entries(value)
          .sort(([a], [b]) => {
            // Extract numeric part for sorting, fallback to string compare
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.localeCompare(b);
          })
          .map(([k, v]) => ({ key: k, value: String(v) }));
        sanctionsDebug = `Found object in field '${field}': ${JSON.stringify(value)}`;
        break;
      }
    }
    if (!sanctions.length) {
      sanctionsDebug = `No sanctions found in fields: ${fieldsToTry.join(', ')}`;
    }
  }

  // Track selected sanction as object { key, value }
  const [selectedSanction, setSelectedSanction] = useState<{ key: string; value: string } | null>(null);

  // Reset sanction when misdemeanor changes
  useEffect(() => {
    setSelectedSanction(null);
  }, [selectedMisdemeanor]);

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
            {!summaryCollapsed && (
              <>
                <Text variant="titleLarge" style={styles.header}>{student?.name ?? ''} ({student?.studentId ?? ''})</Text>
                <Text style={styles.subheader}>{student?.class ?? ''}</Text>
                <View style={styles.heatBarContainer}>
                  <Text style={styles.heatLabel}>Behavior Heat Bar</Text>
                  <ProgressBar progress={heatPercent} color={heatBarColor} style={styles.heatBar} />
                  <Text style={[styles.heatScore, { color: heatBarColor, fontWeight: 'bold' }]}>{heatLabel}</Text>
                </View>
                {summaryLoading ? <ActivityIndicator style={{ marginTop: 10 }} /> : (
                  <>
                    <Text style={styles.sectionHeader}>Recent Incidents</Text>
                    {incidents.length === 0 ? <Text style={styles.emptyText}>No incidents recorded.</Text> : (
                      incidents.slice(0, 2).map((inc, idx) => (
                        <List.Item key={idx} title={inc.misdemeanorName || 'Incident'} description={inc.notes || ''} left={props => <List.Icon {...props} icon="alert-circle-outline" color="#d32f2f" />} right={props => <Text style={styles.time}>{inc.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
                      ))
                    )}
                    <Text style={styles.sectionHeader}>Recent Merits</Text>
                    {merits.length === 0 ? <Text style={styles.emptyText}>No merits awarded.</Text> : (
                      merits.slice(0, 2).map((mer, idx) => (
                        <List.Item key={idx} title={mer.meritTypeName || 'Merit'} description={mer.description || ''} left={props => <List.Icon {...props} icon="star-outline" color="#1976d2" />} right={props => <Text style={styles.time}>{mer.createdAt?.toDate?.().toLocaleDateString?.() || ''}</Text>} style={styles.listItem} />
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text variant="titleLarge" style={{ flex: 1 }}>Log Incident</Text>
        <Button
          icon="clock-outline"
          mode="text"
          onPress={() => navigation.navigate('RecentLogsScreen')}
          compact
          style={{ marginLeft: 8 }}
        >
          Recent
        </Button>
      </View>

        {/* Student Selection */}
        <List.Section>
          <List.Subheader>Student</List.Subheader>
          {student ? (
            <List.Item
              title={`${student.name} (${student.studentId})`}
              description={student.class}
              left={props => <List.Icon {...props} icon="account" />}
              right={props => (
                <Button onPress={handleSelectStudent} mode="text">Change</Button>
              )}
            />
          ) : (
            <Button mode="outlined" onPress={handleSelectStudent} style={{ marginBottom: 12 }}>
              Select Student
            </Button>
          )}
        </List.Section>

        {/* Location Selection */}
        <List.Section>
          <List.Subheader>Location</List.Subheader>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {(['Hostel', 'Main School'] as LocationType[]).map(loc => (
              <Button
                key={loc}
                mode={location === loc ? 'contained' : 'outlined'}
                onPress={() => {
                  setLocation(loc);
                  setSelectedMisdemeanor(null);
                  setSanction('');
                }}
                style={{ marginRight: 8 }}
              >
                {loc}
              </Button>
            ))}
          </View>
        </List.Section>



        {/* Misdemeanor Dropdown */}
        <List.Section>
          <List.Subheader>Misdemeanor</List.Subheader>
          <Menu
            visible={misdemeanorMenuVisible}
            onDismiss={() => setMisdemeanorMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMisdemeanorMenuVisible(true)}
                disabled={loading || !location || filteredMisdemeanors.length === 0}
                style={{ marginBottom: 8 }}
              >
                {selectedMisdemeanor ? selectedMisdemeanor.name : 'Select Misdemeanor'}
              </Button>
            }
          >
            {filteredMisdemeanors.map(m => (
              <Menu.Item
                key={m.id}
                onPress={() => {
                  setSelectedMisdemeanor(m);
                  setSanction('');
                  setMisdemeanorMenuVisible(false);
                }}
                title={m.name}
              />
            ))}
          </Menu>
          {selectedMisdemeanor && selectedMisdemeanor.description && (
            <HelperText type="info">{selectedMisdemeanor.description}</HelperText>
          )}
        </List.Section>

        {/* Sanction Frequency Dropdown */}
        {selectedMisdemeanor && sanctions.length > 0 && (
          <List.Section>
            <List.Subheader>Sanction Frequency</List.Subheader>
            <Menu
              visible={sanctionMenuVisible}
              onDismiss={() => setSanctionMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setSanctionMenuVisible(true)}
                  disabled={sanctions.length === 0}
                  style={{ marginBottom: 8 }}
                >
                  {selectedSanction ? `${selectedSanction.key}: ${selectedSanction.value}` : 'Select Frequency'}
                </Button>
              }
            >
              {sanctions.map(s => (
                <Menu.Item
                  key={s.key}
                  onPress={() => {
                    setSelectedSanction(s);
                    setSanctionMenuVisible(false);
                  }}
                  title={`${s.key}: ${s.value}`}
                />
              ))}
            </Menu>
          </List.Section>
        )}

        {/* Notes */}
        <TextInput
          mode="outlined"
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ marginBottom: 16 }}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || loading || !student || !location || !selectedMisdemeanor || !selectedSanction}
          style={{ marginTop: 12 }}
        >
          Submit Incident
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
  sectionHeader: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  outlinedButton: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  containedButton: {
    backgroundColor: '#d32f2f',
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