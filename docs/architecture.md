# 🏗️ Architecture

## Deux dépôts

### Core OS

`nexgen999/evoX-CoreOS` contient les données :

```text
json/
rss/
archives/
payloads/
assets/
```

### WebUI

`nexgen999/evoX-CoreOS-WebUI` contient :

```text
index.html
web/
docs/
```

## Modules

### `app.js`

Orchestre le rendu, la navigation hash et les interactions.

### `config.js`

Charge et parse le JSONC. Les commentaires sont retirés avant `JSON.parse`.

### `github.js`

Lit le profil et les informations publiques du dépôt.

### `store.js`

Télécharge les catalogues JSON et normalise leurs objets.

### `rss.js`

Lit RSS/Atom et extrait les `xmlUrl` des OPML.

### `docs.js`

Utilise l'arbre GitHub récursif pour découvrir les Markdown.

### `markdown.js`

Rend un sous-ensemble Markdown en HTML.

## Principe de défaillance

Une erreur de profil GitHub, de Store ou de News ne doit pas empêcher les autres modules de s'afficher. Les erreurs sont collectées et affichées localement.
