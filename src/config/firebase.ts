import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAzX7gXbSL47mfPTwku_U7CfTiPogDkiJU",
  authDomain: "frds-24bee.firebaseapp.com",
  projectId: "frds-24bee",
  storageBucket: "frds-24bee.firebasestorage.app",
  messagingSenderId: "317375837625",
  appId: "1:317375837625:web:463f829db410e54a6af268",
  measurementId: "G-Y36F1S9L5C"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
