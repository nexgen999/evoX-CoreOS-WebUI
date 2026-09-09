# Sources de données

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## JSON Store

Le moteur accepte les tableaux `payloads`, `packages`, `files`, `apps`, ainsi que `items` ou `data` si nécessaire. Chaque objet est normalisé vers un modèle commun : nom, fichier, URL, description, version, auteur, catégorie, sous-catégorie, icône et checksum.

## RSS / Atom

Les flux directs sont lus via Fetch lorsque CORS le permet. Une source RSS/Atom peut aussi être chargée via le service public RSS2JSON configuré dans `rss.js`. Si ce service échoue, le moteur tente un parsing XML direct.

## OPML

Un OPML est lu avec `DOMParser`. Toutes les balises `outline` possédant `xmlUrl` deviennent des sources. Les OPML peuvent donc regrouper plusieurs flux sans modifier le code.

## GitHub

Les métadonnées publiques du dépôt et de l'utilisateur sont obtenues via l'API REST GitHub. Un dépôt public peut être interrogé sans token, dans les limites publiques de l'API.
