---
mode: agent
description: Tạo module mới theo chuẩn fui-lms (raw.json tối giản + uc-main-layout.vue). Dùng khi cần scaffold một module hoàn chỉnh với filter, bảng dữ liệu và API calls.
---

# Tạo module mới – fui-lms

## Hướng dẫn sử dụng

Cung cấp thông tin sau (hoặc Copilot sẽ hỏi lại):

1. **Tên module** (ví dụ: `gv-xem-diem-hoc-ki`)
2. **Domain / tiền tố** (gv-, bgh-, admin-, ph-, lms-student-, lms-teacher-, bc-...)
3. **Tiêu đề trang** (ví dụ: `Xem điểm học kỳ`)
4. **Các bộ lọc (filter)** cần có (ví dụ: Khối → Lớp → Môn học)
5. **API endpoint chính** (ví dụ: `grade/list`)
6. **Các cột bảng** cần hiển thị
7. **Có cần chọn nhiều hàng** (`show-select`) không?
8. **Có cần nút hành động** (gửi, lưu, xuất Excel...) không?

---

## Yêu cầu với Copilot

Khi nhận được thông tin ở trên, hãy tạo **đầy đủ** các file sau:

### 1. `modules/{module-name}/raw.json`

Luôn dùng form tối giản:
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
      "rows": [{"prop": ":no-gutters='true'", "cols": [{"el": "uc-main-layout"}]}]
    }
  ],
  "set": {}
}
```

### 2. `modules/{module-name}/script.js`

```js
// logic lives in components/uc-main-layout.vue
```

### 3. `modules/{module-name}/components/uc-main-layout.vue`

Dựa trên template chuẩn:

```vue
<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <!-- một <v-col cols="12" sm="3"> cho mỗi filter v-select -->
            <v-col class="d-flex align-center ga-2 flex-wrap">
              <!-- nút hành động nếu cần -->
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
      DSKhoi: [], DSLop: [],
      KhoiItem: null, LopItem: null,
      DS: [], DSSelected: [],
      headers: [
        { title: 'STT', key: 'STT', width: 60 },
        // ... thêm cột theo yêu cầu
      ],
    }
  },
  computed: {
    TitleCap() { return renderText(parseInt(vueData.CapID)) },
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
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
      const res = await fetchPromise('{API_ENDPOINT}', {
        LopID: this.LopItem.LopID,
        HocKi: vueData.NienKhoaItem.HocKi,
        NienKhoa: vueData.NienKhoa,
        CapID: parseInt(vueData.CapID),
      })
      this.DS = res.data ?? []
    },
  },
}
</script>
```

### Quy tắc bắt buộc khi sinh code

- `inject: ['snackbarRef', 'iframeRef']` — bắt buộc
- `v-data-table` phải có `style="max-height: calc(100dvh - 77px); overflow-y: auto;"`
- `items-per-page="-1" hide-default-footer` — không phân trang
- filter `v-select` không có `density`, `variant`, `flat`
- Không dùng template string `` `text-${id}` `` trong event handlers ở template
- Hàm đọc dùng `fetchPromise`, hàm ghi dùng `ajaxCALL` + `confirm()` trước khi gọi
- Sau mỗi mutation thành công gọi `this.snackbarRef.show({ message: '...', color: 'success' })`
- Không dùng `vueData.headers` — khai báo `headers` trong `data()`
