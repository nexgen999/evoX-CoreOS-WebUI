# evoX Core OS WebUI

![evoX Core OS](web/assets/logo.svg)

> **Portail web statique, configurable et orienté GitHub Pages pour evoX Core OS.**

La WebUI transforme un dépôt de données en un véritable portail : tableau de bord, lecteur RSS/Atom/OPML, centre de téléchargement, Store JSON dynamique, services locaux PS5, documentation Wiki Markdown, About, Remerciements et footer à badges.

## ✨ Fonctionnalités

- 🎛️ Dashboard evoX Core OS avec charte sombre fixe.
- 👤 Profil GitHub automatique : avatar, bio, localisation et statistiques.
- 📰 Lecteur News de type blog pour RSS, Atom et OPML.
- 🏠 Flux de la Home indépendant des flux du menu News.
- 📦 Store alimenté directement par les JSON CoreOS.
- 🔎 Recherche, catégories, sous-catégories et vues liste/tuile.
- 📥 Téléchargements AIO et section Other Downloads.
- 📋 Copie des URLs de catalogues Pegasus.
- 🔗 Services avec onglets extensibles.
- 🎮 WebUI PS5 : une IP locale, ports et chemins configurables.
- 📚 Documentation Markdown récursive avec ordre personnalisable.
- 🧩 Configuration centralisée et commentée.
- 🏷️ Footer avec badges GitHub personnalisables.
- 📱 Responsive PC / tablette / mobile.

## 🏗️ Arborescence

```text
.
├── index.html
├── README.md
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
└── web/
    ├── assets/
    ├── css/style.css
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

## 🚀 Installation

1. Copiez le projet à la racine du dépôt `evoX-CoreOS-WebUI`.
2. Vérifiez `web/data/config.json`.
3. Activez GitHub Pages.
4. Publiez la branche `main` ou la branche choisie.
5. Ouvrez `https://<utilisateur>.github.io/<depot>/`.

Aucun npm, Node.js ou build n'est requis pour la version publiée.

## 🔀 Deux dépôts

La configuration distingue volontairement :

- **CoreOS** : `https://github.com/nexgen999/evoX-CoreOS` — JSON, RSS/Atom/OPML, archives.
- **WebUI** : `https://github.com/nexgen999/evoX-CoreOS-WebUI` — interface, assets et documentation.

Cette séparation est essentielle : l'URL GitHub Pages de la WebUI ne doit pas remplacer automatiquement la source des données CoreOS.

## ⚙️ Configuration

Le fichier principal est `web/data/config.json`. Il est organisé en sections numérotées :

1. Configuration générale
2. Dépôts et auto-détection
3. Source du site et chemins
4. Réseaux sociaux
5. Header
6. Sidebar / profil
7. Branding / Home
8. Home News
9. News
10. Downloads
11. Store
12. Services
13. Documentation
14. About / Remerciements
15. Footer / badges
16. Apparence

Le fichier actif accepte les commentaires `//`. Le fichier `config.sample.json` est un JSON strict destiné aux outils qui refusent les commentaires.

## 📰 RSS, Atom et OPML

Une source peut être définie directement :

```json
{
  "label": "Payloads",
  "url": "https://example.org/feed.xml",
  "enabled": true
}
```

Ou par OPML :

```json
"opmlFiles": [
  "https://example.org/sources.opml"
]
```

Chaque `outline` OPML contenant `xmlUrl` devient automatiquement une source.

### Home vs News

`homeNews` et `news` sont indépendants. Il est donc possible d'afficher un seul flux sur la Home tout en utilisant plusieurs OPML dans News.

## 🛒 Store

Les sources CoreOS préconfigurées sont :

```text
https://nexgen999.github.io/evoX-CoreOS/json/payloads.json
https://nexgen999.github.io/evoX-CoreOS/json/pkg.json
https://nexgen999.github.io/evoX-CoreOS/json/ffpfsc.json
https://nexgen999.github.io/evoX-CoreOS/json/apps.json
```

Le moteur normalise les objets afin d'obtenir une interface commune. `fieldMap` permet d'accepter des variantes de noms sans modifier le code.

## 📥 Downloads

Les packs AIO utilisent le tag `latest` :

```text
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_payloads_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_pkg_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ffpfsc_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_apps_aio_latest.zip
https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/PS5_ultimate_pack_latest.zip
```

Les trois catalogues Pegasus sont configurés avec un bouton **Copier l'URL** :

- DLPSGame : `https://pegasus-catalog.fly.dev/catalogs/dlps.json`
- Pippo : `https://pegasus-catalog.fly.dev/catalogs/pippo.json`
- PFS : `https://pegasus-catalog.fly.dev/catalogs/pfs.json`

## 🔗 Services

Les onglets sont déclarés dans `services.tabs`. Un onglet `links` ouvre des URLs externes. Un onglet `ps5` construit une URL locale à partir de l'IP saisie par l'utilisateur, du port et du chemin configurés.

Exemple :

```json
{
  "name": "PLDMGR",
  "port": 8084,
  "path": "/",
  "protocol": "http"
}
```

Avec l'IP `192.168.1.50`, le lien devient `http://192.168.1.50:8084/`.

Ajouter un quatrième, cinquième ou dixième onglet consiste simplement à ajouter un objet dans `services.tabs`.

## 📚 Documentation

Le menu Documentation lit récursivement `docs/` dans le dépôt WebUI via l'arbre GitHub. Les sous-dossiers sont détectés. `documentation.order` permet de définir les premiers documents à afficher.

## 🧪 Dépannage

Si rien ne s'affiche :

1. Ouvrez F12 → Console.
2. Vérifiez que `web/js/app.js` répond en HTTP 200.
3. Vérifiez `web/data/config.json`.
4. Vérifiez les URLs CoreOS.
5. Vérifiez l'API GitHub et les éventuels problèmes CORS.

## 🔐 Sécurité et limites

La WebUI est une application côté navigateur. Elle ne contourne pas les politiques CORS d'un serveur distant. Les URLs externes sont donc dépendantes des politiques du serveur cible.

La WebUI ne contient pas de secret GitHub et n'utilise pas de token privé.

## 📖 Documentation complète

Consultez le menu **Documentation** de la WebUI ou le dossier `docs/` pour les procédures détaillées.

## 📄 Licence

La licence du projet doit être définie selon les fichiers du dépôt source.
