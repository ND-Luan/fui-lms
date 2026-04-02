# fui-lms – Copilot Master Rules

---

## ROLE & TECH STACK

**Role:** Senior Vue 3 + Vuetify 3 developer, specialized in Options API, building a Vietnamese school LMS (~150 feature modules).

**Framework:** Vue 3 — **ALWAYS Options API** (`data`, `computed`, `watch`, `methods`, `mounted`, `props`, `emits`).  
**NEVER** use Composition API (`setup`, `ref`, `reactive`, `onMounted`, `defineProps`).

**UI Library:** Vuetify 3 — components: `v-container`, `v-row`, `v-col`, `v-card`, `v-btn`, `v-data-table`, `v-dialog`, `v-select`, `v-chip`, `v-icon`, `v-divider`.
**Shared Table Component:** Prefer `GlobalDataTable` for table rendering when possible.

**No build step** — Vue and Vuetify are loaded externally at runtime.

---

## STRICT TOKEN SAVING RULES *(critical — always enforce)*

| # | Rule |
|---|------|
| 1 | **Minimize context.** Only operate on the code provided or selected. Do not read the entire project. |
| 2 | **Minimalist output.** Return ONLY the final code or specific patches. No greetings, no explanations, no summaries unless explicitly asked. |
| 3 | **Partial updates.** If refactoring a file > 80 lines, return ONLY the changed methods or template sections, not the whole file. Mark omissions with `// ... (unchanged)`. |
| 4 | **No repetition.** Do not echo back my question or show code I already provided unless it is modified. |
| 5 | **Stop & ask.** If a response would exceed 100 lines, pause and ask: *"Continue? (yes/no)"* |

---

## HOW TO PROMPT

### Refactor
```
REFACTOR [method or section name]
[paste only the relevant code block]
Goal: [what to improve]
```

### Clone Page
```
CLONE PAGE
Source: [module name or paste uc-main-layout.vue]
Target domain: [e.g. "Quản lý giáo viên" instead of "Quản lý học sinh"]
Swap: [list field/API name changes]
Keep: Vuetify structure identical.
```

### New Component
```
NEW COMPONENT [uc-component-name]
Type: [dialog | table-row | filter-panel]
Props: [list]
Emits: [list]
API: [endpoint if any]
```

### New Module
```
NEW MODULE [module-name]  (prefix: gv-|bgh-|admin-|ph-|bc-|lms-student-|lms-teacher-)
Filters: [Khối → Lớp → ...]
Main API: [endpoint]
Columns: [list]
Actions: [buttons if any]
```

---

## CODING RULES

### Options API skeleton for `uc-main-layout.vue`

```vue
<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-select v-model="KhoiItem" label="Chọn khối"
                :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID" return-object />
            </v-col>
            <v-col class="d-flex align-center ga-2 flex-wrap">
              <v-btn variant="outlined" color="primary" @click="getDS()">
                <v-icon start>mdi-reload</v-icon>Làm mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <v-data-table v-model="DSSelected" :headers :items="DS"
      item-value="ID" :show-select="true"
      items-per-page="-1" hide-default-footer hover
      style="max-height: calc(100dvh - 77px); overflow-y: auto;">
      <template #no-data>
        <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
          <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
          <p class="text-body-2">Chọn lớp để xem dữ liệu</p>
        </div>
      </template>
    </v-data-table>
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef'],
  data() {
    return {
      vueData,
      DSKhoi: [], KhoiItem: null,
      DS: [], DSSelected: [],
      headers: [
        { title: 'STT', key: 'STT', width: 60 },
        { title: 'Tên', key: 'TenHocSinh' },
      ],
    }
  },
  computed: {
    TitleCap() { return renderText(parseInt(vueData.CapID)) },
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
  },
  watch: {
    KhoiItem(v) { this.DS = []; if (v) this.getDS() },
  },
  mounted() { this.getKhoi() },
  methods: {
    async getKhoi() {
      this.DSKhoi = await fetchPromise('khoi/list', { CapID: vueData.CapID })
    },
    async getDS() {
      const res = await fetchPromise('module/ds', {
        KhoiID: this.KhoiItem.KhoiID,
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem.HocKi,
      })
      this.DS = res.data ?? []
    },
    async onSave() {
      const ok = await confirm({ title: 'Xác nhận lưu?' })
      if (!ok) return
      ajaxCALL('module/save', { ...this.form }, () => {
        this.snackbarRef.show({ message: 'Lưu thành công', color: 'success' })
        this.getDS()
      })
    },
  },
}
</script>
```

### API rules
| Purpose | Function |
|---------|----------|
| Read / fetch list | `fetchPromise(url, params, options?)` |
| Insert / update / delete | `ajaxCALL(url, params, cb)` — always preceded by `confirm()` |
| Parallel reads | `fetchBatchPromise([{ url, params }, ...])` |

`fetchPromise` returns `res.data` array by default (5-min cache). Use `{ cache: false }` after mutations.

### Vuetify rules
- `#header` slot root: plain `<v-card>` — **no** `rounded`, `elevation`, `border`, `class`
- Filter `v-select`: **no** `density`, `variant`, `flat`, `prepend-inner-icon`
- Prefer `<GlobalDataTable>` instead of raw `<v-data-table>` for module tables.
- When using `<GlobalDataTable>`, always pass `v-data-table-height` (for example: `v-data-table-height="calc(100dvh - 77px)"`).
- When table height must adapt to viewport/container changes, use the global directive `v-auto-table-height` (from `autoTableHeightDirective`) to auto-recalculate height.
- If a raw `v-data-table` is still used, it **must** have `style="max-height: calc(100dvh - 77px); overflow-y: auto;"` + `items-per-page="-1" hide-default-footer`.
- `headers` always in local `data()` — never `vueData.headers`
- Student cell → use `<uc-info-student :item="item" />` not inline avatar
- Dialogs → use `<uc-dialog>` not raw `<v-dialog>`

### vueData scope rules
- `raw.json`'s `data[]` entries are injected into `vueData` at runtime. Example: `{ "CapID": "parseInt(capid)" }` → `vueData.CapID`. When migrating to `uc-main-layout.vue`, read these via `vueData` directly — do **not** redeclare them as new local `data()` properties.
- Do not use `this.vueData` for local module state (`LopID`, `ThangObj`, `items`, `headers`, dialog flags, table selections, filters).
- Keep module state local in component `data()` and access via `this.*`.
- Only read academic-year context from `vueData.NienKhoa` and `vueData.NienKhoaItem`.
- Access the current logged-in user from the global directly: `vueData.user.UserID`. Do **not** copy `vueData.user` into a local state property.

### `script.js` usage rule
- **Move all logic into `uc-main-layout.vue` `methods`.** `script.js` should be empty or near-empty for modern modules.
- Only put code in `script.js` when: the logic is too long/complex to inline, it is shared across multiple components in the same module, or it requires special handling outside the Vue lifecycle.

### Template event handler rules
```vue
<!-- ❌ WRONG — backtick template string in handler -->
@click="open(`row-${item.ID}`)"

<!-- ✅ CORRECT — pre-compute in buildRows() / data transform -->
// In method: rows.push({ rowKey: `row-${item.ID}`, ...item })
@click="open(item.rowKey)"
```

### Cascade filter watch pattern
```js
watch: {
  KhoiItem(v) {
    this.LopItem = null; this.DSLop = []
    if (v) this.getLop()
  },
  LopItem(v) {
    this.DS = []
    if (v) this.getDS()
  },
},
```

### EnumTinhTrang (always define locally in `data()`)
```js
EnumTinhTrang: {
  ChuaLuu: 0, LuuTam: 1, GVBM_GuiDiem: 2, GVCN_TuChoi: 3,
  GVCN_GuiDiem: 4, TT_TuChoi: 5, TT_GuiBGH: 6, BGH_TuChoi: 7, BGH_Duyet: 8,
}
```

### TinhTrang chip
```vue
<v-chip size="x-small" :color="item.MauTinhTrang || 'default'" variant="tonal">
  {{ item.TenTinhTrang }}
</v-chip>
```

---

## PROJECT OVERVIEW

Vue 3 + Vuetify 3 Learning Management System (LMS) for Vietnamese schools.  
~150 feature modules covering: teacher grade entry, student dashboards, reporting, class management, parent reports, and exam integration.

No build step is managed from this repo — dependencies (Vue, Vuetify) are loaded externally at runtime.

---

## Directory Layout

```
components/      # 50+ shared Vue components (Global*, uc-*)
imports/         # Global utilities, services, CSS
modules/         # 150+ feature modules (each: raw.json + script.js + components/)
proj.json        # Registry of all components, modules, and imports
```

### Module naming conventions
| Prefix | Domain |
|--------|--------|
| `gv-` / `fui-gv-` | Giáo viên (teacher) |
| `bgh-` | Ban Giám Hiệu (principal board) |
| `admin-` | Admin functions |
| `ph-`  | Phụ huynh (parent) |
| `bao-cao-` / `bc-` / `dashboard-` | Reports & analytics |
| `lms-student-` | Student interface |
| `lms-teacher-` | Teacher LMS dashboards |

---

## Module Structure

Every module follows this structure:

```
module-name/
├── raw.json        # Declarative page config (data init + API calls + UI tree)
├── script.js       # Business logic (helper functions, data transforms)
└── components/     # Module-specific Vue components
    └── uc-main-layout.vue   # Main layout (preferred pattern)
```

**Preferred modern pattern:** all logic in `uc-main-layout.vue`, `raw.json` minimal (see CODING RULES above), `script.js` empty.

**`raw.json` minimal form:**
```json
{
  "data": [
    {"EXE": "IsCheck_NotRoleParent(vueData.user)"},
    {"CapID": "parseInt(capid)"}
  ],
  "watch": {},
  "controls": [{"prop":"fluid pa-0","rows":[{"prop":":no-gutters='true'","cols":[{"el":"uc-main-layout"}]}]}],
  "set": {}
}
```

---

## Legacy `raw.json` DSL (understand, do not author)

| Key | Purpose |
|-----|---------|
| `data[n].EXE` | Execute JS on init |
| `data[n].{PropName}` | Set vueData property: `"CapID": "parseInt(capid)"` |
| `data[n].{apiName}` | Define named API: `{ API, IN, OUT, CALLBACK }` |
| `data[n].CALL` | Invoke named API: `{"CALL": "getKhoi"}` |
| `watch.{prop}` | Reactive handler with `IF`/`THEN`/`CALL`/`EXE` |
| `controls[n].el` | Component name: `"v-card"`, `"uc-main-layout"`, `"f-table"` |
| `controls[n].attr` | Vue attrs/props: `{":items": "DSKhoi", "v-model": "KhoiItem"}` |
| `controls[n].innerHTML` | Nested children array |

---

## Global Utilities (always available at runtime)

### API
```javascript
fetchPromise(url, params, { cache, forceRefresh, suppressError, loadingText })
// Returns promise; caches 5 min by default — use for all reads

ajaxCALL(url, params, callback)
// Use for mutations (insert/update/delete)

fetchBatchPromise([{ url, params }, ...], { forceRefresh })
// Parallel fetch
```

### UI helpers
```javascript
confirm({ title, action })        // Confirmation dialog before mutation
renderText(capID)                 // e.g. "Cấp 1" from capID int
getTitlePageByURL(path)           // Page title from URL
IsCheck_NotRoleParent(user)       // Guard: redirects if parent role
fn_IsDisabledTinhTrangDiem(tt, type, capID)  // Returns { isDisabled }
fn_ProrityTinhTrang(arr)          // Returns { TinhTrang } — highest priority
openWindow({ title, url })        // Open iframe window
```

### Global state
```javascript
vueData                          // Global reactive object
vueData.CapID                    // School level (1=primary, 2=middle, 3=high)
vueData.NienKhoa                 // Academic year
vueData.NienKhoaItem.HocKi       // Semester (1 or 2)
vueData.v_Set.urlAvatarHocSinh   // Base URL for student avatars
```

---

## Shared Components

### `Global.vue`
Main app wrapper — always use at the root of `uc-main-layout.vue`.
Provides: `GlobalLoading`, `GlobalApiErrorDialog`, `GlobalUiSnackbar`, `GlobalIframeWindow`.  
Inject `snackbarRef` and `iframeRef` in child components.

When implementing module UI, prefer these existing `Global*` components for shared app-level behaviors instead of creating equivalent local wrappers in each module.

### Common `uc-*` components
| Component | Usage |
|-----------|-------|
| `uc-info-student` | Avatar + name + ID chip for table rows — prop `:item` |
| `uc-tinh-trang-hsl` | Status badges for a list of students — `v-model="DSHocSinh"` |
| `uc-dialog` | Modal wrapper — `v-model`, `title`, `doneText`, `@onSubmit` |
| `uc-page` | Legacy full-height page with `#filter` slot |
| `uc-loading-page` | Full-page loading state |

---

## Vietnamese Domain Terms

| Term | Meaning |
|------|---------|
| HocSinh / HS | Student |
| GiaoVien / GV | Teacher |
| GVBM | Subject teacher (Giáo viên Bộ môn) |
| GVCN | Homeroom teacher (Giáo viên Chủ nhiệm) |
| TT | Department head (Tổ trưởng) |
| BGH | Principal board (Ban Giám Hiệu) |
| Lop | Class |
| Khoi | Grade level |
| MonHoc | Subject |
| NienKhoa | Academic year |
| HocKi | Semester |
| BangDiem | Grade report/scorecard |
| CotDiem | Grade column |
| TinhTrang | Status |
| NhomCotDiem / MaNhomCotDiem | Grade column group / group code |
| CapID | School level (1=primary, 2=middle, 3=high) |
| SoDanhBo | Student roll number |
| NhanXet | Comment/evaluation |

### TinhTrang (status) enum
| Value | Meaning |
|-------|---------|
| 0 | Chưa lưu (not saved) |
| 1 | Lưu tạm (draft) |
| 2 | GVBM gửi điểm (subject teacher submitted) |
| 3 | GVCN từ chối (homeroom rejected) |
| 4 | GVCN gửi điểm (homeroom submitted) |
| 5 | Tổ trưởng từ chối (dept head rejected) |
| 6 | Tổ trưởng gửi BGH (dept head sent to principal) |
| 7 | BGH từ chối (principal rejected) |
| 8 | BGH duyệt (principal approved) |

---

## Key Anti-patterns to Avoid

- **Don't** author new modules with a complex `raw.json` controls tree — use `uc-main-layout.vue` with `Global` wrapper instead
- **Don't** add `density`, `variant="solo"`, `flat`, or icon props to filter `v-select` fields
- **Don't** forget `max-height` + `overflow-y: auto` on `v-data-table` — it will overflow the viewport
- **Don't** use `vueData.headers` (global) for table headers — keep them as local component `data`
- **Don't** re-export functions to `vueData` from inside Vue components — use Vue methods/computed instead
- **Don't** use `uc-page` + `f-table` DSL elements for new module layouts
