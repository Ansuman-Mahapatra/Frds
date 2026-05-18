import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function ChatDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Groups');
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    // Placeholder to fetch chats where user is a participant
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user?.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Mocked data for sports groups since they are auto-created
  const SPORT_GROUPS = [
    { id: 'group_cricket', name: 'Cricket Squad', type: 'sport', lastMessage: 'Anyone up for a match tomorrow?', time: '10:30 AM', unread: 2 },
    { id: 'group_bgmi', name: 'BGMI Shooters', type: 'sport', lastMessage: 'Lobby open!', time: '09:15 AM', unread: 0 },
  ];

  const handleOpenChat = (chatId: string, title: string) => {
    router.push({
      pathname: `/chat/${chatId}`,
      params: { title }
    });
  };

  const renderGroups = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      <Text style={styles.sectionTitle}>Sport Communities</Text>
      {SPORT_GROUPS.map(group => (
        <TouchableOpacity 
          key={group.id} 
          style={styles.chatCard}
          onPress={() => handleOpenChat(group.id, group.name)}
        >
          <View style={styles.groupAvatar}>
            <Text style={styles.groupAvatarText}>#</Text>
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{group.name}</Text>
              <Text style={styles.chatTime}>{group.time}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>{group.lastMessage}</Text>
          </View>
          {group.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{group.unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Live Match Lobbies</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No live matches right now.</Text>
      </View>
    </ScrollView>
  );

  const renderDMs = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No direct messages yet.</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Groups')}>
          <Text style={[styles.tab, activeTab === 'Groups' && styles.activeTab]}>Groups & Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Direct')}>
          <Text style={[styles.tab, activeTab === 'Direct' && styles.activeTab]}>Direct</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Groups' ? renderGroups() : renderDMs()}
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
  sectionTitle: { color: '#00D2FF', fontSize: 14, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  groupAvatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(0, 210, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.3)' },
  groupAvatarText: { color: '#00D2FF', fontSize: 24, fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  chatTime: { color: '#94A3B8', fontSize: 12 },
  lastMessage: { color: '#94A3B8', fontSize: 14 },
  unreadBadge: { backgroundColor: '#FF3366', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  unreadText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20, backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  emptyText: { color: '#64748B', fontSize: 14, fontStyle: 'italic' }
});
