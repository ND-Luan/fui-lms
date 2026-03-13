<template>
	<v-dialog max-width="960px" scrollable persistent @update:model-value="onDialogToggle">

		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template #default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center ga-2 pa-4 bg-primary">
					<v-icon color="white">mdi-clipboard-list-outline</v-icon>
					<span class="text-white text-subtitle-1 font-weight-bold">Quản lí kì thi</span>
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" color="white" size="small" @click="isActive.value = false" />
				</v-card-title>

				<v-divider />

				<v-card-text class="pa-4">

					<!-- ── Chọn kì thi + lớp ── -->
					<v-row dense class="mb-4">
						<v-col cols="12" sm="7">
							<v-autocomplete v-model="selectedExam" :items="exams" :loading="loadingExams"
								item-title="name" item-value="id" return-object label="Chọn kì thi"
								placeholder="Tìm kì thi..." density="compact" variant="outlined" hide-details clearable
								no-data-text="Không có dữ liệu" prepend-inner-icon="mdi-magnify"
								@update:model-value="onExamChange" />
						</v-col>
						<v-col cols="12" sm="5">
							<v-select v-model="selectedLopID" :items="lopOptions" item-title="label" item-value="key"
								label="Chọn lớp" density="compact" variant="outlined" hide-details
								:disabled="!selectedExam" @update:model-value="loadPreview" />
						</v-col>
					</v-row>

					<!-- Preview -->
					<div v-if="loadingPreview" class="d-flex justify-center py-6">
						<v-progress-circular indeterminate color="primary" />
					</div>

					<template v-else-if="previewRows.length">
						<div class="d-flex align-center ga-2 mb-2">
							<v-chip size="small" color="primary" prepend-icon="mdi-account-group-outline">
								{{ previewRows.length }} học sinh
							</v-chip>
							<v-chip v-for="s in skillSummary" :key="s.name" size="small" color="teal-darken-1">
								{{ s.name }}: TB {{ s.avg }}
							</v-chip>
						</div>
						<v-data-table :headers="previewHeaders" :items="previewRows" density="compact"
							hide-default-footer :items-per-page="-1" fixed-header height="360" class="border rounded" />
					</template>

					<!-- Chưa chọn kì thi -->
					<div v-else-if="!selectedExam" class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-clipboard-search-outline</v-icon>
						<div class="mt-2">Chọn kì thi và lớp để xem dữ liệu</div>
					</div>

					<!-- Đã chọn kì thi, chưa chọn lớp -->
					<div v-else-if="selectedExam && !selectedLopID" class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-google-classroom</v-icon>
						<div class="mt-2">Chọn lớp để xem dữ liệu điểm</div>
					</div>

					<!-- Đã chọn đủ nhưng không có data -->
					<div v-else class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-table-off</v-icon>
						<div class="mt-2">Không có dữ liệu điểm cho lớp này</div>
					</div>

				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-3">
					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" variant="flat" :disabled="!canApply" :loading="applying"
						@click="doApply(isActive)">
						<v-icon start size="16">mdi-check</v-icon>
						Apply vào bảng điểm
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>

	</v-dialog>
</template>

<script>
export default {
	name: 'UcDialogQuanLiKiThi',

	props: {
		classes: { type: Array, default: () => [] },
		nienKhoa: { type: Number, default: null },
		hocKy: { type: Number, default: 2 },
	},

	emits: ['apply'],

	data() {
		return {
			loadingExams: false,
			exams: [],
			selectedExam: null,

			selectedLopID: null,
			loadingPreview: false,
			rawScoreData: [],
			previewRows: [],
			applying: false,
		}
	},

	computed: {
		lopOptions() {
			return this.classes.map(cls => ({ key: cls.id, label: cls.name }))
		},

		canApply() {
			return !!this.selectedExam && !!this.selectedLopID && this.previewRows.length > 0
		},

		previewHeaders() {
			const base = [
				{ title: 'Mã HS', key: 'hocSinhID', width: '110px' },
				{ title: 'Họ và tên', key: 'hoTen', width: '180px' },
			]
			const skills = [...new Set((this.rawScoreData ?? []).map(r => r.TenKyNang))]
			return [
				...base,
				...skills.map(s => ({ title: s, key: `skill_${s}`, align: 'center', width: '120px' })),
			]
		},

		skillSummary() {
			const skills = [...new Set((this.rawScoreData ?? []).map(r => r.TenKyNang))]
			return skills.map(s => {
				const vals = this.previewRows
					.map(r => r[`skill_${s}`])
					.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
					.map(Number)
				const avg = vals.length
					? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
					: '—'
				return { name: s, avg }
			})
		},
	},

	methods: {
		onDialogToggle(val) {
			if (val) {
				this.selectedExam = null
				this.selectedLopID = null
				this.rawScoreData = []
				this.previewRows = []
				this.fetchExams()
			}
		},

		async fetchExams() {
			if (this.exams.length) return
			this.loadingExams = true
			try {
				const data = await fetchPromise('/qlktt/LMS_DanhSachKyThi', {
					NamHoc: this.nienKhoa ?? new Date().getFullYear(),
					HocKy: this.hocKy,
				})
				this.exams = (data ?? []).map(x => ({
					id: x.KyThiID,
					name: x.TenKyThi,
					namHoc: x.NamHoc,
					hocKy: x.HocKy,
				}))
			} finally {
				this.loadingExams = false
			}
		},

		onExamChange() {
			this.selectedLopID = null
			this.rawScoreData = []
			this.previewRows = []
		},

		async loadPreview() {
			if (!this.selectedExam || !this.selectedLopID) return
			this.loadingPreview = true
			this.rawScoreData = []
			this.previewRows = []
			try {
				const data = await fetchPromise('/qlktt/LMS_KhaiBaoCauHinhAnhVan', {
					KyThiID: this.selectedExam.id,
				})
				this.rawScoreData = data ?? []
				const filtered = this._filterByLop(this.rawScoreData, this.selectedLopID)
				this.previewRows = this._buildPreviewRows(filtered)
			} finally {
				this.loadingPreview = false
			}
		},

		_buildPreviewRows(data) {
			const map = new Map()
			for (const r of data) {
				if (!map.has(r.HocSinhID)) {
					map.set(r.HocSinhID, {
						hocSinhID: r.HocSinhID,
						hoTen: `${r.Ho} ${r.Ten}`.trim(),
					})
				}
				map.get(r.HocSinhID)[`skill_${r.TenKyNang}`] = r.DiemTong
			}
			return [...map.values()]
		},
		_getKhoiFromLopID(lopID) {
			const cls = this.classes.find(c => c.id === lopID)
			if (!cls) return null
			const match = String(cls.name).match(/^(\d+)/)
			return match ? Number(match[1]) : null
		},

		_filterByLop(data, lopID) {
			const cls = this.classes.find(c => c.id === lopID)
			if (!cls) return data

			const khoi = this._getKhoiFromLopID(lopID)
			if (khoi === null) return data

			if (khoi >= 6 && khoi <= 9) {
				return data.filter(r => r.KhoiID === khoi)
			} else {
				// Khối 10-12: lọc theo Nhom === tên lớp
				return data.filter(r => r.Nhom === cls.name)
			}
		},
		async doApply(isActive) {
			if (!this.canApply) return
			this.applying = true
			try {
				this.$emit('apply', {
					exam: this.selectedExam,
					lopID: this.selectedLopID,
					rows: this.previewRows,
					rawRows: this.rawScoreData,
				})
				isActive.value = false
			} finally {
				this.applying = false
			}
		},
	},
}
</script>