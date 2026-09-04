# evoX Core OS WebUI

Interface web statique configurable pour le dépôt `evoX-CoreOS`. Elle est conçue pour GitHub Pages et ne nécessite aucun serveur applicatif.

## Architecture

- `index.html` : point d'entrée unique.
- `web/css/style.css` : charte graphique sombre evoX.
- `web/js/` : moteur de navigation, GitHub, Store, RSS/Atom/OPML, services et documentation.
- `web/data/config.json` : configuration active, lisible et commentée.
- `web/data/config.example.jsonc` : copie de référence commentée.
- `web/data/store.sample.json` : exemple de catalogue JSON formaté.
- `docs/` : documentation de démonstration intégrée.

## Déploiement

1. Copiez le contenu de cette archive dans le dépôt WebUI.
2. Activez GitHub Pages sur la branche souhaitée.
3. Éditez uniquement `web/data/config.json` pour adapter l'interface.
4. Si la WebUI est déplacée dans un autre dépôt GitHub Pages, l'owner et le nom du dépôt sont détectés automatiquement si `autoDetect` reste activé.

## Deux dépôts

La configuration actuelle sépare :

- **Core OS** : `https://github.com/nexgen999/evoX-CoreOS`
- **WebUI** : `https://github.com/nexgen999/evoX-CoreOS-WebUI`

Le Core OS fournit les JSON, RSS/Atom/OPML et archives. La WebUI fournit l'interface et sa documentation.

## Configuration

Le fichier actif est un JSONC : les commentaires sont autorisés. Il est organisé en sections numérotées pour éviter les longues listes illisibles. Les sections principales sont :

1. général
2. auto-détection
3. dépôt Core OS
4. dépôt WebUI
5. chemins
6. source du site
7. navigation
8. profil
9. branding
10. réseaux sociaux
11. header
12. sidebar
13. Home
14. Home RSS/OPML
15. News RSS/Atom/OPML
16. Download
17. Store
18. Services
19. Documentation
20. About
21. Remerciements
22. Footer/badges
23. thème sombre

### Important

Un fichier portant l'extension `.json` n'accepte normalement pas les commentaires. Cette WebUI utilise volontairement un petit parseur JSONC interne afin que `config.json` reste commenté et agréable à administrer. Ne remplacez pas ce fichier par `JSON.parse()` dans votre propre fork sans conserver ce comportement.

## Core OS : sources réelles

Les quatre catalogues actuellement utilisés sont :

- `/json/payloads.json` → tableau `payloads`
- `/json/pkg.json` → tableau `packages`
- `/json/ffpfsc.json` → tableau `files`
- `/json/apps.json` → tableau `apps`

Le moteur accepte également `items` et `data` pour faciliter la réutilisation sur d'autres dépôts.

## RSS / Atom / OPML

La Home et la page News ont deux configurations distinctes. Une source ajoutée dans `homeNews` n'est pas automatiquement ajoutée à `news`.

Une source peut être :

- une URL RSS/XML directe ;
- une URL Atom ;
- une URL OPML ;
- une URL locale/relative ;
- une URL externe.

Les OPML sont parcourus et chaque `outline` contenant `xmlUrl` devient un flux.

## Download

Les packs AIO utilisent le tag GitHub `latest` :

`https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/`

Les trois catalogues Pegasus sont configurés comme ressources à copier :

- `https://pegasus-catalog.fly.dev/catalogs/dlps.json`
- `https://pegasus-catalog.fly.dev/catalogs/pippo.json`
- `https://pegasus-catalog.fly.dev/catalogs/pfs.json`

## Services

Les onglets sont générés à partir de `services.tabs`. Vous pouvez en ajouter autant que nécessaire.

### WebKit

Utilisez `type: "links"` et `url` pour créer des redirections publiques.

### WebUI PS5

Une IP est saisie dans l'interface puis enregistrée dans `localStorage`. Chaque service définit séparément :

- `protocol`
- `port`
- `path`

Exemple : `http://192.168.1.50:12800/`.

### Vues

Services et Store proposent des vues liste, cartes/tuile. Les vues sont pilotées côté interface sans changer les sources.

## Documentation

La documentation est une petite Wiki Markdown. Le dossier est récursif lorsqu'il est lu via l'arbre GitHub. `docs.order` permet de fixer l'ordre. Les sous-dossiers sont conservés dans les chemins.

## Icônes et images

Les icônes intégrées sont définies dans `web/js/icons.js`. Pour une image personnalisée, utilisez par exemple `iconType: "image"` et un chemin PNG/SVG/ICO. Les backgrounds SVG sont de vrais fichiers séparés afin d'être facilement remplacés.

## Footer

Les badges du footer sont configurables. Vous pouvez utiliser une image locale ou une URL complète, et chaque badge peut pointer vers la page de votre choix.

## Limites GitHub Pages

Cette interface est statique. Les sources externes doivent autoriser les requêtes navigateur (CORS). Les fichiers GitHub et GitHub Pages publics sont normalement adaptés à ce fonctionnement. Une source RSS publique qui bloque CORS devra être publiée via une source intermédiaire ou dans le dépôt Core OS.
