# Fiche de Présence — YAS Madagascar

Application React (Vite) de suivi des présences de stage.

---

## 🔐 Sécurité par URL secrète

L'accès est protégé par un **slug secret** dans l'URL.

### Modifier le slug (dans `src/App.jsx`)

```js
const SECRET_SLUG = '/x9k2m-presence'; // ← change ici
```

Toute autre URL → redirection vers `about:blank`.

---

## 🚀 Déploiement

### Vercel (recommandé)

```bash
npm i -g vercel
vercel --prod
```

URL produite : `https://xxx.vercel.app`

**Lien privé final :** `https://xxx.vercel.app/x9k2m-presence`

### Cloudflare Pages

1. Push sur GitHub
2. Connecter le repo sur pages.cloudflare.com
3. Build command : `npm run build` / Output : `dist`

---

## 👥 Système Manager

Les managers sont persistés dans `localStorage`.

| Action | Comment |
|---|---|
| Changer le manager actif | Cliquer "Activer" dans le panel |
| Renommer un manager | Cliquer "Renommer" puis Enter |
| Persistence | Automatique (localStorage) |

Le **manager actif** apparaît automatiquement sur tous les PDFs exportés.

---

## 📦 Structure

```
src/
├── App.jsx                  # Entry + SecurityGuard
├── components/
│   ├── AttendanceGrid.jsx
│   ├── AttendanceRow.jsx
│   ├── ManagerPanel.jsx     # 🆕 Toggle manager UI
│   └── PdfExport.jsx        # Utilise activeManager.name
├── data/
│   ├── attendanceModel.js
│   └── dataStore.js         # 🆕 Persistence managers
├── hooks/
│   ├── useAttendance.js
│   └── useManagers.js       # 🆕 Manager state
└── fonts/
    └── aptosNarrow.js
```

---

## Dev local

```bash
npm install
npm run dev
# Ouvrir : http://localhost:5173/x9k2m-presence
```# fiche-presence
