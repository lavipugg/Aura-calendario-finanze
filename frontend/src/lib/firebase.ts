import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inizializza Firebase App
export const app = initializeApp(firebaseConfig);

// Inizializza Firestore con l'ID database configurato
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');