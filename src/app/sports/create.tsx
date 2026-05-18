import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const SPORTS = ['Cricket', 'Volleyball', 'Basketball', 'Football', 'Kabaddi'];

export default function CreateMatchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [autoBalance, setAutoBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !location || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const matchData = {
        title,
        sport,
        location,
        date: new Date(date).toISOString(), // Expecting YYYY-MM-DD HH:mm for now
        status: 'upcoming',
        createdBy: user?.uid,
        createdAt: new Date().toISOString(),
        scoreA: 0,
        scoreB: 0,
        players: [user?.uid], // initially just creator
        autoBalance,
      };

      const docRef = await addDoc(collection(db, 'matches'), matchData);
      router.replace(`/sports/match/${docRef.id}`);
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
        <Text style={styles.title}>New Match</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Match Title</Text>
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#666" 
          placeholder="e.g. Sunday Morning Bash" 
          value={title} 
          onChangeText={setTitle} 
        />

        <Text style={styles.label}>Sport</Text>
        <View style={styles.chipContainer}>
          {SPORTS.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.chip, sport === s && styles.chipSelected]}
              onPress={() => setSport(s)}
            >
              <Text style={[styles.chipText, sport === s && styles.chipTextSelected]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location (Ground/Turf)</Text>
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#666" 
          placeholder="e.g. Central Turf" 
          value={location} 
          onChangeText={setLocation} 
        />

        <Text style={styles.label}>Date & Time (YYYY-MM-DD HH:MM)</Text>
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#666" 
          placeholder="e.g. 2026-05-20 18:00" 
          value={date} 
          onChangeText={setDate} 
        />

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Auto-Balance Teams</Text>
            <Text style={styles.switchSubLabel}>Balance based on player experience and age</Text>
          </View>
          <Switch 
            value={autoBalance} 
            onValueChange={setAutoBalance} 
            trackColor={{ false: '#334155', true: '#FF3366' }}
            thumbColor={autoBalance ? '#FFF' : '#94A3B8'}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Match'}</Text>
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
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#334155' },
  switchLabel: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  switchSubLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4, maxWidth: 220 },
  button: { backgroundColor: '#FF3366', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 32, shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
