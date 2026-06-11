<template>
	<Global>
    <!-- Header with page title and filters -->
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="4" md="2">
              <v-select v-model="CapID" label="Chọn cấp học" :items="DSCap" item-title="TenCap" item-value="MaCap"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-select v-model="HocKi" label="Chọn học kỳ" :items="DSHocKi" item-title="TenHocKi" item-value="HocKi"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="2" v-if="viewMode === 'list'">
              <v-select v-model="LopID" label="Chọn lớp học" :items="DSLop" item-title="TenLop" item-value="LopID"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="2" v-if="viewMode === 'matrix'">
              <v-select v-model="filterMonHocIds" label="Lọc môn học" :items="DSMonHoc" item-title="MonHocName"
                item-value="MonHocID" multiple clearable hide-details />
            </v-col>
            <v-col cols="12" sm="6" md="4" v-if="viewMode === 'list'">
              <v-text-field v-model="Search" label="Tìm kiếm giảng viên..." prepend-inner-icon="mdi-magnify"
                hide-details clearable />
            </v-col>
            <v-col class="d-flex align-center ga-2 flex-wrap">
              <v-btn-toggle v-model="viewMode" mandatory color="primary" density="compact" variant="outlined">
                <v-btn value="list" prepend-icon="mdi-format-list-bulleted" class="text-caption">Danh sách</v-btn>
                <v-btn value="matrix" prepend-icon="mdi-grid" class="text-caption">Ma trận phân công</v-btn>
              </v-btn-toggle>
              <v-btn v-if="viewMode === 'list'" color="primary" @click="openAddDialog" class="text-none">
                <v-icon start>mdi-plus</v-icon>
                Thêm phân công
              </v-btn>
              <v-btn v-if="viewMode === 'matrix'" color="success" :loading="savingMatrix" @click="saveMatrix" class="text-none">
                <v-icon start>mdi-content-save-all</v-icon>
                Lưu ma trận
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <!-- VIEW MODE: LIST -->
    <template v-if="viewMode === 'list'">
      <GlobalDataTable :headers="headers" :items="filterDS" item-value="GVLopID" items-per-page="-1"
        hide-default-footer>
        <template #item.STT="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.VaiTro="{ item }">
          <v-chip size="x-small" :color="getVaiTroColor(item.VaiTro)" variant="tonal">
            {{ getVaiTroText(item.VaiTro) }}
          </v-chip>
        </template>

        <template #item.MaDonVi="{ item }">
          <v-chip size="x-small" :color="getDonViColor(item.MaDonVi)" variant="tonal">
            {{ getDonViText(item.MaDonVi) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center ga-1">
            <v-btn icon size="small" variant="text" color="primary" @click="openEditDialog(item)">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
            </v-btn>
            <v-btn icon size="small" variant="text" color="error" @click="deleteItem(item)">
              <v-icon>mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
            <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
            <p class="text-body-2">Không có phân công giáo viên hoặc vui lòng chọn lớp để xem</p>
          </div>
        </template>
      </GlobalDataTable>
    </template>

    <!-- VIEW MODE: MATRIX (SPREADSHEET GRID) -->
    <template v-else>
      <div v-if="loadingMatrix" class="d-flex flex-column align-center justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <p class="text-body-2 text-medium-emphasis">Đang tải ma trận phân công khối học...</p>
      </div>

      <div v-else-if="matrixRows.length === 0"
        class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
        <v-icon size="48" class="mb-3 opacity-40">mdi-alert-circle-outline</v-icon>
        <p class="text-body-2">Không tìm thấy lớp học nào trong khối hiện tại để hiển thị ma trận.</p>
      </div>

      <div v-else class="pa-4 bg-matrix-container">
        <!-- Dynamic matrix table -->
        <v-card class="elevation-1 border overflow-hidden">
          <v-table class="matrix-table text-caption" fixed-header
            style="max-height: calc(100dvh - 300px); overflow-y: auto;">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="font-weight-bold text-center" style="width: 50px;">STT</th>
                <th class="font-weight-bold text-left sticky-col" style="width: 140px; min-width: 120px;">Lớp học</th>
                <th class="font-weight-bold text-left" style="width: 260px; min-width: 220px;">Giáo viên chủ nhiệm / GV
                  Lớp</th>
                <th v-for="sub in DSMonHoc" :key="sub.MonHocID" v-show="isMonHocVisible(sub.MonHocID)"
                  class="font-weight-bold text-left" style="width: 260px; min-width: 220px;">
                  {{ sub.MonHocName }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in matrixRows" :key="row.LopID" class="matrix-row">
                <td class="text-center text-medium-emphasis">{{ rIdx + 1 }}</td>
                <td class="font-weight-bold text-primary sticky-col">{{ row.TenLop }}</td>
                <!-- GVCN Cell -->
                <td>
                  <v-autocomplete v-model="row.GVCN" :items="DSGiaoVien" :item-title="renderTextGiangVien"
                    item-value="GiaoVienID" placeholder="Chọn GVCN..." clearable hide-details density="compact"
                    variant="underlined" class="matrix-select" />
                </td>
                <!-- Subject Cells -->
                <td v-for="sub in DSMonHoc" :key="sub.MonHocID" v-show="isMonHocVisible(sub.MonHocID)">
                  <v-autocomplete v-model="row.Subjects[sub.MonHocID]" :items="DSGiaoVien"
                    :item-title="renderTextGiangVien" item-value="GiaoVienID" placeholder="Chọn GV bộ môn..." clearable
                    hide-details density="compact" variant="underlined" class="matrix-select" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>
    </template>

    <!-- Dialog Add/Edit (For list view mode) -->
    <uc-dialog v-model="dialog.show" :title="dialog.isEdit ? 'Cập nhật phân công' : 'Thêm mới phân công'" doneText="Lưu"
      width="638" @onSubmit="savePhanCong">
      <v-form ref="dialogForm" v-model="dialog.isValid" class="mt-2">
        <v-row>
          <v-col cols="12">
            <v-select v-model="dialog.item.MaDonVi" label="Chọn đơn vị" :items="DSDonVi" item-title="TenDonVi"
              item-value="MaDonVi" :rules="[v => !!v || 'Vui lòng chọn đơn vị']" hide-details="auto" />
          </v-col>

          <v-col cols="12">
            <v-select v-model="dialog.item.VaiTro" label="Chọn vai trò" :items="DSVaiTro" item-title="TenVaiTro"
              item-value="VaiTro" :rules="[v => !!v || 'Vui lòng chọn vai trò']" hide-details="auto" />
          </v-col>

          <v-col :cols="dialog.item.VaiTro === 3 ? 6 : 12">
            <v-autocomplete v-model="dialog.item.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien"
              :item-title="renderTextGiangVien" item-value="GiaoVienID" :rules="[v => !!v || 'Vui lòng chọn giáo viên']"
              :disabled="dialog.isEdit" hide-details="auto" />
          </v-col>

          <v-col cols="6" v-if="dialog.item.VaiTro === 3">
            <v-select v-model="dialog.item.MonHocID" label="Chọn môn học" :items="DSMonHoc" item-title="MonHocName"
              item-value="MonHocID" :rules="[v => !!v || 'Vui lòng chọn môn học']" hide-details="auto" />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="dialog.item.GhiChu" label="Ghi chú" rows="2" hide-details="auto" />
          </v-col>
        </v-row>
      </v-form>
    </uc-dialog>
  </Global>
</template>

<script>
	export default {
		name: 'BghPhanCongGiaoVien',
  inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      CapID: 1,
      KhoiID: null,
      LopID: null,
      Search: '',
      viewMode: 'list', // 'list' or 'matrix'
      HocKi: 1,

      DSHocKi: [
        { TenHocKi: 'Học kỳ 1', HocKi: 1 },
        { TenHocKi: 'Học kỳ 2', HocKi: 2 }
      ],

      DSKhoi: [],
      DSLop: [],
      DSGiaoVien: [],
      DSMonHoc: [],
      DSPhanCongGiaoVien: [],

      // Matrix Grid State
      matrixRows: [],
      initialMatrixRows: [],
      loadingMatrix: false,
      savingMatrix: false,
      filterMonHocIds: [],

      DSCap: [
        { TenCap: 'Cấp 1', MaCap: 1 },
        { TenCap: 'Cấp 2', MaCap: 2 },
        { TenCap: 'Cấp 3', MaCap: 3 }
      ],

      DSDonVi: [
        { TenDonVi: 'Biên Hòa', MaDonVi: 1 },
        { TenDonVi: 'Long Khánh', MaDonVi: 2 }
      ],

      DSVaiTro: [
        { TenVaiTro: 'Giáo viên Lớp', VaiTro: 1 },
        { TenVaiTro: 'Khối Trưởng (Duyệt)', VaiTro: 2 },
        { TenVaiTro: 'Giáo viên bộ môn', VaiTro: 3 }
      ],

      headers: [
        { title: 'STT', value: 'STT', align: 'center', width: 60 },
        { title: 'Mã giáo viên', value: 'GiaoVienID', width: 120 },
        { title: 'Họ tên giảng viên', value: 'HoTenGV' },
        { title: 'Tên môn học', value: 'MonHocName' },
        { title: 'Vai trò', value: 'VaiTro', align: 'center' },
        { title: 'Đơn vị', value: 'MaDonVi', align: 'center' },
        { title: 'Chức năng', value: 'actions', align: 'center', width: 100 }
      ],

      dialog: {
        show: false,
        isEdit: false,
        isValid: false,
        item: {
          GVLopID: null,
          GiaoVienID: null,
          VaiTro: 3,
          MaDonVi: 1,
          MonHocID: null,
          GhiChu: ''
        }
      }
    }
  },
  computed: {
    TitleCap() {
      return typeof renderText === 'function' ? renderText(parseInt(this.CapID)) : 'Cấp ' + this.CapID
    },
    TitlePage() {
      return typeof getTitlePageByURL === 'function'
        ? getTitlePageByURL(window.location.pathname + window.location.search)
        : 'Phân công giáo viên'
    },
    filterDS() {
      if (!this.DSPhanCongGiaoVien) return []
      const s = (this.Search || '').trim().toLowerCase()
      if (!s) return this.DSPhanCongGiaoVien
      return this.DSPhanCongGiaoVien.filter(x => {
        const hoTen = (x.HoTenGV || '').toLowerCase()
        const maGV = (x.GiaoVienID || '').toLowerCase()
        const monHoc = (x.MonHocName || '').toLowerCase()
        return hoTen.includes(s) || maGV.includes(s) || monHoc.includes(s)
      })
    },
    filteredMonHocs() {
      if (!this.DSMonHoc) return []
      if (!this.filterMonHocIds || this.filterMonHocIds.length === 0) {
        return this.DSMonHoc
      }
      return this.DSMonHoc.filter(sub => this.filterMonHocIds.includes(sub.MonHocID))
    }
  },
  watch: {
    viewMode(val) {
      if (val === 'matrix') {
        this.loadMatrixData()
      } else {
        this.getGiaoVienLop()
      }
    },
    HocKi: {
      async handler(val) {
        this.KhoiID = null
        this.LopID = null
        this.DSLop = []
        this.DSPhanCongGiaoVien = []
        if (val) {
          await this.getKhoi()
          if (this.DSKhoi.length > 0) {
            this.KhoiID = this.DSKhoi[0].KhoiID
          }
        }
      }
    },
    CapID: {
      async handler(val) {
        this.KhoiID = null
        this.LopID = null
        this.DSLop = []
        this.DSPhanCongGiaoVien = []
        this.filterMonHocIds = []
        if (val) {
          await Promise.all([this.getKhoi(), this.getMonHoc()])
          if (this.DSKhoi.length > 0) {
            this.KhoiID = this.DSKhoi[0].KhoiID
          }
        }
      }
    },
    KhoiID: {
      async handler(val) {
        this.LopID = null
        this.DSLop = []
        this.DSPhanCongGiaoVien = []
        if (val) {
          await this.getLop()
          if (this.viewMode === 'matrix') {
            this.loadMatrixData()
          }
        }
      }
    },
    LopID: {
      async handler(val) {
        this.DSPhanCongGiaoVien = []
        if (val && this.viewMode === 'list') {
          await this.getGiaoVienLop()
        }
      }
    }
  },
  async mounted() {
    this.CapID = vueData.CapID || 1
    this.HocKi = parseInt(vueData.NienKhoaItem?.HocKi || 1)
    await Promise.all([
      this.getKhoi(),
      this.getMonHoc(),
      this.getGiaoVien()
    ])
    if (this.DSKhoi.length > 0) {
      this.KhoiID = this.DSKhoi[0].KhoiID
    }
  },
  methods: {
    isMonHocVisible(monHocID) {
      if (!this.filterMonHocIds || this.filterMonHocIds.length === 0) return true
      return this.filterMonHocIds.includes(monHocID)
    },

    showSnackbar(message, color = 'success') {
      if (this.snackbarRef?.value?.showSnackbar) {
        this.snackbarRef.value.showSnackbar({ message, color })
      }
    },

    async getKhoi() {
      const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
        CapID: this.CapID,
        NienKhoa: parseInt(vueData.NienKhoa || new Date().getFullYear()),
        HocKi: this.HocKi
      })
      this.DSKhoi = res ?? []
    },

    async getMonHoc() {
      const res = await fetchPromise('lms/MonHoc_Get_ByCapID', { CapID: this.CapID })
      this.DSMonHoc = res ?? []
    },

    async getLop() {
      const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
        NienKhoa: parseInt(vueData.NienKhoa || new Date().getFullYear()),
        KhoiID: this.KhoiID,
        HocKi: this.HocKi
      })
      this.DSLop = res ?? []
      if (this.DSLop.length > 0) {
        this.LopID = this.DSLop[0].LopID
      }
    },

    async getGiaoVien() {
      const res = await fetchPromise('lms/GiaoVien_Get')
      this.DSGiaoVien = (res ?? []).map(item => ({
        ...item,
        GiaoVienID: item.GiaoVienID?.trim()
      }))
    },

    async getGiaoVienLop() {
      if (!this.LopID) return
      const res = await fetchPromise('lms/GiaoVienLop_Get_ByLopID', {
        LopID: this.LopID,
        NienKhoa: parseInt(vueData.NienKhoa || new Date().getFullYear()),
        HocKi: this.HocKi
      })
      this.DSPhanCongGiaoVien = res ?? []
    },

    // ==========================================
    // MATRIX LOAD & SAVE LOGIC
    // ==========================================
    async loadMatrixData() {
      if (!this.DSLop || this.DSLop.length === 0) {
        this.matrixRows = []
        this.blockKhoiTruong = null
        this.blockKhoiTruong_Record = null
        this.initialBlockKhoiTruong = null
        return
      }

      this.loadingMatrix = true
      try {
        const nienKhoa = parseInt(vueData.NienKhoa || new Date().getFullYear())
        const requests = this.DSLop.map(lop => ({
          url: 'lms/GiaoVienLop_Get_ByLopID',
          params: { LopID: lop.LopID, NienKhoa: nienKhoa, HocKi: this.HocKi }
        }))

        // Call fetchBatchPromise
        const results = await fetchBatchPromise(requests)

        const matrixRows = []

        this.DSLop.forEach((lop, idx) => {
          const assignments = results[idx] ?? []
          
          const row = {
            LopID: lop.LopID,
            TenLop: lop.TenLop,
            GVCN: null,             // VaiTro = 1
            GVCN_Record: null,      // GVLopID (int)
            Subjects: {},           // MonHocID -> string GiaoVienID
            Subjects_Record: {}     // MonHocID -> int GVLopID
          }

          assignments.forEach(asg => {
            if (asg.VaiTro === 1) {
              row.GVCN = asg.GiaoVienID
              row.GVCN_Record = asg.GVLopID
            } else if (asg.VaiTro === 3) {
              row.Subjects[asg.MonHocID] = asg.GiaoVienID
              row.Subjects_Record[asg.MonHocID] = asg.GVLopID
            }
          })

          matrixRows.push(row)
        })

        this.matrixRows = matrixRows
        
        // Deep copy of matrix rows for initial comparison
        this.initialMatrixRows = JSON.parse(JSON.stringify(matrixRows))
      } catch (err) {
        console.error(err)
        this.showSnackbar('Lỗi tải dữ liệu ma trận', 'error')
      } finally {
        this.loadingMatrix = false
      }
    },

    async saveMatrix() {
      const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu thay đổi ma trận phân công?' })
      if (!ok) return

      this.savingMatrix = true
      
      const nienKhoa = parseInt(vueData.NienKhoa || new Date().getFullYear())
      const hocKi = this.HocKi
      const sysUserId = vueData.user.UserID

      const deleteQueue = [] // GVLopID
      const insertQueue = [] // new records

      // 2. Check each Class row
      this.matrixRows.forEach(row => {
        const initialRow = this.initialMatrixRows.find(x => x.LopID === row.LopID)
        if (!initialRow) return

        // 2a. Check GVCN
        if (row.GVCN !== initialRow.GVCN) {
          if (initialRow.GVCN_Record) {
            deleteQueue.push(initialRow.GVCN_Record)
          }
          if (row.GVCN) {
            insertQueue.push({
              NienKhoa: nienKhoa,
              KhoiID: parseInt(this.KhoiID),
              LopID: row.LopID.toString(),
              GiaoVienID: row.GVCN,
              VaiTro: 1,
              MaDonVi: 1,
              MonHocID: 0,
              GhiChu: 'Phân công GVCN',
              HocKi: hocKi,
              Enable: true
            })
          }
        }

        // 2b. Check each Subject
        this.DSMonHoc.forEach(sub => {
          const currentGV = row.Subjects[sub.MonHocID]
          const initialGV = initialRow.Subjects[sub.MonHocID]

          if (currentGV !== initialGV) {
            const oldGVLopID = initialRow.Subjects_Record[sub.MonHocID]
            if (oldGVLopID) {
              deleteQueue.push(oldGVLopID)
            }
            if (currentGV) {
              insertQueue.push({
                NienKhoa: nienKhoa,
                KhoiID: parseInt(this.KhoiID),
                LopID: row.LopID.toString(),
                GiaoVienID: currentGV,
                VaiTro: 3,
                MaDonVi: 1,
                MonHocID: sub.MonHocID,
                GhiChu: 'Phân công bộ môn',
                HocKi: hocKi,
                Enable: true
              })
            }
          }
        })
      })

      try {
        // Step 1: Delete changes in parallel
        if (deleteQueue.length > 0) {
          const delRequests = deleteQueue.map(id => 
            fetchPromise('lms/GiaoVienLop_Del', { GVLopID: id, Sys_UserID: sysUserId }, { cache: false })
          )
          await Promise.all(delRequests)
        }

        // Step 2: Insert changes in batch
        if (insertQueue.length > 0) {
          await fetchPromise('lms/GiaoVienLop_Batch_Ins', {
            PhanCongInput: JSON.stringify(insertQueue),
            Sys_UserID: sysUserId
          }, { cache: false })
        }

        this.showSnackbar('Lưu thay đổi ma trận thành công', 'success')
        await this.loadMatrixData()
      } catch (err) {
        console.error(err)
        this.showSnackbar('Lỗi khi lưu thay đổi ma trận', 'error')
      } finally {
        this.savingMatrix = false
      }
    },

    // ==========================================
    // OTHER UTILITY METHODS
    // ==========================================
    getVaiTroText(vaiTro) {
      const obj = this.DSVaiTro.find(x => x.VaiTro === vaiTro)
      return obj ? obj.TenVaiTro : 'Không xác định'
    },

    getVaiTroColor(vaiTro) {
      if (vaiTro === 1) return 'blue'
      if (vaiTro === 2) return 'green'
      if (vaiTro === 3) return 'orange'
      return 'grey'
    },

    getDonViText(donVi) {
      const obj = this.DSDonVi.find(x => x.MaDonVi === donVi)
      return obj ? obj.TenDonVi : 'Biên Hòa'
    },

    getDonViColor(donVi) {
      if (donVi === 1) return 'info'
      if (donVi === 2) return 'purple'
      return 'grey'
    },

    renderTextGiangVien(obj) {
      if (!obj) return ''
      const name = obj.HoTenGV || `${obj.HoGV || ''} ${obj.TenGV || ''}`.trim()
      return `[${obj.GiaoVienID}] - ${name}`
    },

    openAddDialog() {
      this.dialog.isEdit = false
      this.dialog.item = {
        GVLopID: null,
        GiaoVienID: null,
        VaiTro: 3,
        MaDonVi: 1,
        MonHocID: this.DSMonHoc[0]?.MonHocID || null,
        GhiChu: ''
      }
      this.dialog.show = true
      this.$nextTick(() => {
        if (this.$refs.dialogForm) {
          this.$refs.dialogForm.resetValidation()
        }
      })
    },

    openEditDialog(record) {
      this.dialog.isEdit = true
      this.dialog.item = {
        GVLopID: record.GVLopID,
        GiaoVienID: record.GiaoVienID,
        VaiTro: record.VaiTro,
        MaDonVi: record.MaDonVi || 1,
        MonHocID: record.MonHocID || null,
        GhiChu: record.GhiChu || ''
      }
      this.dialog.show = true
      this.$nextTick(() => {
        if (this.$refs.dialogForm) {
          this.$refs.dialogForm.resetValidation()
        }
      })
    },

    async savePhanCong() {
      const form = this.$refs.dialogForm
      if (!form) return

      const { valid } = await form.validate()
      if (!valid) return

      const item = this.dialog.item
      let monHocID = 0
      let lopID = this.LopID

      if (item.VaiTro === 1 || item.VaiTro === 2) {
        monHocID = 0
      } else {
        monHocID = item.MonHocID
      }

      if (item.VaiTro === 2) {
        lopID = 0
      }

      const payload = {
        NienKhoa: parseInt(vueData.NienKhoa || new Date().getFullYear()),
        KhoiID: parseInt(this.KhoiID),
        LopID: lopID.toString(),
        GiaoVienID: item.GiaoVienID,
        VaiTro: parseInt(item.VaiTro),
        MaDonVi: parseInt(item.MaDonVi),
        MonHocID: parseInt(monHocID),
        GhiChu: item.GhiChu || '',
        HocKi: this.HocKi
      }

      if (this.dialog.isEdit) {
        const updatePayload = {
          ...payload,
          GVLopID: item.GVLopID,
          Sys_UserID: vueData.user.UserID
        }
        const res = await fetchPromise('lms/GiaoVienLop_Upd', updatePayload, { cache: false })
        if (res) {
          this.showSnackbar('Cập nhật phân công thành công', 'success')
          this.dialog.show = false
          this.getGiaoVienLop()
        }
      } else {
        const insertPayload = {
          PhanCongInput: JSON.stringify([{
            ...payload,
            Enable: true
          }]),
          Sys_UserID: vueData.user.UserID
        }
        const res = await fetchPromise('lms/GiaoVienLop_Batch_Ins', insertPayload, { cache: false })
        if (res) {
          this.showSnackbar('Thêm phân công thành công', 'success')
          this.dialog.show = false
          this.getGiaoVienLop()
        }
      }
    },

    async deleteItem(record) {
      const ok = await this.confirmRef.value.show({ title: 'Xác nhận xóa phân công giáo viên?' })
      if (!ok) return

      const res = await fetchPromise('lms/GiaoVienLop_Del', {
        GVLopID: record.GVLopID,
        Sys_UserID: vueData.user.UserID
      }, { cache: false })

      if (res) {
        this.showSnackbar('Xóa phân công thành công', 'success')
        this.getGiaoVienLop()
      }
    }
  }
	}
</script>