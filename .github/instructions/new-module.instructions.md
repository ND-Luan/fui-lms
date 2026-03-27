---
applyTo: "modules/**/raw.json,modules/**/script.js"
---

# New Module Rules – fui-lms

## Preferred pattern: minimal `raw.json` + `uc-main-layout.vue`

All new modules must follow the **modern pattern**: put all UI and logic inside `uc-main-layout.vue`. Keep `raw.json` minimal and leave `script.js` empty.

### `raw.json` — required minimal form

```json
{
  "data": [
    {"EXE": "IsCheck_NotRoleParent(vueData.user)"},
    {"CapID": "parseInt(capid)"}
  ],
  "watch": {},
  "controls": [
    {
      "prop": "fluid pa-0",
      "rows": [
        {
          "prop": ":no-gutters='true'",
          "cols": [
            {"el": "uc-main-layout"}
          ]
        }
      ]
    }
  ],
  "set": {}
}
```

Only add extra `data` entries when you need to read a URL query param (e.g. `{"LopID": "parseInt(lopid)"}`).  
Do **not** add `controls` beyond the single `uc-main-layout` reference.  
Do **not** define API calls, watch handlers, or UI trees in `raw.json` for new modules.

### `script.js` — keep empty

```js
// logic lives in components/uc-main-layout.vue
```

## Module naming & folder structure

```
modules/
└── {prefix}-{feature-name}/
    ├── raw.json            ← minimal (see above)
    ├── script.js           ← empty
    └── components/
        ├── uc-main-layout.vue   ← all logic here
        └── uc-{sub-component}.vue  ← optional dialogs / sub-views
```

### Prefix rules
| Module domain | Prefix |
|---------------|--------|
| Teacher (Giáo viên) | `gv-` or `fui-gv-` |
| Principal board | `bgh-` |
| Admin | `admin-` |
| Parent | `ph-` |
| Reports / analytics | `bao-cao-` / `bc-` / `dashboard-` |
| Student LMS interface | `lms-student-` |
| Teacher LMS interface | `lms-teacher-` |

## After creating a module

Register it in `proj.json` — add an entry in the `modules` array:
```json
{
  "name": "my-module-name",
  "path": "modules/my-module-name"
}
```
