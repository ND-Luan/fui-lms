<template>
	<Global>
        <template #header>
            <v-card>
                <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" sm="3">
                            <v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="title"
                                item-value="value" return-object />
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
                                item-value="LopID" return-object :disabled="!KhoiItem" />
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="SemesterItem" label="Chọn học kì" :items="DSSemester" item-title="title"
                                item-value="value" return-object :disabled="!LopItem" />
                        </v-col>
                        <v-col cols="12" sm="3" class="d-flex align-center ga-2 flex-wrap">
                            <v-btn variant="outlined" color="primary" :loading="loading" @click="onRefresh">
                                <v-icon start>mdi-reload</v-icon>Làm mới
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-row v-if="DSHocSinh.length" align="center" class="mt-1">
                        <v-col cols="12" class="d-flex align-center ga-2 flex-wrap">
                            <v-chip color="primary" variant="tonal">Tổng số học sinh: {{ DSHocSinh.length }}</v-chip>
                            <span v-if="reasonRejectInfo.disabled" class="text-body-2 ms-2">
                                Lý do từ chối: <span class="text-red">{{ reasonRejectInfo.NoiDungNhanXet }}</span>
                            </span>
                            <div class="ml-auto d-flex ga-2">
                                <v-btn color="error" variant="outlined" prepend-icon="mdi-cancel"
                                    :disabled="!canActOnDiem" @click="openRejectDialog">
                                    Từ chối
                                </v-btn>
                                <v-btn color="primary" variant="outlined" prepend-icon="mdi-send"
                                    :disabled="!canActOnDiem" @click="onGuiBGH">
                                    Gửi BGH
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <v-progress-linear v-if="loading" color="primary" indeterminate />

        <uc-table v-if="DSHocSinh.length" :model-value="DSHocSinh" :semester="SemesterItem"
            :lop-id="LopItem?.LopID ?? null" />

        <div v-else class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
            <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
            <p class="text-body-2">Chọn khối, lớp và học kì để xem bảng điểm</p>
        </div>

        <!-- Dialog Từ chối -->
        <uc-dialog v-model="isShowDialogReject" title="Từ chối điểm" doneText="Từ chối" @onSubmit="onSubmitReject">
            <v-row>
                <v-col cols="12">
                    <v-select v-model="rejectForm.MonHocLopIDs" multiple label="Chọn môn học" :items="DSMonHoc"
                        item-title="TenMonHoc_HienThi" item-value="MonHocLopID">
                        <template #selection="{ item, index }">
                            <v-chip v-if="index < 3" color="primary" :text="item.raw.TenMonHoc_HienThi" />
                            <span v-if="index === 3" class="text-grey text-caption align-self-center">
                                (+{{ rejectForm.MonHocLopIDs.length - 3 }} môn học khác)
                            </span>
                        </template>
                        <template #item="{ props: itemProps, item }">
                            <v-list-item v-bind="itemProps">
                                <template #append>
                                    <v-chip size="x-small" :color="item.raw.MauTinhTrang || 'default'" variant="tonal">
                                        {{ item.raw.TenTinhTrang }}
                                    </v-chip>
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12">
                    <v-textarea v-model="rejectForm.ReasonReject" label="Lý do từ chối"
                        placeholder="Nhập lý do từ chối..." />
                </v-col>
            </v-row>
        </uc-dialog>
    </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    const { FunctionRight, SystemRight } = vueData.user
    const allKhoi = Array.from({ length: 12 }, (_, i) => {
      const value = i + 1
      const CapID = value <= 5 ? 1 : value <= 9 ? 2 : 3
      return { title: `Khối ${value}`, value, CapID }
    })

    let DSKhoi
    if (SystemRight === 9) {
      DSKhoi = allKhoi.filter(x => x.CapID === parseInt(vueData.CapID))
    } else {
      const allowed = []
      if (FunctionRight.includes('11')) allowed.push(1)
      if (FunctionRight.includes('12')) allowed.push(2)
      if (FunctionRight.includes('13')) allowed.push(3)
      if (FunctionRight.includes('14')) allowed.push(4)
      if (FunctionRight.includes('15')) allowed.push(5)
      DSKhoi = allKhoi.filter(x => allowed.includes(x.value))
    }

    return {
      vueData,
      loading: false,
      DSKhoi,
      DSLop: [],
      DSMonHoc: [],
      DSHocSinh: [],
      RawAPIData: [],
      KhoiItem: null,
      LopItem: null,
      SemesterItem: null,
      isShowDialogReject: false,
      rejectForm: {
        MonHocLopIDs: [],
        ReasonReject: '',
      },
      DSSemester: [
        { title: 'Giữa kì 1', value: 'GK_HK1' },
        { title: 'Cuối kì 1', value: 'CK_HK1' },
        { title: 'Giữa kì 2', value: 'GK_HK2' },
        { title: 'Cuối kì 2', value: 'CK_HK2' },
      ],
      EnumTinhTrang: {
        ChuaLuu: 0, LuuTam: 1, GVBM_GuiDiem: 2, GVCN_TuChoi_GVBM: 3,
        GVCN_GuiDiem: 4, TT_TuChoi: 5, TT_GuiBGH: 6, BGH_TuChoi: 7, BGH_Duyet: 8,
      },
    }
  },
  computed: {
    TitleCap() {
      return renderText(parseInt(vueData.CapID))
    },
    TitlePage() {
      return getTitlePageByURL(window.location.pathname + window.location.search)
    },
    reasonRejectInfo() {
      const semVal = this.SemesterItem?.value ?? ''
      const data = this.RawAPIData.filter(x => x.MaCotDiem?.includes(semVal))
      const obj = data.find(x => x.TinhTrang === this.EnumTinhTrang.TT_TuChoi)
      return {
        disabled: !!obj,
        NoiDungNhanXet: obj?.NoiDungNhanXet ?? '',
      }
    },
    canActOnDiem() {
      if (!this.DSHocSinh.length) return false
      // Tổ trưởng chỉ có thể từ chối/gửi khi GVCN đã gửi (TinhTrang = 4)
      return this.RawAPIData.some(x => x.TinhTrang === this.EnumTinhTrang.GVCN_GuiDiem)
    },
  },
  watch: {
    'vueData.NienKhoa'() {
      this.KhoiItem = null
      this.LopItem = null
      this.SemesterItem = null
      this.DSLop = []
      this.DSMonHoc = []
      this.DSHocSinh = []
      this.RawAPIData = []
    },
    KhoiItem(v) {
      this.LopItem = null
      this.SemesterItem = null
      this.DSLop = []
      this.DSMonHoc = []
      this.DSHocSinh = []
      this.RawAPIData = []
      if (v) this.getLop()
    },
    LopItem(v) {
      this.SemesterItem = null
      this.DSMonHoc = []
      this.DSHocSinh = []
      this.RawAPIData = []
    },
    SemesterItem(v) {
      this.DSMonHoc = []
      this.DSHocSinh = []
      this.RawAPIData = []
      if (v) this.getData()
    },
  },
  mounted() {},
  methods: {
    async getLop(forceRefresh = false) {
      if (!this.KhoiItem?.value) return
      const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
        KhoiID: this.KhoiItem.value,
        NienKhoa: vueData.NienKhoa,
      }, { forceRefresh })
      this.DSLop = res ?? []
    },
    async getData(forceRefresh = false) {
      if (!this.LopItem?.LopID || !this.SemesterItem?.value) return
      this.loading = true
      try {
        const res = await fetchPromise('lms/HocSinhBangDiem_TT_BGH_Get', {
          NienKhoa: vueData.NienKhoa,
          LopID: this.LopItem.LopID,
          Semester: this.SemesterItem.value,
        }, { forceRefresh })
        this.RawAPIData = res ?? []
        this.renderDSHocSinh()
        this.renderDSMonHoc()
      } finally {
        this.loading = false
      }
    },
    renderDSHocSinh() {
      const hocSinhIDs = [...new Set(this.RawAPIData.map(x => x.HocSinhID))]
      this.DSHocSinh = hocSinhIDs.map(id => {
        const hs = this.RawAPIData.find(x => x.HocSinhID === id)
        return {
          ...hs,
          DSCotDiem: this.RawAPIData.filter(x => x.HocSinhID === id),
        }
      })
    },
    renderDSMonHoc() {
      const uniqueMonHocIDs = [...new Set(this.RawAPIData.map(x => x.MonHocID))]
      this.DSMonHoc = uniqueMonHocIDs.map(id => {
        const obj = this.RawAPIData.find(x => x.MonHocID === id)
        return {
          TenMonHoc_HienThi: obj.TenMonHoc_HienThi,
          MonHocLopID: obj.MonHocLopID,
          TinhTrang: obj.TinhTrang,
          TenTinhTrang: obj.TenTinhTrang,
          MauTinhTrang: obj.MauTinhTrang,
        }
      })
    },
    async onRefresh() {
      if (!this.LopItem) {
        await this.getLop(true)
        return
      }
      await this.getData(true)
    },
    openRejectDialog() {
      this.rejectForm = { MonHocLopIDs: [], ReasonReject: '' }
      this.isShowDialogReject = true
    },
    async onSubmitReject() {
      if (!this.rejectForm.MonHocLopIDs.length) {
        this.snackbarRef.value.showSnackbar({ message: 'Vui lòng chọn ít nhất 1 môn học', color: 'warning' })
        return
      }
      const ok = await this.confirmRef.value.show({ title: 'Xác nhận từ chối điểm?' })
      if (!ok) return
      const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp', {
        NienKhoa: vueData.NienKhoa,
        LopID: this.LopItem.LopID,
        TinhTrang: this.EnumTinhTrang.TT_TuChoi,
        Suffix_Semester: this.SemesterItem.value,
        List_MonHocLopID: this.rejectForm.MonHocLopIDs.join(','),
        ReasonReject: this.rejectForm.ReasonReject,
      }, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({ message: 'Từ chối thành công', color: 'success' })
        this.isShowDialogReject = false
        await this.getData(true)
      }
    },
    async onGuiBGH() {
      const ok = await this.confirmRef.value.show({ title: 'Xác nhận gửi điểm cho Ban Giám Hiệu?' })
      if (!ok) return
      const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp', {
        NienKhoa: vueData.NienKhoa,
        LopID: this.LopItem.LopID,
        TinhTrang: this.EnumTinhTrang.TT_GuiBGH,
        Suffix_Semester: this.SemesterItem.value,
      }, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({ message: 'Gửi BGH thành công', color: 'success' })
        await this.getData(true)
      }
    },
  },
	}
</script>
