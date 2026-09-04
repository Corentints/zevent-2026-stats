# zevent-history-worker

Petit Cloudflare Worker qui construit un **historique partagé** des dons ZEvent — le total global *et* le détail par streamer — pour remplacer l'accumulation `localStorage` (privée à chaque navigateur) par une donnée commune à tous les visiteurs du dashboard.

## Comment ça marche

- Un **Cron Trigger** (`*/6 * * * *`, toutes les 6 min) appelle `https://zevent.fr/api/` et insère :
  - une ligne dans `global_history` (total des dons + spectateurs cumulés)
  - une ligne par streamer (338 actuellement) dans `streamer_history` (montant de dons + spectateurs)
- Stockage sur **D1** (SQLite managé par Cloudflare), pas R2 : on a des lignes qui s'accumulent en continu (~339 lignes/tick), ce n'est pas un usage adapté à un blob JSON qu'on relit/réécrit en entier à chaque fois (R2 aurait vite cogné les limites CPU du plan gratuit).
- `GET /history` → historique global, `GET /history/streamer/:twitchId` → historique d'un streamer donné.

### Pourquoi toutes les 6 minutes ?

Le plan gratuit D1 limite à **100 000 lignes écrites/jour**. Avec 338 streamers + 1 ligne globale = 339 lignes par tick :

| Cadence | Ticks/jour | Lignes/jour | % du quota gratuit |
|---|---|---|---|
| 2 min | 720 | 244 080 | ❌ 244% (dépasse) |
| 5 min | 288 | 97 632 | ⚠️ 98% (trop juste) |
| **6 min** | **240** | **81 360** | ✅ 81% |
| 10 min | 144 | 48 816 | ✅ 49% |

6 min garde une marge confortable (~19%) pour absorber retries et pics d'activité, tout en donnant une résolution correcte pour une courbe sur un event de 50h (~500 points par streamer).

## Déployer

Authentification Cloudflare nécessaire (pas possible depuis une session non-interactive). Depuis ton terminal :

```bash
cd worker
npm install

# 1. Connecte-toi à ton compte Cloudflare
npx wrangler login

# 2. Crée la base D1 (une seule fois) — copie le database_id affiché
npx wrangler d1 create zevent-history
```

Colle le `database_id` retourné dans `wrangler.jsonc` (remplace `<TO_FILL_AFTER_WRANGLER_D1_CREATE>`), puis :

```bash
# 3. Applique le schéma sur la base distante
npx wrangler d1 migrations apply zevent-history --remote

# 4. Déploie le worker
npx wrangler deploy
```

À la fin, `wrangler` affiche l'URL publique du worker, du genre :

```
https://zevent-history-worker.<ton-compte>.workers.dev
```

## Brancher le frontend dessus

Dans le projet React (racine du repo), crée un fichier `.env` (copie de `.env.example`) :

```
VITE_HISTORY_API_URL=https://zevent-history-worker.<ton-compte>.workers.dev
```

- En local : redémarre `npm run dev`.
- Sur Vercel : ajoute `VITE_HISTORY_API_URL` dans Project Settings → Environment Variables, puis redéploie.
- Sur GitHub Pages : ajoute `VITE_HISTORY_API_URL` comme secret/variable du repo et référence-le dans le step `npm run build` de ton workflow GitHub Actions.

Si la variable n'est pas définie, l'app retombe automatiquement sur l'ancien comportement (historique local par navigateur, total global uniquement) — rien ne casse.

Le frontend actuel ne consomme que `/history` (courbe globale). L'endpoint `/history/streamer/:twitchId` existe et renvoie déjà de la vraie donnée, mais rien ne l'affiche encore côté UI (sparkline par ligne, graphique au clic sur un streamer...) — à faire si besoin.

## Dev local

```bash
npm run dev                                          # wrangler dev --test-scheduled, sur http://localhost:8787
npx wrangler d1 migrations apply zevent-history --local   # applique le schéma en local (une fois)

curl http://localhost:8787/history                        # historique global
curl http://localhost:8787/history/streamer/<twitch_id>   # historique d'un streamer
curl http://localhost:8787/__scheduled                    # déclenche manuellement le cron
```

## Limites connues

- Pas d'atomicité inter-requêtes sur l'insertion par lots de 20 streamers (voir commentaire dans `src/index.ts`) : un lot qui échoue n'empêche pas les autres d'être écrits. Acceptable pour des stats, pas pour une donnée critique.
- Le cron continue de tourner après la fin de l'event tant que le worker est déployé — pense à supprimer le Cron Trigger (ou le worker) une fois ZEvent terminé.
- Plan gratuit D1 : 5 Go de stockage total, 5M lignes lues/jour, 100k lignes écrites/jour (dépassé au-delà, jusqu'à minuit UTC). Largement suffisant pour un event de quelques jours avec la cadence actuelle.
