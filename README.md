# 🚀 evoX Core OS WebUI

<p align="center"><img src="web/assets/logo.svg" alt="evoX Core OS" width="360"></p>

<p align="center"><strong>Dashboard statique configurable · Store JSON · RSS / Atom / OPML · Services · Wiki Markdown</strong></p>

<p align="center"><a href="https://github.com/nexgen999/evoX-CoreOS">Core OS</a> · <a href="https://github.com/nexgen999/evoX-CoreOS-WebUI">WebUI</a> · <a href="https://nexgen999.github.io/evoX-CoreOS-WebUI/">Live Demo</a></p>

---

## 🧭 Vue d'ensemble

**evoX Core OS WebUI** est une interface web statique destinée à transformer un dépôt GitHub de données en portail moderne.

Le projet sépare volontairement :

- **les données** : dépôt `evoX-CoreOS` ;
- **la présentation** : dépôt `evoX-CoreOS-WebUI`.

La WebUI ne nécessite aucun backend, serveur Node, PHP, base de données ou clé secrète. GitHub Pages suffit.

### Fonctionnalités

- 🏠 Dashboard Home inspiré d'un portail gaming/tech.
- 👤 Profil GitHub et statistiques publiques.
- 🧭 Navigation configurable.
- 🎨 Branding, backgrounds et icônes remplaçables.
- 🌐 Réseaux sociaux configurables.
- 📰 Lecteur RSS et Atom.
- 📑 Import de sources OPML.
- 🔀 Sources Home et News totalement indépendantes.
- 📦 Store alimenté par plusieurs JSON.
- 🔎 Recherche globale du catalogue.
- 🗂️ Catégories et sous-catégories dynamiques.
- 🧱 Vue liste et vue tuiles.
- 📥 Téléchargements AIO.
- 📋 Other Downloads avec copie d'URLs.
- 🔗 Services externes.
- 🎮 WebUI locale PS5 avec IP + port + chemin.
- 🧩 Onglets Services extensibles.
- 📚 Wiki Markdown récursif.
- ❤️ Page Remerciements.
- ℹ️ Page About.
- 🏷️ Footer et badges personnalisables.
- 📱 Responsive desktop/tablette/mobile.

---

# 🏗️ Architecture

Deux dépôts sont utilisés.

## 1. evoX-CoreOS

Dépôt de données :

```text
json/
rss/
archives/
payloads/
assets/
```

Il fournit les catalogues et les ressources.

## 2. evoX-CoreOS-WebUI

Dépôt de présentation :

```text
index.html
web/
docs/
```

Il fournit l'interface.

### Pourquoi séparer les deux ?

Le catalogue peut évoluer indépendamment de l'interface. La WebUI peut également être réutilisée avec un autre dépôt de données simplement en changeant `config.json`.

---

# 📁 Arborescence

```text
evoX-CoreOS-WebUI/
│
├── index.html
├── README.md
│
├── docs/
│   ├── README.md
│   ├── getting-started.md
│   ├── architecture.md
│   ├── configuration.md
│   ├── data-sources.md
│   ├── deployment.md
│   ├── customization.md
│   ├── troubleshooting.md
│   └── menus/
│       ├── home.md
│       ├── news.md
│       ├── download.md
│       ├── store.md
│       ├── services.md
│       ├── documentation.md
│       ├── about.md
│       └── thanks.md
│
└── web/
    ├── assets/
    ├── css/
    │   └── style.css
    ├── data/
    │   ├── config.json
    │   ├── config.sample.json
    │   ├── config.sample.jsonc
    │   ├── config.example.jsonc
    │   ├── store.sample.json
    │   └── store.sample.jsonc
    └── js/
        ├── app.js
        ├── config.js
        ├── docs.js
        ├── github.js
        ├── icons.js
        ├── markdown.js
        ├── rss.js
        └── store.js
```

---

# ⚙️ Configuration

Le seul fichier que l'utilisateur devrait normalement modifier est :

```text
web/data/config.json
```

Il est écrit en JSONC afin de permettre les commentaires.

```jsonc
{
  // commentaire explicatif
  "site": {
    "name": "evoX Core OS"
  }
}
```

Le module `config.js` retire les commentaires avant de transmettre le document au parseur JSON.

## Sections

Le fichier actif est organisé ainsi :

```text
01 — Configuration générale
02 — Auto-détection
03 — Dépôt Core OS
04 — Dépôt WebUI
05 — Source du site et dossiers
06 — Navigation
07 — Profil GitHub
08 — Branding
09 — Réseaux sociaux
10 — Header
11 — Sidebar
12 — Home
13 — Home RSS / OPML
14 — News RSS / Atom / OPML
15 — Download
16 — Store
17 — Services
18 — Documentation
19 — About
20 — Remerciements
21 — Footer
```

La référence complète est disponible dans `web/data/config.example.jsonc`.

---

# 🔍 Auto-détection

Lorsque la WebUI est publiée sur :

```text
https://OWNER.github.io/REPOSITORY/
```

elle peut déterminer automatiquement le dépôt qui héberge l'interface.

### Règle de sécurité

L'auto-détection de la WebUI **ne remplace jamais automatiquement le dépôt Core OS**.

C'est indispensable lorsque :

```text
evoX-CoreOS
```

contient les données et :

```text
evoX-CoreOS-WebUI
```

contient l'interface.

Le dépôt de données reste donc explicitement configurable.

---

# 🌐 Source du site

Les chemins relatifs des données sont résolus avec :

```json
"sourceSite": {
  "baseUrl": "https://nexgen999.github.io/evoX-CoreOS"
}
```

Ainsi :

```text
/json/payloads.json
```

devient :

```text
https://nexgen999.github.io/evoX-CoreOS/json/payloads.json
```

Une URL complète `https://...` est utilisée telle quelle.

---

# 📦 Store

Le Store lit actuellement les quatre catalogues Core OS :

| Source | Tableau |
|---|---|
| `/json/payloads.json` | `payloads` |
| `/json/pkg.json` | `packages` |
| `/json/ffpfsc.json` | `files` |
| `/json/apps.json` | `apps` |

Ces structures correspondent aux JSON actuellement publiés par le dépôt Core OS. citeturn7view0turn8view0turn8view1turn8view2

Chaque entrée est normalisée vers :

```text
name
filename
url
description
version
author
category
subcategory
icon
type
```

## Recherche

La recherche parcourt les champs normalisés.

## Catégories

Les catégories sont calculées à partir des données réellement reçues.

## Sous-catégories

Les sous-catégories sont calculées après sélection de la catégorie.

## Vue liste

Conçue pour parcourir rapidement un catalogue volumineux.

## Vue tuiles

Conçue pour privilégier les icônes et les visuels.

---

# 📰 RSS / Atom / OPML

Le lecteur News accepte :

- RSS 2.x ;
- Atom ;
- OPML.

Le dépôt Core OS possède actuellement un flux global dans `/rss/feed.xml` ainsi que des flux spécialisés sous `/rss/payloads/`, `/rss/pkg/`, `/rss/ffpfsc/` et `/rss/apps/`. citeturn9view0turn9view1turn9view2turn10view0

## OPML

Un OPML peut contenir :

```xml
<outline
  text="Exemple"
  title="Exemple"
  xmlUrl="https://example.com/feed.xml"
/>
```

Chaque `xmlUrl` devient une source.

## Home ≠ News

Les deux sont volontairement indépendantes :

```text
homeNews
 ├── feeds
 └── opml

news
 ├── feeds
 └── opml
```

La Home peut donc présenter quatre nouveautés sélectionnées alors que News peut agréger plusieurs sources.

---

# 📥 Download

Les packs AIO utilisent le tag GitHub :

```text
latest
```

URLs par défaut :

```text
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_payloads_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_pkg_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ffpfsc_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_apps_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ultimate_pack_latest.zip
```

## Other Downloads

Cette zone accepte des téléchargements supplémentaires.

Une entrée peut être :

- un téléchargement ;
- un lien ;
- une URL à copier.

## Catalogues Pegasus

Les trois URLs préconfigurées sont :

```text
DLPSGame
https://pegasus-catalog.fly.dev/catalogs/dlps.json

Pippo-exfat
https://pegasus-catalog.fly.dev/catalogs/pippo.json

PFS Catalog
https://pegasus-catalog.fly.dev/catalogs/pfs.json
```

Chaque entrée dispose d'un bouton **Copier**.

---

# 🔗 Services

Services utilise des onglets dynamiques.

Par défaut :

```text
WebKit
WebUI
Scene Sites
Autres
```

Ajouter un objet dans `services.tabs` crée un nouvel onglet.

## WebKit / sites publics

Utilisez :

```json
{
  "type": "links",
  "items": [
    {
      "name": "Mon site",
      "url": "https://example.com"
    }
  ]
}
```

## WebUI PS5

Le visiteur saisit l'IP :

```text
192.168.1.50
```

Chaque service fournit :

```text
protocol
port
path
```

Le bouton construit :

```text
http://192.168.1.50:12800/
```

ou :

```text
http://192.168.1.50:9000/sender/
```

L'IP est enregistrée dans le `localStorage` du navigateur.

La WebUI ne crée aucun tunnel réseau.

---

# 📚 Documentation Wiki

La documentation est elle-même alimentée par Markdown.

Le moteur utilise l'arbre récursif GitHub et détecte :

```text
docs/*.md
docs/**/*.md
```

Les sous-dossiers sont donc conservés.

## Ordre

Utilisez :

```json
"order": [
  "docs/README.md",
  "docs/getting-started.md",
  "docs/configuration.md"
]
```

Les documents non présents dans cette liste restent accessibles.

## Markdown pris en charge

- titres ;
- paragraphes ;
- listes ;
- citations ;
- liens HTTPS ;
- code inline ;
- blocs de code ;
- gras ;
- italique.

---

# 🎨 Branding

Les principaux backgrounds sont séparés :

```text
web/assets/
├── hero-bg.svg
├── welcome-bg.svg
├── news-bg.svg
├── services-bg.svg
├── thanks-bg.svg
├── about-bg.svg
└── sidebar-bg.svg
```

Le logo et le favicon sont également séparés.

Les images peuvent être remplacées sans modifier le moteur.

---

# 🌐 Réseaux sociaux

Les réseaux sont définis une seule fois dans :

```text
socials
```

Ils peuvent apparaître dans :

- Header ;
- Sidebar → Suivez-moi.

Une icône peut être :

```text
github
x
bluesky
```

ou une image personnalisée.

---

# 🏷️ Footer

Le footer accepte :

- texte ;
- année automatique ;
- liens ;
- badges ;
- images personnalisées.

Les badges peuvent provenir de shields.io ou d'une image locale/publique.

---

# 📱 Responsive

Le design s'adapte aux :

- écrans desktop ;
- laptops ;
- tablettes ;
- smartphones.

Sur petit écran, la Sidebar devient un menu coulissant.

---

# 🔐 Sécurité

La WebUI ne stocke aucun secret.

Elle ne demande :

- aucune clé API ;
- aucun token GitHub ;
- aucun mot de passe.

L'API GitHub utilisée pour le profil et le dépôt est publique.

L'adresse IP de la console est stockée localement dans le navigateur.

---

# ⚠️ CORS

GitHub Pages est statique. Le navigateur applique donc les règles CORS des serveurs externes.

Un flux RSS externe peut être parfaitement valide et néanmoins impossible à lire depuis la WebUI si son serveur ne permet pas les requêtes cross-origin.

Pour les sources critiques, privilégiez les flux publiés dans le dépôt Core OS.

---

# 🧪 Vérification avant publication

Avant de publier, vérifiez :

```text
index.html
web/css/style.css
web/js/app.js
web/js/config.js
web/data/config.json
```

Puis :

1. Ouvrez la Home.
2. Vérifiez le profil GitHub.
3. Vérifiez Store.
4. Vérifiez Download.
5. Vérifiez News.
6. Vérifiez Services.
7. Vérifiez Documentation.
8. Vérifiez les boutons sociaux.
9. Vérifiez les badges du footer.
10. Testez la version mobile.

---

# 🧰 Dépannage

## Page blanche

Ouvrez la console développeur.

Si vous voyez `SyntaxError`, remplacez les modules JavaScript par ceux de cette version.

## Configuration invalide

Vérifiez les :

- guillemets ;
- virgules ;
- accolades ;
- crochets.

Les commentaires sont permis car `config.js` utilise un parseur JSONC interne.

## Store vide

Contrôlez :

```text
sourceSite.baseUrl
store.sources[].url
store.sources[].arrayKey
```

## News vide

Contrôlez :

```text
homeNews.feeds
homeNews.opml
news.feeds
news.opml
```

Puis testez chaque URL directement.

## Documentation vide

Contrôlez :

```text
docs.source.owner
docs.source.repo
docs.source.branch
docs.source.directory
docs.source.apiUrl
docs.source.rawBaseUrl
```

## WebUI locale inaccessible

La WebUI ne peut pas rendre une PS5 accessible depuis Internet. Le visiteur doit être sur un réseau capable de joindre l'adresse IP locale.

---

# 📦 Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `config.json` | configuration active JSONC |
| `config.sample.json` | exemple JSON valide sans commentaires |
| `config.sample.jsonc` | exemple commenté |
| `config.example.jsonc` | référence exhaustive |
| `store.sample.json` | exemple de catalogue |
| `store.sample.jsonc` | catalogue commenté |

---

# 🛠️ Réutiliser la WebUI

Pour l'utiliser avec un autre projet :

1. Copiez `index.html`, `web/` et `docs/`.
2. Modifiez `repository`.
3. Modifiez `sourceSite`.
4. Configurez `store.sources`.
5. Configurez `homeNews` et `news`.
6. Configurez les téléchargements.
7. Configurez Services.
8. Ajoutez votre documentation.
9. Publiez GitHub Pages.

Le moteur ne nécessite normalement aucune modification.

---

# 🧭 Principes de conception

Le projet suit quatre principes :

### 1. Configuration avant code

Une option visible doit autant que possible être configurable.

### 2. Données séparées de la présentation

Le Core OS fournit les données ; la WebUI les présente.

### 3. Dégradation propre

Une source indisponible ne doit pas rendre tout le dashboard inutilisable.

### 4. Lisibilité

La configuration et la documentation doivent rester compréhensibles par un humain.

---

# 🔗 Dépôts

- Core OS : https://github.com/nexgen999/evoX-CoreOS
- WebUI : https://github.com/nexgen999/evoX-CoreOS-WebUI
- Live : https://nexgen999.github.io/evoX-CoreOS-WebUI/

---

## ❤️ Merci

Merci à tous les développeurs, mainteneurs, testeurs et membres de la communauté qui rendent les projets open source possibles.

**evoX Core OS — One place. All your needs.**
