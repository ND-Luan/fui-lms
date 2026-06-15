<template>
	<global>
    <template #header="">
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-select v-model="Semester" label="Chọn học kì" :items="DSSemester" item-title="title"
                item-value="value">
              </v-select>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID">
              </v-select>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select v-model="MonHocItem" label="Chọn môn học" :items="DSMonHoc" item-title="MonHocName"
                item-value="MonHocID" return-object="">
              </v-select>
            </v-col>
            <v-col cols="12" sm="3" class="d-flex align-center ga-2 flex-wrap">
              <v-btn variant="outlined" color="primary" @click="onRefresh">
                <v-icon start="">mdi-refresh</v-icon>Làm mới
              </v-btn>
              <v-btn variant="outlined" color="primary" :disabled="DSHocSinh.length === 0 && DataThongKe.length === 0"
                @click="exportExcel">
                <v-icon start="">mdi-file-excel</v-icon>Xuất Excel{{ DataThongKe.length > 0 ? ' (2 bảng)' : '' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-card class="pt-0 mt-3 elevation-1" v-if="DataThongKe.length > 0">
      <v-card-title class="d-flex text-primary">
        <span>Thống kê kết quả các khối</span>
      </v-card-title>
      <v-card-text>
        <v-data-table :items="DataThongKe" :headers="headers" items-per-page="-1" hide-default-footer=""
          style="max-height: calc(100dvh - 77px); overflow-y: auto;">
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card class="pt-0">
      <v-card-title class="d-flex text-primary px-0">
        <span>Bảng điểm chi tiết môn học</span>
        <v-chip v-if="KhoiID > 0" class="ml-2" color="primary">Khối {{ KhoiID }}</v-chip>
        <v-chip v-if="MonHocItem?.MonHocID > 0" class="ml-2" color="primary">{{ MonHocItem.MonHocName }}</v-chip>
        <v-chip v-if="DSHocSinh.length > 0" class="ml-2" color="primary">Tổng số học sinh: {{ DSHocSinh.length }}
        </v-chip>
      </v-card-title>

      <uc-jexcel v-if="DSHocSinh.length > 0" class="height-excel" :key="keyComp" :columns="columns"
        :data-source="DSHocSinh" :freeze-columns="freezeColumns" />
      <uc-card-empty v-else />
    </v-card>
  </global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      keyComp: 0,
      DSKhoi: [],
      KhoiID: null,
      MonHocItem: null,
      DSMonHoc: [],
      DSHocSinh: [],
      DSCotDiem: [],
      DataThongKe: [],
      MaCotDiem: null,
      HocKi: null,
      Semester: null,
      headers: [],
      columns: [],
      freezeColumns: 3,
      DSSemester: [
        { title: 'Giữa kì 1', value: 'GK_HK1' },
        { title: 'Cuối kì 1', value: 'CK_HK1' },
        { title: 'Giữa kì 2', value: 'GK_HK2' },
        { title: 'Cuối kì 2', value: 'CK_HK2' },
      ],
    }
  },
  computed: {
    TitleCap() {
      return renderText(parseInt(vueData.CapID || capid))
    },
    TitlePage() {
      return getTitlePageByURL(window.location.pathname + window.location.search)
    },
  },
  watch: {
    'vueData.NienKhoa'() {
      this.KhoiID = null
      this.MonHocItem = null
      this.DSMonHoc = []
      this.DSCotDiem = []
      this.DSHocSinh = []
      this.DataThongKe = []
      this.getKhoi()
    },
    Semester(v) {
      if (!v) return
      this.MonHocItem = null
      this.DSMonHoc = []
      this.DSCotDiem = []
      this.DSHocSinh = []
      this.DataThongKe = []
      if (this.KhoiID > 0) this.getMon()
    },
    KhoiID(v) {
      this.MonHocItem = null
      this.DSMonHoc = []
      this.DSCotDiem = []
      this.DSHocSinh = []
      this.DataThongKe = []
      if (v > 0) this.getMon()
    },
    MonHocItem(v) {
      this.DSCotDiem = []
      this.DSHocSinh = []
      this.DataThongKe = []
      if (v?.MonHocID > 0) {
        this.getHocSinh()
        this.getThongKe()
      }
    },
  },
  mounted() {
    this.initMaCotDiem()
    this.setThongKeHeaders()
    this.getKhoi()
  },
  methods: {
    initMaCotDiem() {
      if (parseInt(vueData.CapID) === 1) {
        this.MaCotDiem = 'DiemCK_HK2'
        this.HocKi = 'HK2'
      } else {
        this.MaCotDiem = 'DiemTB_CaNam'
        this.HocKi = 'CaNam'
      }
    },
    async getKhoi() {
      const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
        CapID: vueData.CapID,
        HocKi: vueData.NienKhoaItem.HocKi,
        NienKhoa: vueData.NienKhoa,
      })
      this.DSKhoi = res ?? []
    },
    async getMon() {
      if (!this.KhoiID) return
      const res = await fetchPromise('lms/MonHoc_GetByKhoiID', {
        NienKhoa: vueData.NienKhoa,
        KhoiID: this.KhoiID,
        HocKi: vueData.NienKhoaItem.HocKi,
      })
      this.DSMonHoc = res ?? []
    },
    async getHocSinh() {
      if (!this.KhoiID || !this.MonHocItem?.TemplateBangDiemID || !this.Semester) return
      const res = await fetchPromise('lms/HocSinhBangDiem_Get_By_KhoiID_MonHocID', {
        KhoiID: this.KhoiID,
        TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
        Semester: this.Semester,
        NienKhoa: vueData.NienKhoa,
      })
      this.DSCotDiem = res ?? []
      this.renderHocSinh()
    },
    async getThongKe() {
      if (!this.MonHocItem?.MonHocID) return
      const res = await fetchPromise('lms/ThongKeDiemTheoCap_MaCotDiem', {
        CapID: vueData.CapID,
        MonHocID: this.MonHocItem.MonHocID,
        MaCotDiem: this.MaCotDiem,
        HocKi: this.HocKi,
        NhomHocKi: this.Semester,
      })
      this.DataThongKe = res ?? []
      this.setThongKeHeaders()
    },
    onRefresh() {
      this.getHocSinh()
      this.getThongKe()
    },
    exportExcel() {
      const workbook = XLSX.utils.book_new()

      if (this.DataThongKe && this.DataThongKe.length > 0) {
        const thongKeHeaders = this.headers.map(x => x.title ?? x.value)
        const thongKeKeys = this.headers.map(x => x.value)
        const thongKeData = this.DataThongKe.map(item => thongKeKeys.map(key => item[key] ?? ''))
        const worksheetThongKe = XLSX.utils.aoa_to_sheet([thongKeHeaders, ...thongKeData])
        XLSX.utils.book_append_sheet(workbook, worksheetThongKe, 'ThongKeKhoi')
      }

      const detailHeaders = this.columns.map(x => x.title ?? x.name)
      const detailKeys = this.columns.map(x => x.name)
      const detailData = this.DSHocSinh.map(item => detailKeys.map(key => item[key] ?? ''))
      const worksheetDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData])
      XLSX.utils.book_append_sheet(workbook, worksheetDetail, 'BangDiemChiTiet')

      XLSX.writeFile(
        workbook,
        `Bang_Diem_Chi_Tiet_Khoi${this.KhoiID || ''}_${this.MonHocItem?.MonHocName || 'MonHoc'}.xlsx`
      )
    },
    renderHocSinh() {
      const uniqueHocSinhID = [...new Set((this.DSCotDiem ?? []).map(x => x.HocSinhID))]
      const dsHocSinh = []

      for (const hocSinhID of uniqueHocSinhID) {
        const hocSinh = this.DSCotDiem.find(x => x.HocSinhID === hocSinhID)
        if (!hocSinh) continue

        const obj = {
          SoDanhBo: hocSinh.SoDanhBo,
          HoTen: hocSinh.HoTen,
          HocSinhID: hocSinh.HocSinhID,
        }

        const arrDSCotDiemFilter = this.DSCotDiem.filter(x => x.HocSinhID === hocSinhID)
        for (const maCotDiem of arrDSCotDiemFilter) {
          obj[maCotDiem.MaCotDiem] = maCotDiem.KetQuaDanhGia_VI
        }
        dsHocSinh.push(obj)
      }

      const firstHocSinhID = uniqueHocSinhID[0]
      const arrDSCotDiemFirstStudent = firstHocSinhID
        ? this.DSCotDiem.filter(x => x.HocSinhID === firstHocSinhID)
        : []

      const columnThongTinHocSinh = [
        {
          type: 'text',
          title: 'Mã học sinh',
          name: 'HocSinhID',
          width: 100,
          backGroundColor: null,
          wrap: true,
          readOnly: true,
        },
        {
          type: 'text',
          title: 'Số Danh Bộ',
          name: 'SoDanhBo',
          width: 100,
          backGroundColor: null,
          wrap: true,
          readOnly: true,
        },
        {
          type: 'text',
          title: 'Họ tên học sinh',
          name: 'HoTen',
          width: 200,
          backGroundColor: null,
          wrap: true,
          align: 'left',
          readOnly: true,
        },
      ]

      const arrCotDiemWithAlignCenter = ['MucDoDanhGia']
      const listMonHoc = [5, 46, 76]

      const columnsCotDiem = arrDSCotDiemFirstStudent.map((x) => {
        const title = (listMonHoc.includes(this.MonHocItem?.MonHocID) ? x.TenHienThi_EN : x.TenHienThi_VI) || x.TenHienThi_VI || x.TenHienThi_EN || x.MaCotDiem

        if (x.GiaTriCotDiem === 'number') {
          return {
            type: 'numeric',
            title,
            name: x.MaCotDiem,
            typeValue: x.GiaTriCotDiem,
            autoWidth: true,
            decimal: '.',
            backGroundColor: x.HexBackground,
            width: x.WidthCSS,
            wrapText: true,
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'text') {
          return {
            type: 'text',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: arrCotDiemWithAlignCenter.some(item => x.MaCotDiem.includes(item)) ? 'center' : 'left',
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'ICO_Star') {
          return {
            type: 'html',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: 'center',
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'Dropdown_text') {
          return {
            type: 'dropdown',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: 'center',
            source: ['Done', 'Not Yet'],
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'Dropdown_THC') {
          return {
            type: 'dropdown',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: 'center',
            source: ['T', 'H', 'C'],
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'Dropdown_TDC') {
          return {
            type: 'dropdown',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: 'center',
            source: ['T', 'Đ', 'C'],
            readOnly: true,
          }
        }

        if (x.GiaTriCotDiem === 'Dropdown_CD_D') {
          return {
            type: 'dropdown',
            title,
            name: x.MaCotDiem,
            width: x.WidthCSS,
            typeValue: x.GiaTriCotDiem,
            backGroundColor: x.HexBackground,
            wrap: true,
            align: 'center',
            source: ['CĐ', 'Đ'],
            readOnly: true,
          }
        }

        return null
      }).filter(Boolean)

      this.freezeColumns = listMonHoc.includes(this.MonHocItem?.MonHocID) ? 4 : 3
      this.columns = [...columnThongTinHocSinh, ...columnsCotDiem]
      this.DSHocSinh = dsHocSinh
      this.keyComp += 1
    },
    setThongKeHeaders() {
      const rowFirst = this.DataThongKe.length > 0 ? this.DataThongKe[0] : null
      const isSaoType = !!rowFirst && (
        Object.prototype.hasOwnProperty.call(rowFirst, 'SaoDuoi3')
        || Object.prototype.hasOwnProperty.call(rowFirst, 'Sao3')
        || Object.prototype.hasOwnProperty.call(rowFirst, 'Sao4')
        || Object.prototype.hasOwnProperty.call(rowFirst, 'Sao5')
      )

      if (isSaoType) {
        this.headers = [
          { title: 'Giai đoạn', value: 'Semester' },
          { title: 'Khối', value: 'TenKhoiHoc' },
          { title: 'Tổng số học sinh', value: 'TongSoHocSinh', align: 'right' },
          { title: 'Sao < 3', value: 'SaoDuoi3', align: 'right' },
          { title: 'TL sao < 3', value: 'TiLeSaoDuoi3', align: 'right' },
          { title: 'Sao 3', value: 'Sao3', align: 'right' },
          { title: 'TL sao 3', value: 'TiLeSao3', align: 'right' },
          { title: 'Sao 4', value: 'Sao4', align: 'right' },
          { title: 'TL sao 4', value: 'TiLeSao4', align: 'right' },
          { title: 'Sao 5', value: 'Sao5', align: 'right' },
          { title: 'TL sao 5', value: 'TiLeSao5', align: 'right' },
        ]
        return
      }

      this.headers = [
        { title: 'Giai đoạn', value: 'Semester' },
        { title: 'Khối', value: 'TenKhoiHoc' },
        { title: 'Tổng số học sinh', value: 'TongSoHocSinh', align: 'right' },
        { title: '<5', value: 'DiemDuoi5', align: 'right' },
        { title: 'TL <5', value: 'TiLeDiemDuoi5', align: 'right' },
        { title: '5', value: 'Diem5', align: 'right' },
        { title: 'TL 5', value: 'TiLeDiem5', align: 'right' },
        { title: '6', value: 'Diem6', align: 'right' },
        { title: 'TL 6', value: 'TiLeDiem6', align: 'right' },
        { title: '7', value: 'Diem7', align: 'right' },
        { title: 'TL 7', value: 'TiLeDiem7', align: 'right' },
        { title: '8', value: 'Diem8', align: 'right' },
        { title: 'TL 8', value: 'TiLeDiem8', align: 'right' },
        { title: '9', value: 'Diem9', align: 'right' },
        { title: 'TL 9', value: 'TiLeDiem9', align: 'right' },
        { title: '10', value: 'Diem10', align: 'right' },
        { title: 'TL 10', value: 'TiLeDiem10', align: 'right' },
      ]
    },
  },
	}
</script>