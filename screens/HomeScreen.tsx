import React, { useState } from 'react';
import { Surface, Text, useTheme, Dialog, Portal, Button as PaperButton, IconButton } from 'react-native-paper';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleDismiss = () => setDialogVisible(false);
  const handleLogout = () => {
    setDialogVisible(false);
    logout();
  };

  return (
    <Surface style={[styles.surface, { backgroundColor: theme.colors.background, padding: 0 }]}> 
      <View style={{ flex: 1 }}>
        {/* Custom Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d32f2f', height: 80, width: '100%', alignSelf: 'stretch', paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>MCC Home</Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 28,
              paddingVertical: 6,
              paddingHorizontal: 18,
              marginLeft: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={() => setDialogVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Logout"
          >
            <MaterialCommunityIcons name="logout" size={26} color="#d32f2f" style={{ marginRight: 8 }} />
            <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View>
        {/* Main Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Welcome to MCC!</Text>
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={handleDismiss}>
            <Dialog.Title>Logout</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to log out?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={handleDismiss}>Cancel</PaperButton>
              <PaperButton onPress={handleLogout}>Logout</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

});
