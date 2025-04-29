import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, List, Avatar, ActivityIndicator } from 'react-native-paper';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface UserItem {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function UserListScreen() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserItem[] = [];
        snap.forEach(doc => {
          list.push({ uid: doc.id, ...doc.data() } as UserItem);
        });
        setUsers(list);
      } catch (e) {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  function getInitials(name?: string | null, email?: string | null) {
    if (name && name.trim()) {
      return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0]?.toUpperCase() || '?';
    }
    return '?';
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>All Users</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <List.Item
              title={`${item.displayName || item.email || item.uid}`}
              description={item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : 'No role'}
              left={props => <Avatar.Text {...props} label={getInitials(item.displayName, item.email)} size={40} />}
            />
          )}
          ListEmptyComponent={<Text>No users found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
