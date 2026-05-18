import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const GAMES = ['BGMI', 'Free Fire', 'Chess', 'Ludo Star', 'COD'];

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('BGMI');
  const [prizePool, setPrizePool] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title) {
      Alert.alert('Error', 'Tournament title is required');
      return;
    }

    setLoading(true);
    try {
      // Auto bracket generation placeholder
      const participants = [user?.uid]; // Currently just the creator
      
      const tournamentData = {
        title,
        game,
        prizePool: prizePool ? parseInt(prizePool) : 0,
        maxPlayers: parseInt(maxPlayers) || 8,
        status: 'open',
        createdBy: user?.uid,
        createdAt: new Date().toISOString(),
        participants,
        bracket: [], // Would generate rounds/matchups here when full
      };

      await addDoc(collection(db, 'tournaments'), tournamentData);
      Alert.alert('Success', 'Tournament created! Waiting for players to join.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Tournament</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Tournament Name</Text>
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#666" 
          placeholder="e.g. Weekend Clash" 
          value={title} 
          onChangeText={setTitle} 
        />

        <Text style={styles.label}>Select Game</Text>
        <View style={styles.chipContainer}>
          {GAMES.map(g => (
            <TouchableOpacity 
              key={g} 
              style={[styles.chip, game === g && styles.chipSelected]}
              onPress={() => setGame(g)}
            >
              <Text style={[styles.chipText, game === g && styles.chipTextSelected]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Max Players</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#666" 
              keyboardType="numeric"
              value={maxPlayers} 
              onChangeText={setMaxPlayers} 
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Prize Pool (₹)</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#666" 
              placeholder="e.g. 500" 
              keyboardType="numeric"
              value={prizePool} 
              onChangeText={setPrizePool} 
            />
          </View>
        </View>

        <View style={styles.bracketCard}>
          <Text style={styles.bracketTitle}>Auto-Bracket Generation</Text>
          <Text style={styles.bracketDesc}>Once the lobby reaches {maxPlayers} players, SquadUp will automatically generate the tournament brackets and notify all participants.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Launch Tournament'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginBottom: 16 },
  backButtonText: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  form: { paddingHorizontal: 20, paddingBottom: 50 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 20 },
  input: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#1E293B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipSelected: { backgroundColor: 'rgba(255, 51, 102, 0.2)', borderColor: '#FF3366' },
  chipText: { color: '#94A3B8', fontWeight: '600' },
  chipTextSelected: { color: '#FF3366' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  bracketCard: { backgroundColor: 'rgba(0, 210, 255, 0.05)', padding: 16, borderRadius: 12, marginTop: 30, borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.2)' },
  bracketTitle: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  bracketDesc: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  button: { backgroundColor: '#FF3366', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 32, shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
