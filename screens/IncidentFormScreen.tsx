import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, HelperText, Menu, ActivityIndicator, List } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../services/firebase';
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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [student, setStudent] = useState<Student | null>(route?.params?.student || null);

  // Listen for selectedStudent param from StudentSearchScreen
  useEffect(() => {
    if (route.params?.selectedStudent) {
      setStudent(route.params.selectedStudent);
      // Optionally clear the param after use
      navigation.setParams({ selectedStudent: undefined });
    }
  }, [route.params?.selectedStudent, navigation]);

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
    navigation.navigate('StudentSearchScreen');
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
        // Optionally add teacherId, etc.
      });
      setSubmitting(false);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to submit incident:', e);
      setError('Failed to submit incident.');
      setSubmitting(false);
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Log Incident</Text>

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
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
});