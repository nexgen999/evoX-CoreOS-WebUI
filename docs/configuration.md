# Configuration complète

> **evoX Core OS WebUI** — documentation officielle.

Cette documentation décrit le fonctionnement réel du portail, sa configuration et les conventions à respecter pour le déployer sur GitHub Pages.

## Règle principale

`config.json` est le fichier actif. Il utilise volontairement une extension `.json` tout en acceptant des commentaires `//` et les virgules finales. Le chargeur retire ces éléments avant `JSON.parse`. Pour un JSON strict destiné à un outil externe, utilisez `config.sample.json`.

## Sections

### `site`
Nom, langue et page par défaut.

### `autoDetect`
Contrôle les déductions de dépôt et de branche. Pour une installation reproductible, gardez les dépôts explicites.

### `repositories`
`coreOS` contient le dépôt des données. `webUI` contient le dépôt de l'interface. Les URLs GitHub Pages sont optionnelles mais utiles pour les liens.

### `sources`
Définit la racine des JSON, RSS, docs et archives. Les URLs absolues sont recommandées lorsqu'une source vient d'un autre dépôt.

### `socials`
Chaque entrée possède `id`, `label`, `url`, `icon`, `enabled`. L'icône peut être remplacée dans `app.js` ou par une future image personnalisée.

### `header`
Contrôle le logo, les liens AIO, les réseaux et l'avatar.

### `homeNews` et `news`
Ces blocs sont indépendants. Une source peut être une URL RSS/Atom directe ou un fichier OPML contenant plusieurs `xmlUrl`.

### `store`
Définit les JSON et les clés de tableaux possibles. `fieldMap` permet de faire correspondre des noms de champs différents sans modifier le moteur.

### `services`
Les onglets sont des objets dans `tabs`. Un onglet `type: ps5` construit `protocol://IP:port/path`. Un onglet `links` utilise directement `url`.

### `documentation`
La racine est parcourue via l'API Git Trees. `recursive: true` permet de détecter les sous-dossiers. `order` place les documents importants en tête.

### `footer`
Le texte et les badges sont configurables. Les badges sont des images liées à une URL.
