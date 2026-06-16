// src/data/attendanceModel.js

export const STAGE_START = new Date(2026, 3, 27); // 27 avril
export const STAGE_END   = new Date(2026, 6, 26); // 26 juillet

export const JOURS_FERIES = new Set([
    '2026-05-01',
    '2026-05-14',
    '2026-05-25',
    '2026-05-27',
    '2026-06-26',
    '2026-08-15',
]);

export const PERIODS = {
    MATIN: 'morning',
    'APRES-MIDI': 'afternoon',
};

/** Crée un modèle vierge avec tous les jours ouvrés pré-remplis à "" */
export function createEmptyModel() {
    const morning = {}, afternoon = {};
    let d = new Date(STAGE_START);
    while (d <= STAGE_END) {
        const dow = d.getDay(); // 0=dim, 6=sam
        const key = toKey(d);
        if (dow !== 0 && dow !== 6 && !JOURS_FERIES.has(key)) {
            morning[key] = '';
            afternoon[key] = '';
        }
        d.setDate(d.getDate() + 1);
    }
    return { morning, afternoon };
}

export function toKey(date) {
    return date.toISOString().slice(0, 10); // "yyyy-MM-dd"
}

export function getStatus(model, date, period) {
    const key = toKey(date);
    return period === 'MATIN'
        ? (model.morning[key] ?? '')
        : (model.afternoon[key] ?? '');
}

export function setStatus(model, date, period, status) {
    const key = toKey(date);
    const field = period === 'MATIN' ? 'morning' : 'afternoon';
    return {
        ...model,
        [field]: { ...model[field], [key]: status },
    };
}

export function toggle(model, date, period) {
    const current = getStatus(model, date, period);
    const next = current === 'P' ? 'A' : 'P';
    return setStatus(model, date, period, next);
}

export function calculateAbsenceDays(model) {
    let count = 0;
    for (const v of Object.values(model.morning))   if (v === 'A') count += 0.5;
    for (const v of Object.values(model.afternoon)) if (v === 'A') count += 0.5;
    return count;
}

export function calculateAbsenceForPeriod(model, start, end) {
    let absence = 0;
    let d = new Date(start);
    while (d <= end) {
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) {
            if (getStatus(model, d, 'MATIN')      === 'A') absence += 0.5;
            if (getStatus(model, d, 'APRES-MIDI') === 'A') absence += 0.5;
        }
        d.setDate(d.getDate() + 1);
    }
    return absence;
}