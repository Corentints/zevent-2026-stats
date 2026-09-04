# zevent-2026-stats

Tableau de bord React pour suivre en direct les dons et le classement des streamers du [ZEvent](https://zevent.fr), à partir de l'API publique `https://zevent.fr/api/`.

## Stack

- [Vite](https://vite.dev) + React + TypeScript
- [TanStack Router](https://tanstack.com/router) — navigation entre les pages (Vue d'ensemble / Classement complet)
- [TanStack Query](https://tanstack.com/query) — polling de l'API toutes les 30s
- [TanStack Table v9](https://tanstack.com/table) — classement triable et filtrable
- [Recharts](https://recharts.org) via les composants `chart` de [shadcn/ui](https://ui.shadcn.com)
- Tailwind CSS v4

## Fonctionnalités

- Deux pages accessibles depuis la navbar : **Vue d'ensemble** (`/`) et **Classement complet** (`/classement`)
- Statistiques globales : total des dons, spectateurs cumulés, streamers en ligne
- Courbe générale des dons dans le temps — historique partagé via [worker/](worker/) (Cloudflare Worker + D1) si `VITE_HISTORY_API_URL` est configuré, sinon accumulation locale par navigateur (`localStorage`) en secours
- Top 10 des streamers par montant de dons
- Classement complet : recherche par nom, tri par colonne (dons, spectateurs, statut…), filtre "en ligne uniquement"

## Démarrer

```bash
npm install
npm run dev
```

L'app est servie sur http://localhost:5173.

### À propos du proxy API

`zevent.fr/api/` ne renvoie pas d'en-tête CORS, donc un appel direct depuis le navigateur est bloqué hors de zevent.fr. En développement, `vite.config.ts` proxifie `/api/zevent` vers `https://zevent.fr/api/` pour contourner ça.

**Pour un déploiement en production statique**, ce proxy de dev ne suffit plus : il faut une fonction serverless / un edge worker (Cloudflare Worker, Vercel/Netlify function, etc.) qui relaie la requête vers `zevent.fr/api/` avec les bons en-têtes.

### Historique des dons partagé (Cloudflare Worker + D1)

Voir [worker/README.md](worker/README.md) pour déployer le petit worker qui construit une courbe de dons partagée entre tous les visiteurs (au lieu d'un historique privé par navigateur), avec le détail par streamer en plus du total global. Une fois déployé, renseigne son URL dans `VITE_HISTORY_API_URL` (voir `.env.example`) — sans ça, l'app fonctionne quand même, juste avec l'historique local.

### Routing et fallback SPA

L'app utilise TanStack Router en mode navigateur (vraies URLs `/` et `/classement`, pas de hash). Un rechargement direct sur `/classement` doit être servi avec `index.html` par ton hébergeur :

- **Vite dev / `vite preview`** : déjà géré automatiquement.
- **Vercel** : voir `vercel.json` à la racine (rewrite déjà configuré).
- **GitHub Pages** : pas de rewrites côté serveur — copie `dist/index.html` vers `dist/404.html` après le build (GitHub Pages sert `404.html` pour toute route inconnue, qui charge l'app et laisse le routeur reprendre la main côté client).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (`dist/`)
- `npm run preview` — prévisualiser le build
- `npm run lint` — lint avec oxlint
