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
            :disabled="loadingFetchLop || loadingSyncLop"
            @click="onFetchLop" prepend-icon="mdi-download">
            Lấy dữ liệu lớp
          </v-btn>
          <v-btn color="success" :loading="loadingSyncLop"
            :disabled="loadingFetchLop || loadingSyncLop || lopFetchedCount === null"
            @click="onSyncLop" prepend-icon="mdi-sync">
            Đồng bộ vào DB
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
    }
  },
  computed: {
    TitlePage() {
      return typeof getTitlePageByURL === 'function'
        ? getTitlePageByURL(window.location.pathname + window.location.search)
        : 'Cài đặt mặc định'
    },
  },
  methods: {
    showSnackbar(message, color = 'success') {
      this.snackbarRef?.value?.showSnackbar({ message, color })
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
        const data = await new Promise((resolve, reject) => {
          ajaxCALL(`student/LMS_GetLopChuNhiem?NamHoc=${vueData.NienKhoa}`,
            null,
            res => resolve(res.data),
            err => reject(err)
          )
        })
        this._cachedLopData = data
        this.lopFetchedCount = Array.isArray(data) ? data.length : 0
        this.showSnackbar(`Đã lấy ${this.lopFetchedCount} lớp từ Edubot`)
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

    // ── Helper ──────────────────────────────────────────────────────────────
    _ajaxPromise(url, params = null) {
      return new Promise((resolve, reject) => {
        ajaxCALL(url, params, res => resolve(res.data), err => reject(err))
      })
    },
  },
	}
</script>