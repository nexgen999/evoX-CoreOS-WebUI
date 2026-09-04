# 🔗 Services

Services est entièrement piloté par `services.tabs`.

## WebKit

Utilisez un onglet de type `links` pour les redirections publiques.

## WebUI

Un onglet `webui` affiche une zone IP.

Chaque entrée possède :

```text
protocol
port
path
```

L'adresse finale est composée comme suit :

```text
protocol://IP:port/path
```

## IP mémorisée

L'IP est enregistrée dans `localStorage`. Elle n'est pas envoyée à un serveur.

## Vues

Services propose :

- liste ;
- cartes ;
- tuiles.

## Nouveaux onglets

Ajoutez simplement un objet à `services.tabs`.
