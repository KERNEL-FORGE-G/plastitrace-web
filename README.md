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
