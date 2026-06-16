// src/components/AttendanceGrid.jsx
import AttendanceRow from './AttendanceRow.jsx';
import { JOURS_FERIES } from '../data/attendanceModel.js';

export default function AttendanceGrid({ days, model, onToggle }) {
    return (
        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ background: '#4682b4', color: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px' }}>Date</th>
                    <th style={{ padding: '6px 8px' }}>Matin</th>
                    <th style={{ padding: '6px 8px' }}>Après-midi</th>
                </tr>
                </thead>
                <tbody>
                {days.map(d => {
                    const key = d.getFullYear() + '-' +
                        String(d.getMonth() + 1).padStart(2, '0') + '-' +
                        String(d.getDate()).padStart(2, '0');

                    if (JOURS_FERIES.has(key)) {
                        return (
                            <tr key={key} style={{ background: '#fff3cd' }}>
                                <td style={{ padding: '4px 8px' }}>
                                    {d.toLocaleDateString('fr-FR')}
                                </td>
                                <td
                                    colSpan={2}
                                    style={{ textAlign: 'center', color: '#b47800', fontStyle: 'italic' }}
                                >
                                    Jour Férié
                                </td>
                            </tr>
                        );
                    }

                    return (
                        <AttendanceRow
                            key={key}
                            date={d}
                            model={model}
                            onToggle={onToggle}
                        />
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}