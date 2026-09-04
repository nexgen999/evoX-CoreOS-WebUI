# evoX Core OS WebUI

Bienvenue dans la documentation de démonstration de l'interface **evoX Core OS**.

Cette interface est une application web statique configurable destinée à être publiée sur GitHub Pages. Elle sépare volontairement le moteur graphique (`evoX-CoreOS-WebUI`) des données (`evoX-CoreOS`).

## Architecture

- `index.html` : point d'entrée minimal.
- `web/css/` : charte graphique.
- `web/js/` : moteur de navigation, GitHub, RSS/Atom/OPML, Store, Services et documentation.
- `web/data/config.json` : configuration active.
- `web/data/config.example.jsonc` : configuration commentée de référence.
- `docs/` : cette documentation de démonstration.

## Première installation

1. Copiez le dossier dans votre dépôt GitHub Pages.
2. Ouvrez `web/data/config.json`.
3. Renseignez le dépôt qui contient vos JSON/RSS/OPML.
4. Activez GitHub Pages.
5. Ouvrez l'URL de la page.

Le site est statique : aucun serveur Node n'est nécessaire.
