---
applyTo: "modules/**/*.vue,modules/**/script.js,imports/**/*.js"
---

# API & Data Patterns – fui-lms

## Read vs. mutation — choose the right function

| Situation | Function |
|-----------|----------|
| Fetch data for display (GET-style) | `fetchPromise(url, params, options?)` |
| Insert / update / delete | `fetchPromise(url, params, { cache: false })` |
| Multiple parallel reads at once | `fetchBatchPromise([{ url, params }, ...], options?)` |

**Always** use `fetchPromise` — for both reads and mutations. Use `{ cache: false }` on mutation calls to skip the cache.

## `fetchPromise` — reads and mutations

> **`fetchPromise` returns the data array/object directly** — it is already unwrapped.  
> Do **not** use `.data` on the result. Access the value directly:
> ```js
> const res = await fetchPromise('module/endpoint', params)
> this.DS = res ?? []          // ✅ correct
> this.DS = res.data ?? []     // ❌ wrong — res.data is undefined
> ```

```js
// Read
async getData() {
  const res = await fetchPromise('module/endpoint', {
    NienKhoa: vueData.NienKhoa,
    HocKi: vueData.NienKhoaItem.HocKi,
    LopID: this.LopItem.LopID,
  })
  this.DS = res ?? []
}

// Mutation — always preceded by confirmRef dialog, always { cache: false }
async onSave() {
  const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu?' })
  if (!ok) return
  const res = await fetchPromise('module/save', { ...this.formData }, { cache: false })
  if (res?.status === 'success' || res) {
    this.snackbarRef.value.showSnackbar({ message: 'Lưu thành công', color: 'success' })
    this.getData()
  }
}
```

Options (all optional):
```js
fetchPromise(url, params, {
  cache: true,           // default: true — 5-min in-memory cache
  forceRefresh: true,    // bypass cache
  suppressError: false,  // suppress global error dialog
  loadingText: 'Đang tải...', // loading overlay label
})
```

## Snackbar — always `showSnackbar()`

The injected `snackbarRef` exposes `showSnackbar()`, **not** `show()`:

```js
this.snackbarRef.value.showSnackbar({ message: 'Cập nhật thành công', color: 'success' })
this.snackbarRef.value.showSnackbar({ message: 'Có lỗi xảy ra', color: 'error' })
```

❌ Never call `.show()` — that method does not exist on `GlobalUiSnackbar`.

## `confirm` callback pattern in Vue methods

When using `confirm({ action })` and you need to access Vue instance properties inside the callback, always create an intermediate variable first:

```js
async onDoAction() {
  const $this = this
  confirm({
    title: 'Xác nhận thực hiện?',
    action: async () => {
      // Always use $this inside confirm callback.
      await $this.doWork()
      $this.snackbarRef.value.show({ message: 'Thành công', color: 'success' })
    },
  })
}
```

Do not rely on direct `this` access inside `confirm` callbacks. — parallel reads

Use when multiple independent APIs must be loaded together (e.g. on `mounted`):

```js
async mounted() {
  const [resKhoi, resMonHoc] = await fetchBatchPromise([
    { url: 'khoi/list', params: { CapID: vueData.CapID } },
    { url: 'monhoc/list', params: { NienKhoa: vueData.NienKhoa } },
  ])
  this.DSKhoi = resKhoi ?? []
  this.DSMonHoc = resMonHoc ?? []
}
```

## Standard filter loading chain

Load dependent lookups lazily — only call child API when parent value is set:

```js
methods: {
  async getKhoi() {
    const res = await fetchPromise('khoi/list', { CapID: vueData.CapID })
    this.DSKhoi = res.data ?? []
  },
  async getLop() {
    const res = await fetchPromise('lop/list', {
      KhoiID: this.KhoiItem.KhoiID,
      NienKhoa: vueData.NienKhoa,
    })
    this.DSLop = res.data ?? []
  },
  async getDS() {
    if (!this.LopItem) return
    const res = await fetchPromise('module/ds', {
      LopID: this.LopItem.LopID,
      HocKi: vueData.NienKhoaItem.HocKi,
      NienKhoa: vueData.NienKhoa,
    })
    this.DS = res.data ?? []
  },
},
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
mounted() { this.getKhoi() },
```

## Snackbar feedback

`snackbarRef` is injected as `{ value: null }` and populated by the `Global` component at runtime.
Always call `.showSnackbar()` via `.value` — **never** use `alert()` or `.show()`:

```js
this.snackbarRef.value.showSnackbar({ message: 'Cập nhật thành công', color: 'success' })
this.snackbarRef.value.showSnackbar({ message: 'Có lỗi xảy ra', color: 'error' })
```

## Common API param names

| Param | Source |
|-------|--------|
| `NienKhoa` | `vueData.NienKhoa` |
| `HocKi` | `vueData.NienKhoaItem.HocKi` |
| `CapID` | `parseInt(vueData.CapID)` |
| `KhoiID` | `this.KhoiItem.KhoiID` |
| `LopID` | `this.LopItem.LopID` |
| `MonHocID` | `this.MonHocItem.MonHocID` |
| `MaNhomCotDiem` | `this.MaNhomCotDiemItem.MaNhomCotDiem` |
| `HocSinhID` | `this.HocSinhItem.HocSinhID` |
