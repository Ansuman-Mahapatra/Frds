import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function GroupCallScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Mock participants in the call
  const participants = [
    { id: '1', name: 'You', isSpeaking: true },
    { id: '2', name: 'Rahul', isSpeaking: false },
    { id: '3', name: 'Priya', isSpeaking: false },
    { id: '4', name: 'Amit', isSpeaking: true },
  ];

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad Group Call</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>05:24</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {participants.map((p, index) => (
          <View key={p.id} style={[styles.videoTile, participants.length > 2 ? styles.gridItemHalf : styles.gridItemFull]}>
            <View style={[styles.avatarPlaceholder, p.isSpeaking && styles.speakingBorder]}>
              <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
            </View>
            <View style={styles.nameBadge}>
              <Text style={styles.nameText}>{p.name}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.controlButtonOff]} 
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isVideoOff && styles.controlButtonOff]} 
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          <Text style={styles.controlIcon}>{isVideoOff ? '🚫' : '📹'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Text style={styles.controlIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  liveBadge: { backgroundColor: 'rgba(255, 51, 102, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FF3366' },
  liveBadgeText: { color: '#FF3366', fontWeight: 'bold', fontSize: 14 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  videoTile: { backgroundColor: '#1E293B', borderRadius: 16, marginBottom: 10, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  gridItemHalf: { width: '48%', aspectRatio: 0.8 },
  gridItemFull: { width: '100%', aspectRatio: 1.2 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  speakingBorder: { borderWidth: 3, borderColor: '#00D2FF' },
  avatarText: { color: '#00D2FF', fontSize: 32, fontWeight: 'bold' },
  nameBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(15, 23, 42, 0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  nameText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 30, backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  controlButtonOff: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  endCallButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF3366', justifyContent: 'center', alignItems: 'center', shadowColor: '#FF3366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  controlIcon: { fontSize: 24 }
});
