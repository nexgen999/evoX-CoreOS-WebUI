# Architecture technique

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Séparation WebUI / CoreOS

La WebUI est indépendante des données. `repositories.coreOS` désigne le dépôt source et `repositories.webUI` désigne le dépôt contenant l'interface. Cette séparation évite qu'une auto-détection de la page Pages remplace accidentellement le dépôt de données.

## Modules

`app.js` orchestre l'interface. `config.js` charge JSONC. `github.js` accède aux métadonnées et à l'arborescence GitHub. `rss.js` gère RSS/Atom/OPML. `store.js` normalise les JSON. `docs.js` découvre récursivement les Markdown. `markdown.js` rend un sous-ensemble Markdown sûr pour une documentation statique.
