import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const SPORTS = ['Cricket', 'Volleyball', 'Basketball', 'Football', 'Kabaddi'];
const GAMES = ['BGMI', 'Free Fire', 'Chess', 'Ludo Star', 'COD'];
const LEVELS = ['Beginner', 'Intermediate', 'Pro'];

export default function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [sportLevels, setSportLevels] = useState<Record<string, string>>({});
  
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [gameUsernames, setGameUsernames] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(prev => prev.filter(s => s !== sport));
      const newLevels = { ...sportLevels };
      delete newLevels[sport];
      setSportLevels(newLevels);
    } else {
      setSelectedSports(prev => [...prev, sport]);
      setSportLevels(prev => ({ ...prev, [sport]: 'Beginner' }));
    }
  };

  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(prev => prev.filter(g => g !== game));
      const newUsernames = { ...gameUsernames };
      delete newUsernames[game];
      setGameUsernames(newUsernames);
    } else {
      setSelectedGames(prev => [...prev, game]);
      setGameUsernames(prev => ({ ...prev, [game]: '' }));
    }
  };

  const handleSave = async () => {
    if (!name || !age || !city) {
      Alert.alert('Incomplete', 'Please fill your basic details');
      return;
    }

    setLoading(true);
    try {
      let photoURL = '';
      if (imageUri && user) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          name,
          age,
          city,
          photoURL,
          sports: selectedSports,
          sportLevels,
          games: selectedGames,
          gameUsernames,
          profileComplete: true,
          updatedAt: new Date().toISOString()
        });

        await refreshProfile();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error saving profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up Profile</Text>
      
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} placeholderTextColor="#666" placeholder="e.g. John Doe" value={name} onChangeText={setName} />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} placeholderTextColor="#666" placeholder="e.g. 24" keyboardType="numeric" value={age} onChangeText={setAge} />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>City/Village</Text>
          <TextInput style={styles.input} placeholderTextColor="#666" placeholder="e.g. Mumbai" value={city} onChangeText={setCity} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Real-Life Sports</Text>
      <View style={styles.chipContainer}>
        {SPORTS.map(sport => (
          <TouchableOpacity 
            key={sport} 
            style={[styles.chip, selectedSports.includes(sport) && styles.chipSelected]}
            onPress={() => toggleSport(sport)}
          >
            <Text style={[styles.chipText, selectedSports.includes(sport) && styles.chipTextSelected]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSports.map(sport => (
        <View key={`level-${sport}`} style={styles.levelContainer}>
          <Text style={styles.subLabel}>{sport} Level</Text>
          <View style={styles.chipContainer}>
            {LEVELS.map(level => (
              <TouchableOpacity
                key={`${sport}-${level}`}
                style={[styles.chipSmall, sportLevels[sport] === level && styles.chipSmallSelected]}
                onPress={() => setSportLevels(prev => ({ ...prev, [sport]: level }))}
              >
                <Text style={[styles.chipTextSmall, sportLevels[sport] === level && styles.chipTextSelected]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Online Games</Text>
      <View style={styles.chipContainer}>
        {GAMES.map(game => (
          <TouchableOpacity 
            key={game} 
            style={[styles.chip, selectedGames.includes(game) && styles.chipSelected]}
            onPress={() => toggleGame(game)}
          >
            <Text style={[styles.chipText, selectedGames.includes(game) && styles.chipTextSelected]}>{game}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedGames.map(game => (
        <View key={`username-${game}`} style={styles.levelContainer}>
          <Text style={styles.subLabel}>{game} Username</Text>
          <TextInput 
            style={styles.inputSmall} 
            placeholderTextColor="#666"
            placeholder={`Enter ${game} ID/Username`} 
            value={gameUsernames[game] || ''} 
            onChangeText={(text) => setGameUsernames(prev => ({ ...prev, [game]: text }))} 
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Complete Profile'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputSmall: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  sectionTitle: {
    color: '#00D2FF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    borderColor: '#FF3366',
  },
  chipText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FF3366',
  },
  levelContainer: {
    marginTop: 16,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
  },
  subLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    marginBottom: 8,
  },
  chipSmall: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipSmallSelected: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    borderColor: '#FF3366',
  },
  chipTextSmall: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF3366',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
