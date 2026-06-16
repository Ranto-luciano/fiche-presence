// src/data/dataStore.js
import { db, auth } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createEmptyModel } from './attendanceModel.js';

const DOC_ATTENDANCE = 'data/attendance';
const DOC_MANAGERS   = 'data/managers';

// Attend que Firebase Auth soit prêt (currentUser connu)
function waitForAuth() {
    return new Promise((resolve) => {
        // Si déjà connecté, on résout immédiatement
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }
        // Sinon on attend le premier changement d'état
        const unsub = auth.onAuthStateChanged(user => {
            unsub();
            resolve(user);
        });
    });
}

// ── Attendance ──────────────────────────────────────────────
export async function save(model) {
    await waitForAuth();
    await setDoc(doc(db, DOC_ATTENDANCE), model);
}

export async function load() {
    try {
        await waitForAuth();
        const snap = await getDoc(doc(db, DOC_ATTENDANCE));
        if (snap.exists()) return snap.data();
    } catch (e) {
        console.error('Erreur chargement Firestore', e);
    }
    const fresh = createEmptyModel();
    await save(fresh);
    return fresh;
}

export async function reset() {
    const fresh = createEmptyModel();
    await save(fresh);
    return fresh;
}

// ── Managers ────────────────────────────────────────────────
export const DEFAULT_MANAGERS = [
    { id: 1, name: 'Fitiavana RAZAFIMANJATO', role: 'Manager principal', active: true  },
    { id: 2, name: 'Aina RAKOTOMALALA',       role: 'Manager backup',    active: false },
];

export async function loadManagers() {
    try {
        await waitForAuth();
        const snap = await getDoc(doc(db, DOC_MANAGERS));
        if (snap.exists()) return snap.data().list;
    } catch (e) {
        console.error('Erreur chargement managers', e);
    }
    await saveManagers(DEFAULT_MANAGERS);
    return DEFAULT_MANAGERS;
}

export async function saveManagers(list) {
    await waitForAuth();
    await setDoc(doc(db, DOC_MANAGERS), { list });
}

export function getActiveManager(list) {
    return list.find(m => m.active) || list[0];
}

export function switchManager(list, id) {
    return list.map(m => ({ ...m, active: m.id === id }));
}