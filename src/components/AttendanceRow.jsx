// src/components/AttendanceRow.jsx
import { getStatus } from '../data/attendanceModel.js';

const STATUS_STYLE = {
    P: { label: 'Présent',    bg: '#4caf50', color: '#fff' },
    A: { label: 'Absent',     bg: '#f44336', color: '#fff' },
    '':{ label: 'Non défini', bg: '#ccc',    color: '#000' },
};

function formatDate(date) {
    return date.toLocaleDateString('fr-FR'); // "27/04/2026"
}

export default function AttendanceRow({ date, model, onToggle }) {
    const dow = date.getDay();
    const dateStr = formatDate(date);

    // Week-end
    if (dow === 0 || dow === 6) {
        return (
            <tr style={{ background: '#ddd' }}>
                <td>{dateStr}</td>
                <td colSpan={2} style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                    —
                </td>
            </tr>
        );
    }

    // Jour férié
    const key = date.toISOString().slice(0, 10);
    // (importez JOURS_FERIES si besoin depuis attendanceModel.js)

    const matinStatus  = getStatus(model, date, 'MATIN') || '';
    const apremStatus  = getStatus(model, date, 'APRES-MIDI') || '';
    const matinStyle   = STATUS_STYLE[matinStatus]  ?? STATUS_STYLE[''];
    const apremStyle   = STATUS_STYLE[apremStatus] ?? STATUS_STYLE[''];

    return (
        <tr>
            <td>{dateStr}</td>
            <td>
                <button
                    onClick={() => onToggle(date, 'MATIN')}
                    style={{ background: matinStyle.bg, color: matinStyle.color,
                        border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}
                >
                    {matinStyle.label}
                </button>
            </td>
            <td>
                <button
                    onClick={() => onToggle(date, 'APRES-MIDI')}
                    style={{ background: apremStyle.bg, color: apremStyle.color,
                        border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}
                >
                    {apremStyle.label}
                </button>
            </td>
        </tr>
    );
}