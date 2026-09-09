# Personnalisation

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Branding

Remplacez les SVG dans `web/assets/` et les chemins `branding.*` dans la configuration. Les textes du Hero, des panneaux et du footer ne sont pas codés en dur.

## Icônes

Le module `icons.js` fournit un jeu d'icônes sans dépendance externe. Les entrées de configuration référencent leurs identifiants. Pour une icône graphique, ajoutez un fichier dans `web/assets` puis adaptez le rendu selon votre besoin.

## Services

Ajoutez un objet dans `services.tabs`. Pour un service local : `type: "ps5"`, `port`, `path`, `protocol`. Pour un site externe : `type: "links"`, `url`.
