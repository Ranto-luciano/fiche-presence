// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAXVBskgILi79shm8WF9M5L97zm7LVYck4",
  authDomain: "fiche-presence-f5a92.firebaseapp.com",
  projectId: "fiche-presence-f5a92",
  storageBucket: "fiche-presence-f5a92.firebasestorage.app",
  messagingSenderId: "755507598588",
  appId: "1:755507598588:web:3b8cbec5ffe15ec4f6f379",
  measurementId: "G-LWN9EWB92K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function signIn(email, password) {
    if (!auth.currentUser) {
        await signInWithEmailAndPassword(auth, email, password);
    }
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
}

export function signOut() {
    return auth.signOut();
}