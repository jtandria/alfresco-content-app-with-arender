# ARender viewer in ACA as extension

## Description

ARender4ADF with ADF Core 3.7.0

## Prerequisites

- Alfresco 5.2.4, 6.x
- Tomcat  7.0
- NodeJS v10.16.0,
- npm 6.14.2

## Arender Viewer Component

## Install

As the module is preview and not publicly available you need to add it manually.

- Clone the ACA repository

```console
$> git clone https://github.com/Alfresco/alfresco-content-app.git
$> git checkout v1.10.1
```

- Create a library project

```console
$> ng g library arondor-arender-viewer
```

- Replace the content of the created folder by ARender ACA extension sources
- Add ARender lib to the compiler config `tsconfig.json`

```json
{
  "compilerOptions": {
    // [...]
    "paths": {
    // [...]
      "@arondor/arender-viewer": ["dist/@arondor/arender-viewer"],
      "@arondor/arender-viewer/*": ["dist/@arondor/arender-viewer/*"]
    }
  }
}
```

- Add ARender assets to the app in `angular.json` and replace project infos

```json
{
  "projects": {
    "app": {
      "architect": {
        //[...]
        "build": {
          //[...]
          "options": {
            //[...]
            "assets": [
              //[...]
              {
                "glob": "arender.plugin.json",
                "input": "node_modules/@arondor/arender-viewer/assets",
                "output": "./assets/plugins"
              },
              {
                "glob": "arender.plugin.json",
                "input": "projects/arondor-arender-viewer/assets",
                "output": "./assets/plugins"
              },
              {
                "glob": "**/*",
                "input": "node_modules/@arondor/arender-viewer/assets",
                "output": "./assets/arender-viewer"
              },
              {
                "glob": "**/*",
                "input": "projects/arondor-arender-viewer/assets",
                "output": "./assets/arender-viewer"
              }
            ]
          }
        }
      }
    },
    //[...]
    "arondor-arender-viewer": {
      "root": "projects/arondor-arender-viewer",
      "sourceRoot": "projects/arondor-arender-viewer/src",
      "projectType": "library",
      "prefix": "arender",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-ng-packagr:build",
          "options": {
            "tsConfig": "projects/arondor-arender-viewer/tsconfig.lib.json",
            "project": "projects/arondor-arender-viewer/ng-package.json"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "main": "projects/arondor-arender-viewer/src/test.ts",
            "tsConfig": "projects/arondor-arender-viewer/tsconfig.spec.json",
            "karmaConfig": "projects/arondor-arender-viewer/karma.conf.js"
          }
        },
        "lint": {
          "builder": "@angular-devkit/build-angular:tslint",
          "options": {
            "tsConfig": [
              "projects/arondor-arender-viewer/tsconfig.lib.json",
              "projects/arondor-arender-viewer/tsconfig.spec.json"
            ],
            "exclude": [
              "**/node_modules/**"
            ]
          }
        }
      }
    }
  }
}
```

- Add ARender extension description to `app.extensions.json`

```json
{
  "$references": [
    "arender.plugin.json",
    "..."
  ],
}
```

- import ARender extension in `extension.module.ts`

```ts
import { ArenderExtensionModule } from '@arondor/arender-viewer';

@NgModule({
  imports: [ArenderExtensionModule, ... ]
})
```

- Add ARender ACA extension to the package build scripts in `package.json`

```json
{
  "scripts": {
    //[...]
    "build:arender-extension": "npx rimraf dist/@arondor/arender-viewer && ng build arondor-arender-viewer && cpr projects/arondor-arender-viewer/ngi.json dist/@arondor/arender-viewer/ngi.json && cpr projects/arondor-arender-viewer/assets dist/@arondor/arender-viewer/assets",
    "build.arender": "npm run build:arender-extension",
    "build.allExtensions": "npm run build.shared && npm run build.aos && npm run build.arender",
    "build.all": "npm run build.allExtensions && ng build app --prod",
    //[...]
  }
}
```

- Build the app

```console
$> npm run build.all
```

## Configuration

### ARender server config

- Add these lines in `app.config.json`

```json
{
  "arender" :{
    "host": "{protocol}//{hostname}:{port}/arender/", //arender host: avoid CORS to use "open in ARender" with multiple document selected
    "onPromise": true,
    "documentbuilder":true // enable documentbuilder by default
  },
  //[...]
}
```

### file extension openned

Modify features.viewer.content.fileExtension list in `asset/arender-viewer/arender.plugin.json`

```json
{
  //[...]
  "features": {
    "viewer": {
      "content": [{
        "id": "app.arender.viewer",
        "fileExtension": [
          "docx", "docm", "dotx", "dotm", "doc", "dot",
          "rtf", "odt", "ott",
          "xlsx", "xlsm", "xls", "xlt", "xml", "csv",
          "ods", "ots",
          "pptx", "pptm", "ppt", "pps",
          "odp", "otp", "vsdx",
          "msg", "eml",
          "html", "htm",
          "txt",
          "dwg", "dxf", "tif", "tiff", "dcm",
          "mda", "ica", "mmr", "mca",
          "jpg", "jpeg", "jpe", "jfif", "jp2", "jpf", "jpx", "j2k", "j2c", "jpc",
          "png", "gif", "webp", "bmp"
          // <- Add your extensions here or/and remove element from the list above ^
        ],
      }]
    },
    // [...]
  }
}
```

### Docker

Change ARender ui context path to /arender with `CONTEXT_PATH=/arender` in container environment
