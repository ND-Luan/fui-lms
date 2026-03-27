---
mode: agent
description: Tạo component con (dialog, filter panel, table row...) cho một module fui-lms. Dùng khi cần thêm uc-dialog-*, uc-filter, uc-item-* vào module đang làm.
---

# Tạo component con – fui-lms

## Cung cấp thông tin sau

1. **Loại component** (dialog xem/sửa, dialog xác nhận, filter panel, table row, v.v.)
2. **Tên file** (ví dụ: `uc-dialog-edit-diem`, `uc-item-hoc-sinh`)
3. **Module chứa** (ví dụ: `gv-bm-gui-diem`)
4. **Props cần nhận** (ví dụ: `modelValue`, `item`, `LopID`)
5. **Emits** (ví dụ: `@onSubmitFinish`, `@update:modelValue`)
6. **API cần gọi** (nếu có)

---

## Template theo loại

### Dialog xem / sửa

```vue
<template>
  <uc-dialog v-model="isShow" :title="title" doneText="Lưu" @onSubmit="handleSubmit">
    <!-- form fields -->
  </uc-dialog>
</template>

<script>
export default {
  inject: ['snackbarRef'],
  props: {
    modelValue: { type: Boolean, required: true },
    item: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue', 'onSubmitFinish'],
  computed: {
    isShow: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },
  },
  methods: {
    async handleSubmit() {
      const ok = await confirm({ title: 'Xác nhận lưu?' })
      if (!ok) return
      ajaxCALL('module/save', { ...this.item }, (res) => {
        this.snackbarRef.show({ message: 'Lưu thành công', color: 'success' })
        this.$emit('onSubmitFinish')
        this.isShow = false
      })
    },
  },
}
</script>
```

### Dialog xác nhận hành động (approve/reject)

```vue
<template>
  <uc-dialog v-model="isShow" title="Xác nhận" doneText="Đồng ý" @onSubmit="handleConfirm">
    <p>Bạn có chắc muốn thực hiện thao tác này?</p>
    <v-textarea v-if="needsReason" v-model="lyDo" label="Lý do" rows="3" />
  </uc-dialog>
</template>

<script>
export default {
  inject: ['snackbarRef'],
  props: {
    modelValue: { type: Boolean, required: true },
    items: { type: Array, default: () => [] },
    needsReason: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'onDone'],
  data() { return { lyDo: '' } },
  computed: {
    isShow: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },
  },
  methods: {
    handleConfirm() {
      ajaxCALL('module/action', {
        IDs: this.items.map(i => i.ID),
        LyDo: this.lyDo,
      }, () => {
        this.snackbarRef.show({ message: 'Thành công', color: 'success' })
        this.$emit('onDone')
        this.isShow = false
      })
    },
  },
}
</script>
```

### Table row component (`uc-item-*`)

```vue
<template>
  <div class="d-flex align-center ga-3 py-2">
    <v-avatar :size="52" class="elevation-2 flex-shrink-0">
      <v-img :src="vueData.v_Set.urlAvatarHocSinh + item.HocSinhID" />
    </v-avatar>
    <div class="d-flex flex-column ga-1">
      <span class="font-weight-bold text-body-2">{{ item.HoTen }}</span>
      <div class="d-flex align-center ga-2 flex-wrap">
        <v-chip size="x-small" variant="tonal" color="primary" label>{{ item.HocSinhID }}</v-chip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { item: { type: Object, required: true } },
  data() { return { vueData } },
}
</script>
```

## Quy tắc bắt buộc

- Luôn `inject: ['snackbarRef']` nếu component gọi API write
- Dùng `uc-dialog` thay vì raw `v-dialog`
- `isShow` computed getter/setter để bind `v-model` đúng cách
- `ajaxCALL` mutations phải có `confirm()` hoặc ít nhất confirm trong dialog
- Không tự quản lý loading — dùng overlay toàn cục của `Global`
- Emit `onSubmitFinish` / `onDone` để parent biết reload data
