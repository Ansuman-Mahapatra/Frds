import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'matches', id as string);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setMatch({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const isCreator = user?.uid === match?.createdBy;
  const isPlayer = match?.players?.includes(user?.uid);

  const joinMatch = async () => {
    try {
      await updateDoc(doc(db, 'matches', id as string), {
        players: arrayUnion(user?.uid)
      });
      // In a real app, autoBalance logic would assign to team A or B here
    } catch (error) {
      Alert.alert('Error', 'Failed to join match');
    }
  };

  const updateScore = async (team: 'A' | 'B', change: number) => {
    try {
      const field = team === 'A' ? 'scoreA' : 'scoreB';
      const currentScore = match[field] || 0;
      await updateDoc(doc(db, 'matches', id as string), {
        [field]: Math.max(0, currentScore + change)
      });
    } catch (error) {
      Alert.alert('Error updating score');
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, 'matches', id as string), {
        status: newStatus
      });
    } catch (error) {
      Alert.alert('Error updating status');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF3366" /></View>;
  }

  if (!match) {
    return <View style={styles.center}><Text style={{color: 'white'}}>Match not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.statusTag(match.status)}>{match.status.toUpperCase()}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.title}>{match.title}</Text>
        <Text style={styles.subtitle}>{match.sport} • {new Date(match.date).toLocaleString()}</Text>
        <Text style={styles.location}>📍 {match.location}</Text>
      </View>

      <View style={styles.scoreBoard}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>Team A</Text>
          <Text style={styles.score}>{match.scoreA || 0}</Text>
          {isCreator && match.status === 'live' && (
            <View style={styles.scoreControls}>
              <TouchableOpacity style={styles.scoreBtn} onPress={() => updateScore('A', -1)}><Text style={styles.scoreBtnText}>-</Text></TouchableOpacity>
              <TouchableOpacity style={styles.scoreBtn} onPress={() => updateScore('A', 1)}><Text style={styles.scoreBtnText}>+</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>Team B</Text>
          <Text style={styles.score}>{match.scoreB || 0}</Text>
          {isCreator && match.status === 'live' && (
            <View style={styles.scoreControls}>
              <TouchableOpacity style={styles.scoreBtn} onPress={() => updateScore('B', -1)}><Text style={styles.scoreBtnText}>-</Text></TouchableOpacity>
              <TouchableOpacity style={styles.scoreBtn} onPress={() => updateScore('B', 1)}><Text style={styles.scoreBtnText}>+</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {!isPlayer && match.status === 'upcoming' && (
          <TouchableOpacity style={styles.primaryButton} onPress={joinMatch}>
            <Text style={styles.primaryButtonText}>Join Match</Text>
          </TouchableOpacity>
        )}

        {isCreator && match.status === 'upcoming' && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => updateStatus('live')}>
            <Text style={styles.primaryButtonText}>Start Match</Text>
          </TouchableOpacity>
        )}

        {isCreator && match.status === 'live' && (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#10B981' }]} onPress={() => updateStatus('completed')}>
            <Text style={styles.primaryButtonText}>Finish Match</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>Players ({match.players?.length || 0})</Text>
        {/* Placeholder for player list */}
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>Waiting for players to join...</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { paddingVertical: 10 },
  backButtonText: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold' },
  statusTag: (status: string) => ({
    backgroundColor: status === 'live' ? 'rgba(255, 51, 102, 0.2)' : 'rgba(148, 163, 184, 0.2)',
    color: status === 'live' ? '#FF3366' : status === 'completed' ? '#10B981' : '#00D2FF',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 12, fontWeight: 'bold', overflow: 'hidden'
  }),
  infoSection: { paddingHorizontal: 20, marginBottom: 30, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  location: { color: '#94A3B8', fontSize: 14 },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 24, padding: 30, borderWidth: 1, borderColor: '#334155' },
  teamColumn: { flex: 1, alignItems: 'center' },
  teamName: { color: '#94A3B8', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  score: { color: '#FFF', fontSize: 64, fontWeight: '900', lineHeight: 70 },
  vsText: { color: '#FF3366', fontSize: 24, fontWeight: '900', marginHorizontal: 20 },
  scoreControls: { flexDirection: 'row', marginTop: 15, gap: 15 },
  scoreBtn: { backgroundColor: '#334155', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreBtnText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  actionsContainer: { paddingHorizontal: 20, marginTop: 30 },
  primaryButton: { backgroundColor: '#FF3366', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  playersSection: { paddingHorizontal: 20, marginTop: 40 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  playerCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  playerName: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
});
