---
applyTo: "modules/**/*.vue,components/**/*.vue"
---

# Vue Component Rules – fui-lms

## Component skeleton

Every `uc-main-layout.vue` (and any sibling component that uses `Global`) must follow this structure:

```vue
<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <!-- filter v-select columns -->
            <v-col class="d-flex align-center ga-2 flex-wrap">
              <!-- action v-btn -->
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <GlobalDataTable
      v-model="DSSelected"
      :headers="headers"
      :items="DS"
      item-value="ID"
      :show-select="true"
      items-per-page="-1"
      hide-default-footer
      hover
      v-data-table-height="calc(100dvh - 77px)"
    >
      <!-- custom column slots -->
    </GlobalDataTable>
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef'],
  data() {
    return {
      vueData,
      // local state ...
    }
  },
  computed: {
    TitleCap() { return renderText(parseInt(vueData.CapID)) },
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
  },
  watch: {},
  mounted() { this.getData() },
  methods: {},
}
</script>
```

## Mandatory rules

### Prefer Global components
- Use `<Global>` as the root wrapper for main module layouts (`uc-main-layout.vue`).
- Prefer existing global UI components for shared app-level behaviors instead of re-implementing the same UI pattern in feature modules:
  - `GlobalLoading`
  - `GlobalApiErrorDialog`
  - `GlobalUiSnackbar`
  - `GlobalIframeWindow`
- Do not create duplicate local components for loading overlays, global API error dialogs, app-wide snackbar notifications, or iframe window containers when Global equivalents already exist.

### `inject`
Always include:
```js
inject: ['snackbarRef', 'iframeRef']
```

### `script.js` usage rule
- All module logic (API calls, data transforms, event handlers, helpers) **must live inside the `uc-main-layout.vue` `methods`**, not in `script.js`.
- `script.js` is reserved only for: logic too complex to inline (e.g. long multi-step async pipelines), code shared across multiple components in the same module, or domain-specific utilities that require special handling.
- If `script.js` is empty or trivial, that is intentional and correct — do not move logic back out.

### `vueData` usage scope
- `raw.json`'s `data[]` entries are evaluated at runtime and injected into `vueData`. For example:
  ```json
  { "CapID": "parseInt(capid)" }
  ```
  becomes `vueData.CapID` globally. When migrating to `uc-main-layout.vue`, **do not redeclare these as local state** — read them from `vueData` directly (e.g. `vueData.CapID`, `parseInt(vueData.CapID || capid)` in `mounted`).
- Do not use `this.vueData` for local UI/module state such as `LopID`, `ThangObj`, `items`, `headers`, dialog flags, or selection state.
- Keep those values as local component state (`this.LopID`, `this.ThangObj`, `this.items`, ...).
- Only read global academic context from `vueData.NienKhoa` and `vueData.NienKhoaItem` in module components.
- Access the current logged-in user directly from the global: `vueData.user.UserID`. Do **not** copy it into a local state property.

### `#header` slot
- Root element **must** be `<v-card>` with no extra props (`rounded`, `elevation`, `border`, `class`)
- Title in `<v-card-title>`: `{{ TitlePage }} • {{ TitleCap }}`
- Filters inside `<v-card-text>` → `<v-row align="center">` → one `<v-col>` per filter
- Action buttons in the last `<v-col class="d-flex align-center ga-2 flex-wrap">`
- Filter `v-select` must be plain — **no** `density`, `variant`, `flat`, `prepend-inner-icon`

### `GlobalDataTable` / `v-data-table`
- Prefer `GlobalDataTable` for module tables.
- When using `GlobalDataTable`, always pass `v-data-table-height` (example: `v-data-table-height="calc(100dvh - 77px)"`).
- When you need auto-fit height by viewport/container resize, apply `v-auto-table-height` (from `autoTableHeightDirective`) on the table wrapper/container.
- **Always** add `items-per-page="-1" hide-default-footer` — no pagination.
- If you must use raw `v-data-table`, add `style="max-height: calc(100dvh - 77px); overflow-y: auto;"`.
- Keep `headers` as local component `data`, never use `vueData.headers`.

### Template event handlers — NO template string literals
❌ Wrong:
```vue
@click="openDetail(`row-${item.ID}`)"
```
✅ Correct — pre-compute keys in `data()` or transformation methods:
```js
rows.push({ rowKey: `row-${item.ID}`, ...item })
```
```vue
@click="openDetail(item.rowKey)"
```

### Cascade filter resets in `watch`
When a parent filter changes, reset all child filters and their data arrays:
```js
watch: {
  KhoiItem(v) {
    this.LopItem = null
    this.DSLop = []
    if (v) this.getLop()
  },
  LopItem(v) {
    this.DSData = []
    if (v) this.getData()
  },
}
```

### `no-data` slot
Always add a friendly empty state when the table depends on filters:
```vue
<template #no-data>
  <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
    <p class="text-body-2">Chọn lớp để xem danh sách</p>
  </div>
</template>
```

### `uc-info-student`
Use for student name+avatar cells — **do not** hand-roll avatar chips inline:
```vue
<template #item.hocSinh="{ item }">
  <uc-info-student :item="item" />
</template>
```

### `uc-dialog`
Use for all modal dialogs instead of raw `v-dialog`:
```vue
<uc-dialog v-model="isOpen" title="Tiêu đề" doneText="Lưu" @onSubmit="handleSave">
  <!-- content -->
</uc-dialog>
```

### `GlobalConfirmDialog` — use `confirm()` for mutations
Always call `confirm()` before any insert/update/delete operation. It maps to `GlobalConfirmDialog` and is available as a global helper:
```js
async onSave() {
  const ok = await confirm({ title: 'Xác nhận lưu?' })
  if (!ok) return
  ajaxCALL(...)
}
```
- **Never** use `window.confirm()` or inline dialog hacks for confirmation
- `confirm()` is already wired to `GlobalConfirmDialog` via the global runtime — no import needed

### TinhTrang chip pattern
```vue
<v-chip size="x-small" :color="item.MauTinhTrang || 'default'" variant="tonal">
  {{ item.TenTinhTrang }}
</v-chip>
```

### EnumTinhTrang — always define locally
```js
EnumTinhTrang: {
  ChuaLuu: 0, LuuTam: 1, GVBM_GuiDiem: 2, GVCN_TuChoi_GVBM: 3,
  GVCN_GuiDiem: 4, TT_TuChoi: 5, TT_GuiBGH: 6, BGH_TuChoi: 7, BGH_Duyet: 8,
}
```
