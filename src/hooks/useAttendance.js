// src/hooks/useAttendance.js
import { useState, useEffect } from 'react';
import { load, save, reset } from '../data/dataStore.js';
import { toggle, calculateAbsenceDays, createEmptyModel } from '../data/attendanceModel.js';

export function useAttendance() {
    const [model, setModel] = useState(() => createEmptyModel());
    const [loading, setLoading] = useState(true);

    // Chargement initial depuis Firebase
    useEffect(() => {
        load().then(data => {
            setModel(data);
            setLoading(false);
        });
    }, []);

    function handleToggle(date, period) {
        setModel(prev => {
            const next = toggle(prev, date, period);
            save(next); // async, fire-and-forget
            return next;
        });
    }

    async function handleReset() {
        if (!window.confirm('Réinitialiser toutes les présences ?')) return;
        const fresh = await reset();
        setModel(fresh);
    }

    return {
        model,
        loading,
        absenceDays: calculateAbsenceDays(model),
        handleToggle,
        handleReset,
    };
}