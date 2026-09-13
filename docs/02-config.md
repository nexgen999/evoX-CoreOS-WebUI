# **docs/02-config.md \- Documentation de Configuration**

Guide complet de personnalisation et de paramétrage de **evoX-CoreOS WebUI** via config.json.

## ---

**📂 Emplacement du Fichier de Configuration**

L'application s'appuie sur un fichier de configuration centralisé au format JSON :

> * **Fichier Actif :** web/data/config.json  
> * **Fichier Modèle Commenté :** web/data/config.sample.jsonc

## **⚙️ Structure Détaillée des Clés de Configuration**

{  
  "siteTitle": "evoX-CoreOS WebUI",  
  "github": {  
    "user": "nexgen999",  
    "dataRepository": "nexgen999/evoX-CoreOS",  
    "webuiRepository": "nexgen999/evoX-CoreOS-WebUI"  
  },  
  "sources": {  
    "json": \[  
      { "name": "Payloads", "url": "https://nexgen999.github.io/evoX-CoreOS/json/payloads.json" },  
      { "name": "PKGs", "url": "https://nexgen999.github.io/evoX-CoreOS/json/pkg.json" },  
      { "name": "FFPFSC", "url": "https://nexgen999.github.io/evoX-CoreOS/json/ffpfsc.json" },  
      { "name": "Apps", "url": "https://nexgen999.github.io/evoX-CoreOS/json/apps.json" }  
    \],  
    "changelog": "https://raw.githubusercontent.com/nexgen999/evoX-CoreOS/main/CHANGELOG.md",  
    "pegasus": \[  
      { "name": "DLPS Catalog", "url": "https://pegasus-catalog.fly.dev/catalogs/dlps.json" }  
    \]  
  },  
  "releases": {  
    "baseUrl": "https://github.com/nexgen999/evoX-CoreOS/releases/download/latest/",  
    "packs": \[  
      { "name": "Payloads AIO", "file": "PS5\_payloads\_aio\_latest.zip", "icon": "fa-cubes" },  
      { "name": "Ultimate Pack AIO", "file": "PS5\_ultimate\_pack\_latest.zip", "icon": "fa-crown" }  
    \]  
  },  
  "credits": \["nexgen999", "evoX Team", "Bouti313", "Sistro"\],  
  "socials": \[  
    { "platform": "github", "url": "https://github.com/nexgen999", "icon": "fa-brands fa-github" },  
    { "platform": "discord", "url": "https://discord.gg", "icon": "fa-brands fa-discord" }  
  \]  
}

## **🛠️ Description des Blocs**

| Bloc | Propriété | Description   |
| :---- | :---- | :---- |
| github | dataRepository | Identifiant du dépôt contenant les catalogues JSON (Format : compte/depot). |
| sources.json | \[ { name, url } \] | Liste des 4 JSON maîtres qui alimentent le Store et les compteurs de la Home. |
| sources.changelog | url | Lien direct vers le fichier Markdown des nouveautés pour l'onglet News. |
| releases | baseUrl / packs | Définition de l'URL racine des téléchargements AIO et de la liste des fichiers ZIP. |
| socials | \[ { platform, url, icon } \] | Liens et icônes FontAwesome affichés dans le pied de page (Footer). |

## **🔄 Fusion dans le Dépôt CoreOS**

Pour fusionner la WebUI dans un dépôt unique (tout-en-un) :

> 1. Copiez le dossier web/ et le fichier index.html dans le dépôt maître.  
> 2. Dans web/data/config.json, modifiez la valeur de dataRepository pour pointer vers votre fork principal.
