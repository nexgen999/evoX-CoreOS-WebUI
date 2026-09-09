# Dépannage

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Écran vide

Ouvrez F12 → Console. Une erreur JavaScript bloque généralement le rendu. Vérifiez ensuite Network → `config.json`, `app.js` et `style.css`.

## GitHub API

Si les statistiques ou la documentation disparaissent, testez l'URL du dépôt et vérifiez qu'il est public. Une limitation de taux peut également demander un nouvel essai plus tard.

## CORS

Une WebUI GitHub Pages ne peut pas forcer le navigateur à accepter une politique CORS externe. Préférez les flux déjà publiés pour le web ou un service proxy autorisé.

## WebUI PS5

L'adresse saisie est stockée dans `localStorage`. Les ports et chemins restent dans `config.json`. Exemple : IP `192.168.1.50`, port `8084`, path `/` produit `http://192.168.1.50:8084/`.
