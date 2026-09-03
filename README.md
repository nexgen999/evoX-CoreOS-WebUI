# evoX Core OS — Web Dashboard

Une interface web **statique, moderne et entièrement configurable** destinée à transformer n'importe quel dépôt GitHub compatible GitHub Pages en véritable dashboard.

Le projet est pensé pour `evoX Core OS`, mais **aucun nom, dépôt, URL ou contenu n'est codé en dur dans l'interface** : la personnalisation se fait principalement dans `web/data/config.json`.

## ✨ Fonctionnalités

- 🧭 Dashboard Home avec hero, raccourcis et statistiques.
- 👤 Détection automatique du propriétaire GitHub, du dépôt, de l'avatar, de la bio et des statistiques.
- 📰 Lecteur RSS/XML avec affichage façon blog.
- 📥 Page Download avec liste de fichiers configurable.
- 🛒 Store dynamique lisant un ou plusieurs JSON.
- 🔎 Recherche instantanée.
- 🗂️ Catégories + sous-catégories.
- 🧩 Auto-détection des `.json` présents dans `/json/`.
- 📡 Auto-détection des `.xml` présents dans `/rss/`.
- 📚 Wiki Markdown avec découverte récursive de `/docs/`.
- 🧭 Ordre manuel des documents de documentation.
- 🔗 Page Services configurable.
- ❤️ Page Remerciements.
- ℹ️ Page About.
- 🌐 Réseaux sociaux avec icônes intégrées ou images PNG/SVG/ICO personnalisées.
- 🏷️ Footer entièrement configurable avec badges interactifs type GitHub/ shields.io.
- 🌙 Thème sombre + bascule clair/sombre.
- 📱 Responsive PC / tablette / smartphone.
- 🚫 Aucun backend obligatoire.
- 🚀 Compatible GitHub Pages.

---

# 📁 Structure

Le principe est volontairement propre :

```text
/
├── index.html
├── README.md
├── json/
├── rss/
├── docs/
├── archives/
└── web/
    ├── assets/
    │   ├── logo.svg
    │   ├── favicon.svg
    │   ├── avatar-placeholder.svg
    │   └── custom-icon.svg
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js
    │   ├── config.js
    │   ├── docs.js
    │   ├── github.js
    │   ├── icons.js
    │   ├── markdown.js
    │   ├── rss.js
    │   └── store.js
    └── data/
        ├── config.json
        ├── config.sample.json
        ├── config.example.jsonc
        ├── store.sample.json
        └── news.sample.xml
```

Le seul fichier web à la racine est donc `index.html`.

---

# 🚀 Installation

1. Copiez `index.html` à la racine du dépôt.
2. Copiez le dossier `web/` à la racine.
3. Éditez `web/data/config.json`.
4. Activez GitHub Pages sur le dépôt.
5. Ouvrez l'URL GitHub Pages.

Exemple :

```text
https://USER.github.io/REPOSITORY/
```

Le moteur détectera automatiquement :

```text
USER         → propriétaire GitHub
REPOSITORY   → dépôt GitHub
BRANCH       → branche par défaut du dépôt
```

Si l'URL est un domaine personnalisé, renseignez simplement `repository.owner`, `repository.name` et éventuellement `repository.baseUrl` dans la configuration.

---

# ⚙️ Configuration

Le fichier principal est :

```text
web/data/config.json
```

Il est volontairement centralisé.

## Détection automatique

Configuration recommandée :

```json
"autoDetect": {
  "enabled": true,
  "githubPages": true,
  "owner": true,
  "repository": true,
  "branch": "auto"
}
```

Avec :

```json
"repository": {
  "owner": "",
  "name": "",
  "branch": "auto"
}
```

Le site utilise alors l'URL courante et l'API GitHub.

Pour forcer un dépôt :

```json
"repository": {
  "owner": "mon-user",
  "name": "mon-repo",
  "branch": "main"
}
```

---

# 📂 Chemins standards

Les emplacements attendus sont :

```json
"paths": {
  "jsonDir": "/json/",
  "rssDir": "/rss/",
  "docsDir": "/docs/",
  "assetsDir": "/web/assets/",
  "archivesDir": "/archives/"
}
```

Le `/` initial signifie **racine du dépôt**, et non racine du domaine.

C'est important pour GitHub Pages :

```text
https://user.github.io/repo/
                     ↑
                 racine du dépôt
```

Le moteur transforme automatiquement :

```text
/json/payloads.json
```

en :

```text
https://user.github.io/repo/json/payloads.json
```

---

# 🛒 Store JSON

Le Store accepte plusieurs sources :

```json
"store": {
  "autoDiscover": true,
  "sources": [
    {
      "id": "payloads",
      "label": "Payloads",
      "type": "json",
      "url": "/json/payloads.json",
      "arrayKeys": ["payloads", "items", "data"]
    }
  ]
}
```

### Auto-discovery

Avec :

```json
"autoDiscover": true
```

le site demande à GitHub la liste des fichiers du dépôt et recherche récursivement les JSON présents dans `/json/`.

Les fichiers explicitement définis dans `sources` restent prioritaires.

Ainsi un dépôt peut avoir :

```text
/json/
├── payloads.json
├── pkg.json
├── apps.json
├── ffpfs.json
├── tools.json
└── autre.json
```

sans avoir à modifier le JavaScript.

---

# 🧩 Mapping des champs JSON

Les JSON peuvent utiliser des noms différents.

Le mapping permet de les normaliser :

```json
"fieldMap": {
  "name": ["name", "title", "filename"],
  "filename": ["filename", "file", "name"],
  "url": ["url", "download", "download_url", "href"],
  "description": ["description", "desc", "summary"],
  "version": ["version", "ver"],
  "author": ["author", "developer", "creator"],
  "category": ["category", "type", "group"],
  "subcategory": ["subcategory", "sub_category", "subCategory"],
  "icon": ["icon", "image", "logo"],
  "checksum": ["checksum", "sha256", "sha-256"]
}
```

Cela permet de réutiliser le dashboard avec des structures JSON différentes.

---

# 🗂️ Catégories et sous-catégories

Le Store récupère :

```text
category
subcategory
```

lorsqu'ils existent.

Si `subcategory` est absent, le moteur peut essayer de la déduire depuis `local_path` / `filename`.

Exemple :

```text
payloads/
└── ps5_hen_loader/
    └── etaHEN/
        └── 2.5B/
            └── etaHEN.bin
```

Cela permet d'obtenir automatiquement une sous-catégorie exploitable.

---

# 📰 RSS

Les flux sont configurés ici :

```json
"news": {
  "enabled": true,
  "autoDiscover": true,
  "maxItems": 12,
  "feeds": [
    {
      "id": "payloads",
      "label": "Payloads",
      "url": "/rss/payloads_rss.xml",
      "enabled": true
    }
  ]
}
```

Avec `autoDiscover`, les fichiers XML présents dans `/rss/` sont également détectés.

Le lecteur accepte RSS et Atom dans une structure classique :

```text
<item>
<title>
<link>
<description>
<pubDate>
```

ou :

```text
<entry>
<title>
<link>
<summary>
<updated>
```

### Flux externes

Une URL externe peut être utilisée :

```json
"url": "https://example.com/feed.xml"
```

Attention : le serveur distant doit autoriser les requêtes CORS depuis votre site. GitHub Pages ne peut pas contourner une politique CORS distante.

---

# 📚 Documentation / Wiki

La documentation utilise :

```text
/docs/
```

et est parcourue récursivement via l'API GitHub.

Exemple :

```text
/docs/
├── README.md
├── installation.md
├── configuration.md
├── advanced/
│   ├── api.md
│   └── development.md
└── guides/
    ├── guide-1.md
    └── guide-2.md
```

Tous les `.md` sont détectés.

La sidebar de documentation est indépendante du menu principal.

## Ordre personnalisé

```json
"order": [
  "README.md",
  "installation.md",
  "configuration.md",
  "advanced/api.md"
]
```

Les documents non listés sont ensuite placés automatiquement par ordre alphabétique.

## Masquer des documents

```json
"hideFiles": [
  "draft.md",
  "private-notes.md"
]
```

---

# 📥 Downloads

La page Download utilise une simple liste :

```json
"downloads": {
  "search": true,
  "items": [
    {
      "name": "Payloads AIO",
      "description": "Pack complet.",
      "filename": "payloads.zip",
      "category": "Payloads",
      "url": "/archives/payloads.zip"
    }
  ]
}
```

Les URL peuvent être :

```text
/archives/file.zip
```

ou :

```text
https://example.com/file.zip
```

---

# 🌐 Réseaux sociaux

Les icônes suivantes sont intégrées :

```text
GitHub
X
Bluesky
Home
RSS
Download
Store
Heart
Link
Info
Documentation
Globe
```

Exemple :

```json
{
  "id": "github",
  "label": "GitHub",
  "url": "https://github.com/",
  "icon": "github",
  "enabled": true
}
```

## Icône personnalisée

PNG, SVG ou ICO :

```json
{
  "id": "custom",
  "label": "Mon service",
  "url": "https://example.com/",
  "iconType": "image",
  "icon": "/web/assets/custom.svg",
  "enabled": true
}
```

---

# 🏷️ Footer et badges

Le footer est entièrement configurable.

```json
"footer": {
  "enabled": true,
  "text": "Mon projet open source",
  "showYear": true,
  "links": [],
  "badges": []
}
```

Un badge peut être n'importe quelle image :

```json
{
  "label": "License",
  "href": "https://github.com/",
  "image": "https://img.shields.io/badge/custom-badge-111827?style=for-the-badge",
  "alt": "Badge personnalisé"
}
```

Cela permet d'utiliser les badges GitHub/shields que l'on trouve habituellement dans les README.

---

# 🎨 Branding

Tout ce qui concerne l'identité visuelle peut être changé :

```json
"branding": {
  "logo": "./web/assets/logo.svg",
  "favicon": "./web/assets/favicon.svg",
  "heroImage": "",
  "heroTitle": "Bienvenue",
  "heroText": "Mon texte",
  "heroTags": [
    "Open Source",
    "GitHub",
    "Store"
  ]
}
```

Vous pouvez remplacer les SVG fournis par vos propres fichiers.

---

# 🎨 Thème

Le thème initial :

```json
"theme": "dark"
```

La couleur principale peut être modifiée dans le CSS et le système est prévu pour accueillir d'autres variantes.

Le bouton de thème peut être désactivé :

```json
"showThemeToggle": false
```

---

# 🧭 Menus

Chaque menu peut être activé/désactivé :

```json
{
  "id": "store",
  "label": "Store",
  "icon": "store",
  "enabled": true
}
```

Les pages actuellement disponibles :

```text
home
news
downloads
store
thanks
services
about
docs
```

L'ordre du tableau `navigation` correspond à l'ordre d'affichage dans la sidebar.

---

# 🔗 Sources externes

La plupart des URLs acceptent indifféremment :

```text
/json/file.json
```

ou :

```text
https://autre-site.example/file.json
```

Même principe pour RSS, downloads, services et liens sociaux.

---

# 🧪 Exemple evoX Core OS

Le fichier `config.json` fourni est déjà préparé pour :

```text
PS5-Super-PLDMGR-Auto-Updater-Core_OS
```

avec notamment :

```text
/json/payloads.json
/json/pkg.json
/json/ffpfsc.json
/json/apps.json

/rss/payloads_rss.xml
/rss/pkg_rss.xml
/rss/ffpfsc_rss.xml
/rss/apps_rss.xml

/archives/PS5_payloads_aio_latest.zip
/archives/PS5_pkg_aio_latest.zip
/archives/PS5_ffpfsc_aio_latest.zip
/archives/PS5_apps_aio_latest.zip
/archives/PS5_ultimate_pack_latest.zip

/docs/
```

Les URLs de téléchargement présentes dans les JSON peuvent également être externes : le Store conserve leur destination.

---

# 🔐 Limites techniques importantes

## GitHub API

La détection du dépôt, du profil et des fichiers de documentation utilise l'API GitHub.

Pour un dépôt public, cela fonctionne sans token.

Une utilisation très intensive peut rencontrer la limite de requêtes de l'API GitHub.

## CORS

Les ressources locales du dépôt ne posent normalement pas de problème.

Pour un JSON ou RSS externe, le serveur distant doit accepter les requêtes cross-origin.

## GitHub Pages

Le projet est volontairement statique :

```text
HTML
CSS
JavaScript
JSON
XML/RSS
Markdown
```

Aucun Node.js, PHP, Python ou serveur permanent n'est nécessaire pour le dashboard.

---

# 🧰 Fichiers de configuration fournis

### `config.json`

Configuration prête à tester.

### `config.sample.json`

Configuration minimale propre destinée à repartir de zéro.

### `config.example.jsonc`

Version **commentée ligne par ligne** de la configuration pour servir de documentation.

### `store.sample.json`

Exemple de structure JSON compatible avec le Store.

### `news.sample.xml`

Exemple de flux RSS minimal.

---

# 📦 Philosophie du projet

Le but d'evoX Core OS Web est de séparer clairement :

```text
CONTENU
   ↓
JSON / RSS / Markdown / fichiers

CONFIGURATION
   ↓
web/data/config.json

MOTEUR
   ↓
web/js/

DESIGN
   ↓
web/css/

ASSETS
   ↓
web/assets/

PAGE D'ENTRÉE
   ↓
index.html
```

Ainsi, le moteur peut être distribué avec différents dépôts sans devoir réécrire le code.

---

## 📜 Licence

À adapter selon la licence choisie pour votre projet.
