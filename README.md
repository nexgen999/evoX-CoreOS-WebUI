# evoX Core OS Web Dashboard

Dashboard statique GitHub Pages au style evoX Core OS. Il détecte automatiquement le dépôt GitHub et propose Home, News RSS/Atom/OPML, Download, Store JSON, Services externes + WebUI locales, Documentation Markdown, About, Remerciements et footer configurable.

## Structure
```text
/
├── index.html
├── README.md
└── web/
    ├── assets/      # logo + backgrounds SVG remplaçables
    ├── css/style.css
    ├── data/
    │   ├── config.json
    │   ├── config.sample.json
    │   └── config.example.jsonc
    └── js/
```

## Installation
1. Copiez `index.html` et `web/` à la racine du dépôt.
2. Modifiez `web/data/config.json`.
3. Activez GitHub Pages.
4. Le site détecte owner, repository et branche depuis l'URL. Les valeurs de `repository` peuvent forcer la détection.

Chemins par défaut : `/json/`, `/rss/`, `/docs/`, `/archives/`, `/web/assets/`. Toute source peut aussi être une URL HTTPS.

## News RSS / Atom / OPML
Le moteur lit RSS (`item`) et Atom (`entry`). Les OPML sont lus via leurs `outline[xmlUrl]`. Les `.opml` du dossier `/rss/` peuvent être détectés automatiquement.

`homeNews` est volontairement indépendant de `news`, donc la Home peut avoir son propre OPML/RSS :
```json
"homeNews": {
  "feeds": [],
  "opmlFiles": ["/rss/home.opml"],
  "autoDiscover": false,
  "autoDiscoverOpml": false,
  "maxItems": 4
}
```

## Store
Les `.json` de `/json/` sont découverts automatiquement ou peuvent être déclarés dans `store.sources`. `fieldMap` permet de mapper les noms de champs. Recherche, catégorie, sous-catégorie, vue **liste**, vue **tuile**, détails et téléchargement sont disponibles.

## Download
Liste de fichiers/packs fixes via `downloads.items`, idéale pour les AIO ZIP.

## Services
`services.external.items` contient les liens publics. `services.local.groups` contient les WebUI locales. L'utilisateur saisit l'IP de la console ; une tuile configurée avec `port: 12800` et `path: "/"` ouvre par exemple `http://192.168.1.50:12800/`.

## Documentation
`/docs/` est parcouru récursivement via l'API GitHub. Les sous-dossiers sont affichés dans la sidebar wiki. `docs.order` permet d'imposer un ordre ; les autres fichiers sont triés automatiquement.

## Réseaux sociaux
GitHub, X et Bluesky ont des icônes intégrées. Une icône personnalisée peut utiliser `iconType: "image"` avec un PNG/SVG/ICO.

Les réseaux apparaissent dans la barre supérieure et dans **Suivez-moi** en bas de la sidebar.

## Footer / badges
Le footer accepte des liens et autant de badges que nécessaire. Les images Shields.io sont directement supportées et chaque badge peut avoir son propre lien `href`.

## Design
Le thème est **dark uniquement**. Les backgrounds suivants sont séparés et remplaçables : `hero-bg.svg`, `welcome-bg.svg`, `news-bg.svg`, `thanks-bg.svg`, `services-bg.svg`, `about-bg.svg`, `sidebar-bg.svg`.

Pour la configuration détaillée et commentée, consultez `web/data/config.example.jsonc`.
