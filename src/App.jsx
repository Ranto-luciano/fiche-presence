// src/App.jsx
import { useState, useEffect } from 'react';
import { useAttendance } from './hooks/useAttendance.js';
import { useManagers } from './hooks/useManagers.js';
import AttendanceGrid from './components/AttendanceGrid.jsx';
import PdfExport from './components/PdfExport.jsx';
import ManagerPanel from './components/ManagerPanel.jsx';
import { PasswordGate } from './components/PasswordGate.jsx';
import { db, auth, signOut } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SECRET_SLUG = '/x9k2m-presence';

function SecurityGuard({ children }) {
    const path = window.location.pathname;
    if (path !== SECRET_SLUG) {
        window.location.href = 'about:blank';
        return null;
    }
    return children;
}

const PERIODS = {
    'Avril – Mai 2026':    [new Date(2026, 3, 27), new Date(2026, 4, 13)],
    'Mai – Juin 2026':     [new Date(2026, 4, 15), new Date(2026, 5, 15)],
    'Juin – Juillet 2026': [new Date(2026, 5, 16), new Date(2026, 6, 15)],
    'Juillet – Août 2026': [new Date(2026, 6, 16), new Date(2026, 7, 15)],
};

function getDaysInRange(start, end) {
    const days = [];
    let d = new Date(start);
    while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return days;
}

function formatAbsenceSummary(absenceDays) {
    if (absenceDays === 0) return '0 jour';
    const demi = Math.round(absenceDays * 2);
    if (demi % 2 === 0) {
        const j = demi / 2;
        return `${j} jour${j > 1 ? 's' : ''}`;
    }
    const j = Math.floor(demi / 2);
    if (j === 0) return '½ journée';
    return `${j} j et ½`;
}

function MainApp({ onLogout }) {
    const [selectedPeriod, setSelectedPeriod] = useState('Avril – Mai 2026');
    const { model, loading, absenceDays, handleToggle, handleReset } = useAttendance();
    const { managers, activeManager, handleSwitch, handleUpdateName } = useManagers();

    const [start, end] = PERIODS[selectedPeriod];
    const days = getDaysInRange(start, end);

    async function handleLogout() {
        await signOut();
        onLogout();
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f0f4f8',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 12px' }}>

                {/* Header */}
                <div style={{
                    background: '#1e3a5f', borderRadius: 12, padding: '14px 18px',
                    marginBottom: 14, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: 8,
                }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: 18, margin: 0, fontWeight: 700 }}>
                            Fiche de Présence
                        </h1>
                        <div style={{ color: '#93c5fd', fontSize: 12, marginTop: 2 }}>
                            YAS Madagascar · D.S.I · Fahatokiana David RAZAFIMAMONJY
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <select
                            value={selectedPeriod}
                            onChange={e => setSelectedPeriod(e.target.value)}
                            style={{
                                background: '#fff', border: 'none', borderRadius: 7,
                                padding: '6px 10px', fontSize: 13, fontFamily: 'inherit',
                                cursor: 'pointer', color: '#1e3a5f', fontWeight: 600,
                            }}
                        >
                            {Object.keys(PERIODS).map(p => <option key={p}>{p}</option>)}
                        </select>

                        {/* Bouton déconnexion */}
                        <button
                            onClick={handleLogout}
                            title="Se déconnecter"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: 7,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontFamily: 'inherit',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            🔓 Déconnexion
                        </button>
                    </div>
                </div>

                {/* Manager Panel */}
                <ManagerPanel
                    managers={managers}
                    activeManager={activeManager}
                    onSwitch={handleSwitch}
                    onUpdateName={handleUpdateName}
                />

                {/* Grille */}
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    {loading ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                            ⏳ Chargement des données...
                        </div>
                    ) : (
                        <AttendanceGrid days={days} model={model} onToggle={handleToggle} />
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#fff', borderRadius: 12, padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}>
                    <div style={{
                        background: absenceDays > 0 ? '#fef2f2' : '#f0fdf4',
                        borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700,
                        color: absenceDays > 0 ? '#dc2626' : '#16a34a',
                    }}>
                        Absences : {formatAbsenceSummary(absenceDays)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <PdfExport
                            model={model}
                            selectedMonth={selectedPeriod}
                            start={start}
                            end={end}
                            managerName={activeManager.name}
                        />
                        <button
                            onClick={handleReset}
                            style={{
                                background: '#fef2f2', color: '#dc2626',
                                border: '1px solid #fca5a5', borderRadius: 6,
                                padding: '8px 14px', cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                            }}
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function App() {
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(async user => {
            if (!user) {
                setAuthed(false);
                setChecking(false);
                return;
            }

            try {
                const snap = await getDoc(doc(db, 'config/allowedEmails'));
                const allowedEmails = snap.data()?.list ?? [];

                if (allowedEmails.includes(user.email)) {
                    setAuthed(true);
                } else {
                    await signOut();
                    setAuthed(false);
                }
            } catch (e) {
                await signOut();
                setAuthed(false);
            }

            setChecking(false);
        });
        return unsub;
    }, []);

    if (checking) return null;

    return (
        <SecurityGuard>
            {authed
                ? <MainApp onLogout={() => setAuthed(false)} />
                : <PasswordGate onSuccess={() => setAuthed(true)} />
            }
        </SecurityGuard>
    );
}