import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';

export default function ProfileScreen() {
  const { profile } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile?.photoURL ? (
          <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>{profile?.name?.charAt(0) || 'U'}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.subtitle}>{profile?.age} yrs • {profile?.city}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sports Level</Text>
        <View style={styles.card}>
          {profile?.sports?.map(sport => (
            <View key={sport} style={styles.row}>
              <Text style={styles.itemText}>{sport}</Text>
              <Text style={styles.levelText}>{profile.sportLevels?.[sport] || 'Beginner'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gaming IDs</Text>
        <View style={styles.card}>
          {profile?.games?.map(game => (
            <View key={game} style={styles.row}>
              <Text style={styles.itemText}>{game}</Text>
              <Text style={styles.levelText}>{profile.gameUsernames?.[game] || 'Not Set'}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholderText: { fontSize: 40, color: '#FF3366', fontWeight: 'bold' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#00D2FF', marginBottom: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  itemText: { fontSize: 16, color: '#E2E8F0', fontWeight: '500' },
  levelText: { fontSize: 14, color: '#FF3366', fontWeight: 'bold' },
  logoutButton: { backgroundColor: 'rgba(255, 51, 102, 0.1)', borderWidth: 1, borderColor: '#FF3366', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  logoutButtonText: { color: '#FF3366', fontSize: 16, fontWeight: 'bold' }
});
