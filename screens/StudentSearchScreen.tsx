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

  const handleSelect = (student: Student) => {
    // Navigate back and set the selected student in navigation params
    navigation.navigate({
      name: 'IncidentFormScreen',
      params: { selectedStudent: student },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Search Students</Text>
      <TextInput
        mode="outlined"
        placeholder="Search by name, ID, or class"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 12 }}
        autoFocus
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <List.Item
                title={`${item.name} (${item.studentId})`}
                description={item.class}
                left={props => <List.Icon {...props} icon="account" />}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No students found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
