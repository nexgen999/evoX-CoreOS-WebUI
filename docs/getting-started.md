# 🚀 Démarrage

## Prérequis

Aucun backend n'est nécessaire. La WebUI utilise HTML, CSS et JavaScript natifs et peut être publiée directement avec GitHub Pages.

## Installation

La racine du dépôt doit contenir `index.html`, `web/` et `docs/`.

Ne placez pas l'application dans `evoX-CoreOS-WebUI/evoX-CoreOS-WebUI/` par erreur : le `index.html` doit être directement à la racine publiée.

## Configuration initiale

Modifiez `web/data/config.json`.

Les sections les plus importantes sont `repository`, `sourceSite`, `navigation`, `socials`, `homeNews`, `news`, `downloads`, `store`, `services`, `docs` et `footer`.

## Première validation

Après publication :

1. ouvrez la Home ;
2. vérifiez le profil ;
3. ouvrez Store ;
4. testez une recherche ;
5. ouvrez Download ;
6. testez un bouton AIO ;
7. ouvrez News ;
8. ouvrez Documentation ;
9. testez Services ;
10. testez le bouton Copier d'un catalogue.

## GitHub Pages

Dans **Settings → Pages**, choisissez la branche `main` et le dossier `/ (root)`.

## Si la page est vide

Ouvrez la console développeur. Une erreur JavaScript doit être traitée avant d'examiner les données. Vérifiez également que `web/js/app.js` et `web/data/config.json` répondent en HTTP 200.
