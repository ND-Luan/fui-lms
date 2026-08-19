<template>
	<Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }}</v-card-title>
      </v-card>
    </template>

    <v-divider />

    <div class="pa-6 d-flex flex-column ga-6" style="max-width: 720px;">

      <!-- 1. Cập nhật Giáo viên -->
      <v-card variant="outlined">
        <v-card-title class="text-body-1 font-weight-bold">
          <v-icon start color="primary">mdi-account-sync</v-icon>
          1. Cập nhật danh sách Giáo viên
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          Lấy danh sách giáo viên từ Edubot và cập nhật vào hệ thống.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn color="primary" :loading="loadingGV" @click="onUpdateGiaoVien" prepend-icon="mdi-download">
            Cập nhật Giáo viên
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- 2. Đồng bộ Lớp học -->
      <v-card variant="outlined">
        <v-card-title class="text-body-1 font-weight-bold">
          <v-icon start color="success">mdi-school-outline</v-icon>
          2. Đồng bộ danh sách Lớp học từ Edubot
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          Bước 1: Lấy dữ liệu lớp từ Edubot. Bước 2: Đồng bộ vào database hệ thống.
          <div v-if="lopFetchedCount !== null" class="mt-2">
            <v-chip size="small" color="success" variant="tonal">
              <v-icon start>mdi-check-circle</v-icon>
              Đã lấy {{ lopFetchedCount }} lớp — sẵn sàng đồng bộ
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4 ga-2 flex-wrap">
          <v-btn color="primary" variant="tonal" :loading="loadingFetchLop"
            :disabled="loadingFetchLop || loadingSyncLop" @click="onFetchLop" prepend-icon="mdi-download">
            Lấy dữ liệu lớp
          </v-btn>
          <v-btn color="success" :loading="loadingSyncLop"
            :disabled="loadingFetchLop || loadingSyncLop || lopFetchedCount === null" @click="onSyncLop"
            prepend-icon="mdi-sync">
            Đồng bộ vào DB
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- 3. Đồng bộ học sinh - lớp theo nhiều niên khóa -->
      <v-card variant="outlined">
        <v-card-title class="text-body-1 font-weight-bold">
          <v-icon start color="info">mdi-account-school-outline</v-icon>
          3. Đồng bộ dữ liệu Học sinh - Lớp
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          Lấy dữ liệu theo đúng giai đoạn của niên khóa chọn: lớp chủ nhiệm đầu năm, lớp tổ hợp sau khi phân tổ hợp.
          <v-select
            v-model="selectedNienKhoa"
            class="mt-3"
            density="compact"
            variant="outlined"
            label="Niên khóa cần đồng bộ"
            :items="nienKhoaItems"
            item-title="label"
            item-value="NienKhoa"
            :loading="loadingNienKhoa"
            :disabled="loadingNienKhoa || loadingSyncHocSinhLop"
            hide-details
          />
          <div v-if="hocSinhLopSyncSummary" class="mt-2">
            <v-chip size="small" color="info" variant="tonal">
              <v-icon start>mdi-check-circle</v-icon>
              {{ hocSinhLopSyncSummary }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn color="info" :loading="loadingSyncHocSinhLop"
            :disabled="loadingGV || loadingFetchLop || loadingSyncLop || loadingSyncHocSinhLop || !selectedNienKhoa"
            @click="onSyncHocSinhLop" prepend-icon="mdi-sync">
            Đồng bộ học sinh-lớp {{ selectedNienKhoa ? `năm ${selectedNienKhoa}–${Number(selectedNienKhoa) + 1}` : '' }}
          </v-btn>
        </v-card-actions>
      </v-card>

    </div>
  </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef'],
  data() {
    return {
      vueData,
      // Giáo viên
      loadingGV: false,
      // Lớp học
      loadingFetchLop: false,
      loadingSyncLop: false,
      lopFetchedCount: null,
      _cachedLopData: null,
      loadingNienKhoa: false,
      nienKhoaItems: [],
      selectedNienKhoa: null,
      loadingSyncHocSinhLop: false,
      hocSinhLopSyncSummary: null,
    }
  },
  computed: {
    TitlePage() {
      return typeof getTitlePageByURL === 'function'
        ? getTitlePageByURL(window.location.pathname + window.location.search)
        : 'Cài đặt mặc định'
    },
  },
  mounted() {
    this.loadNienKhoa()
  },
  methods: {
    showSnackbar(message, color = 'success') {
      this.snackbarRef?.value?.showSnackbar({ message, color })
    },

    async loadNienKhoa() {
      this.loadingNienKhoa = true
      try {
        const data = await this._ajaxPromise('lms/NienKhoa_Get')
        this.nienKhoaItems = [...new Map((Array.isArray(data) ? data : [])
          .map(item => [item.NienKhoa, {
            ...item,
            label: `${item.NienKhoa} - ${Number(item.NienKhoa) + 1}`,
          }]))
          .values()]
        this.selectedNienKhoa = this.nienKhoaItems.find(item => item.IsActive)?.NienKhoa
          ?? Number(vueData.NienKhoa)
          ?? this.nienKhoaItems[0]?.NienKhoa
          ?? null
      } catch (err) {
        console.error('loadNienKhoa', err)
        this.nienKhoaItems = []
        this.selectedNienKhoa = Number(vueData.NienKhoa) || null
        this.showSnackbar('Không lấy được danh sách niên khóa', 'warning')
      } finally {
        this.loadingNienKhoa = false
      }
    },

    // ── 1. Giáo viên ────────────────────────────────────────────────────────
    async onUpdateGiaoVien() {
      this.loadingGV = true
      try {
        const GiaoVienObjArr = await this._ajaxPromise('student/Edubot_GetGiaoVien')
        await this._ajaxPromise('lms/IO_IN_GiaoVien_Ins', { GiaoVienObjArr })
        this.showSnackbar('Cập nhật giáo viên thành công')
      } catch (err) {
        console.error('onUpdateGiaoVien', err)
        this.showSnackbar('Cập nhật giáo viên thất bại', 'error')
      } finally {
        this.loadingGV = false
      }
    },

    // ── 2. Lớp học (port từ fui-sync) ───────────────────────────────────────
    async onFetchLop() {
      this.loadingFetchLop = true
      this._cachedLopData = null
      this.lopFetchedCount = null
      try {
        const fetchLop = url => new Promise((resolve, reject) => {
          ajaxCALL(url, null, res => resolve(Array.isArray(res?.data) ? res.data : []), reject)
        })

        const [lopChuNhiem, lopLMS] = await Promise.all([
          fetchLop(`student/LMS_GetLopChuNhiem?NamHoc=${vueData.NienKhoa}`),
          fetchLop(`student/LMS_GetLop?NamHoc=${vueData.NienKhoa}`),
        ])

        const isCap3 = lop => Number(lop?.KhoiID) >= 10
        const isLopToHop = lop => {
          const tenLop = String(lop?.TenLop ?? '').trim()
          const kyTuCuoi = tenLop.slice(-1)
          return tenLop.length > 3 && Number.isInteger(Number(kyTuCuoi)) && Number(kyTuCuoi) > 0
        }
        const lmsLopIDs = new Set(lopLMS.map(lop => String(lop.LopID)))

        // Cấp 1–2 dùng các lớp có LopID chung giữa hai nguồn.
        const lopCap12 = lopChuNhiem
          .filter(lop => !isCap3(lop) && lmsLopIDs.has(String(lop.LopID)))
          .map(lop => ({ ...lop, IsLopToHop: false }))
        const lopLMSCap3 = lopLMS.filter(isCap3)
        const hasLopToHopCap3 = lopLMSCap3.some(isLopToHop)

        // Khi Edubot đã có lớp tổ hợp, lấy toàn bộ cấp 3 từ LMS_GetLop.
        // Nếu chưa có tổ hợp thì giữ danh sách lớp chủ nhiệm hiện tại.
        const lopCap3 = hasLopToHopCap3
          ? lopLMSCap3.map(lop => ({ ...lop, IsLopToHop: true }))
          : lopChuNhiem.filter(isCap3).map(lop => ({ ...lop, IsLopToHop: false }))
        const data = [...lopCap12, ...lopCap3]

        this._cachedLopData = data
        this.lopFetchedCount = Array.isArray(data) ? data.length : 0
        this.showSnackbar(
          `Đã lấy ${this.lopFetchedCount} lớp từ Edubot${hasLopToHopCap3 ? ' (cấp 3 theo tổ hợp)' : ''}`
        )
      } catch (err) {
        console.error('onFetchLop', err)
        this.showSnackbar('Lấy dữ liệu lớp thất bại', 'error')
      } finally {
        this.loadingFetchLop = false
      }
    },

    async onSyncLop() {
      if (!this._cachedLopData) {
        this.showSnackbar('Vui lòng lấy dữ liệu lớp trước khi đồng bộ', 'warning')
        return
      }
      this.loadingSyncLop = true
      this.loadingFetchLop = true
      try {
        await new Promise((resolve, reject) => {
          ajaxCALL(
            '/lms/DongBo_Lop_From_Edubot',
            { HocSinhJSON: JSON.stringify(this._cachedLopData) },
            res => resolve(res.data),
            err => reject(err)
          )
        })
        this.showSnackbar('Đồng bộ lớp học thành công')
      } catch (err) {
        console.error('onSyncLop', err)
        this.showSnackbar('Đồng bộ lớp học thất bại', 'error')
      } finally {
        this.loadingSyncLop = false
        this.loadingFetchLop = false
      }
    },

    async onSyncHocSinhLop() {
      if (this.loadingSyncHocSinhLop) return
      this.loadingSyncHocSinhLop = true
      this.hocSinhLopSyncSummary = null
      try {
        const namHoc = Number(this.selectedNienKhoa)
        if (!namHoc) {
          this.showSnackbar('Vui lòng chọn niên khóa cần đồng bộ', 'warning')
          return
        }
        let tongSoHocSinhLop = 0
        let tongSoNienKhoa = 0

        {
          const [dsLopChuNhiem, dsLopLMS] = await Promise.all([
            this._ajaxPromise('student/LMS_GetLopChuNhiem?NamHoc=' + namHoc),
            this._ajaxPromise('student/LMS_GetLop?NamHoc=' + namHoc),
          ])
          const lopMau = Array.isArray(dsLopLMS) && dsLopLMS.length ? dsLopLMS[0].LopID : null
          if (lopMau === null || lopMau === undefined) return

          const isCap3 = lop => Number(lop?.KhoiID) >= 10
          const isLopToHop = lop => {
            const tenLop = String(lop?.TenLop ?? '').trim()
            const kyTuCuoi = tenLop.slice(-1)
            return tenLop.length > 3 && Number.isInteger(Number(kyTuCuoi)) && Number(kyTuCuoi) > 0
          }
          const hasLopToHopCap3 = dsLopLMS
            .filter(isCap3)
            .some(isLopToHop)
          const lopChuNhiemIDs = new Set(dsLopChuNhiem.map(lop => String(lop.LopID)))
          const lopLMSCap3IDs = new Set(
            dsLopLMS.filter(isCap3).map(lop => String(lop.LopID))
          )

          const [dsHocSinhLopChuNhiem, dsHocSinhLopLMS] = await Promise.all([
            this._ajaxPromise('student/LMS_GetHocSinhLopChuNhiem', { NienKhoa: namHoc }),
            hasLopToHopCap3
              ? this._ajaxPromise('student/LMS_GetHocSinhLop', {
                  LopID: String(lopMau),
                  NienKhoa: namHoc,
                })
              : Promise.resolve([]),
          ])
          const rowsChuNhiem = Array.isArray(dsHocSinhLopChuNhiem)
            ? dsHocSinhLopChuNhiem.filter(row => lopChuNhiemIDs.has(String(row.LopID)))
            : []
          const rowsLMS = Array.isArray(dsHocSinhLopLMS)
            ? dsHocSinhLopLMS.filter(row => lopLMSCap3IDs.has(String(row.LopID)))
            : []
          const rows = (hasLopToHopCap3 ? rowsChuNhiem.filter(row => {
            const lop = dsLopChuNhiem.find(item => String(item.LopID) === String(row.LopID))
            return !isCap3(lop)
            }) : rowsChuNhiem).concat(hasLopToHopCap3 ? rowsLMS : [])
            .map(row => ({ ...row, Enable: true }))

          for (let i = 0; i < rows.length; i += 500) {
            await this._ajaxPromise('lms/IO_IN_HocSinhLop_Ins', {
              HocSinhLopObjArr: rows.slice(i, i + 500),
            })
          }

          tongSoHocSinhLop += rows.length
          tongSoNienKhoa += 1
        }

        this.hocSinhLopSyncSummary =
          'Đã đồng bộ ' + tongSoHocSinhLop + ' dòng học sinh-lớp / ' + tongSoNienKhoa + ' niên khóa'
        this.showSnackbar('Đồng bộ dữ liệu học sinh-lớp thành công')
      } catch (err) {
        console.error('onSyncHocSinhLop', err)
        this.showSnackbar('Đồng bộ dữ liệu học sinh-lớp thất bại', 'error')
      } finally {
        this.loadingSyncHocSinhLop = false
      }
    },

    // ── Helper ──────────────────────────────────────────────────────────────
    _ajaxPromise(url, params = null) {
      return new Promise((resolve, reject) => {
        ajaxCALL(url, params, res => resolve(res.data), err => reject(err))
      })
    },
  },
	}
</script>