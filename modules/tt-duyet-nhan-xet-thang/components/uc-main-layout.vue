<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-title>
          {{ TitlePage }} • {{ TitleCap }}
          <v-chip color="primary" variant="text" class="font-weight-medium ml-2">
            Tổng số học sinh: {{ items.length }}
          </v-chip>
          <v-spacer />
          <v-btn v-if="vueData.user?.UserID === 'NA0000022' && ThangObj" color="primary" variant="outlined"
            @click="isOpenReport = true">
            Xem báo cáo nhận xét tháng {{ ThangObj.Thang }}
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="4" md="3">
              <v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop" item-value="LopID" />
            </v-col>

            <v-col cols="12" sm="4" md="3">
              <v-select v-model="ThangObj" label="Chọn tháng" :items="DSThang" item-title="Thang_HienThi"
                item-value="Lop_NhanXetThangID" return-object>
                <template #item="{ props, item }">
                  <uc-item-thang v-bind="props" :item="item" />
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" sm="4" md="3" class="d-flex align-center ga-2 flex-wrap">
              <v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" @click="onRefresh">
                Làm mới
              </v-btn>
            </v-col>

            <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap ga-2">
              <div class="d-flex flex-column">
                <div v-if="ThangObj?.ReasonReject && ThangObj?.TinhTrang === 3">
                  Lý do từ chối: <span class="text-red">{{ ThangObj?.ReasonReject }}</span>
                </div>
              </div>

              <div class="d-flex ga-2 flex-wrap">
                <v-btn v-if="ThangObj?.TinhTrang === 2" :disabled="items.length === 0" color="error" variant="outlined"
                  @click="IsShowDialogReject = true">
                  Từ chối
                </v-btn>

                <v-btn v-if="ThangObj?.TinhTrang === 2" :disabled="items.length === 0" color="primary"
                  variant="outlined" @click="onApprove">
                  Duyệt
                </v-btn>

                <v-btn v-if="ThangObj?.TinhTrang === 2" :disabled="items.length === 0" color="primary"
                  variant="outlined" @click="onOpenApproveAll">
                  Duyệt tất cả lớp
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <div style="overflow-x: auto;">
      <GlobalDataTable :headers="headers" :items="items" items-per-page="-1" hide-default-footer hover
        :auto-table-height="{ offset: 8 }" style="min-width: 1200px;">
        <template #item.hocSinh="{ item }">
          <uc-info-student :item="item" />
        </template>

        <template #item.gvcn_extra="{ item }">
          <div class="d-flex ga-2 flex-column pa-2">
            <v-select v-model="item.PhoiHopCMHS" label="Phối hợp CMHS" :items="['Tốt', 'Đạt', 'Không đạt']"
              placeholder="Chọn" />

            <template v-if="!isKhoiCanLoai">
              <v-select v-model="item.PhanLoai_TuyenThang" :items="['Tuyển thẳng', 'Tuyển thẳng có cam kết']"
                label="Phân loại tuyển thẳng" />
              <v-text-field v-model="item.Flyers" label="Flyers" />
              <v-text-field v-model="item.DiemTA" label="Điểm Tiếng Anh" />
              <v-checkbox v-model="item.DKHocTiep" label="Đăng ký học tiếp" />
              <v-textarea v-model="item.DeXuat_NDCamKet" label="Đề xuất / ND cam kết" :hide-details="false" />
            </template>
          </div>
        </template>

        <template #item.NhanXetGVCN_VePhuHuynh_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'NhanXetGVCN_VePhuHuynh_HTML' + item.HocSinhID"
              v-model="item.NhanXetGVCN_VePhuHuynh_HTML" :spellcheck="false" style="height: 110px;" />
          </div>
        </template>

        <template #item.NhanXetGVCN_VeHocSinh_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'NhanXetGVCN_VeHocSinh_HTML' + item.HocSinhID"
              v-model="item.NhanXetGVCN_VeHocSinh_HTML" :spellcheck="false" style="height: 110px;" />
          </div>
        </template>

        <template #item.NhanXetToan_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'NhanXetToan_HTML' + item.HocSinhID" v-model="item.NhanXetToan_HTML"
              :spellcheck="false" :readOnly="true" style="height: 110px;" />
            <v-text-field class="mt-2" v-model="item.DiemToan" placeholder="Nhập điểm..."
              messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm" reverse solo />
          </div>
        </template>

        <template #item.NhanXetTiengViet_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'NhanXetTiengViet_HTML' + item.HocSinhID" v-model="item.NhanXetTiengViet_HTML"
              :spellcheck="false" :readOnly="true" style="height: 110px;" />
            <v-text-field class="mt-2" v-model="item.DiemTiengViet" placeholder="Nhập điểm..."
              messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm" reverse solo />
          </div>
        </template>

        <template #item.NhanXetMonHocKhac_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'NhanXetMonHocKhac_HTML' + item.HocSinhID" v-model="item.NhanXetMonHocKhac_HTML"
              :spellcheck="false" :readOnly="true" style="height: 110px;" />
          </div>
        </template>

        <template #item.HoatDongGiaoDucKhac_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'HoatDongGiaoDucKhac_HTML' + item.HocSinhID" v-model="item.HoatDongGiaoDucKhac_HTML"
              :spellcheck="false" :readOnly="true" style="height: 110px;" />
          </div>
        </template>

        <template #item.PhamChatNangLuc_HTML="{ item }">
          <div style="padding: 10px; max-width: 340px;">
            <uc-quill-editor :key="'PhamChatNangLuc_HTML' + item.HocSinhID" v-model="item.PhamChatNangLuc_HTML"
              :spellcheck="false" :readOnly="true" style="height: 110px;" />
          </div>
        </template>

        <template #item.NhanXetCap1Mobile="{ item }">
          <div style="padding: 10px; max-width: 350px;" class="d-flex flex-column ga-2">
            <div>
              <b class="text-left">Nhận xét môn Toán</b>
              <div class="compact-comment" v-html="formatComment(item.NhanXetToan_HTML)"></div>
              <div class="mt-1 text-body-2">Điểm Toán: {{ item.DiemToan ?? '-' }}</div>
            </div>

            <div>
              <b class="text-left">Nhận xét môn Tiếng Việt</b>
              <div class="compact-comment" v-html="formatComment(item.NhanXetTiengViet_HTML)"></div>
              <div class="mt-1 text-body-2">Điểm Tiếng Việt: {{ item.DiemTiengViet ?? '-' }}</div>
            </div>

            <div>
              <b class="text-left">Nhận xét môn học khác</b>
              <div class="compact-comment" v-html="formatComment(item.NhanXetMonHocKhac_HTML)"></div>
            </div>

            <div>
              <b class="text-left">Hoạt động giáo dục khác</b>
              <div class="compact-comment" v-html="formatComment(item.HoatDongGiaoDucKhac_HTML)"></div>
            </div>

            <div>
              <b class="text-left">Phẩm chất - Năng lực</b>
              <div class="compact-comment" v-html="formatComment(item.PhamChatNangLuc_HTML)"></div>
            </div>
          </div>
        </template>

        <template #item.NgayNghi="{ item }">
          <div class="d-flex ga-2 flex-column" style="padding: 8px; min-width: 220px;">
            <div class="d-flex justify-space-between">
              <p v-if="item.NgayNghi?.TongSoTiet > 0" class="text-left font-weight-medium">
                Tổng số tiết: {{ item.NgayNghi?.TongSoTiet }}
              </p>
              <v-btn v-if="item.NgayNghi?.TongSoTiet > 0" icon="mdi-eye" size="small" variant="text" color="primary"
                :title="'Xem báo nghỉ chi tiết học sinh - ' + item.HoTen"
                :href="'/gv-xem-vang-tre-nghi-phep?hocsinhid=' + item.HocSinhID + '&lopid=' + item.LopID + '&ngaybatdau=' + item.firstDay + '&ngayketthuc=' + item.lastDay"
                target="_blank" />
            </div>

            <v-chip v-for="mon in item.NgayNghi?.MonVang" :key="mon.TenMonHoc" color="orange" size="small"
              style="width: fit-content;">
              {{ mon.TenMonHoc }}
            </v-chip>

            <div v-if="item.LoaiViPham_Group?.length > 0">
              <v-divider class="mt-2" />
              <p class="text-left font-weight-medium">Loại vi phạm</p>
              <div v-for="lvp in item.LoaiViPham_Group" :key="lvp.LoaiViPham">
                <div class="text-left text-body-2">• {{ lvp.TenViPham }}</div>
                <div v-for="ngayVP in lvp.Ngay" :key="ngayVP.Ngay" class="text-body-2 text-left">
                  <p>Ngày: {{ ngayVP.Ngay }}</p>
                  <div v-for="ngay in ngayVP.DSNgay" :key="ngay.Buoi" class="ml-2">
                    <p>{{ ngay.Buoi }}</p>
                    <v-chip v-for="buoi in ngay.DS" :key="buoi.Tiet + '_' + buoi.TenMonHoc" class="mt-1" size="small"
                      color="orange">
                      Tiết: {{ buoi.Tiet }} - {{ buoi.TenMonHoc }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #item.UuDiem="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.UuDiem)"></div>
          </div>
        </template>

        <template #item.NhuocDiem="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.NhuocDiem)"></div>
          </div>
        </template>

        <template #item.DeXuat="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.DeXuat)"></div>
          </div>
        </template>

        <template #item.NoiDungKienThuc_HTML="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.NoiDungKienThuc_HTML)"></div>
          </div>
        </template>

        <template #item.NoiDungNangLuc_HTML="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.NoiDungNangLuc_HTML)"></div>
          </div>
        </template>

        <template #item.NoiDungHoatDongKhac_HTML="{ item }">
          <div style="padding: 10px; max-width: 360px;">
            <div class="compact-comment" v-html="formatComment(item.NoiDungHoatDongKhac_HTML)"></div>
          </div>
        </template>

        <template #item.NhanXetCap23Mobile="{ item }">
          <div style="padding: 10px; max-width: 350px;" class="d-flex flex-column ga-2">
            <template v-if="isCuoiKi">
              <div>
                <b class="text-left">Ưu điểm</b>
                <div class="compact-comment" v-html="formatComment(item.UuDiem)"></div>
              </div>
              <div>
                <b class="text-left">Nhược điểm</b>
                <div class="compact-comment" v-html="formatComment(item.NhuocDiem)"></div>
              </div>
              <div>
                <b class="text-left">Đề xuất</b>
                <div class="compact-comment" v-html="formatComment(item.DeXuat)"></div>
              </div>
            </template>

            <template v-else>
              <div>
                <b class="text-left">Về học tập</b>
                <div class="compact-comment" v-html="formatComment(item.NoiDungKienThuc_HTML)"></div>
              </div>
              <div>
                <b class="text-left">Về nền nếp</b>
                <div class="compact-comment" v-html="formatComment(item.NoiDungNangLuc_HTML)"></div>
              </div>
              <div>
                <b class="text-left">Mong muốn phối hợp</b>
                <div class="compact-comment" v-html="formatComment(item.NoiDungHoatDongKhac_HTML)"></div>
              </div>
            </template>
          </div>
        </template>

        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
            <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
            <p class="text-body-2">Chọn lớp để xem dữ liệu</p>
          </div>
        </template>
      </GlobalDataTable>
    </div>

    <uc-dialog v-model="IsShowDialogReject" title="Lý do từ chối" doneText="Xác nhận" @onSubmit="onReject">
      <v-textarea v-model="ReasonReject" placeholder="Nhập lý do từ chối..." />
    </uc-dialog>

    <v-dialog v-model="isOpenReport" max-width="800">
      <uc-bc-tinh-trang-nxt-lop
        v-if="isOpenReport"
        :ThangObj="ThangObj"
        :CapID="CapID"
        @close="isOpenReport = false"
        @select-lop="onSelectLop"
      />
    </v-dialog>

    <uc-dialog-duyet-all :DSLop="DSLop" :ThangObj="ThangObj" @done="onDuyetAllDone" />
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef'],
  data() {
    return {
      vueData,
      CapID: null,
      DSLop: [],
      DSThang: [],
      LopID: null,
      ThangObj: null,
      items: [],
      headers: [],
      ReasonReject: '',
      IsShowDialogReject: false,
      TinhTrang: false,
      isOpenReport: false,
      firstDay: null,
      lastDay: null,
    }
  },
  computed: {
    TitleCap() {
      return renderText(parseInt(this.CapID))
    },
    TitlePage() {
      return getTitlePageByURL(window.location.pathname + window.location.search)
    },
    isLowScreen() {
      if (this.$vuetify?.display) return this.$vuetify.display.lgAndDown
      return window.innerWidth < 1366
    },
    isKhoiCanLoai() {
      const DSKhoi_CanLoai = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]
      const lop = this.DSLop.find(x => x.LopID === this.LopID)
      return DSKhoi_CanLoai.includes(lop?.KhoiID)
    },
    isCuoiKi() {
      return [12, 5].includes(this.ThangObj?.Thang)
    },
  },
  watch: {
    'vueData.NienKhoa'(v) {
      if (v !== null) {
        this.getDSLop()
        this.LopID = null
        this.ThangObj = null
        this.items = []
      }
    },
    LopID(v) {
      if (v !== null) {
        this.ThangObj = null
        this.items = []
        this.getDSThang()
        // localStorage.setItem('LopID_C' + this.CapID + '_NXT', v)
      }
    },
    ThangObj(v) {
      if (v !== null) {
        const result = fn_IsDisabledTinhTrangDiem({ TinhTrang: v?.TinhTrang, type: 'TT' })
        const { isDisabled } = result || {}
        this.TinhTrang = isDisabled ?? false
        this.getItems()
        localStorage.setItem('Thang_C' + this.CapID + '_NXT', JSON.stringify(v))
        const { firstDay, lastDay } = this.getFirstAndLastDay(v.Nam, v.Thang)
        this.firstDay = firstDay
        this.lastDay = lastDay
        this.headers = this.renderHeader()
      }
    },
    isLowScreen() {
      this.headers = this.renderHeader()
    },
  },
  mounted() {
    this.CapID = parseInt(vueData.CapID || capid)
    this.restoreFilter()
    this.getDSLop()
  },
  methods: {
    restoreFilter() {
      const LopIDSaved = localStorage.getItem('LopID_C' + this.CapID + '_NXT')
      if (LopIDSaved) this.LopID = parseInt(LopIDSaved)
    },
    async getDSLop() {
      this.DSLop = await fetchPromise('lms/Lop_Get_By_CapID', {
        NienKhoa: vueData.NienKhoa,
        CapID: this.CapID,
      })
    },
    async getDSThang() {
      this.DSThang = await fetchPromise('lms/NhanXetThang_Lop_Get', {
        NienKhoa: vueData.NienKhoa,
        LopID: this.LopID,
      })
      this.ThangObj = this.DSThang.length > 0 ? this.DSThang[0] : null
    },
    async getItems() {
      this.items = await fetchPromise('lms/NhanXetThang_Get', {
        Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
        LopID: this.LopID,
      })
      await this.convertItems()
      this.headers = this.renderHeader()
    },
    onRefresh() {
      if (!this.ThangObj || !this.LopID) return
      this.getItems()
    },
    async onApprove() {
      const ok = await confirm({ title: 'Xác nhận Duyệt' })
      if (!ok) return
      await fetchPromise('lms/NhanXetThang_Upd_TinhTrang', {
        TinhTrang: 4,
        Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
      }, { cache: false })
      this.snackbarRef.value.showSnackbar({ message: 'Duyệt thành công', color: 'success' })
      await this.getDSThang()
      await this.getItems()
      const result = fn_IsDisabledTinhTrangDiem({ TinhTrang: this.ThangObj?.TinhTrang, type: 'TT' })
      const { isDisabled } = result || {}
      this.TinhTrang = isDisabled ?? false
      this.callAPIPushME()
    },
    onOpenApproveAll() {
      if (vueData.user?.UserID === 'NA0000022') {
        vueData.IsShowDialogDuyetAll = true
      }
    },
    async onDuyetAllDone() {
      await this.getDSThang()
      await this.getItems()
    },
    onSelectLop(lopid) {
      this.LopID = lopid
    },
    async onReject() {
      const ok = await confirm({ title: 'Bạn có muốn từ chối nhận xét tháng' })
      if (!ok) return
      await fetchPromise('lms/NhanXetThang_Upd_TinhTrang', {
        TinhTrang: 3,
        ReasonReject: this.ReasonReject,
        Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
      }, { cache: false })
      this.snackbarRef.value.showSnackbar({ message: 'Từ chối thành công', color: 'success' })
      await this.getDSThang()
      await this.getItems()
      this.IsShowDialogReject = false
    },
    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    formatComment(value) {
      if (value === null || value === undefined) return '<span class="text-medium-emphasis">-</span>'
      const raw = String(value).trim()
      if (!raw) return '<span class="text-medium-emphasis">-</span>'

      if (/<[a-z][\s\S]*>/i.test(raw)) {
        const div = document.createElement('div')
        div.innerHTML = raw
        const text = (div.innerText || div.textContent || '').trim()
        if (!text) return '<span class="text-medium-emphasis">-</span>'
        return this.escapeHtml(text).replace(/\n/g, '<br/>')
      }

      return this.escapeHtml(raw).replace(/\n/g, '<br/>')
    },
    renderHeader() {
      const columns = [
        {
          key: 'hocSinh',
          title: 'Học sinh',
          minWidth: 190,
          width: 190,
          align: 'center',
          sortable: false,
        },
      ]

      if (!this.ThangObj?.Is_HienThiPhuHuynh) {
        columns.push({ key: 'gvcn_extra', title: '', width: 320, sortable: false })
        columns.push({ key: 'NhanXetGVCN_VePhuHuynh_HTML', title: 'Nhận xét về Phụ huynh', width: 340, sortable: false })
        columns.push({ key: 'NhanXetGVCN_VeHocSinh_HTML', title: 'Nhận xét về Học sinh', width: 340, sortable: false })
      }

      if (this.CapID === 1 && this.ThangObj?.Is_HienThiPhuHuynh) {
        if (this.isLowScreen) {
          columns.push({ key: 'NhanXetCap1Mobile', title: 'Nhận xét', width: 360, sortable: false })
        } else {
          columns.push({ key: 'NhanXetToan_HTML', title: 'Nhận xét môn Toán', width: 340, sortable: false })
          columns.push({ key: 'NhanXetTiengViet_HTML', title: 'Nhận xét môn Tiếng Việt', width: 340, sortable: false })
          columns.push({ key: 'NhanXetMonHocKhac_HTML', title: 'Nhận xét môn học khác', width: 340, sortable: false })
          columns.push({ key: 'HoatDongGiaoDucKhac_HTML', title: 'Hoạt động giáo dục khác', width: 340, sortable: false })
          columns.push({ key: 'PhamChatNangLuc_HTML', title: 'Phẩm chất - Năng lực', width: 340, sortable: false })
        }
      }

      if ((this.CapID === 2 || this.CapID === 3) && this.ThangObj?.Is_HienThiPhuHuynh) {
        if (this.isLowScreen) {
          columns.push({ key: 'NhanXetCap23Mobile', title: 'Nhận xét', width: 360, sortable: false })
        } else {
          if (this.isCuoiKi) {
            columns.push({ key: 'UuDiem', title: 'Ưu điểm', width: 360, sortable: false })
            columns.push({ key: 'NhuocDiem', title: 'Nhược điểm', width: 360, sortable: false })
            columns.push({ key: 'DeXuat', title: 'Đề xuất', width: 360, sortable: false })
          } else {
            columns.push({ key: 'NoiDungKienThuc_HTML', title: 'Về học tập', width: 360, sortable: false })
            columns.push({ key: 'NoiDungNangLuc_HTML', title: 'Về nền nếp', width: 360, sortable: false })
            columns.push({ key: 'NoiDungHoatDongKhac_HTML', title: 'Mong muốn phối hợp', width: 360, sortable: false })
          }
        }
      }

      return columns
    },

    getFirstAndLastDay(year, month) {
      const firstDay = dayjs(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD')
      const lastDay = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
      return { firstDay, lastDay }
    },

    async convertItems() {
      function convertNewLineToP(text) {
        if (!text) return ''
        return text.split(/\n+/).map(line => `<p>${line}</p>`).join('')
      }
      this.items = this.items.map(x => {
        const existDSTreVang = vueData.DSChuyenCan_TreVang?.find(n => n.HocSinhID === x.HocSinhID)
        x.NgayNghi = {
          MonVang: existDSTreVang ? JSON.parse(existDSTreVang.MonVang) : [],
          TongSoTiet: existDSTreVang?.TongSoTiet || null,
        }
        x.firstDay = this.firstDay
        x.lastDay = this.lastDay
        x.LopID = this.LopID
        let text = ''
        if ([12, 5].includes(this.ThangObj.Thang)) {
          text = (
            (x.UuDiem ? ('<b>Ưu điểm: </b>' + convertNewLineToP(x.UuDiem) + '<br/>') : '<b>Ưu điểm: - </b><br/>')
            + (x.NhuocDiem ? ('<b>Nhược điểm: </b>' + convertNewLineToP(x.NhuocDiem) + '<br/>') : '<b>Nhược điểm: - </b><br/>')
            + (x.DeXuat ? ('<b>Đề xuất: </b>' + convertNewLineToP(x.DeXuat) + '<br/>') : '<b>Đề xuất: - </b><br/>')
          )
        } else {
          text = (
            (x.NoiDungKienThuc_HTML ? ('<b>Học tập: </b>' + convertNewLineToP(x.NoiDungKienThuc_HTML) + '<br/>') : '<b>Học tập: - </b><br/>')
            + (x.NoiDungNangLuc_HTML ? ('<b>Nền nếp: </b>' + convertNewLineToP(x.NoiDungNangLuc_HTML) + '<br/>') : '<b>Nền nếp: - </b><br/>')
            + (x.NoiDungHoatDongKhac_HTML ? ('<b>Mong muốn phối hợp: </b>' + convertNewLineToP(x.NoiDungHoatDongKhac_HTML) + '<br/>') : '<b>Mong muốn phối hợp: - </b><br/>')
          )
        }
        x.RenderNhanXet = text
        return x
      })
    },

    processDataBeforePostAPI() {
      // Deprecated: no longer needed after vueData cleanup
    },

    async callAPIPushME() {
      const capID = parseInt(this.CapID)
      for (const item of this.items) {
        const plainText = buildPushMEText(item, capID, vueData.NienKhoa, this.ThangObj)
        if (!plainText) continue
        const isSend = await ajaxCALLPromise('student/LMS_SendMessageToME', {
          HocSinhID: item.HocSinhID,
          NoiDung: plainText,
        })
        if (isSend) Vue.$toast.success(`Đẩy ${item.HocSinhID} - ${item.HoTen} dữ liệu tháng sang ME`, { position: 'top' })
      }
    },
  },
}
</script>
