import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, ActivityIndicator, List } from 'react-native-paper';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

interface Student {
  uid: string;
  name: string;
  class: string;
  studentId: string;
}

export default function StudentSearchScreen({ route }: any) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'students'));
        const list: Student[] = [];
        snap.forEach(doc => {
          list.push({ uid: doc.id, ...doc.data() } as Student);
        });
        setStudents(list);
        setFiltered(list);
      } catch (e) {
        setStudents([]);
        setFiltered([]);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(students);
    } else {
      setFiltered(
        students.filter(s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.studentId.toLowerCase().includes(search.toLowerCase()) ||
          s.class.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, students]);

  // Always open profile on tap
  const handleSelect = (student: Student) => {
    // Direct-to-form navigation if logType is set
    if (route?.params?.logType === 'merit') {
      navigation.navigate('MeritFormScreen', { student });
    } else if (route?.params?.logType === 'incident') {
      navigation.navigate('IncidentFormScreen', { student });
    } else {
      navigation.navigate('StudentProfileScreen', { student });
    }
  };

  // Handle long press: open profile (redundant, but kept for clarity)
  const handleProfile = (student: Student) => {
    navigation.navigate('StudentProfileScreen', { student });
  };


  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>Search Students</Text>
      <TextInput
        label="Search by name, class, or ID"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 12 }}
        mode="outlined"
      />
      <Text style={{ color: '#888', marginBottom: 6, fontSize: 12 }}>
        Tap to select for form, long-press for profile
      </Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)} onLongPress={() => handleProfile(item)}>
              <List.Item
                title={item.name}
                description={`${item.class} • ${item.studentId}`}
                left={props => <List.Icon {...props} icon="account-outline" color="#1976d2" />}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>No students found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
