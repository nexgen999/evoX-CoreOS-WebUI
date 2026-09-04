# 🗃️ Sources de données

## JSON Store

Le Core OS actuel expose quatre catalogues.

| URL | Tableau |
|---|---|
| `/json/payloads.json` | `payloads` |
| `/json/pkg.json` | `packages` |
| `/json/ffpfsc.json` | `files` |
| `/json/apps.json` | `apps` |

Le moteur accepte également `items` ou `data` comme fallback.

## Modèle normalisé

Une entrée est convertie vers :

```text
name
filename
url
description
version
author
category
subcategory
icon
type
```

## Flux

Les flux peuvent être RSS ou Atom.

## OPML

Le moteur parcourt tous les `outline` qui possèdent `xmlUrl`.

Cela permet de conserver un fichier OPML comme liste centrale de sources.

## Markdown

La documentation utilise l'API GitHub pour énumérer les fichiers du dossier configuré.
