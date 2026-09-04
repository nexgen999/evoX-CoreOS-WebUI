# 🚀 Déploiement

## GitHub Pages

1. Poussez les fichiers à la racine.
2. Ouvrez Settings → Pages.
3. Choisissez `main` / `/ (root)`.
4. Attendez le déploiement.
5. Ouvrez l'URL affichée par GitHub.

## Vérifications HTTP

Ces ressources doivent être accessibles :

```text
/index.html
/web/css/style.css
/web/js/app.js
/web/data/config.json
```

## Déplacer la WebUI

L'auto-détection peut mettre à jour l'identité du dépôt WebUI.

Ne laissez pas cette détection remplacer le dépôt Core OS lorsque celui-ci est séparé.

## Cache

Le fichier de configuration est demandé avec `cache: no-store`, ce qui facilite les tests après modification.
