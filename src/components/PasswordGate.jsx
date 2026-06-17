// src/components/PasswordGate.jsx
import { useState } from 'react';
import {signIn, signInWithGoogle, signOut} from '../firebase.js';

export async function isAuthenticated() {
    // On vérifie via Firebase Auth, pas sessionStorage
    const {auth} = await import('../firebase.js');
    return !!auth.currentUser;
}

export function PasswordGate({ onSuccess }) {
    const [value, setValue]   = useState('');
    const [error, setError]   = useState(false);
    const [errorMsg, setErrorMsg] = useState('Mot de passe incorrect');
    const [shake, setShake]   = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!value.trim()) return;
        setLoading(true);
        try {
            await signIn('fchprsrnt@fichep.mg', value);
            onSuccess();
        } catch (e) {
            setErrorMsg('Mot de passe incorrect'); // ← ajouter ça
            setError(true);
            setShake(true);
            setValue('');
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setLoading(true);
        try {
            const result = await signInWithGoogle();
            const email = result.user.email;

            const allowed = ["fchprsrnt@fichep.mg", "rantoluciano622@gmail.com"];

            if (!allowed.includes(email)) {
                // Déconnecter immédiatement
                await signOut();
                setErrorMsg("Accès non autorisé pour ce compte.");
                setError(true);
                setShake(true);
                setTimeout(() => setShake(false), 500);
                return; // ← ne jamais appeler onSuccess()
            }

            onSuccess();
        } catch (e) {
            if (e.code !== 'auth/popup-closed-by-user') {
                setErrorMsg("Erreur de connexion.");
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f0f4f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '36px 32px',
                width: 320,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
                animation: shake ? 'shake 0.4s ease' : undefined,
            }}>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-8px); }
                        40% { transform: translateX(8px); }
                        60% { transform: translateX(-6px); }
                        80% { transform: translateX(6px); }
                    }
                `}</style>

                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#1e3a5f' }}>
                    Fiche de Présence
                </h2>
                <p style={{ margin: '0 0 24px', fontSize: 13, color: '#94a3b8' }}>
                    YAS Madagascar · D.S.I
                </p>

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={value}
                    onChange={e => { setValue(e.target.value); setError(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                        fontSize: 15,
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: 8,
                        transition: 'border-color 0.2s',
                    }}
                />

                {error && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>
                        {errorMsg}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    style={{
                        width: '100%',
                        background: '#1e3a5f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        marginTop: 4,
                    }}
                    disabled={loading}
                >
                    Accéder
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>ou</span>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: '#fff',
                        color: '#374151',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '10px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} />
                    Continuer avec Google
                </button>
            </div>
        </div>
    );
}
