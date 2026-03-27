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

    <v-data-table
      v-model="DSSelected"
      :headers
      :items="DS"
      item-value="ID"
      :show-select="true"
      items-per-page="-1"
      hide-default-footer
      hover
      style="max-height: calc(100dvh - 77px); overflow-y: auto;"
    >
      <!-- custom column slots -->
    </v-data-table>
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

### `inject`
Always include:
```js
inject: ['snackbarRef', 'iframeRef']
```

### `#header` slot
- Root element **must** be `<v-card>` with no extra props (`rounded`, `elevation`, `border`, `class`)
- Title in `<v-card-title>`: `{{ TitlePage }} • {{ TitleCap }}`
- Filters inside `<v-card-text>` → `<v-row align="center">` → one `<v-col>` per filter
- Action buttons in the last `<v-col class="d-flex align-center ga-2 flex-wrap">`
- Filter `v-select` must be plain — **no** `density`, `variant`, `flat`, `prepend-inner-icon`

### `v-data-table`
- **Always** add `style="max-height: calc(100dvh - 77px); overflow-y: auto;"`
- **Always** add `items-per-page="-1" hide-default-footer` — no pagination
- Keep `headers` as local component `data`, never use `vueData.headers`

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
