# Documentation evoX Core OS WebUI

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Objectif

La WebUI est une application statique : aucune base de données, aucun serveur Node et aucun backend propriétaire ne sont nécessaires pour l'interface. Le navigateur charge la configuration, interroge les APIs publiques nécessaires et lit les sources du dépôt CoreOS.

## Architecture

- `index.html` : point d'entrée GitHub Pages.
- `web/css/` : charte graphique et responsive.
- `web/js/` : moteur applicatif modulaire.
- `web/data/config.json` : configuration active JSONC.
- `web/assets/` : logos et backgrounds.
- `docs/` : documentation Markdown affichée par le menu Documentation.

## Principes

1. Le dépôt **WebUI** héberge l'interface.
2. Le dépôt **CoreOS** héberge les JSON, RSS/Atom/OPML et archives.
3. Les chemins peuvent être remplacés par des URLs absolues.
4. La Home et News possèdent des sources indépendantes.
5. Les menus sont pilotés par `config.json`.

## Installation

Copiez le contenu du projet à la racine d'un dépôt GitHub, activez GitHub Pages sur la branche souhaitée et ouvrez l'URL Pages. Aucun build n'est nécessaire.
