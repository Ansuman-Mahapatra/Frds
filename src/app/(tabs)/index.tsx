import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {profile?.name?.split(' ')[0] || 'Player'} 👋</Text>
          <Text style={styles.subtitle}>Ready to dominate today?</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifIcon} 
          onPress={() => router.push('/notifications')}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/sports/create')}>
            <Text style={styles.actionIcon}>⚽</Text>
            <Text style={styles.actionText}>Host Match</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/gaming/tournament')}>
            <Text style={styles.actionIcon}>🎮</Text>
            <Text style={styles.actionText}>Tournament</Text>
          </TouchableOpacity>
        </View>

        {/* Highlight Section */}
        <Text style={styles.sectionTitle}>Your Squad Stats</Text>
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>75%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>MVP Badges</Text>
          </View>
        </View>

        {/* Current Active Events */}
        <Text style={styles.sectionTitle}>Live Around You</Text>
        <View style={styles.liveEventCard}>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
          <Text style={styles.eventName}>Central Turf - Football</Text>
          <Text style={styles.eventScore}>Team A (3) - Team B (2)</Text>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Watch / Join</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  notifBadge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3366' },
  content: { padding: 20, paddingBottom: 100 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionCard: { flex: 0.48, backgroundColor: '#1E293B', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { color: '#00D2FF', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statsCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 51, 102, 0.1)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 51, 102, 0.2)', marginBottom: 30 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FF3366', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  divider: { width: 1, backgroundColor: 'rgba(255, 51, 102, 0.2)' },
  liveEventCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  liveBadge: { alignSelf: 'flex-start', backgroundColor: '#FF3366', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  liveBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  eventName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  eventScore: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  joinBtn: { backgroundColor: '#334155', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  joinBtnText: { color: '#FFF', fontWeight: 'bold' }
});
