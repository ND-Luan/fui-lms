<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					{{ TitlePage }} • {{ TitleCap }}
					<v-chip variant="text" color="primary" class="font-weight-medium">
						Tổng số học sinh: {{ DSHocSinhQLD.length }}
					</v-chip>
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="Semester" label="Chọn kì đánh giá" :items="DSSemester" item-title="title"
								item-value="value" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" :disabled="!KhoiItem" return-object />
						</v-col>
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" :disabled="!LopItem" @click="getDiemTheoLopQLD">
								<v-icon start>mdi-refresh</v-icon>Làm mới
							</v-btn>
							<v-btn variant="outlined" color="amber-darken-2"
								:disabled="DSHocSinh_API_QLD.length === 0 || IsPullingDiem"
								@click="onKeoDiem">
								<v-icon start>mdi-database-import</v-icon>
								{{ IsPullingDiem ? 'Đang kéo điểm...' : 'Kéo điểm' }}
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<v-card v-if="IsPullingDiem" class="ma-3" border>
			<v-card-text>
				<div class="d-flex align-center justify-space-between mb-2 ga-2 flex-wrap">
					<div class="text-body-2 font-weight-medium text-truncate" style="max-width: 65%;">
						{{ PullProgressText }}
					</div>
					<div class="d-flex align-center ga-2">
						<v-chip size="small" color="primary" variant="tonal" style="min-width: 72px; justify-content: center;">
							{{ PullProgressCurrent }}/{{ PullProgressTotal }}
						</v-chip>
						<v-chip size="small" color="secondary" variant="outlined" style="min-width: 92px; justify-content: center;">
							ETA {{ PullEtaDisplay }}
						</v-chip>
					</div>
				</div>
				<v-progress-linear color="primary" height="8" rounded :model-value="PullProgressPercent" />
			</v-card-text>
		</v-card>

		<div v-if="DSHocSinhQLD.length > 0" class="pa-3">
			<div v-for="hocSinh in DSHocSinhQLD" :key="hocSinh.HocSinhID" class="mb-3">
				<v-card border>
					<v-card-title class="font-weight-medium text-primary">
						Học sinh: [{{ hocSinh.HocSinhID }}] {{ hocSinh.HoTen }}
					</v-card-title>
					<v-data-table :headers="headers" :items="hocSinh.DSCotDiem" item-value="__rowKey"
						items-per-page="-1" hide-default-footer hover
						style="max-height: calc(100dvh - 77px); overflow-y: auto;">
						<template #item.TenMon="{ item }">
							{{ item.TenMon || item.MonHocCode || item.MonHocName || '-' }}
						</template>
					</v-data-table>
				</v-card>
			</div>
		</div>

		<template v-else>
			<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
				<v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
				<p class="text-body-2">Chọn lớp để xem dữ liệu</p>
			</div>
		</template>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	
		data() {
			return {
				vueData,
				DSKhoi: [],
				DSLop: [],
				KhoiItem: null,
				LopItem: null,
				DSHocSinh_API_QLD: [],
				DSHocSinhQLD: [],
				DSSemester: [
					{ title: 'Giữa kì 1', value: 'GK_HK1', KyDanhGia: 1 },
					{ title: 'Cuối kì 1', value: 'CK_HK1', KyDanhGia: 2 },
					{ title: 'Giữa kì 2', value: 'GK_HK2', KyDanhGia: 3 },
					{ title: 'Cuối kì 2', value: 'CK_HK2', KyDanhGia: 4 },
				],
				Semester: null,
				headers: [
					{ title: 'STT', value: 'STT', minWidth: 60, align: 'center' },
					{ title: 'Môn học', value: 'TenMon', minWidth: 160, align: 'start' },
					{ title: 'Mức độ đánh giá', value: 'MucDoDanhGia', minWidth: 120, align: 'center' },
					{ title: 'Điểm môn học', value: 'DiemMonHoc', minWidth: 120, align: 'center' },
					{ title: 'Nhận xét', value: 'NhanXet', minWidth: 320, align: 'start' },
					{ title: 'Thời điểm đánh giá', value: 'ThoiDiemDanhGia', minWidth: 120, align: 'center' },
				],
				IsPullingDiem: false,
				PullProgressCurrent: 0,
				PullProgressTotal: 0,
				PullProgressText: '',
				PullEtaText: '',
				PullEtaSeconds: 0,
				PullElapsedMs: 0,
				PullStartedAt: 0,
				PullEtaInterval: null,
			}
		},
	
		computed: {
			TitleCap() { return renderText(parseInt(vueData.CapID || 1)) },
			TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
			PullProgressPercent() {
				if (!this.PullProgressTotal) return 0
				return Math.round((this.PullProgressCurrent / this.PullProgressTotal) * 100)
			},
			PullEtaDisplay() {
				const sec = Math.max(0, Math.round(this.PullEtaSeconds || 0))
				const minute = Math.floor(sec / 60)
				const remainSec = sec % 60
				const mm = String(minute).padStart(2, '0')
				const ss = String(remainSec).padStart(2, '0')
				return `${mm}:${ss}`
			},
		},
	
		watch: {
			KhoiItem(v) {
				this.LopItem = null
				this.DSLop = []
				this.clearData()
				if (v?.KhoiID) this.getLop()
			},
			LopItem(v) {
				this.clearData()
				if (v?.LopID && this.Semester?.KyDanhGia) this.getDiemTheoLopQLD()
			},
			Semester(v) {
				this.clearData()
				if (this.LopItem?.LopID && v?.KyDanhGia) this.getDiemTheoLopQLD()
			},
		},
	
		mounted() {
			this.Semester = this.DSSemester[0]
			this.getKhoi()
		},
	
		methods: {
			formatDuration(seconds) {
				const sec = Math.max(0, Math.round(seconds || 0))
				const minute = Math.floor(sec / 60)
				const remainSec = sec % 60
				if (minute <= 0) return `${remainSec}s`
				if (remainSec <= 0) return `${minute}m`
				return `${minute}m ${remainSec}s`
			},

			startEtaTicker() {
				this.stopEtaTicker()
				this.PullEtaInterval = setInterval(() => {
					if (!this.IsPullingDiem || this.PullEtaSeconds <= 0) return
					this.PullEtaSeconds -= 1
					this.PullEtaText = this.formatDuration(this.PullEtaSeconds)
				}, 1000)
			},

			stopEtaTicker() {
				if (!this.PullEtaInterval) return
				clearInterval(this.PullEtaInterval)
				this.PullEtaInterval = null
			},

			updateEtaAfterStep() {
				if (!this.PullProgressCurrent || !this.PullProgressTotal) {
					this.PullEtaSeconds = 0
					this.PullEtaText = ''
					return
				}

				const avgMs = this.PullElapsedMs / this.PullProgressCurrent
				const remainSteps = Math.max(0, this.PullProgressTotal - this.PullProgressCurrent)
				this.PullEtaSeconds = Math.max(0, Math.ceil((avgMs * remainSteps) / 1000))
				this.PullEtaText = this.formatDuration(this.PullEtaSeconds)
			},

			resetPullProgress() {
				this.stopEtaTicker()
				this.IsPullingDiem = false
				this.PullProgressCurrent = 0
				this.PullProgressTotal = 0
				this.PullProgressText = ''
				this.PullEtaText = ''
				this.PullEtaSeconds = 0
				this.PullElapsedMs = 0
				this.PullStartedAt = 0
			},

			async finishPullProgressSmoothly() {
				for (let i = 3; i >= 1; i--) {
					this.PullProgressText = `Hoàn tất, đóng sau ${i}s`
					this.PullEtaText = ''
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
				this.resetPullProgress()
			},

			buildKeoDiemTasks() {
				const taskMap = {}
				for (const item of this.DSHocSinh_API_QLD) {
					if (!item?.HocSinhID || !item?.TenMon) continue
					const taskKey = `${item.HocSinhID}__${item.TenMon}`
					if (!taskMap[taskKey]) {
						taskMap[taskKey] = {
							HocSinhID: item.HocSinhID,
							TenMon: item.TenMon,
							JsonData: [],
						}
					}
					taskMap[taskKey].JsonData.push(item)
				}

				return Object.values(taskMap)
			},

			getHeaderTitle(key) {
				const mapTitle = {
					STT: 'STT',
					TenMon: 'Môn học',
					MucDoDanhGia: 'Mức độ đánh giá',
					DiemMonHoc: 'Điểm môn học',
					NhanXet: 'Nhận xét',
					ThoiDiemDanhGia: 'Thời điểm đánh giá',
				}
				return mapTitle[key] || key
			},

			buildDynamicHeaders(items) {
				if (!Array.isArray(items) || items.length === 0) return

				const excludedKeys = new Set(['HocSinhID', 'HoTen', 'NgaySinh', 'TenLop', 'SoDanhBo', '__rowKey'])
				const preferredKeys = ['STT', 'TenMon', 'MucDoDanhGia', 'DiemMonHoc', 'NhanXet', 'ThoiDiemDanhGia']
				const allKeys = new Set()

				for (const item of items) {
					for (const key of Object.keys(item || {})) {
						if (excludedKeys.has(key)) continue
						allKeys.add(key)
					}
				}

				const orderedKeys = [
					...preferredKeys.filter(key => allKeys.has(key)),
					...Array.from(allKeys).filter(key => !preferredKeys.includes(key)).sort(),
				]

				this.headers = orderedKeys.map(key => {
					const isCenter = ['STT', 'MucDoDanhGia', 'DiemMonHoc', 'ThoiDiemDanhGia'].includes(key)
					return {
						title: this.getHeaderTitle(key),
						value: key,
						minWidth: key === 'NhanXet' ? 320 : 120,
						align: isCenter ? 'center' : 'start',
					}
				})
			},

			extractList(res) {
				if (Array.isArray(res)) return res
				return res?.data ?? []
			},
	
			clearData() {
				this.DSHocSinh_API_QLD = []
				this.DSHocSinhQLD = []
				this.headers = [
					{ title: 'STT', value: 'STT', minWidth: 60, align: 'center' },
					{ title: 'Môn học', value: 'TenMon', minWidth: 160, align: 'start' },
					{ title: 'Mức độ đánh giá', value: 'MucDoDanhGia', minWidth: 120, align: 'center' },
					{ title: 'Điểm môn học', value: 'DiemMonHoc', minWidth: 120, align: 'center' },
					{ title: 'Nhận xét', value: 'NhanXet', minWidth: 320, align: 'start' },
					{ title: 'Thời điểm đánh giá', value: 'ThoiDiemDanhGia', minWidth: 120, align: 'center' },
				]
			},
	
			async getKhoi() {
				const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
					CapID: parseInt(vueData.CapID || 1),
					NienKhoa: vueData.NienKhoa,
				})
				this.DSKhoi = this.extractList(res)
			},
	
			async getLop() {
				if (!this.KhoiItem?.KhoiID) return
				const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.KhoiItem.KhoiID,
				})
				this.DSLop = this.extractList(res)
			},
	
			async getDiemTheoLopQLD(options = {}) {
				if (!this.LopItem?.LopID || !this.Semester?.KyDanhGia) return
				const res = await fetchPromise('psmark1/LMS_GetDanhGiaHocSinh', {
					LopID: this.LopItem.LopID,
					KyDanhGia: this.Semester.KyDanhGia,
					NamHoc: vueData.NienKhoa,
				}, {
					silent: options.silent === true,
				})
	
				this.DSHocSinh_API_QLD = this.extractList(res)
					this.buildDynamicHeaders(this.DSHocSinh_API_QLD)
				this.renderDSHocSinhQLD()
			},
	
			renderDSHocSinhQLD() {
				const mapHocSinh = {}
					let rowIndex = 0
				for (const item of this.DSHocSinh_API_QLD) {
					const hocSinhID = item.HocSinhID
					if (!hocSinhID) continue
					if (!mapHocSinh[hocSinhID]) {
						mapHocSinh[hocSinhID] = {
							...item,
							DSCotDiem: [],
						}
					}
						rowIndex += 1
						mapHocSinh[hocSinhID].DSCotDiem.push({
							...item,
							__rowKey: `${hocSinhID}-${rowIndex}`,
						})
				}
				this.DSHocSinhQLD = Object.values(mapHocSinh)
			},
	
			async onKeoDiem() {
				if (this.DSHocSinh_API_QLD.length === 0 || this.IsPullingDiem) return
	
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận kéo điểm?' })
				if (!ok) return
	
				const tasks = this.buildKeoDiemTasks()
				if (tasks.length === 0) {
					this.snackbarRef.value.showSnackbar({ message: 'Không có dữ liệu hợp lệ để kéo điểm', color: 'warning' })
					return
				}

				this.IsPullingDiem = true
				this.PullProgressCurrent = 0
				this.PullProgressTotal = tasks.length
				this.PullProgressText = 'Bắt đầu kéo điểm...'
				this.PullEtaText = 'Đang ước tính...'
				this.PullEtaSeconds = 0
				this.PullElapsedMs = 0
				this.PullStartedAt = Date.now()
				this.startEtaTicker()

				let isSuccess = false
				try {
					for (let i = 0; i < tasks.length; i++) {
						const task = tasks[i]
						this.PullProgressText = `Đang kéo: HS ${task.HocSinhID} - ${task.TenMon}`
						const stepStartedAt = Date.now()

						await fetchPromise('lms/fn_HocSinh_KeoDiem', {
							NienKhoa: vueData.NienKhoa,
							JsonData: task.JsonData,
						}, {
							cache: false,
							loadingText: '',
							silent: true,
							_skipLoading: true,
						})

						this.PullElapsedMs += Date.now() - stepStartedAt
						this.PullProgressCurrent = i + 1
						this.updateEtaAfterStep()
					}

					isSuccess = true
					this.PullProgressCurrent = this.PullProgressTotal
					this.PullEtaText = ''
					this.snackbarRef.value.showSnackbar({ message: 'Kéo điểm thành công', color: 'success' })
				} catch (error) {
					this.snackbarRef.value.showSnackbar({
						message: `Kéo điểm thất bại ở bước ${this.PullProgressCurrent + 1}/${this.PullProgressTotal}`,
						color: 'error',
					})
				} finally {
					if (isSuccess) {
						await this.finishPullProgressSmoothly()
					} else {
						this.resetPullProgress()
					}
				}

				if (isSuccess) await this.getDiemTheoLopQLD({ silent: true })
			},
		},
	}
</script>