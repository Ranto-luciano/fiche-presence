// src/components/ManagerPanel.jsx
import { useState } from 'react';

export default function ManagerPanel({ managers, activeManager, onSwitch, onUpdateName }) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [open, setOpen] = useState(false);

    function startEdit(m) {
        setEditingId(m.id);
        setEditValue(m.name);
    }

    function confirmEdit(id) {
        if (editValue.trim()) onUpdateName(id, editValue.trim());
        setEditingId(null);
    }

    return (
        <div style={{ marginBottom: 12 }}>
            {/* Toggle button */}
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    background: 'none',
                    border: '1px solid #cbd5e1',
                    borderRadius: 7,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'inherit',
                }}
            >
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#22c55e', display: 'inline-block', flexShrink: 0
                }} />
                Manager actif : <strong style={{ color: '#1e3a5f' }}>{activeManager.name}</strong>
                <span style={{ marginLeft: 4, opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
            </button>

            {/* Panel */}
            {open && (
                <div style={{
                    marginTop: 8,
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                }}>
                    <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Gestion des managers
                    </div>
                    {managers.map(m => (
                        <div key={m.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            background: m.active ? '#eff6ff' : '#fff',
                        }}>
                            {/* Dot */}
                            <span style={{
                                width: 9, height: 9, borderRadius: '50%',
                                background: m.active ? '#22c55e' : '#cbd5e1',
                                flexShrink: 0,
                            }} />

                            {/* Name / edit */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>{m.role}</div>
                                {editingId === m.id ? (
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onBlur={() => confirmEdit(m.id)}
                                        onKeyDown={e => e.key === 'Enter' && confirmEdit(m.id)}
                                        style={{
                                            fontSize: 13, fontWeight: 600, border: '1px solid #3b82f6',
                                            borderRadius: 4, padding: '2px 6px', width: '100%',
                                            fontFamily: 'inherit', color: '#1e3a5f',
                                            outline: 'none',
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>
                                        {m.name}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                {!m.active && (
                                    <button
                                        onClick={() => { onSwitch(m.id); setOpen(false); }}
                                        style={{
                                            fontSize: 11, padding: '3px 10px',
                                            background: '#1e3a5f', color: '#fff',
                                            border: 'none', borderRadius: 5, cursor: 'pointer',
                                            fontFamily: 'inherit', fontWeight: 600,
                                        }}
                                    >
                                        Activer
                                    </button>
                                )}
                                {editingId !== m.id && (
                                    <button
                                        onClick={() => startEdit(m)}
                                        style={{
                                            fontSize: 11, padding: '3px 10px',
                                            background: '#f1f5f9', color: '#475569',
                                            border: '1px solid #e2e8f0', borderRadius: 5,
                                            cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        Renommer
                                    </button>
                                )}
                            </div>

                            {m.active && (
                                <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', borderRadius: 4, padding: '2px 7px', fontWeight: 700 }}>ACTIF</span>
                            )}
                        </div>
                    ))}
                    <div style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 11, color: '#94a3b8' }}>
                        ℹ️ Le manager actif apparaîtra sur les PDF exportés.
                    </div>
                </div>
            )}
        </div>
    );
}
