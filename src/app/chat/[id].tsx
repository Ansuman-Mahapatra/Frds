import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const SPORT_EMOJIS = ['🏏', '🏐', '🏀', '⚽', '🏆', '🔥'];

export default function ChatRoomScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState("No matches scheduled for today. Want to play?");

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, `chats/${id}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgData);
    });
    return () => unsubscribe();
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    try {
      await addDoc(collection(db, `chats/${id}/messages`), {
        text: inputText,
        senderId: user?.uid,
        senderName: profile?.name,
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    // Simulated reaction handling
    Alert.alert('Reaction added', `You reacted with ${emoji}`);
  };

  const triggerMatchScheduler = () => {
    Alert.alert('Schedule Match', 'Launch the Group Voting UI for Match Scheduling?');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title || 'Chat'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/chat/call/${id}`)} style={{ marginRight: 15 }}>
            <Text style={styles.headerAction}>📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={triggerMatchScheduler}>
            <Text style={styles.headerAction}>📅 Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pinned Announcement */}
      <View style={styles.pinnedContainer}>
        <Text style={styles.pinnedTitle}>📌 Pinned Announcement</Text>
        <Text style={styles.pinnedText}>{pinnedMessage}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map((msg, index) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <View key={msg.id || index} style={[styles.messageWrapper, isMine ? styles.messageWrapperMine : null]}>
              {!isMine && <Text style={styles.senderName}>{msg.senderName}</Text>}
              <View style={[styles.messageBubble, isMine ? styles.messageBubbleMine : null]}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
              {/* Fake Reactions display on long press - just showing inline here for mock */}
              {!isMine && index === messages.length - 1 && (
                <View style={styles.reactionBar}>
                  {SPORT_EMOJIS.slice(0, 4).map(e => (
                    <TouchableOpacity key={e} onPress={() => handleReaction(msg.id, e)}>
                      <Text style={styles.reactionEmoji}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  backButton: { paddingVertical: 5 },
  backButtonText: { color: '#00D2FF', fontSize: 16, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerAction: { color: '#FF3366', fontSize: 16, fontWeight: 'bold' },
  pinnedContainer: { backgroundColor: 'rgba(255, 51, 102, 0.1)', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 51, 102, 0.2)' },
  pinnedTitle: { color: '#FF3366', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  pinnedText: { color: '#E2E8F0', fontSize: 14, fontStyle: 'italic' },
  chatContent: { padding: 20, paddingBottom: 40 },
  messageWrapper: { marginBottom: 20, alignItems: 'flex-start' },
  messageWrapperMine: { alignItems: 'flex-end' },
  senderName: { color: '#94A3B8', fontSize: 12, marginBottom: 4, marginLeft: 4 },
  messageBubble: { backgroundColor: '#1E293B', padding: 14, borderRadius: 20, borderBottomLeftRadius: 4, maxWidth: '80%' },
  messageBubbleMine: { backgroundColor: '#FF3366', borderBottomLeftRadius: 20, borderBottomRightRadius: 4 },
  messageText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  reactionBar: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 6, borderRadius: 20, marginTop: 4, borderWidth: 1, borderColor: '#334155', alignSelf: 'flex-start' },
  reactionEmoji: { fontSize: 16, marginHorizontal: 4 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#1E293B', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#334155' },
  attachButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  attachText: { color: '#FFF', fontSize: 24, lineHeight: 26 },
  input: { flex: 1, backgroundColor: '#0F172A', borderRadius: 20, minHeight: 40, maxHeight: 100, color: '#FFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, marginHorizontal: 12, borderWidth: 1, borderColor: '#334155' },
  sendButton: { backgroundColor: '#00D2FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 4 },
  sendButtonText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 }
});
