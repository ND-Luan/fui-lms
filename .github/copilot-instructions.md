# fui-lms – Copilot Instructions

## Project Overview

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

### Preferred modern pattern (post-refactor)

Move **all logic into a self-contained `uc-main-layout.vue`** component. Keep `raw.json` minimal and `script.js` empty.

**`raw.json` (minimal):**
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

**`uc-main-layout.vue` template structure** (mirrors `fui-gv-ds-hoc-sinh-lop`):
```vue
<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <!-- v-row with v-select filters + action buttons -->
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <v-data-table v-model="selected" :headers :items="DS"
      item-value="ID" :show-select="true"
      items-per-page="-1" hide-default-footer hover
      style="max-height: calc(100dvh - 77px); overflow-y: auto;">
      <!-- custom slots -->
    </v-data-table>
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef'],
  data() { return { vueData, /* local state */ } },
  computed: {
    TitleCap() { return renderText(parseInt(vueData.CapID)) },
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
  },
  watch: { /* cascade resets on filter changes */ },
  mounted() { this.getKhoi() },
  methods: { /* fetchPromise-based API calls + renderDS*() transforms */ },
}
</script>
```

**Rules for the new pattern:**
- Use `fetchPromise(url, params, options?)` for all API calls, **not** `ajaxCALL` inside components
- Use `ajaxCALL(url, params, cb)` only for write/mutation operations (update, insert)
- Always `inject: ['snackbarRef', 'iframeRef']`
- `v-data-table` must have `max-height: calc(100dvh - 77px); overflow-y: auto;` to prevent viewport overflow
- `items-per-page="-1" hide-default-footer` — no pagination UI
- Filter `v-select` components: plain (no `density`, `variant="solo"`, `flat`, `prepend-inner-icon`)

### `#header` slot design rules (standard pattern)

Always use this exact structure inside `<template #header>` — no custom `rounded`, `elevation`, `border` props on the card:

```vue
<template #header>
  <v-card>
    <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
    <v-card-text>
      <v-row align="center">
        <v-col cols="12" sm="3">
          <v-select v-model="FilterItem" label="Chọn ..." :items="DS" ... />
        </v-col>
        <!-- more filter cols -->
        <v-col class="d-flex align-center ga-2 flex-wrap">
          <!-- action buttons: v-btn with variant="outlined" or variant="tonal" -->
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
```

**Header rules:**
- Outer element is always `<v-card>` — **no** `rounded`, `elevation`, `border`, `class` props
- Title in `<v-card-title>`: use `TitlePage` (+ `• TitleCap` if school-level aware)
- Filters in `<v-card-text>` wrapped in `<v-row align="center">` with `<v-col>` per filter
- Action buttons go in the last `<v-col class="d-flex align-center ga-2 flex-wrap">`
- **Don't** use custom `d-flex` / overline / `v-divider` inside the header card — use `v-card-title` + `v-card-text` with `v-row`/`v-col` instead
- **Don't** add `density`, `variant="outlined"` to filter `v-select` in header

---

## Legacy `raw.json` DSL (legacy modules)

Older modules drive the whole UI from `raw.json`. Understand but don't author new modules this way.

| Key | Purpose |
|-----|---------|
| `data[n].EXE` | Execute JS on init: `"IsCheck_NotRoleParent(vueData.user)"` |
| `data[n].{PropName}` | Set vueData property: `"CapID": "parseInt(capid)"` |
| `data[n].{apiName}` | Define named API: `{ API, IN, OUT, CALLBACK }` |
| `data[n].CALL` | Invoke named API: `{"CALL": "getKhoi"}` |
| `watch.{prop}` | Reactive handler with optional `IF`/`THEN`/`CALL`/`EXE` |
| `controls[n].el` | Component name: `"v-card"`, `"uc-main-layout"`, `"f-table"` |
| `controls[n].attr` | Vue attrs/props: `{":items": "DSKhoi", "v-model": "KhoiItem"}` |
| `controls[n].innerHTML` | Nested children array |

---

## Global Utilities (always available at runtime)

### API
```javascript
fetchPromise(url, params, { cache, forceRefresh, suppressError, loadingText })
// Returns promise; caches 5 min by default
// Use for all reads

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
vueData             // Global reactive object — shared between raw.json DSL and Vue components
vueData.CapID       // School level (1=primary, 2=middle, 3=high)
vueData.NienKhoa    // Academic year
vueData.NienKhoaItem.HocKi  // Semester (1 or 2)
vueData.v_Set.urlAvatarHocSinh  // Base URL for student avatars
```

---

## Shared Components

### `Global.vue`
Main app wrapper. Always use at the root of `uc-main-layout.vue`.
```vue
<Global>
  <template #header><!-- sticky header content --></template>
  <!-- page body -->
</Global>
```
Provides: `GlobalLoading`, `GlobalApiErrorDialog`, `GlobalUiSnackbar`, `GlobalIframeWindow`.  
Inject `snackbarRef` and `iframeRef` in child components.

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
