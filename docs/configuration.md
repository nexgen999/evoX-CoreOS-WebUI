# ⚙️ Configuration

`web/data/config.json` est le fichier principal.

Il est JSONC : les commentaires `//` et `/* ... */` sont autorisés.

## Sections

### 01 — Général

`site` définit nom, slogan, langue et page initiale.

### 02 — Auto-détection

`autoDetect` permet de détecter le dépôt qui héberge la WebUI à partir de GitHub Pages.

### 03 — Core OS

`repository` définit le propriétaire, nom, branche, URL GitHub, URL Pages et API.

### 04 — WebUI

`uiRepository` décrit le dépôt de l'interface.

### 05 — Sources

`sourceSite.baseUrl` est la base des URLs relatives du Core OS.

### 06 — Navigation

`navigation` contrôle les menus et leur ordre.

### 07 — Profil

`profile` contrôle le profil GitHub de la Sidebar.

### 08 — Branding

`branding` contrôle logo, favicon et couleurs principales.

### 09 — Socials

`socials` définit les réseaux.

### 10 — Header

`header.quickDownloads` définit les boutons AIO et `showGitHubButton` contrôle le bouton GitHub.

### 11 — Sidebar

`sidebar.followMe` et `sidebar.promo` contrôlent les deux zones inférieures.

### 12 — Home

`home.hero`, `home.welcome` et `home.thanks` contrôlent le dashboard.

### 13 — Home News

`homeNews` est indépendant de `news`.

### 14 — News

`news.feeds` et `news.opml` alimentent le lecteur blog.

### 15 — Downloads

`downloads.items` contient les AIO et `downloads.otherDownloads` les autres ressources.

### 16 — Store

`store.sources` définit les JSON.

### 17 — Services

`services.tabs` crée les onglets.

### 18 — Documentation

`docs.source` indique le dépôt Markdown et `docs.order` l'ordre.

### 19–20 — About / Thanks

Contenus éditoriaux.

### 21 — Footer

Texte, liens et badges.

## URL relative

`/json/pkg.json` avec `sourceSite.baseUrl = https://example.github.io/core` devient `https://example.github.io/core/json/pkg.json`.

Une URL complète reste inchangée.
