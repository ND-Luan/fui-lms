<template>
	<Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="4" md="3" class="py-1">
              <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="3" class="py-1">
              <v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop" item-value="LopID"
                hide-details />
            </v-col>
            <v-col cols="12" sm="4" md="3" class="py-1">
              <v-select v-model="MaNhomCotDiem" label="Chọn mã nhóm điểm" :items="DSNhomDiem"
                item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" hide-details />
            </v-col>
            <v-col cols="auto" class="py-1">
              <v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" @click="getHocSinhBangDiem(true)">
                Làm mới
              </v-btn>
            </v-col>
          </v-row>

          <v-row align="center" dense class="mt-2" v-if="items.length > 0">
            <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap ga-2">
              <div class="d-flex align-center ga-2 flex-wrap">
                <p v-if="reasonRejectInfo.disabled" class="text-black text-body-2 mb-0">
                  Lý do từ chối: <span class="text-red font-weight-bold">{{ reasonRejectInfo.NoiDungNhanXet }}</span>
                </p>
                <v-chip color="primary" class="font-weight-medium" size="small">
                  Tổng số học sinh: {{ items.length }}
                </v-chip>
              </div>
              <div class="d-flex ga-2">
                <v-btn color="error" variant="outlined" prepend-icon="mdi-cancel" :disabled="items.length === 0"
                  @click="IsShowDialogReject = true">
                  Từ chối
                </v-btn>
                <v-btn color="success" variant="outlined" prepend-icon="mdi-check-circle" :disabled="items.length === 0"
                  @click="onDuyetDiem">
                  Duyệt (Công bố PH)
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <GlobalDataTable :headers="headers" :items="items" item-value="HocSinhID" items-per-page="-1" hide-default-footer
      hover density="compact" class="border rounded text-body-2 table-sticky-first-col"
      v-data-table-height="calcTableHeight">
      <template #item.hocSinh="{ item }">
        <uc-info-student :item="item" />
      </template>

      <template #no-data>
        <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
          <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
          <p class="text-body-2">Chọn đầy đủ bộ lọc để xem danh sách điểm</p>
        </div>
      </template>
    </GlobalDataTable>

    <!-- Dialog Từ chối -->
    <uc-dialog v-model="IsShowDialogReject" title="Lý do từ chối" doneText="Xác nhận" @onSubmit="onTuChoiDiem">
      <v-textarea v-model="ReasonReject" placeholder="Nhập lý do từ chối..." rows="4" hide-details outlined>
      </v-textarea>
    </uc-dialog>
  </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      KhoiID: null,
      LopID: null,
      MaNhomCotDiem: null,
      MonHocLopItem: null,
      DSKhoi: [],
      DSLop: [],
      DSMonHoc: [],
      DSNhomDiem: [],
      DSCotDiem: [],
      items: [],
      headers: [],
      IsShowDialogReject: false,
      ReasonReject: '',
    }
  },
  computed: {
    TitleCap() {
      return renderText(parseInt(vueData.CapID || 1))
    },
    TitlePage() {
      return getTitlePageByURL(window.location.pathname + window.location.search)
    },
    calcTableHeight() {
      return 'calc(100dvh - 200px)'
    },
    reasonRejectInfo() {
      let defaultObj = {
        disabled: false,
        NoiDungNhanXet: null
      }
      const obj = this.DSCotDiem?.find(x => x.TinhTrang === 5)
      defaultObj.disabled = obj ? true : false
      defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
      return defaultObj
    },
    academicYearAndSemester() {
      return {
        nienKhoa: vueData.NienKhoa,
        hocKi: vueData.NienKhoaItem?.HocKi
      }
    }
  },
  watch: {
    academicYearAndSemester: {
      deep: true,
      async handler(v) {
        this.LopID = null
        this.MaNhomCotDiem = null
        this.items = []
        this.headers = []
        this.DSLop = []
        this.DSMonHoc = []
        this.DSNhomDiem = []
        this.MonHocLopItem = null
        await this.getKhoi(true)
        if (this.KhoiID) {
          this.getLop(true)
        }
      }
    },
    KhoiID(v) {
      this.LopID = null
      this.MaNhomCotDiem = null
      this.items = []
      this.headers = []
      this.DSLop = []
      this.DSMonHoc = []
      this.DSNhomDiem = []
      this.MonHocLopItem = null
      if (v) this.getLop(true)
    },
    LopID(v) {
      this.MaNhomCotDiem = null
      this.items = []
      this.headers = []
      this.DSMonHoc = []
      this.DSNhomDiem = []
      this.MonHocLopItem = null
      if (v) this.getMonHoc(true)
    },
    MaNhomCotDiem(v) {
      this.items = []
      this.headers = []
      if (v) this.getHocSinhBangDiem()
    },
    IsShowDialogReject(v) {
      if (v) {
        this.ReasonReject = ''
      }
    }
  },
  mounted() {
    this.getKhoi()
  },
  methods: {
    async getKhoi(force = false) {
      try {
        const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
          CapID: vueData.CapID,
          NienKhoa: vueData.NienKhoa,
          HocKi: vueData.NienKhoaItem?.HocKi
        }, { forceRefresh: force })
        this.DSKhoi = res ?? []
      } catch (err) {
        console.error('getKhoi error:', err)
      }
    },
    async getLop(force = false) {
      if (!this.KhoiID) return
      try {
        const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
          NienKhoa: vueData.NienKhoa,
          KhoiID: this.KhoiID
        }, { forceRefresh: force })
        this.DSLop = res ?? []
      } catch (err) {
        console.error('getLop error:', err)
      }
    },
    async getMonHoc(force = false) {
      if (!this.LopID) return
      try {
        const res = await fetchPromise('lms/MonHoc_Get_ByLopID', {
          NienKhoa: vueData.NienKhoa,
          LopID: this.LopID
        }, { forceRefresh: force })
        this.DSMonHoc = res ?? []
        this.MonHocLopItem = this.DSMonHoc.find(x => x.MonHocID === 5) || null
        if (this.MonHocLopItem) {
          await this.getMaNhomCotDiem(force)
        } else {
          this.DSNhomDiem = []
        }
      } catch (err) {
        console.error('getMonHoc error:', err)
      }
    },
    async getMaNhomCotDiem(force = false) {
      if (!this.MonHocLopItem?.TemplateBangDiemID) return
      try {
        const res = await fetchPromise('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID', {
          TemplateBangDiemID: this.MonHocLopItem.TemplateBangDiemID
        }, { forceRefresh: force })
        const ListMaCotDiem = ["DiemGK_HK1", "DiemCK_HK1", "DiemGK_HK2", "DiemCK_HK2"]
        this.DSNhomDiem = (res ?? []).filter(x => !ListMaCotDiem.includes(x.MaNhomCotDiem))
      } catch (err) {
        console.error('getMaNhomCotDiem error:', err)
      }
    },
    async getHocSinhBangDiem(force = false) {
      if (!this.LopID || !this.MonHocLopItem?.MonHocID || !this.MaNhomCotDiem) return
      try {
        const res = await fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom', {
          LopID: this.LopID,
          MonHocID: this.MonHocLopItem.MonHocID,
          TemplateBangDiemID: this.MonHocLopItem.TemplateBangDiemID,
          MaNhomCotDiem: this.MaNhomCotDiem
        }, { forceRefresh: force })
        this.DSCotDiem = res ?? []
        this.convertHocSinh()
      } catch (err) {
        console.error('getHocSinhBangDiem error:', err)
      }
    },
    convertHocSinh() {
      if (!this.DSCotDiem || this.DSCotDiem.length === 0) {
        this.items = []
        this.headers = []
        return
      }
      const firstStudent = this.DSCotDiem[0]
      const _headers = this.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
      const uniqueHocSinhID = [...new Set(this.DSCotDiem.map(x => x.HocSinhID))]
      const DSHocSinh = []
      
      for (const HocSinhID of uniqueHocSinhID) {
        const hocSinh = this.DSCotDiem.find(x => x.HocSinhID === HocSinhID)
        if (hocSinh) {
          DSHocSinh.push({
            HocSinhID: HocSinhID,
            HoTen: hocSinh.HoTen,
            NgaySinh: hocSinh.NgaySinh,
            SoDanhBo: hocSinh.SoDanhBo,
            Nu: hocSinh.Nu,
          })
        }
      }

      for (const hocSinh of DSHocSinh) {
        const arrCotDiemOfHocSinh = this.DSCotDiem.filter(x => x.HocSinhID === hocSinh.HocSinhID)
        for (const cotDiem of arrCotDiemOfHocSinh) {
          hocSinh[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI
          hocSinh[cotDiem.TenCotDiem_VI] = cotDiem.KetQuaDanhGia_VI
        }
      }

      const headers = [
        {
          key: "hocSinh",
          value: "hocSinh",
          title: "Học sinh",
          align: "start",
          minWidth: 250,
          cellProps: {
            class: "w-250 font-weight-medium",
          }
        }
      ]

      for (const header of _headers) {
        headers.push({
          title: header.TenCotDiem_VI,
          key: header.MaCotDiem,
          value: header.MaCotDiem,
          align: "center",
          minWidth: header.WidthCSS ? parseInt(header.WidthCSS) : 80,
          nowrap: true,
          cellProps: {
            class: `w-${header.WidthCSS || 80} text-center`,
          }
        })
      }

      this.headers = headers
      this.items = DSHocSinh
    },
    async onDuyetDiem() {
      if (!this.confirmRef?.value) return
      const ok = await this.confirmRef.value.show({
        title: 'Xác nhận duyệt?',
        message: 'Xác nhận duyệt (Công bố Phụ Huynh)'
      })
      if (!ok) return

      try {
        const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp_C2_C3', {
          NienKhoa: vueData.NienKhoa,
          LopID: this.LopID,
          MonHocLopID: this.MonHocLopItem?.MonHocLopID,
          MaNhomCotDiem: this.MaNhomCotDiem,
          TinhTrang: 8,
          ReasonReject: ''
        }, { cache: false })

        if (res?.status === 'success' || res) {
          this.snackbarRef.value.showSnackbar({
            message: 'Duyệt thành công',
            color: 'success'
          })
          await this.getHocSinhBangDiem(true)
        }
      } catch (err) {
        console.error('onDuyetDiem error:', err)
      }
    },
    async onTuChoiDiem() {
      if (!this.ReasonReject?.trim()) {
        this.snackbarRef.value.showSnackbar({
          message: 'Vui lòng nhập lý do từ chối',
          color: 'warning'
        })
        return
      }
      if (!this.confirmRef?.value) return
      const ok = await this.confirmRef.value.show({
        title: 'Xác nhận từ chối?',
        message: 'Xác nhận lý do từ chối'
      })
      if (!ok) return

      try {
        const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp_C2_C3', {
          NienKhoa: vueData.NienKhoa,
          LopID: this.LopID,
          MonHocLopID: this.MonHocLopItem?.MonHocLopID,
          MaNhomCotDiem: this.MaNhomCotDiem,
          TinhTrang: 5,
          ReasonReject: this.ReasonReject
        }, { cache: false })

        if (res?.status === 'success' || res) {
          this.snackbarRef.value.showSnackbar({
            message: 'Từ chối thành công',
            color: 'success'
          })
          this.IsShowDialogReject = false
          await this.getHocSinhBangDiem(true)
        }
      } catch (err) {
        console.error('onTuChoiDiem error:', err)
      }
    }
  }
	}
</script>