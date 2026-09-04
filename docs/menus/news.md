# 📰 News

News est un lecteur de flux présenté comme un blog.

## Sources

Une source directe :

```json
{
  "id": "scene",
  "label": "Scène",
  "url": "https://example.com/feed.xml"
}
```

Une source OPML :

```json
{
  "id": "scene-opml",
  "url": "https://example.com/sources.opml"
}
```

Chaque `xmlUrl` trouvé dans l'OPML devient un flux.

## Articles

Le lecteur affiche titre, source, date, description, image lorsqu'elle existe et lien original.

## Recherche

La recherche examine le titre, la description et la source.

## Indépendance Home / News

Il est possible d'utiliser une OPML de veille générale dans News et un flux projet dans Home.
