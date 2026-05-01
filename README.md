# Majalis Store Online

Application React / Vite pour une boutique en ligne Majalis Store.

## Description

Site e-commerce simple avec tableau de bord administrateur, gestion des commandes, gestion du stock, et expérience client pour parcourir une boutique et passer des commandes.

## Technologies

- React 18
- Vite
- JavaScript / JSX
- CSS

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure principale

- `src/App.jsx` - point d’entrée de l’application, gestion de l’authentification et de la navigation
- `src/components/` - composants de pages et UI
- `src/data/mockData.js` - données initiales de produits, utilisateurs et commandes
- `src/styles.css` - styles globaux et responsivité

## Utilisation

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
3. Construire pour la production :
   ```bash
   npm run build
   ```
4. Prévisualiser la build :
   ```bash
   npm run preview
   ```

## Notes

- L’application stocke l’utilisateur connecté dans `localStorage` pour conserver la session.
- Les données produits et commandes sont initialisées à partir de `src/data/mockData.js`.
- La sidebar mobile peut être ouverte/fermée avec le menu hamburger et un bouton de fermeture.
