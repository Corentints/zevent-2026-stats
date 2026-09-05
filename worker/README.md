# zevent-history-worker

Petit Cloudflare Worker qui construit un **historique partagé** des dons ZEvent — le total global *et* le détail par streamer — pour remplacer l'accumulation `localStorage` (privée à chaque navigateur) par une donnée commune à tous les visiteurs du dashboard.

## Comment ça marche

- Un **Cron Trigger** (`* * * * *`, toutes les minutes) appelle `https://zevent.fr/api/`.
- Chaque relevé complet est compacté dans une seule ligne de `streamer_history` :
  - `amount` et `viewers` contiennent les totaux globaux ;
  - `display` contient un objet JSON compact indexé par identifiant Twitch, avec les dons et spectateurs de chaque streamer ;
  - `twitch_id` vaut `__zevent_snapshot__` pour distinguer ces nouveaux relevés des anciennes lignes individuelles.
- Les endpoints fusionnent les anciennes données et les snapshots compacts, sans migration destructive ni perte d'historique.
- Les réponses sont conservées 55 secondes dans le cache Cloudflare pour limiter les lectures D1 lorsque plusieurs visiteurs consultent la même courbe.
- `GET /history` → historique global, `GET /history/streamer/:twitchId` → historique d'un streamer donné.

### Pourquoi un snapshot compact ?

Le plan gratuit D1 limite à **100 000 lignes écrites/jour** et chaque index modifié compte comme une écriture supplémentaire. L'ancien format écrivait une ligne par streamer dans une table possédant deux index, soit environ 1 015 écritures facturées par relevé.

Le nouveau format écrit une seule ligne dans cette même table. Table + clé primaire + index secondaire représentent au maximum trois écritures facturées par relevé :

| Cadence | Relevés/jour | Écritures D1/jour | Quota gratuit |
|---|---:|---:|---:|
| **1 min** | **1 440** | **~4 320** | **~4,3 %** |

La fréquence d'une minute est la fréquence maximale des Cron Triggers Cloudflare et garde plus de 95 % de marge sur le quota d'écriture.

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

Le frontend consomme `/history` pour la courbe globale et `/history/streamer/:twitchId` pour les pages et aperçus des streamers.

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
- Plan gratuit D1 : 5 Go de stockage total, 5M lignes lues/jour et 100k lignes écrites/jour. Le cache limite les lectures répétées, tandis que les snapshots compacts restent très largement sous la limite d'écriture.
