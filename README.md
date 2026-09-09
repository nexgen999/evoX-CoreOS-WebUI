# evoX Core OS WebUI

> **One Store · One Tool · All Platforms**

Dashboard WebUI statique pour evoX Core OS, pensé pour GitHub Pages, les forks et la fusion éventuelle dans le dépôt CoreOS.

## Fonctionnalités

- 🏠 Home riche avec Hero, news, mini-store, ressources, remerciements, statistiques et footer
- 📰 RSS / Atom / OPML
- 🔀 sources Home et News indépendantes
- ⬇️ packs AIO + Other Downloads
- 📋 copie des catalogues Pegasus
- 🛒 Store JSON web avec recherche, catégories, sous-catégories, tuiles et liste
- 🔗 Services par onglets extensibles
- 🎮 WebUI PS5 avec IP + ports configurables
- 📖 wiki Markdown récursif
- 👤 détection GitHub
- 🌐 réseaux sociaux configurables
- 🖼️ icônes externes PNG/SVG/ICO
- 🏷️ footer et badges
- 📦 aucune étape de build

## Structure

```text
index.html
docs/
web/
├── css/
├── js/
├── data/
└── assets/
```

## Configuration

Le fichier actif est `web/data/config.json`.

La référence commentée et lisible ligne par ligne est `web/data/config.sample.jsonc`.

### Dépôt séparé

```text
WebUI: nexgen999/evoX-CoreOS-WebUI
Data : nexgen999/evoX-CoreOS
```

### Fusion dans CoreOS

Copiez `index.html` et `web/` dans le fork CoreOS et pointez `github.dataRepository` vers ce fork.

## Sources CoreOS préconfigurées

### JSON

- `https://nexgen999.github.io/evoX-CoreOS/json/payloads.json`
- `https://nexgen999.github.io/evoX-CoreOS/json/pkg.json`
- `https://nexgen999.github.io/evoX-CoreOS/json/ffpfsc.json`
- `https://nexgen999.github.io/evoX-CoreOS/json/apps.json`

### RSS

- `https://nexgen999.github.io/evoX-CoreOS/rss/payloads_rss.xml`
- `https://nexgen999.github.io/evoX-CoreOS/rss/pkg_rss.xml`
- `https://nexgen999.github.io/evoX-CoreOS/rss/ffpfsc_rss.xml`
- `https://nexgen999.github.io/evoX-CoreOS/rss/apps_rss.xml`

### OPML

`https://nexgen999.github.io/evoX-CoreOS/rss/source_aio.opml`

### Releases

Les packs utilisent le tag `latest` :

```text
PS5_payloads_aio_latest.zip
PS5_pkg_aio_latest.zip
PS5_ffpfsc_aio_latest.zip
PS5_apps_aio_latest.zip
PS5_ultimate_pack_latest.zip
```

### Pegasus

```text
https://pegasus-catalog.fly.dev/catalogs/dlps.json
https://pegasus-catalog.fly.dev/catalogs/pippo.json
https://pegasus-catalog.fly.dev/catalogs/pfs.json
```

## Documentation

Voir `docs/` pour la documentation détaillée.
