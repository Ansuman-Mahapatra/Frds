import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function ChallengeScreen() {
  const { opponentId, game } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [opponent, setOpponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchOpponent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', opponentId as string));
        if (docSnap.exists()) {
          setOpponent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching opponent", error);
      } finally {
        setLoading(false);
      }
    };
    if (opponentId) fetchOpponent();
  }, [opponentId]);

  const handleSendChallenge = async () => {
    setSending(true);
    try {
      // Create a notification doc
      await addDoc(collection(db, 'notifications'), {
        type: 'game_invite',
        senderId: user?.uid,
        senderName: profile?.name,
        receiverId: opponentId,
        game: game,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message: `${profile?.name} challenged you to ${game} — Join now?`
      });

      Alert.alert('Challenge Sent!', `Waiting for ${opponent?.name} to accept.`);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF3366" /></View>;
  if (!opponent) return <View style={styles.center}><Text style={{color:'white'}}>Opponent not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{opponent.name?.charAt(0)}</Text>
        </View>

        <Text style={styles.title}>Challenge {opponent.name}</Text>
        <Text style={styles.subtitle}>To a match of</Text>
        
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>{game}</Text>
          <Text style={styles.gameUsername}>Their ID: {opponent.gameUsernames?.[game as string] || 'Unknown'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.sendBtn} 
          onPress={handleSendChallenge}
          disabled={sending}
        >
          <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send Challenge Notification'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { paddingVertical: 10 },
  backButtonText: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, marginTop: 40 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#FF3366' },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#94A3B8', fontSize: 16, marginBottom: 24 },
  gameCard: { backgroundColor: '#1E293B', width: '100%', padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#00D2FF', marginBottom: 40 },
  gameTitle: { color: '#00D2FF', fontSize: 32, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  gameUsername: { color: '#E2E8F0', fontSize: 14, fontStyle: 'italic' },
  sendBtn: { backgroundColor: '#FF3366', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  sendBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
