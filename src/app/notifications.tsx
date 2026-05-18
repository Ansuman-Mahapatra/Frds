import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'), 
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAction = async (notifId: string, action: 'accept' | 'decline') => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { status: action });
      Alert.alert(action === 'accept' ? 'Challenge Accepted!' : 'Challenge Declined');
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'game_invite': return '🎮';
      case 'match_reminder': return '⏰';
      case 'weather_alert': return '⛈️';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{width: 50}} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map(notif => (
            <View key={notif.id} style={styles.notifCard}>
              <View style={styles.notifHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{getIcon(notif.type)}</Text>
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.message}>{notif.message}</Text>
                  <Text style={styles.time}>{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
              </View>

              {notif.type === 'game_invite' && notif.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={() => handleAction(notif.id, 'decline')}>
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAction(notif.id, 'accept')}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {notif.status && notif.status !== 'pending' && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>You {notif.status}ed</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { paddingVertical: 10 },
  backButtonText: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  list: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748B', fontSize: 16 },
  notifCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  notifHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 51, 102, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  notifContent: { flex: 1 },
  message: { color: '#E2E8F0', fontSize: 15, fontWeight: '500', lineHeight: 22 },
  time: { color: '#64748B', fontSize: 12, marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  declineBtn: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  acceptBtn: { backgroundColor: '#FF3366', shadowColor: '#FF3366', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  declineText: { color: '#94A3B8', fontWeight: 'bold' },
  acceptText: { color: '#FFF', fontWeight: 'bold' },
  statusBadge: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' }
});
