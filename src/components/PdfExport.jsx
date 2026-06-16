// src/components/PdfExport.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    JOURS_FERIES,
    STAGE_END,
    getStatus,
    calculateAbsenceForPeriod,
} from '../data/attendanceModel.js';
import { APTOS_NARROW_BASE64 } from "../fonts/aptosNarrow.js";

function formatDate(date) {
    return date.toLocaleDateString('fr-FR');
}
function getStatusLabel(status) {
    if (status === 'P') return 'Présent';
    if (status === 'A') return 'Absent';
    return '-';
}
function formatAbsence(absence) {
    if (absence === 0) return '0 jour';
    const demi = Math.round(absence * 2);
    if (demi % 2 === 0) {
        const j = demi / 2;
        return `${j} jour${j > 1 ? 's' : ''}`;
    }
    const j = Math.floor(demi / 2);
    if (j === 0) return '1/2 journée';
    return `${j} jour${j > 1 ? 's' : ''} et 1/2 journée`;
}

const BASE_FONT_SIZE = 9;
const BASE_PADDING   = 1.2;
const BASE_ROW_H     = 5.5;
const PAGE_W         = 210;
const PAGE_H         = 297;
const BASE_MARGIN    = 5;

export default function PdfExport({ model, selectedMonth, start, end, managerName }) {

    async function handleExport() {
        if (!window.confirm(`Exporter le PDF pour ${selectedMonth} ?`)) return;

        const actualEnd = end < STAGE_END ? end : new Date(STAGE_END);
        const rows = [];

        let d = new Date(start);
        while (d <= actualEnd) {
            const key = d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
            const dow = d.getDay();
            const dateStr = formatDate(d);

            if (dow === 0 || dow === 6) {
                rows.push({ date: dateStr, matin: 'Week-end', aprem: '', type: 'weekend' });
            } else if (JOURS_FERIES.has(key)) {
                rows.push({ date: dateStr, matin: 'Jour Férié', aprem: '', type: 'ferie' });
            } else {
                rows.push({
                    date: dateStr,
                    matin: getStatusLabel(getStatus(model, d, 'MATIN')),
                    aprem: getStatusLabel(getStatus(model, d, 'APRES-MIDI')),
                    type: 'normal',
                });
            }
            d.setDate(d.getDate() + 1);
        }

        const renderPdf = (isDryRun, scaleRatio = 1) => {
            const docFormat = isDryRun ? [PAGE_W, 2000] : [PAGE_W, PAGE_H];
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: docFormat });

            const sMargin  = BASE_MARGIN * scaleRatio;
            const sFont    = BASE_FONT_SIZE * scaleRatio;
            const sPadding = BASE_PADDING * scaleRatio;
            const sRowH    = BASE_ROW_H * scaleRatio;

            doc.addFileToVFS('AptosNarrow.ttf', APTOS_NARROW_BASE64);
            doc.addFont('AptosNarrow.ttf', 'AptosNarrow', 'normal');
            doc.addFont('AptosNarrow.ttf', 'AptosNarrow', 'bold');
            doc.addFont('AptosNarrow.ttf', 'AptosNarrow', 'italic');
            const font = 'AptosNarrow';
            doc.setFont(font);

            let cursorY = sMargin + (5 * scaleRatio);
            doc.setFontSize(sFont + (2 * scaleRatio));
            doc.setFont(font, 'bold');
            doc.text('SOCIETE : YAS Madagascar', sMargin, cursorY);
            cursorY += (5 * scaleRatio);

            doc.setFontSize(sFont);
            doc.setFont(font, 'normal');
            doc.text('Direction/Département : D.S.I', sMargin, cursorY);
            cursorY += (3 * scaleRatio);

            autoTable(doc, {
                startY: cursorY,
                theme: 'plain',
                tableWidth: PAGE_W - (2 * sMargin),
                margin: { left: sMargin, right: sMargin },
                styles: { font, fontSize: sFont - (1 * scaleRatio), cellPadding: sPadding * 0.8 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 30 * scaleRatio },
                    1: { cellWidth: 50 * scaleRatio },
                    2: { fontStyle: 'bold', cellWidth: 30 * scaleRatio },
                    3: { cellWidth: 90 * scaleRatio },
                },
                body: [
                    ['NOM :',           'RAZAFIMAMONJY',           'Période Stage :',  '27/04/2026 au 26/07/2026'],
                    ['PRENOMS :',       'Fahatokiana David',        'Durée Stage :',    '3 mois'],
                    ['MVOLA :',         '0389518154',               '',                 ''],
                    ['Période Fiche :', `${formatDate(start)} au ${formatDate(end)}`, '', ''],
                ],
            });

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + (2 * scaleRatio),
                tableWidth: PAGE_W - (2 * sMargin),
                margin: { bottom: 0, left: sMargin, right: sMargin },
                head: [['Date', 'Matin', 'Après-midi']],
                body: rows.map(r => [r.date, r.matin, r.aprem]),
                styles: {
                    font, fontSize: sFont, cellPadding: sPadding,
                    halign: 'center', minCellHeight: sRowH, valign: 'middle',
                    lineWidth: 0.1 * scaleRatio, lineColor: [200, 200, 200],
                },
                columnStyles: {
                    0: { halign: 'left',   cellWidth: 60 * scaleRatio },
                    1: { halign: 'center', cellWidth: 70 * scaleRatio },
                    2: { halign: 'center', cellWidth: 70 * scaleRatio },
                },
                headStyles: {
                    fillColor: [70, 130, 180], textColor: 255,
                    fontStyle: 'bold', minCellHeight: sRowH,
                },
                didParseCell(data) {
                    if (data.section !== 'body') return;
                    const row = rows[data.row.index];
                    if (data.row.index % 2 === 0) data.cell.styles.fillColor = [240, 248, 255];
                    if (row.type === 'weekend') {
                        data.cell.styles.fillColor = [220, 220, 220];
                        data.cell.styles.textColor = [100, 100, 100];
                        data.cell.styles.fontStyle = 'italic';
                    } else if (row.type === 'ferie') {
                        data.cell.styles.fillColor = [255, 243, 205];
                        data.cell.styles.textColor = [180, 120, 0];
                        data.cell.styles.fontStyle = 'italic';
                    } else if (data.column.index > 0) {
                        if (data.cell.raw === 'Présent') data.cell.styles.textColor = [0, 128, 0];
                        if (data.cell.raw === 'Absent')  data.cell.styles.textColor = [180, 0, 0];
                    }
                },
                willDrawCell(data) {
                    if (data.section !== 'body') return;
                    const row = rows[data.row.index];
                    if ((row.type === 'weekend' || row.type === 'ferie') && data.column.index === 2) {
                        data.cell.text = [''];
                        data.cell.styles.fillColor = row.type === 'weekend' ? [220, 220, 220] : [255, 243, 205];
                    }
                },
            });

            const presenceBottom = doc.lastAutoTable.finalY;
            const absY = presenceBottom + (4 * scaleRatio);

            doc.setFontSize(sFont);
            doc.setFont(font, 'bold');
            const absence = calculateAbsenceForPeriod(model, start, end);
            doc.text(`Nombre de jour(s) d'absence : ${formatAbsence(absence)}`, sMargin, absY);

            const sigY = absY + (6 * scaleRatio);
            const leftCenterX = PAGE_W * 0.25;
            const rightCenterX = PAGE_W * 0.75;
            const lineHalfLength = 20 * scaleRatio;
            const SIGNATURE_SPACE = 22;

            doc.setFont(font, 'normal');
            doc.setFontSize(sFont - (0.5 * scaleRatio));
            doc.text('Le stagiaire,', leftCenterX, sigY, { align: 'center' });
            doc.text('Le Manager,', rightCenterX, sigY, { align: 'center' });

            doc.setLineWidth(0.3 * scaleRatio);
            const lineY = sigY + (SIGNATURE_SPACE * scaleRatio);
            doc.line(leftCenterX - lineHalfLength, lineY, leftCenterX + lineHalfLength, lineY);
            doc.line(rightCenterX - lineHalfLength, lineY, rightCenterX + lineHalfLength, lineY);

            doc.setFont(font, 'bold');
            const nameY = lineY + (4 * scaleRatio);
            doc.text('Fahatokiana David RAZAFIMAMONJY', leftCenterX, nameY, { align: 'center' });
            // ✅ Utilise le manager actif dynamiquement
            doc.text(managerName, rightCenterX, nameY, { align: 'center' });

            const finalContentBottom = nameY + (5 * scaleRatio);
            return { doc, contentHeight: finalContentBottom };
        };

        const { contentHeight } = renderPdf(true, 1);
        const targetHeight = PAGE_H - 5;
        let scaleFactor = 1;
        if (contentHeight > targetHeight) {
            scaleFactor = targetHeight / contentHeight;
        }

        const { doc: finalDoc } = renderPdf(false, scaleFactor);
        const filename = `presence_${selectedMonth.replace(/ /g, '_')}.pdf`;
        finalDoc.save(filename);
    }

    return (
        <button onClick={handleExport} style={{
            background: '#1e3a5f', color: '#fff', border: 'none',
            borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
        }}>
            📄 Exporter PDF
        </button>
    );
}