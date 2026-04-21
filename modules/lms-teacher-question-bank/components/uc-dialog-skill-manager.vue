<template>
  <v-dialog v-model="isShow" width="780" :close-on-back="false">
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon start color="primary">mdi-brain</v-icon>
        Quản lý kỹ năng — {{ monHocName }}
        <v-spacer />
        <v-icon @click="isShow = false" color="grey">mdi-close</v-icon>
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-0" style="height: 520px; overflow: hidden;">
        <v-row no-gutters style="height: 100%;">

          <!-- Panel trái: Nhóm kỹ năng -->
          <v-col cols="5" style="height: 100%; border-right: 1px solid rgba(0,0,0,0.12); display: flex; flex-direction: column;">
            <div class="d-flex align-center pa-3 ga-2">
              <span class="text-subtitle-2 font-weight-bold">Nhóm kỹ năng</span>
              <v-chip size="x-small" color="primary" variant="tonal">{{ DSNhom.length }}</v-chip>
              <v-spacer />
              <v-btn icon size="x-small" variant="tonal" color="success" @click="openAddNhom">
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Thêm nhóm</v-tooltip>
              </v-btn>
            </div>
            <v-divider />
            <div style="flex: 1; overflow-y: auto;">
              <!-- Inline add/edit nhóm -->
              <div v-if="formNhom.mode" class="pa-3 pb-0">
                <v-text-field
                  v-model="formNhom.NhomKyNang"
                  :label="formNhom.mode === 'add' ? 'Tên nhóm mới' : 'Sửa tên nhóm'"
                  density="compact"
                  autofocus
                  hide-details
                  @keyup.enter="saveNhom"
                  @keyup.esc="cancelNhom"
                >
                  <template #append>
                    <v-btn icon size="x-small" color="success" variant="tonal" @click="saveNhom" :loading="savingNhom">
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" color="grey" variant="text" @click="cancelNhom">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </div>

              <v-list density="compact" nav class="pa-2">
                <v-list-item
                  v-for="nhom in DSNhom"
                  :key="nhom.KyNang_MonHocID"
                  :active="selectedNhom && selectedNhom.KyNang_MonHocID === nhom.KyNang_MonHocID"
                  color="primary"
                  rounded="lg"
                  class="mb-1"
                  @click="selectNhom(nhom)"
                >
                  <v-list-item-title class="text-body-2">{{ nhom.NhomKyNang }}</v-list-item-title>
                  <template #append>
                    <div class="d-flex align-center ga-1">
                      <v-btn icon size="x-small" variant="text" color="primary" @click.stop="openEditNhom(nhom)">
                        <v-icon size="small">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon size="x-small" variant="text" color="error" @click.stop="deleteNhom(nhom)">
                        <v-icon size="small">mdi-delete-outline</v-icon>
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
                <div v-if="!DSNhom.length && !loadingNhom" class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
                  <v-icon size="36" class="mb-2 opacity-40">mdi-folder-outline</v-icon>
                  <p class="text-caption">Chưa có nhóm nào</p>
                </div>
                <div v-if="loadingNhom" class="d-flex justify-center py-6">
                  <v-progress-circular size="24" indeterminate />
                </div>
              </v-list>
            </div>
          </v-col>

          <!-- Panel phải: Chi tiết kỹ năng -->
          <v-col cols="7" style="height: 100%; display: flex; flex-direction: column;">
            <div class="d-flex align-center pa-3 ga-2">
              <span class="text-subtitle-2 font-weight-bold">
                {{ selectedNhom ? selectedNhom.NhomKyNang : 'Kỹ năng' }}
              </span>
              <v-chip v-if="selectedNhom" size="x-small" color="primary" variant="tonal">{{ DSChiTiet.length }}</v-chip>
              <v-spacer />
              <v-btn v-if="selectedNhom" icon size="x-small" variant="tonal" color="success" @click="openAddChiTiet">
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Thêm kỹ năng</v-tooltip>
              </v-btn>
            </div>
            <v-divider />
            <div style="flex: 1; overflow-y: auto;">

              <div v-if="!selectedNhom" class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                <v-icon size="40" class="mb-2 opacity-30">mdi-cursor-default-click-outline</v-icon>
                <p class="text-caption">Chọn nhóm để xem kỹ năng</p>
              </div>

              <template v-else>
                <!-- Inline add/edit chi tiết -->
                <div v-if="formChiTiet.mode" class="pa-3 pb-0">
                  <v-text-field
                    v-model="formChiTiet.TenKyNang"
                    :label="formChiTiet.mode === 'add' ? 'Tên kỹ năng mới' : 'Sửa tên kỹ năng'"
                    density="compact"
                    autofocus
                    hide-details
                    class="mb-2"
                    @keyup.enter="saveChiTiet"
                    @keyup.esc="cancelChiTiet"
                  />
                  <v-text-field
                    v-model="formChiTiet.MoTaKyNang"
                    label="Mô tả"
                    density="compact"
                    hide-details
                    @keyup.esc="cancelChiTiet"
                  >
                    <template #append>
                      <v-btn icon size="x-small" color="success" variant="tonal" @click="saveChiTiet" :loading="savingChiTiet">
                        <v-icon>mdi-check</v-icon>
                      </v-btn>
                      <v-btn icon size="x-small" color="grey" variant="text" @click="cancelChiTiet">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </div>

                <v-list density="compact" nav class="pa-2">
                  <v-list-item
                    v-for="ct in DSChiTiet"
                    :key="ct.KyNang_MonHoc_ChiTietID"
                    rounded="lg"
                    class="mb-1"
                  >
                    <v-list-item-title class="text-body-2">{{ ct.TenKyNang }}</v-list-item-title>
                    <v-list-item-subtitle v-if="ct.MoTaKyNang" class="text-caption">{{ ct.MoTaKyNang }}</v-list-item-subtitle>
                    <template #append>
                      <div class="d-flex align-center ga-1">
                        <v-btn icon size="x-small" variant="text" color="primary" @click="openEditChiTiet(ct)">
                          <v-icon size="small">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="x-small" variant="text" color="error" @click="deleteChiTiet(ct)">
                          <v-icon size="small">mdi-delete-outline</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-list-item>
                  <div v-if="!DSChiTiet.length && !loadingChiTiet" class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
                    <v-icon size="36" class="mb-2 opacity-40">mdi-lightbulb-outline</v-icon>
                    <p class="text-caption">Chưa có kỹ năng nào</p>
                  </div>
                  <div v-if="loadingChiTiet" class="d-flex justify-center py-6">
                    <v-progress-circular size="24" indeterminate />
                  </div>
                </v-list>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  inject: ['snackbarRef', 'confirmRef'],
  props: {
    modelValue: Boolean,
    monHocId: { type: Number, default: null },
    monHocName: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      DSNhom: [],
      selectedNhom: null,
      loadingNhom: false,
      formNhom: { mode: null, KyNang_MonHocID: null, NhomKyNang: '' },
      savingNhom: false,

      DSChiTiet: [],
      loadingChiTiet: false,
      formChiTiet: { mode: null, KyNang_MonHoc_ChiTietID: null, TenKyNang: '', MoTaKyNang: '' },
      savingChiTiet: false,
    }
  },
  computed: {
    isShow: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },
  },
  watch: {
    modelValue(v) {
      if (v) {
        this.selectedNhom = null
        this.DSChiTiet = []
        this.formNhom = { mode: null, KyNang_MonHocID: null, NhomKyNang: '' }
        this.formChiTiet = { mode: null, KyNang_MonHoc_ChiTietID: null, TenKyNang: '', MoTaKyNang: '' }
        this.loadNhom()
      }
    },
  },
  methods: {
    // ── NHÓM ──────────────────────────────────────────
    async loadNhom() {
      if (!this.monHocId) return
      this.loadingNhom = true
      const res = await fetchPromise('lms/EL_KyNang_MonHoc_Get', { MonHocID: this.monHocId }, { forceRefresh: true })
      this.DSNhom = Array.isArray(res?.[0]) ? res[0] : (res ?? [])
      this.loadingNhom = false
    },
    selectNhom(nhom) {
      this.selectedNhom = nhom
      this.cancelChiTiet()
      this.loadChiTiet()
    },
    openAddNhom() {
      this.formNhom = { mode: 'add', KyNang_MonHocID: null, NhomKyNang: '' }
    },
    openEditNhom(nhom) {
      this.formNhom = { mode: 'edit', KyNang_MonHocID: nhom.KyNang_MonHocID, NhomKyNang: nhom.NhomKyNang }
    },
    cancelNhom() {
      this.formNhom = { mode: null, KyNang_MonHocID: null, NhomKyNang: '' }
    },
    async saveNhom() {
      if (!this.formNhom.NhomKyNang.trim()) return
      this.savingNhom = true
      if (this.formNhom.mode === 'add') {
        await fetchPromise('lms/EL_KyNang_MonHoc_Ins', {
          MonHocID: this.monHocId,
          NhomKyNang: this.formNhom.NhomKyNang.trim(),
          SYS_USERID: vueData.user.UserID,
        }, { cache: false })
      } else {
        await fetchPromise('lms/EL_KyNang_MonHoc_Upd', {
          KyNang_MonHocID: this.formNhom.KyNang_MonHocID,
          MonHocID: this.monHocId,
          NhomKyNang: this.formNhom.NhomKyNang.trim(),
          SYS_USERID: vueData.user.UserID,
        }, { cache: false })
      }
      this.savingNhom = false
      this.cancelNhom()
      await this.loadNhom()
    },
    async deleteNhom(nhom) {
      const ok = await this.confirmRef.value.show({ title: `Xóa nhóm "${nhom.NhomKyNang}"?` })
      if (!ok) return
      await fetchPromise('lms/EL_KyNang_MonHoc_Del', {
        KyNang_MonHocID: nhom.KyNang_MonHocID,
        SYS_USERID: vueData.user.UserID,
      }, { cache: false })
      if (this.selectedNhom?.KyNang_MonHocID === nhom.KyNang_MonHocID) {
        this.selectedNhom = null
        this.DSChiTiet = []
      }
      this.snackbarRef.value.showSnackbar({ message: 'Đã xóa nhóm', color: 'success' })
      await this.loadNhom()
    },

    // ── CHI TIẾT ──────────────────────────────────────
    async loadChiTiet() {
      if (!this.selectedNhom) return
      this.loadingChiTiet = true
      const res = await fetchPromise('lms/EL_KyNang_MonHoc_ChiTiet_Get', {
        KyNang_MonHocID: this.selectedNhom.KyNang_MonHocID,
      }, { forceRefresh: true })
      this.DSChiTiet = Array.isArray(res?.[0]) ? res[0] : (res ?? [])
      this.loadingChiTiet = false
    },
    openAddChiTiet() {
      this.formChiTiet = { mode: 'add', KyNang_MonHoc_ChiTietID: null, TenKyNang: '', MoTaKyNang: '' }
    },
    openEditChiTiet(ct) {
      this.formChiTiet = { mode: 'edit', KyNang_MonHoc_ChiTietID: ct.KyNang_MonHoc_ChiTietID, TenKyNang: ct.TenKyNang, MoTaKyNang: ct.MoTaKyNang || '' }
    },
    cancelChiTiet() {
      this.formChiTiet = { mode: null, KyNang_MonHoc_ChiTietID: null, TenKyNang: '', MoTaKyNang: '' }
    },
    async saveChiTiet() {
      if (!this.formChiTiet.TenKyNang.trim()) return
      this.savingChiTiet = true
      if (this.formChiTiet.mode === 'add') {
        await fetchPromise('lms/EL_KyNang_MonHoc_ChiTiet_Ins', {
          KyNang_MonHocID: this.selectedNhom.KyNang_MonHocID,
          TenKyNang: this.formChiTiet.TenKyNang.trim(),
          MoTaKyNang: this.formChiTiet.MoTaKyNang.trim(),
          SYS_USERID: vueData.user.UserID,
        }, { cache: false })
      } else {
        await fetchPromise('lms/EL_KyNang_MonHoc_ChiTiet_Upd', {
          KyNang_MonHoc_ChiTietID: this.formChiTiet.KyNang_MonHoc_ChiTietID,
          TenKyNang: this.formChiTiet.TenKyNang.trim(),
          MoTaKyNang: this.formChiTiet.MoTaKyNang.trim(),
          SYS_USERID: vueData.user.UserID,
        }, { cache: false })
      }
      this.savingChiTiet = false
      this.cancelChiTiet()
      await this.loadChiTiet()
    },
    async deleteChiTiet(ct) {
      const ok = await this.confirmRef.value.show({ title: `Xóa kỹ năng "${ct.TenKyNang}"?` })
      if (!ok) return
      await fetchPromise('lms/EL_KyNang_MonHoc_ChiTiet_Del', {
        KyNang_MonHoc_ChiTietID: ct.KyNang_MonHoc_ChiTietID,
        SYS_USERID: vueData.user.UserID,
      }, { cache: false })
      this.snackbarRef.value.showSnackbar({ message: 'Đã xóa kỹ năng', color: 'success' })
      await this.loadChiTiet()
    },
  },
}
</script>
