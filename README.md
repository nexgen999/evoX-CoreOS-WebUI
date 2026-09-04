# evoX Core OS WebUI

> Dashboard web statique, futuriste et entièrement configurable pour GitHub Pages.

**evoX Core OS WebUI** est l'interface graphique de l'écosystème evoX. Elle est conçue pour être publiée comme un simple site statique, sans Node.js, sans backend et sans build obligatoire.

Le projet sépare volontairement :

- `evoX-CoreOS` → dépôt de données : JSON, RSS, Atom/OPML, archives, documentation et ressources.
- `evoX-CoreOS-WebUI` → dépôt de l'interface graphique et de sa configuration.

La configuration permet néanmoins de pointer vers n'importe quel autre dépôt ou domaine.

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Structure](#structure)
3. [Installation](#installation)
4. [Configuration rapide](#configuration-rapide)
5. [Configuration complète](#configuration-complète)
6. [Détection GitHub](#détection-github)
7. [Sources et dossiers](#sources-et-dossiers)
8. [RSS, Atom et OPML](#rss-atom-et-opml)
9. [Home et flux indépendants](#home-et-flux-indépendants)
10. [Download](#download)
11. [Store JSON](#store-json)
12. [Services et onglets](#services-et-onglets)
13. [Documentation Wiki](#documentation-wiki)
14. [Réseaux sociaux et icônes](#réseaux-sociaux-et-icônes)
15. [Footer et badges](#footer-et-badges)
16. [Personnaliser les backgrounds](#personnaliser-les-backgrounds)
17. [Dépannage](#dépannage)
18. [Limites navigateur](#limites-navigateur)

---

# Fonctionnalités

### Interface

- header global pleine largeur ;
- logo evoX Core OS configurable ;
- boutons AIO dans le header ;
- réseaux sociaux dans le header ;
- avatar GitHub ;
- sidebar sous le header ;
- profil GitHub automatique ;
- menu configurable ;
- section **Suivez-moi** dans la sidebar ;
- encart promotionnel graphique ;
- footer configurable ;
- badges interactifs.

### Home

La Home reprend la charte graphique dashboard evoX :

- Hero graphique ;
- Dernières News ;
- Welcome ;
- Store résumé ;
- catégories ;
- ressources rapides ;
- bandeau « Un immense merci ! » ;
- statistiques ;
- footer.

Le Hero et les éléments décoratifs sont exclus des autres pages afin de ne pas gaspiller de place.

### News

Lecteur de flux de type blog :

- RSS ;
- Atom ;
- OPML ;
- plusieurs flux ;
- sources externes ;
- filtrage par source ;
- images lorsqu'elles sont présentes dans le flux ;
- tri par date ;
- actualisation.

### Download

- liste des packs ;
- recherche ;
- URL internes ou HTTPS ;
- liens GitHub Releases ;
- section **Other Downloads & Catalogues** ;
- bouton Copier pour les URLs de catalogues Pegasus.

### Store

Le Store lit les JSON dynamiquement et propose :

- recherche ;
- catégorie ;
- sous-catégorie ;
- vue liste ;
- vue tuile ;
- icônes ;
- versions ;
- descriptions ;
- liens de téléchargement ;
- plusieurs sources JSON ;
- auto-détection des fichiers JSON via l'API GitHub lorsque `autoDiscover` est activé.

### Services

Les services sont organisés par onglets configurables :

1. **WebKit** — URLs de redirection ;
2. **WebUI** — WebUI PS5 avec IP locale + ports/path ;
3. **Scene Sites** — sites de votre choix ;
4. **Autres** — espace libre pour les futurs besoins.

Vous pouvez ajouter autant d'onglets que nécessaire dans `services.tabs`.

Les services disposent de trois présentations :

- liste ;
- tuiles ;
- cartes.

### Documentation

Le moteur recherche les `.md` dans `docs/`, y compris les sous-dossiers, et affiche une mini-sidebar indépendante du menu principal.

L'ordre est contrôlé par `docs.order`.

---

# Structure

```text
evoX-CoreOS-WebUI/
├── index.html
├── README.md
├── docs/
│   ├── README.md
│   ├── getting-started.md
│   ├── configuration.md
│   └── menus/
│       ├── home.md
│       ├── news.md
│       ├── download.md
│       ├── store.md
│       ├── services.md
│       ├── documentation.md
│       ├── about.md
│       └── thanks.md
└── web/
    ├── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js
    │   ├── config.js
    │   ├── github.js
    │   ├── rss.js
    │   ├── store.js
    │   ├── docs.js
    │   ├── markdown.js
    │   └── icons.js
    └── data/
        ├── config.json
        ├── config.sample.json
        ├── config.example.jsonc
        ├── store.sample.json
        └── news.sample.opml
```

`index.html` reste volontairement petit. Le gros du projet est dans `web/` afin de garder la racine propre.

---

# Installation

## GitHub Pages

1. Créez ou utilisez le dépôt destiné à l'interface.
2. Copiez les fichiers du projet.
3. Allez dans **Settings → Pages**.
4. Sélectionnez la branche et le dossier contenant `index.html`.
5. Attendez le déploiement.
6. Ouvrez la page GitHub Pages.

Aucun serveur Node n'est requis.

---

# Configuration rapide

Le fichier réellement utilisé est :

```text
web/data/config.json
```

Le fichier de référence commenté est :

```text
web/data/config.example.jsonc
```

Pour une nouvelle installation, commencez par ces sections :

```json
"repository": {
  "owner": "mon-user",
  "name": "mon-depot",
  "branch": "main",
  "pagesUrl": "https://mon-user.github.io/mon-depot",
  "githubUrl": "https://github.com/mon-user/mon-depot"
}
```

Puis :

```json
"sourceSite": {
  "baseUrl": "https://mon-user.github.io/mon-depot",
  "useForRelativeSources": true
}
```

Après cela, `/json/`, `/rss/`, `/docs/` et `/archives/` peuvent être utilisés directement.

---

# Configuration complète

Les sections de `config.json` sont volontairement séparées :

```text
01 site
02 autoDetect
03 repository
04 uiRepository
05 sourceSite
06 paths
07 navigation
08 profile
09 socials
10 header
11 sidebar
12 rss
13 homeNews
14 news
15 downloads
16 store
17 services
18 docs
19 about
20 thanks
21 home
22 footer
23 themeColors
24 advanced
```

Le fichier `config.example.jsonc` contient les commentaires détaillés directement à côté des options.

---

# Détection GitHub

Si le site est publié sur :

```text
https://utilisateur.github.io/depot/
```

et que :

```json
"autoDetect": {
  "enabled": true,
  "owner": true,
  "repository": true
}
```

le moteur peut déterminer automatiquement :

- propriétaire ;
- dépôt ;
- URL GitHub Pages.

### Cas recommandé avec deux dépôts

Dans evoX, l'interface est dans `evoX-CoreOS-WebUI` alors que les données sont dans `evoX-CoreOS`.

Il faut donc conserver :

```json
"repository": {
  "owner": "nexgen999",
  "name": "evoX-CoreOS",
  "pagesUrl": "https://nexgen999.github.io/evoX-CoreOS"
}
```

Ainsi, même si l'interface est servie depuis un autre dépôt, les données restent dirigées vers Core OS.

---

# Sources et dossiers

Les chemins standards sont :

```text
/json/
/rss/
docs/
/archives/
/web/assets/
```

Ils sont configurables :

```json
"paths": {
  "jsonDir": "/json/",
  "rssDir": "/rss/",
  "opmlDir": "/rss/",
  "docsDir": "/docs/",
  "archivesDir": "/archives/",
  "assetsDir": "/web/assets/"
}
```

Une source peut aussi être une URL complète :

```json
"url": "https://autre-site.example/data.json"
```

Cela permet de mélanger sources internes et externes.

---

# RSS, Atom et OPML

Un flux peut être déclaré directement :

```json
{
  "label": "Payloads",
  "url": "/rss/payloads_rss.xml",
  "enabled": true
}
```

Un fichier OPML peut contenir plusieurs `outline` :

```xml
<outline
  text="Mon flux"
  title="Mon flux"
  type="rss"
  xmlUrl="https://example.com/feed.xml"/>
```

Le moteur lit `xmlUrl` et charge les flux référencés.

### Auto-détection

Avec :

```json
"autoDiscover": true
```

le moteur peut interroger l'API GitHub du dépôt source pour rechercher les fichiers de flux présents dans `/rss/`.

---

# Home et flux indépendants

C'est une distinction importante.

La Home possède sa propre section :

```json
"homeNews": {
  "feeds": [],
  "opmlFiles": []
}
```

La page News possède sa propre section :

```json
"news": {
  "feeds": [],
  "opmlFiles": []
}
```

Vous pouvez donc avoir :

```text
HOME
 └── home.opml

NEWS
 └── sources.opml
```

sans que les deux pages affichent les mêmes articles.

---

# Download

Les packs GitHub Releases peuvent utiliser le tag spécial `latest` :

```text
https://github.com/OWNER/REPOSITORY/releases/download/latest/fichier.zip
```

Dans la configuration evoX actuelle, les URLs prédéfinies utilisent :

```text
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_payloads_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_pkg_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ffpfsc_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_apps_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ultimate_pack_latest.zip
```

## Other Downloads

La section `downloads.otherDownloads.items` permet d'ajouter :

- packs cheat ;
- outils ;
- archives ;
- catalogues ;
- n'importe quelle autre URL.

Les trois entrées Cheat Pack sont livrées désactivées parce que leurs URLs n'ont pas encore été renseignées. Il suffit de mettre l'URL et :

```json
"enabled": true
```

---

# Catalogues Pegasus

Trois catalogues sont préconfigurés :

```text
DLPSGame
https://pegasus-catalog.fly.dev/catalogs/dlps.json

Pippo-exfat
https://pegasus-catalog.fly.dev/catalogs/pippo.json

PFS
https://pegasus-catalog.fly.dev/catalogs/pfs.json
```

Ils utilisent :

```json
"copyOnly": true
```

Le résultat est une carte avec un bouton **Copier l'URL** plutôt qu'un téléchargement direct.

---

# Store JSON

Le Store accepte plusieurs sources :

```json
"sources": [
  {
    "id": "payloads",
    "label": "Payloads",
    "url": "/json/payloads.json",
    "arrayKeys": ["payloads", "items", "data"]
  }
]
```

## Mapping

Les JSON ne possèdent pas toujours les mêmes noms de champs. `fieldMap` permet donc de définir plusieurs possibilités :

```json
"fieldMap": {
  "name": ["name", "title", "filename"],
  "url": ["url", "download", "download_url", "href"],
  "description": ["description", "desc", "summary"],
  "category": ["category", "type", "group"],
  "subcategory": ["subcategory", "sub_category", "subCategory"],
  "icon": ["icon", "image", "logo"]
}
```

## Deux affichages

La page Store dispose de :

- **Liste** pour une vue compacte et efficace ;
- **Tuiles** pour une présentation graphique.

Le choix est conservé pendant la navigation.

---

# Services et onglets

Les services sont désormais pilotés par un tableau unique :

```json
"services": {
  "tabs": []
}
```

## WebKit

Type :

```json
"type": "links"
```

Exemple :

```json
{
  "id": "webkit",
  "label": "WebKit",
  "icon": "globe",
  "type": "links",
  "items": [
    {
      "name": "WebKit exemple",
      "url": "https://example.com/",
      "icon": "globe"
    }
  ]
}
```

## WebUI PS5

Type :

```json
"type": "webui"
```

L'utilisateur renseigne l'IP :

```text
192.168.1.50
```

Chaque service peut ensuite définir :

```json
{
  "name": "Payload Sender",
  "port": 9000,
  "path": "/",
  "protocol": "http"
}
```

Le navigateur construit alors :

```text
http://192.168.1.50:9000/
```

L'IP est conservée dans `localStorage` afin d'éviter de la ressaisir à chaque visite.

## Ajouter un nouvel onglet

Il suffit d'ajouter :

```json
{
  "id": "downloads-future",
  "label": "Futur",
  "icon": "folder",
  "type": "links",
  "items": []
}
```

Le nouvel onglet apparaît automatiquement dans la barre Services.

---

# Documentation Wiki

Le moteur utilise :

```text
docs/
```

et recherche récursivement les `.md`.

Exemple :

```text
docs/
├── README.md
├── configuration.md
└── menus/
    ├── home.md
    ├── store.md
    └── services.md
```

L'ordre peut être imposé :

```json
"order": [
  "README.md",
  "getting-started.md",
  "configuration.md",
  "menus/home.md",
  "menus/store.md"
]
```

Les fichiers non présents dans `order` sont placés ensuite par ordre alphabétique.

La documentation dispose de sa propre sidebar, indépendante de la sidebar générale du site.

---

# Réseaux sociaux et icônes

## Icône standard

```json
{"label":"GitHub","icon":"github"}
```

Icônes intégrées :

```text
home
rss
download
store
heart
link
info
book
github
x
bluesky
globe
folder
file
external
code
check
search
clock
pin
repo
list
grid
```

## Icône personnalisée

Vous pouvez mettre votre propre PNG, SVG ou ICO :

```json
{
  "label":"Mon réseau",
  "iconType":"image",
  "icon":"./web/assets/mon-logo.svg"
}
```

Le même principe est utilisé pour les services et le Store.

---

# Footer et badges

Le footer est entièrement configurable.

```json
"footer": {
  "enabled": true,
  "text": "evoX Core OS",
  "showYear": true,
  "links": [],
  "badges": []
}
```

Un badge peut être :

- un badge shields.io ;
- un PNG ;
- un SVG ;
- toute image accessible par URL.

Exemple :

```json
{
  "label":"GitHub Pages",
  "href":"https://example.com/",
  "image":"https://img.shields.io/badge/GITHUB-PAGES-blue?style=for-the-badge",
  "alt":"GitHub Pages"
}
```

Le badge devient automatiquement cliquable.

---

# Personnaliser les backgrounds

Les assets graphiques sont centralisés dans :

```text
web/assets/
```

Les principaux sont :

```text
logo.svg
favicon.svg
hero-bg.svg
welcome-bg.svg
news-bg.svg
services-bg.svg
thanks-bg.svg
about-bg.svg
sidebar-bg.svg
```

Vous pouvez remplacer les fichiers ou modifier leurs chemins dans `config.json`.

---

# Charte graphique

Le site est volontairement limité à une esthétique sombre :

- navy / noir ;
- cyan ;
- bleu électrique ;
- bordures lumineuses ;
- panneaux translucides ;
- arrière-plans techniques ;
- tuiles compactes ;
- interface type dashboard gaming / homebrew.

Il n'y a volontairement **aucun sélecteur clair/sombre**.

---

# Dépannage

## « Impossible de charger la configuration »

Vérifiez :

```text
web/data/config.json
```

et assurez-vous qu'il s'agit d'un JSON valide.

Le fichier `.jsonc` ne doit jamais remplacer `config.json` : JSONC accepte des commentaires, JSON standard non.

## Les JSON ne chargent pas

Vérifiez :

1. `repository.pagesUrl` ;
2. `sourceSite.baseUrl` ;
3. `/json/` ;
4. le nom exact du fichier ;
5. `arrayKeys` ;
6. la structure du JSON.

## Les flux ne chargent pas

Les flux externes doivent autoriser les requêtes cross-origin depuis le navigateur. Un serveur RSS qui interdit CORS peut être inaccessible depuis GitHub Pages.

Pour les flux du même site GitHub Pages, ce problème est normalement évité.

## WebUI PS5

La redirection locale est faite directement par le navigateur :

```text
http://IP:PORT/PATH
```

Il faut donc que l'ordinateur ou téléphone puisse joindre l'IP locale de la console.

---

# Limites navigateur

Cette application est volontairement statique. Elle ne possède pas de backend.

Par conséquent :

- les APIs GitHub publiques sont utilisées directement depuis le navigateur ;
- les RSS/Atom/OPML externes dépendent du CORS ;
- les JSON externes dépendent du CORS ;
- les WebUI locales dépendent du réseau local et des règles du navigateur ;
- le bouton Copier utilise l'API Clipboard du navigateur lorsque celle-ci est disponible.

---

# Dépôts evoX

Interface graphique :

```text
https://github.com/nexgen999/evoX-CoreOS-WebUI
```

Données Core OS :

```text
https://github.com/nexgen999/evoX-CoreOS
```

Le fichier `config.json` de cette version est prérempli avec ces deux dépôts et les nouvelles URLs `latest` du dépôt `evoX-CoreOS`.

---

# Philosophie du projet

**evoX Core OS** est pensé comme un moteur de dashboard réutilisable : l'interface reste générique et les données sont pilotées par configuration.

L'objectif est de pouvoir réutiliser le même moteur pour un autre dépôt en modifiant principalement :

- le dépôt source ;
- les chemins ;
- les sources RSS/OPML ;
- les JSON ;
- les téléchargements ;
- les services ;
- la documentation ;
- les réseaux sociaux ;
- les backgrounds ;
- les badges ;
- les textes.

Pour une nouvelle personnalisation, commencez par **`web/data/config.example.jsonc`** : c'est le fichier de référence le plus complet.
