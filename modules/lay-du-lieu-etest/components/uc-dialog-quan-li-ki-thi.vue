<template>
	<v-dialog max-width="980px" scrollable persistent @update:model-value="onDialogToggle">

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

					<!-- ⚠️ Warning: lớp chọn khác tab active -->
					<v-alert v-if="activeTabWarning && selectedLopID" type="warning" density="compact" variant="tonal"
						class="mb-3 text-body-2" :text="activeTabWarning" />

					<!-- Loading -->
					<div v-if="loadingPreview" class="d-flex justify-center py-6">
						<v-progress-circular indeterminate color="primary" />
					</div>

					<template v-else-if="previewRows.length">

						<!-- ── Mapping kĩ năng → cột điểm ── -->
						<v-card variant="outlined" class="mb-4 rounded">
							<v-card-title
								class="text-body-2 font-weight-bold pa-3 bg-grey-lighten-4 d-flex align-center ga-1">
								<v-icon size="16" color="primary">mdi-swap-horizontal</v-icon>
								Mapping kĩ năng → cột điểm jspreadsheet
							</v-card-title>
							<v-divider />
							<v-card-text class="pa-3">
								<div v-if="!scoreDescOptions.length" class="text-body-2 text-medium-emphasis">
									Không có cột điểm nào khả dụng. Hãy chọn lớp đã được tải dữ liệu.
								</div>
								<v-row v-else dense>
									<v-col v-for="skill in detectedSkills" :key="skill" cols="12" sm="6" md="4">
										<div class="d-flex align-center ga-2">
											<v-chip size="small" color="teal" label class="flex-shrink-0"
												style="min-width:80px; justify-content:center">
												{{ skill }}
											</v-chip>
											<v-icon size="16" color="grey">mdi-arrow-right</v-icon>
											<v-select v-model="skillMapping[skill]" :items="scoreDescOptions"
												item-title="label" item-value="key" density="compact" variant="outlined"
												hide-details clearable placeholder="Chọn cột điểm..." style="flex:1" />
										</div>
									</v-col>
								</v-row>

								<!-- Trường mapping: DiemTong hoặc SoCauDung -->
								<v-divider class="my-3" />
								<div class="text-body-2 font-weight-medium mb-2">Điền giá trị từ trường:</div>
								<v-btn-toggle v-model="mappingField" mandatory density="compact" variant="outlined"
									color="primary">
									<v-btn value="DiemTong" size="small">
										<v-icon start size="14">mdi-counter</v-icon>
										DiemTong
									</v-btn>
									<v-btn value="SoCauDung" size="small">
										<v-icon start size="14">mdi-format-list-numbered</v-icon>
										SoCauDung
									</v-btn>
								</v-btn-toggle>
								<div class="text-caption text-medium-emphasis mt-1">
									<span v-if="mappingField === 'DiemTong'">Dùng điểm tổng đã tính sẵn từ kì thi</span>
									<span v-else>Dùng số câu đúng → jspreadsheet tự tính điểm</span>
								</div>
							</v-card-text>
						</v-card>

						<!-- Preview table -->
						<div class="d-flex align-center ga-2 mb-1">
							<v-chip size="small" color="primary" prepend-icon="mdi-account-group-outline">
								{{ previewRows.length }} học sinh
							</v-chip>
							<v-chip v-for="s in skillSummary" :key="s.name" size="small" color="teal-darken-1">
								{{ s.name }}: TB {{ s.avg }}
							</v-chip>
						</div>
						<!-- Toolbar chọn học sinh -->
						<div class="d-flex align-center pa-2 bg-grey-lighten-4 border rounded-t">
							<v-icon size="16" class="mr-1" color="primary">mdi-account-check-outline</v-icon>
							<span class="text-caption font-weight-medium">
								Áp dụng cho:
								<strong class="text-primary">{{ selectedStudentIDs.length }}</strong>
								/ {{ previewRows.length }} học sinh
							</span>
							<v-spacer />
							<v-btn size="x-small" variant="text" color="primary" @click="selectAllStudents">Chọn tất cả</v-btn>
							<v-btn size="x-small" variant="text" color="grey" @click="selectedStudentIDs = []">Bỏ chọn</v-btn>
						</div>
						<v-data-table :headers="previewHeaders" :items="previewRows" density="compact"
							hide-default-footer :items-per-page="-1" fixed-header height="270" class="border rounded-b"
							:item-value="r => String(r.hocSinhID)"
							v-model="selectedStudentIDs"
							show-select />
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
					<div v-if="mappingWarnings.length" class="text-caption d-flex align-center ga-1"
						style="color: #f59e0b">
						<v-icon size="14" color="warning">mdi-alert-outline</v-icon>
						{{ mappingWarnings.join(' · ') }}
					</div>
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
		// wsMeta từ parent: [{ cls, students, scoreDescs, ... }]
		wsMeta: { type: Array, default: () => [] },
		// Tab đang active ở jspreadsheet
		activeTabMeta: { type: Object, default: null },
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

			selectedStudentIDs: [],

			// Mapping: { [TenKyNang]: maCotDiem }
			skillMapping: {},
			// Trường dùng để điền: 'DiemTong' | 'SoCauDung'
			mappingField: 'DiemTong',
		}
	},

	computed: {
		lopOptions() {
			return this.classes.map(cls => ({ key: cls.id, label: cls.name }))
		},

		// Các TenKyNang duy nhất — lấy từ rawScoreData đã filter theo HocSinhID tab active
		// Dùng previewRows để biết đang show HS nào, rồi lấy skills của họ
		detectedSkills() {
			if (!this.rawScoreData?.length) return []
			const activeIDs = this.activeTabMeta?.students
				? new Set(this.activeTabMeta.students.map(s => String(s.id)))
				: null
			const relevant = activeIDs
				? this.rawScoreData.filter(r => activeIDs.has(String(r.HocSinhID)))
				: this.rawScoreData
			return [...new Set(relevant.map(r => r.TenKyNang).filter(Boolean))]
		},

		// Cột điểm lấy từ tab đang active (activeTabMeta) — không phải lớp đang chọn trong dialog
		// Vì HS có thể chuyển lớp: API trả Nhom cũ nhưng jspreadsheet đã đặt đúng tab
		scoreDescOptions() {
			const meta = this.activeTabMeta ?? this.wsMeta?.find(m => m.cls?.id === this.selectedLopID)
			if (!meta?.scoreDescs) return []
			return meta.scoreDescs
				.filter(d => d.key && !d.readOnly)
				.map(d => ({ key: d.key, label: d.title ?? d.key }))
		},

		// Cảnh báo nếu lớp chọn trong dialog khác tab đang active
		activeTabWarning() {
			if (!this.activeTabMeta || !this.selectedLopID) return null
			const activeID = this.activeTabMeta.cls?.id
			if (activeID === this.selectedLopID) return null
			const activeName = this.activeTabMeta.cls?.name ?? activeID
			const selectedName = this.classes.find(c => c.id === this.selectedLopID)?.name ?? this.selectedLopID
			return `⚠️ Dữ liệu kì thi lấy từ "${selectedName}" nhưng sẽ apply vào tab đang active: "${activeName}". Chỉ học sinh có HocSinhID khớp mới được điền.`
		},

		canApply() {
			return (
				!!this.selectedExam &&
				!!this.selectedLopID &&
				this.previewRows.length > 0 &&
				this.detectedSkills.some(s => !!this.skillMapping[s])
			)
		},

		mappingWarnings() {
			const warns = []
			const unmapped = this.detectedSkills.filter(s => !this.skillMapping[s])
			if (unmapped.length) warns.push(`Chưa mapping: ${unmapped.join(', ')}`)
			return warns
		},

		previewHeaders() {
			const base = [
				{ title: 'Mã HS', key: 'hocSinhID', width: '110px' },
				{ title: 'Họ và tên', key: 'hoTen', width: '180px' },
			]
			const skillCols = this.detectedSkills.flatMap(s => [
				{ title: `${s} - Số câu`, key: `skill_${s}_SoCauHoi`,  align: 'center', width: '95px' },
				{ title: `${s} - Đúng`,   key: `skill_${s}_SoCauDung`, align: 'center', width: '85px' },
				{ title: `${s} - Điểm`,   key: `skill_${s}_DiemTong`,  align: 'center', width: '85px' },
			])
			return [...base, ...skillCols]
		},

		skillSummary() {
			return this.detectedSkills.map(s => {
				const vals = this.previewRows
					.map(r => r[`skill_${s}_DiemTong`])
					.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
					.map(Number)
				const avg = vals.length
					? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
					: '—'
				return { name: s, avg }
			})
		},
	},

	watch: {
		// Khi detectedSkills thay đổi → thử auto-map theo tên kĩ năng
		detectedSkills(skills) {
			this._autoMap(skills)
		},
	},

	methods: {
		onDialogToggle(val) {
			if (val) {
				this.selectedExam = null
				this.selectedLopID = null
				this.rawScoreData = []
				this.previewRows = []
				this.skillMapping = {}
				this.mappingField = 'DiemTong'
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
			this.skillMapping = {}
			this.selectedStudentIDs = []
		},

		async loadPreview() {
			if (!this.selectedExam || !this.selectedLopID) return
			this.loadingPreview = true
			this.rawScoreData = []
			this.previewRows = []
			this.skillMapping = {}
			try {
				const data = await fetchPromise('/qlktt/LMS_KhaiBaoCauHinhAnhVan', {
					KyThiID: this.selectedExam.id,
				})
				this.rawScoreData = data ?? []
				// ✅ Filter chính xác theo HocSinhID của tab active (activeTabMeta)
				// Union với filter theo Nhom để không bỏ sót HS nào
				const filtered = this._filterForPreview(this.rawScoreData, this.selectedLopID)
				this.previewRows = this._buildPreviewRows(filtered)
				// Auto-select tất cả học sinh
				this.selectedStudentIDs = this.previewRows.map(r => String(r.hocSinhID))
				// Trigger auto-map ngay sau khi có data
				this._autoMap(this.detectedSkills)
			} finally {
				this.loadingPreview = false
			}
		},

		selectAllStudents() {
			this.selectedStudentIDs = this.previewRows.map(r => String(r.hocSinhID))
		},

		// ── Auto-map kĩ năng theo từ khóa tên ──
		_autoMap(skills) {
			const options = this.scoreDescOptions
			if (!options.length) return
			const newMapping = { ...this.skillMapping }

			const HINT_MAP = {
				'Nói':  ['Speaking', 'Noi', 'speaking'],
				'Nghe': ['Listening', 'Nghe', 'listening'],
				'Đọc':  ['Reading', 'Doc', 'reading'],
				'Viết': ['Writing', 'Viet', 'writing'],
			}

			for (const skill of skills) {
				if (newMapping[skill]) continue // đã map → giữ nguyên
				const hints = HINT_MAP[skill] ?? [skill]
				const found = options.find(opt =>
					hints.some(h =>
						opt.key?.toLowerCase().includes(h.toLowerCase()) ||
						opt.label?.toLowerCase().includes(h.toLowerCase())
					)
				)
				if (found) newMapping[skill] = found.key
			}
			this.skillMapping = newMapping
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
				const row = map.get(r.HocSinhID)
				const s = r.TenKyNang
				row[`skill_${s}_SoCauHoi`]  = r.SoCauHoi  ?? null
				row[`skill_${s}_SoCauDung`] = r.SoCauDung ?? null
				row[`skill_${s}_DiemTong`]  = r.DiemTong  ?? null
				// backward compat — vẫn giữ key cũ để doApply dùng
				row[`skill_${s}`] = r.DiemTong ?? null
			}
			return [...map.values()]
		},

		_getKhoiFromLopID(lopID) {
			const cls = this.classes.find(c => c.id === lopID)
			if (!cls) return null
			// Tên lớp có thể dạng "25-10AV1" hoặc "10AV1" — lấy số đầu tiên của phần lớp thực
			// Ưu tiên match phần sau dấu "-" nếu có, VD: "25-10AV1" → "10AV1" → khoi=10
			const rawName = String(cls.name)
			const normalized = rawName.includes('-') ? rawName.split('-').pop() : rawName
			const match = normalized.match(/^(\d+)/)
			return match ? Number(match[1]) : null
		},

		// Lấy phần tên lớp "thuần" để so với r.Nhom
		// VD: "25-10AV1" → "10AV1", "10AV1" → "10AV1"
		_normalizeLopName(name) {
			const s = String(name ?? '').trim()
			return s.includes('-') ? s.split('-').pop().trim() : s
		},

		_matchesLop(r, lopID) {
			if (!lopID) return true
			const cls = this.classes.find(c => c.id === lopID)
			if (!cls) return true
			const khoi = this._getKhoiFromLopID(lopID)
			if (khoi === null) return true
			if (khoi >= 6 && khoi <= 9) return r.KhoiID === khoi

			// Khối 10-12: so sánh r.Nhom với tên lớp (normalize cả hai phía)
			const rNhom = String(r.Nhom ?? '').trim()
			const clsNorm = this._normalizeLopName(cls.name)
			return rNhom === clsNorm || rNhom === cls.name
		},

		_filterByLop(data, lopID) {
			return data.filter(r => this._matchesLop(r, lopID))
		},

		// ✅ Filter chính xác nhất: union của 2 điều kiện
		// 1. HocSinhID có trong tab active (activeTabMeta.students)
		// 2. Nhom khớp với lớp đang chọn (fallback khi chưa có activeTabMeta)
		_filterForPreview(data, lopID) {
			// Lấy Set HocSinhID từ tab active
			const activeStudentIDs = this.activeTabMeta?.students
				? new Set(this.activeTabMeta.students.map(s => String(s.id)))
				: null

			if (!activeStudentIDs) {
				// Chưa có activeTabMeta → fallback filter theo Nhom
				return this._filterByLop(data, lopID)
			}

			// Union: khớp HocSinhID trong tab active OR khớp Nhom (tránh bỏ sót)
			return data.filter(r =>
				activeStudentIDs.has(String(r.HocSinhID)) ||
				this._matchesLop(r, lopID)
			)
		},

		async doApply(isActive) {
			if (!this.canApply) return
			this.applying = true
			try {
				// Chỉ giữ các skill đã map
				const activeMapping = Object.fromEntries(
					Object.entries(this.skillMapping).filter(([, v]) => !!v)
				)

				// Build studentScores — filter theo selectedStudentIDs nếu user chọn subset
				const selectedSet = this.selectedStudentIDs.length > 0
					? new Set(this.selectedStudentIDs.map(String))
					: null
				const studentScores = new Map()

				for (const r of this.rawScoreData) {
					if (selectedSet && !selectedSet.has(String(r.HocSinhID))) continue
					const maCotDiem = activeMapping[r.TenKyNang]
					if (!maCotDiem) continue

					const val = this.mappingField === 'SoCauDung' ? r.SoCauDung : r.DiemTong
					if (val === null || val === undefined) continue

					if (!studentScores.has(r.HocSinhID)) {
						studentScores.set(r.HocSinhID, { hocSinhID: r.HocSinhID })
					}
					studentScores.get(r.HocSinhID)[maCotDiem] = val
				}

				this.$emit('apply', {
					exam: this.selectedExam,
					lopID: this.selectedLopID,
					skillMapping: activeMapping,   // { TenKyNang → maCotDiem }
					mappingField: this.mappingField, // 'DiemTong' | 'SoCauDung'
					rows: this.previewRows,
					rawRows: this.rawScoreData,
					studentScores,                 // Map<hocSinhID, { maCotDiem: value }>
				})
				isActive.value = false
			} finally {
				this.applying = false
			}
		},
	},
}
</script>