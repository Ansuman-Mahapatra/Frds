import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function SportsScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Listen to upcoming matches
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(matchData);
    });

    return () => unsubscribe();
  }, []);

  const renderMatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => router.push(`/sports/match/${item.id}`)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.sportTag}>{item.sport}</Text>
        <Text style={styles.statusTag(item.status)}>{item.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.matchTitle}>{item.title || 'Friendly Match'}</Text>
      <Text style={styles.matchDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.matchLocation}>📍 {item.location}</Text>
      
      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamName}>Team A</Text>
          <Text style={styles.score}>{item.scoreA || 0}</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.team}>
          <Text style={styles.score}>{item.scoreB || 0}</Text>
          <Text style={styles.teamName}>Team B</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sports Center</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/sports/create')}
        >
          <Text style={styles.createButtonText}>+ New Match</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <Text style={[styles.tab, styles.activeTab]}>Upcoming</Text>
        <Text style={styles.tab}>Live</Text>
        <Text style={styles.tab}>History</Text>
        <Text style={styles.tab}>Leaderboard</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matches found. Start a game!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  createButton: {
    backgroundColor: '#FF3366',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 20,
  },
  tab: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  activeTab: { color: '#00D2FF', borderBottomWidth: 2, borderBottomColor: '#00D2FF', paddingBottom: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  matchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sportTag: { backgroundColor: 'rgba(0, 210, 255, 0.1)', color: '#00D2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  statusTag: (status: string) => ({
    color: status === 'live' ? '#FF3366' : status === 'completed' ? '#10B981' : '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  }),
  matchTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  matchDate: { color: '#94A3B8', fontSize: 14, marginBottom: 2 },
  matchLocation: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  teamsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 12 },
  team: { flex: 1, alignItems: 'center' },
  teamName: { color: '#E2E8F0', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  score: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  vs: { color: '#FF3366', fontWeight: 'bold', fontSize: 16, paddingHorizontal: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 }
});
