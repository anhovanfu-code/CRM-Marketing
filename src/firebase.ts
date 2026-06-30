import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZhtajUmYjhidCaV8RKoQRa6xtrtragiY",
  authDomain: "gen-lang-client-0977264813.firebaseapp.com",
  projectId: "gen-lang-client-0977264813",
  storageBucket: "gen-lang-client-0977264813.firebasestorage.app",
  messagingSenderId: "418218050420",
  appId: "1:418218050420:web:6978cf3b97ebd67b036221"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore using the specific database ID
export const db = getFirestore(app, "ai-studio-fugaloqunlmarket-36acce79-7e01-460b-8c16-c1382077f512");

