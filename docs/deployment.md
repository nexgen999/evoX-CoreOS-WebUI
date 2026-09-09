# Déploiement GitHub Pages

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Publication

Dans GitHub : **Settings → Pages**, sélectionnez la branche contenant `index.html` à la racine. Attendez la publication puis ouvrez l'URL Pages.

## Cache

GitHub Pages et les navigateurs peuvent mettre en cache les ressources. Pour un diagnostic, utilisez un rechargement forcé et vérifiez l'onglet Network/Console du navigateur.

## Erreurs courantes

- **404 CSS/JS** : le chemin relatif `./web/...` n'est plus respecté.
- **Configuration HTTP 404** : `web/data/config.json` manque.
- **Store vide** : URL JSON incorrecte ou CORS.
- **News vide** : URL RSS/OPML incorrecte ou proxy RSS indisponible.
- **Docs vide** : dépôt/branche/racine incorrects ou limite API GitHub.
