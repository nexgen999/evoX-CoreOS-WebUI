# 🧰 Dépannage

## Page blanche

La priorité est la console développeur.

Si vous voyez `SyntaxError`, le navigateur n'a pas pu charger le module JavaScript. Vérifiez le fichier `app.js`.

Si vous voyez `Configuration JSONC invalide`, vérifiez les guillemets, virgules, accolades et crochets.

## Store vide

Testez chaque JSON directement.

Puis vérifiez :

```text
sourceSite.baseUrl
store.sources[].url
store.sources[].arrayKey
```

## News vide

Testez chaque URL RSS/Atom directement.

Si elle fonctionne directement mais pas dans la WebUI, le serveur peut bloquer CORS.

## OPML

Vérifiez que le fichier contient des `outline` avec `xmlUrl`.

## Documentation

Vérifiez le propriétaire, dépôt, branche et chemin dans `docs.source`.

## Services PS5

Le bouton compose simplement une URL locale. Il ne crée aucun tunnel.

La machine qui utilise la WebUI doit pouvoir joindre la PS5.

## GitHub API

Une limitation de l'API peut empêcher les statistiques de s'afficher sans empêcher le reste de l'application.
