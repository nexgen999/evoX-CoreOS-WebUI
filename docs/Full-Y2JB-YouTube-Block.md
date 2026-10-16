Simply modifing appinfo.db will not block YouTube from being updated.
As soon as you connect to the internet without setting a DNS it will automatically refresh itself to the correct clean state, the icon also switches back to original.
This can result in a softlock where you have to set up everyhting again.

In order to properly block YouTube from being updated, you also need to fully update YouTube's parameters after a new installation.

The param.json file of the YouTube app is actually located at 3 positions when installed :
- At ```/system_data/priv/appmeta/PPSA01650/param.json```
- At ```/user/appmeta/PPSA01650/param.json```
- And also inside ```/system_data/priv/mms/app.db``` TABLE: ```tbl_contentinfo``` COLUMN: ```AppInfoJson```
  - The values aren't exactly the same ones as in param.json but the ```CONTENT_VERSION``` and ```VERSION_FILE_URI``` is also located in there

To fully block YouTube from being updated:
1. Get ```/system_data/priv/mms/appinfo.db```  and apply following patch :

```sql
UPDATE tbl_appinfo SET val = 'http://127.0.0.2' WHERE titleId = 'PPSA01650' AND key = 'VERSION_FILE_URI';
UPDATE tbl_appinfo SET val = '99.999.999' WHERE titleId = 'PPSA01650' AND key = 'CONTENT_VERSION';
```

2. Get 1 param.json from ```/system_data/priv/appmeta/PPSA01650/param.json``` OR ```/user/appmeta/PPSA01650/param.json```
3. Modify ```contentVersion``` to ```99.999.999``` and ```versionFileUri``` to ```http://127.0.0.2```
4. Get ```/system_data/priv/mms/app.db``` and apply following patch :

```sql
UPDATE tbl_contentinfo
SET AppInfoJson = json_set(
    AppInfoJson,
    '$.CONTENT_VERSION', '99.999.999',
    '$.VERSION_FILE_URI', 'http://127.0.0.2'
)
WHERE titleId = 'PPSA01650';
```

5. Navigate to the Settings on your PS5
6. Upload all files back using FTP :
  - ```param.json``` to ```/system_data/priv/appmeta/PPSA01650/param.json``` AND ```/user/appmeta/PPSA01650/param.json```
  - ```appinfo.db``` to ```/system_data/priv/mms/appinfo.db```
  - ```app.db``` to ```/system_data/priv/mms/app.db```
7. Press PS button on the controller and restart the console
