import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  'Online': '#10B981',
  'In Game': '#FF3366',
  'Looking for Players': '#00D2FF',
  'Away': '#F59E0B',
  'Offline': '#64748B'
};

export default function GamingScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Lobby'); // Lobby or Tournaments

  useEffect(() => {
    // Fetch all users who play online games
    const q = query(collection(db, 'users'), where('profileComplete', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user?.uid && u.games && u.games.length > 0);
      setPlayers(usersData);
    });

    return () => unsubscribe();
  }, [user]);

  const sendChallenge = (playerId: string, game: string) => {
    router.push({
      pathname: '/gaming/challenge',
      params: { opponentId: playerId, game }
    });
  };

  const renderLobby = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      {/* Current User Status */}
      <View style={styles.myStatusCard}>
        <Text style={styles.sectionTitle}>My Status</Text>
        <View style={styles.statusChips}>
          {Object.keys(STATUS_COLORS).map(status => (
            <TouchableOpacity 
              key={status} 
              style={[
                styles.statusChip, 
                { borderColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }]} />
              <Text style={styles.statusChipText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Available Players</Text>
      
      {players.map(player => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.playerInfo}>
            {player.photoURL ? (
              <Image source={{ uri: player.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{player.name?.charAt(0)}</Text></View>
            )}
            <View>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerStatus}>
                <View style={[styles.statusDotSmall, { backgroundColor: '#10B981' }]} /> Online
              </Text>
            </View>
          </View>
          
          <View style={styles.gamesList}>
            {player.games?.map((game: string) => (
              <TouchableOpacity 
                key={game} 
                style={styles.gameActionBtn}
                onPress={() => sendChallenge(player.id, game)}
              >
                <Text style={styles.gameActionText}>Invite to {game}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTournaments = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      <TouchableOpacity 
        style={styles.createTourneyBtn}
        onPress={() => router.push('/gaming/tournament')}
      >
        <Text style={styles.createTourneyText}>+ Create Mini Tournament</Text>
      </TouchableOpacity>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No active tournaments. Create one!</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gaming Zone</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Lobby')}>
          <Text style={[styles.tab, activeTab === 'Lobby' && styles.activeTab]}>Lobby</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Tournaments')}>
          <Text style={[styles.tab, activeTab === 'Tournaments' && styles.activeTab]}>Tournaments</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Lobby' ? renderLobby() : renderTournaments()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 24 },
  tab: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  activeTab: { color: '#00D2FF', borderBottomWidth: 2, borderBottomColor: '#00D2FF', paddingBottom: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  myStatusCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  statusChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusChipText: { color: '#E2E8F0', fontSize: 12, fontWeight: 'bold' },
  playerCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FF3366', fontSize: 20, fontWeight: 'bold' },
  playerName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  playerStatus: { color: '#94A3B8', fontSize: 12, flexDirection: 'row', alignItems: 'center' },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  gamesList: { gap: 8 },
  gameActionBtn: { backgroundColor: 'rgba(0, 210, 255, 0.1)', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.3)' },
  gameActionText: { color: '#00D2FF', fontWeight: 'bold', fontSize: 14 },
  createTourneyBtn: { backgroundColor: '#FF3366', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 30, shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  createTourneyText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748B', fontSize: 16 }
});
