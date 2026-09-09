# Majalis Store Online

Application React / Vite avec API Node et base PostgreSQL Neon pour une boutique en ligne Majalis Store.

## Description

Site e-commerce simple avec tableau de bord administrateur, gestion des commandes, gestion du stock, et expérience client pour parcourir une boutique et passer des commandes.

## Technologies

- React 18
- Vite
- JavaScript / JSX
- CSS
- Node.js / Express
- PostgreSQL Neon

## Scripts

```bash
npm install
npm run dev
npm run server
npm run start:full
npm run build
npm run preview
```

## Structure principale

- `src/App.jsx` - point d’entrée de l’application, gestion de l’authentification et de la navigation
- `src/components/` - composants de pages et UI
- `server/index-neon.js` - API REST, schéma Neon et authentification
- `src/styles.css` - styles globaux et responsivité

## Utilisation

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer `.env` (un modèle est disponible dans `.env.example`) :
   ```env
   VITE_API_URL=http://localhost:8001/api
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   PORT=8001
   ADMIN_EMAIL=admin@majalis.store
   ADMIN_PASSWORD=changez-ce-mot-de-passe
   ```
3. Configurer le compte administrateur initial (une seule fois, avant le premier lancement) :
   ```bash
   ADMIN_EMAIL=admin@majalis.store ADMIN_PASSWORD=change-moi npm run server
   ```
   Utilisez un mot de passe d'au moins 6 caractères et remplacez ces valeurs en production.
4. Démarrer l’API et le front dans deux terminaux :
   ```bash
   npm run server
   npm run dev
   ```
5. Construire pour la production :
   ```bash
   npm run build
   ```
5. Prévisualiser la build :
   ```bash
   npm run preview
   ```

## Notes

- Le token de session reste uniquement en mémoire dans le navigateur et est supprimé au rechargement ; les utilisateurs, produits et commandes sont persistés dans Neon.
- Les tables Neon sont créées automatiquement au premier démarrage. La base démarre sans produits ni commandes fictifs.
- Les photos sont stockées directement dans Neon (`BYTEA`) et servies par `/api/products/:id/image`, sans dossier local d’uploads.

## Déploiement Render + Vercel

Le frontend et l’API doivent être déployés comme deux services séparés.

Pour l’API sur Render, créez un **Web Service** avec :

```text
Build command: npm install
Start command: npm run serve
```

Ajoutez sur Render `DATABASE_URL`, `ADMIN_EMAIL` et `ADMIN_PASSWORD`. Testez ensuite :

```text
https://URL-DE-L-API.onrender.com/api/health
```

La réponse attendue est `{"ok":true,"service":"majalis-api"}`. Dans Vercel, configurez ensuite `VITE_API_URL=https://URL-DE-L-API.onrender.com/api`, puis redéployez le frontend.
- La sidebar mobile peut être ouverte/fermée avec le menu hamburger et un bouton de fermeture.
