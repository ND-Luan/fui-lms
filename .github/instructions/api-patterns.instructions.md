---
applyTo: "modules/**/*.vue,modules/**/script.js,imports/**/*.js"
---

# API & Data Patterns – fui-lms

## Read vs. mutation — choose the right function

| Situation | Function |
|-----------|----------|
| Fetch data for display (GET-style) | `fetchPromise(url, params, options?)` |
| Insert / update / delete | `ajaxCALL(url, params, callback)` |
| Multiple parallel reads at once | `fetchBatchPromise([{ url, params }, ...], options?)` |

**Never** use `ajaxCALL` inside Vue components for read operations — use `fetchPromise`.

## `fetchPromise` — all reads

```js
async getData() {
  const res = await fetchPromise('module/endpoint', {
    NienKhoa: vueData.NienKhoa,
    HocKi: vueData.NienKhoaItem.HocKi,
    LopID: this.LopItem.LopID,
  })
  this.DS = res.data ?? []
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

## `ajaxCALL` — mutations only

Always wrap mutations in `confirm()` first:

```js
async onSave() {
  const ok = await confirm({ title: 'Xác nhận lưu dữ liệu?' })
  if (!ok) return

  ajaxCALL('module/save', { ...this.formData }, (res) => {
    if (res.status === 'success') {
      this.snackbarRef.show({ message: 'Lưu thành công', color: 'success' })
      this.getData()
    }
  })
}
```

## `fetchBatchPromise` — parallel reads

Use when multiple independent APIs must be loaded together (e.g. on `mounted`):

```js
async mounted() {
  const [resKhoi, resMonHoc] = await fetchBatchPromise([
    { url: 'khoi/list', params: { CapID: vueData.CapID } },
    { url: 'monhoc/list', params: { NienKhoa: vueData.NienKhoa } },
  ])
  this.DSKhoi = resKhoi.data ?? []
  this.DSMonHoc = resMonHoc.data ?? []
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

Always use `snackbarRef` (injected) to show operation results — **never** use `alert()`:

```js
this.snackbarRef.show({ message: 'Cập nhật thành công', color: 'success' })
this.snackbarRef.show({ message: 'Có lỗi xảy ra', color: 'error' })
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
