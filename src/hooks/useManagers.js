// src/hooks/useManagers.js
import { useState, useEffect } from 'react';
import {
    loadManagers,
    saveManagers,
    getActiveManager,
    switchManager,
    DEFAULT_MANAGERS,
} from '../data/dataStore.js';

export function useManagers() {
    const [managers, setManagers] = useState(DEFAULT_MANAGERS);

    // Chargement initial depuis Firebase
    useEffect(() => {
        loadManagers().then(list => setManagers(list));
    }, []);

    async function handleSwitch(id) {
        const next = switchManager(managers, id);
        setManagers(next);
        await saveManagers(next);
    }

    async function handleUpdateName(id, newName) {
        const next = managers.map(m => m.id === id ? { ...m, name: newName } : m);
        setManagers(next);
        await saveManagers(next);
    }

    return {
        managers,
        activeManager: getActiveManager(managers),
        handleSwitch,
        handleUpdateName,
    };
}