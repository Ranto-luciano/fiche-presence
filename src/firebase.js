// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyACzEKmMgCmsHuKRZzvODDAV2Ox9l209O0",
    authDomain: "fiche-presence.firebaseapp.com",
    projectId: "fiche-presence",
    storageBucket: "fiche-presence.firebasestorage.app",
    messagingSenderId: "606340890898",
    appId: "1:606340890898:web:cfe822ef7fdb126f5b73cb"
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