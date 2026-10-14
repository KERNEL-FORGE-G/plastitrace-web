# PlastiTrace Web

Site public et tableau de bord de démonstration de PlastiTrace, construit avec React et Vite. Il explique la solution, les trois étapes (collecter, valider, prouver), les indicateurs clés et l'état des lots.

## Installation

```bash
npm install
npm run dev
```

Production : `npm run build`, puis déployer le dossier `dist` sur Vercel, Netlify ou un serveur HTTPS. Le domaine public cible est `https://www.plastitrace.site/`.

## Organisation

`src/main.jsx` contient les vues et interactions du prototype ; `src/style.css` contient le système visuel responsive. Les données affichées sont de démonstration et doivent être remplacées par les réponses de l'API (`/stats`, `/lots`, `/certificates`, `/verify`).

## Prochaines intégrations API

Ajouter l'URL de l'API via `VITE_API_URL`, protéger le tableau de bord par authentification par rôle et relier la page de vérification au journal d'événements append-only.

appwrite key: standard_5cf74327c3abd5e7f84c54bb116e3e27d05b204aafd676d26322beb4593d9b853d066f3cb1b1623a89702a7e1e1f9f4d070b9b8b580cc2baf64c5a0a9590fd712b7ecbe5072ac90919b6baf024514cfe2897ebda9a828794a1ba84a3e0a14d11de87d2243ee7369bd6f8c1dface58d4124eb7d4cfec942fd26b14c9c0ee58aaa
