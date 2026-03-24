<template>
	<v-dialog max-width="980px" scrollable persistent @update:model-value="onDialogToggle">

		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template #default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center ga-2 pa-4 bg-primary">
					<v-icon color="white">mdi-clipboard-list-outline</v-icon>
					<span class="text-white text-subtitle-1 font-weight-bold">Quản lí kì thi — Cấp 2</span>
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" color="white" size="small" @click="isActive.value = false" />
				</v-card-title>

				<v-divider />

				<v-card-text class="pa-4">

					<!-- ── Chọn kì thi + khối ── -->
					<v-row dense class="mb-3">
						<v-col cols="12" sm="7">
							<v-autocomplete v-model="selectedExam" :items="exams" :loading="loadingExams"
								item-title="name" item-value="id" return-object label="Chọn kì thi"
								placeholder="Tìm kì thi..." density="compact" variant="outlined" hide-details clearable
								no-data-text="Không có dữ liệu" prepend-inner-icon="mdi-magnify"
								@update:model-value="onExamChange" />
						</v-col>
						<v-col cols="12" sm="5">
							<v-select v-model="selectedKhoiKeyID" :items="khoiOptions" item-title="TenKhoi"
								item-value="KhoiKeyID" label="Chọn khối" density="compact" variant="outlined"
								hide-details :disabled="!selectedExam || loadingKhoi" :loading="loadingKhoi"
								@update:model-value="onKhoiChange" />
						</v-col>
					</v-row>

					<!-- ⚠️ Warning lớp khác tab active -->
					<v-alert v-if="activeTabWarning" type="warning" density="compact" variant="tonal"
						class="mb-3 text-body-2" :text="activeTabWarning" />

					<!-- Loading -->
					<div v-if="loadingPreview" class="d-flex justify-center py-8">
						<v-progress-circular indeterminate color="primary" />
					</div>

					<template v-else-if="previewRows.length">

						<!-- ── Mapping ── -->
						<v-card variant="outlined" class="mb-3 rounded">
							<v-card-title
								class="text-body-2 font-weight-bold pa-3 bg-grey-lighten-4 d-flex align-center ga-1">
								<v-icon size="16" color="primary">mdi-swap-horizontal</v-icon>
								Mapping kỹ năng → cột bảng điểm
							</v-card-title>
							<v-divider />
							<v-card-text class="pa-3">

								<!-- Mode toggle -->
								<div class="d-flex align-center ga-3 mb-3 flex-wrap">
									<v-btn-toggle v-model="fillMode" mandatory density="compact" variant="outlined"
										color="primary">
										<v-btn value="HK" size="small">
											<v-icon start size="14">mdi-counter</v-icon>
											Điểm HK
										</v-btn>
										<v-btn value="CB" size="small">
											<v-icon start size="14">mdi-school-outline</v-icon>
											Cambridge
										</v-btn>
										<v-btn value="BOTH" size="small">
											<v-icon start size="14">mdi-layers-outline</v-icon>
											Cả hai
										</v-btn>
									</v-btn-toggle>
									<span class="text-caption text-medium-emphasis">
										<template v-if="fillMode === 'HK'">Điền điểm kỹ năng thô (thang 10)</template>
										<template v-else-if="fillMode === 'CB'">Điền tỉ lệ %, phân loại
											Cambridge</template>
										<template v-else>Điền cả điểm HK lẫn Cambridge một lần</template>
									</span>
								</div>

								<div v-if="!hkColOptions.length && !cbColOptions.length"
									class="text-body-2 text-medium-emphasis">
									Không có cột điểm khả dụng — hãy tải dữ liệu và chọn đúng tab lớp trước.
								</div>

								<v-row v-else dense>
									<!-- HK -->
									<template v-if="fillMode !== 'CB'">
										<v-col cols="12">
											<div class="text-caption font-weight-bold text-primary text-uppercase mb-1">
												Điểm HK (ThongKe_SelectBangDiemTheoMon)
											</div>
										</v-col>
										<v-col v-for="skill in HK_SKILLS" :key="'hk_' + skill.apiField" cols="12"
											sm="6">
											<div class="d-flex align-center ga-2">
												<v-chip size="small" color="primary" label class="flex-shrink-0"
													style="min-width:110px;justify-content:center">
													{{ skill.label }}
												</v-chip>
												<v-icon size="16" color="grey">mdi-arrow-right</v-icon>
												<v-select v-model="hkMapping[skill.apiField]" :items="hkColOptions"
													item-title="label" item-value="key" density="compact"
													variant="outlined" hide-details clearable
													placeholder="-- Không áp dụng --" style="flex:1" />
											</div>
										</v-col>
									</template>

									<!-- CB -->
									<template v-if="fillMode !== 'HK'">
										<v-col cols="12" :class="fillMode === 'BOTH' ? 'mt-2' : ''">
											<div class="text-caption font-weight-bold text-teal text-uppercase mb-1">
												Cambridge (ThongKe_AnhVan_SelectThongKeDiemAnhVan1_Cambridge)
											</div>
										</v-col>
										<v-col v-for="skill in CB_SKILLS" :key="'cb_' + skill.apiField" cols="12"
											sm="6">
											<div class="d-flex align-center ga-2">
												<v-chip size="small" color="teal" label class="flex-shrink-0"
													style="min-width:110px;justify-content:center">
													{{ skill.label }}
												</v-chip>
												<v-icon size="16" color="grey">mdi-arrow-right</v-icon>
												<v-select v-model="cbMapping[skill.apiField]" :items="cbColOptions"
													item-title="label" item-value="key" density="compact"
													variant="outlined" hide-details clearable
													placeholder="-- Không áp dụng --" style="flex:1" />
											</div>
										</v-col>
									</template>
								</v-row>
							</v-card-text>
						</v-card>

						<!-- ── Chọn lớp filter + summary ── -->
						<v-row dense class="mb-2">
							<v-col cols="12" sm="5">
								<v-select v-model="selectedLopFilter" :items="lopOptions" item-title="label"
									item-value="key" label="Lọc theo lớp" density="compact" variant="outlined"
									hide-details clearable placeholder="Tất cả lớp" />
							</v-col>
							<v-col cols="12" sm="7" class="d-flex align-center flex-wrap ga-1">
								<v-chip size="small" color="primary" prepend-icon="mdi-account-group-outline">
									{{ filteredRows.length }} học sinh
								</v-chip>
								<v-chip v-for="s in skillSummary" :key="s.key" size="small" color="teal-darken-1">
									{{ s.label }}: TB {{ s.avg }}
								</v-chip>
							</v-col>
						</v-row>

						<!-- Toolbar chọn học sinh -->
						<div class="d-flex align-center pa-2 bg-grey-lighten-4 border rounded-t">
							<v-icon size="16" class="mr-1" color="primary">mdi-account-check-outline</v-icon>
							<span class="text-caption font-weight-medium">
								Áp dụng cho:
								<strong class="text-primary">{{ selectedStudentIDs.length }}</strong>
								/ {{ filteredRows.length }} học sinh
							</span>
							<v-spacer />
							<v-btn size="x-small" variant="text" color="primary" @click="selectAll">Chọn tất cả</v-btn>
							<v-btn size="x-small" variant="text" color="grey" @click="selectedStudentIDs = []">Bỏ chọn
							</v-btn>
						</div>

						<v-data-table :headers="previewHeaders" :items="filteredRows" density="compact"
							hide-default-footer :items-per-page="-1" fixed-header height="260" class="border rounded-b"
							:item-value="r => String(r.hocSinhID)" v-model="selectedStudentIDs" show-select />

					</template>

					<!-- Empty states -->
					<div v-else-if="!selectedExam" class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-clipboard-search-outline</v-icon>
						<div class="mt-2">Chọn kì thi và khối để xem dữ liệu</div>
					</div>
					<div v-else-if="!selectedKhoiKeyID" class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-school-outline</v-icon>
						<div class="mt-2">Chọn khối để xem dữ liệu điểm</div>
					</div>
					<div v-else class="text-center text-medium-emphasis py-10">
						<v-icon size="48" color="grey-lighten-1">mdi-table-off</v-icon>
						<div class="mt-2">Không có dữ liệu cho khối này</div>
					</div>

				</v-card-text>

				<v-divider />

				<v-card-actions class="pa-3">
					<div v-if="mappingWarnings.length" class="text-caption d-flex align-center ga-1"
						style="color:#f59e0b">
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
		name: 'UcDialogQuanLiKiThiCap2',

		props: {
			classes: { type: Array, default: () => [] },
			nienKhoa: { type: Number, default: null },
			hocKy: { type: Number, default: 2 },
			wsMeta: { type: Array, default: () => [] },
			activeTabMeta: { type: Object, default: null },
		},

		emits: ['apply'],

		data() {
			const HK_SKILLS = [
				{ apiField: 'Nghe',     label: 'Nghe',       suffix: 'Listening_Point' },
				{ apiField: 'NgonNgu',  label: 'Ngôn ngữ',   suffix: 'Language_Point' },
				{ apiField: 'Doc',      label: 'Đọc',        suffix: 'Reading_Point' },
				{ apiField: 'Viet',     label: 'Viết',       suffix: 'Writing_Point' },
				{ apiField: 'Noi',      label: 'Nói',        suffix: 'Speaking_Point' },
				{ apiField: 'DiemTong', label: 'Điểm tổng',  suffix: 'Avg_Point', isAvg: true },
			]

			const CB_SKILLS = [
				{ apiField: 'NgheTL',       label: 'Nghe %',    suffix: 'CB_Listening_Point',  isNumeric: true },
				{ apiField: 'NghePL',       label: 'Nghe PL',   suffix: 'CB_Listening_Conv',   isNumeric: false },
				{ apiField: 'DocTL',        label: 'Đọc %',     suffix: 'CB_Reading_Point',    isNumeric: true },
				{ apiField: 'DocPL',        label: 'Đọc PL',    suffix: 'CB_Reading_Conv',     isNumeric: false },
				{ apiField: 'VietTL',       label: 'Viết %',    suffix: 'CB_Writing_Point',    isNumeric: true },
				{ apiField: 'VietPL',       label: 'Viết PL',   suffix: 'CB_Writing_Conv',     isNumeric: false },
				{ apiField: 'NoiTL',        label: 'Nói %',     suffix: 'CB_Speaking_Point',   isNumeric: true },
				{ apiField: 'NoiPL',        label: 'Nói PL',    suffix: 'CB_Speaking_Conv',    isNumeric: false },
				{ apiField: 'PhanTramChung',label: 'TB Chung %', suffix: 'CB_Avg_Point',       isNumeric: true },
				{ apiField: 'DanhGiaChung', label: 'Đánh giá',  suffix: 'CB_Avg_Conv',         isNumeric: false },
			]

			return {
				HK_SKILLS,
				CB_SKILLS,

				loadingExams: false,
				exams: [],
				selectedExam: null,

				loadingKhoi: false,
				khoiOptions: [],
				selectedKhoiKeyID: null,

				loadingPreview: false,
				rawHK: [],
				rawCB: [],
				previewRows: [],

				selectedLopFilter: null,
				selectedStudentIDs: [],

				fillMode: 'BOTH',

				hkMapping: Object.fromEntries(HK_SKILLS.map(s => [s.apiField, null])),
				cbMapping: Object.fromEntries(CB_SKILLS.map(s => [s.apiField, null])),

				applying: false,
			}
		},

		computed: {
			scoreDescOptions() {
				const meta = this.activeTabMeta ?? this.wsMeta?.[0]
				return meta?.scoreDescs ?? []
			},

			// ✅ cap2: cột điểm thẳng (_isDirectScore) cho HK skills
			// DiemTong → _isAvgPoint không phải CB
			hkColOptions() {
				return this.scoreDescOptions
					.filter(d => d.key &&
						!d.key.includes('_CB_') &&
						!d.key.includes('__SoCauDung') &&
						(d._isDirectScore || d._isAvgPoint))
					.map(d => ({ key: d.key, label: d.title ?? d.key }))
			},

			// Cột CB: key chứa _CB_
			cbColOptions() {
				return this.scoreDescOptions
					.filter(d => d.key && d.key.includes('_CB_'))
					.map(d => ({ key: d.key, label: d.title ?? d.key }))
			},

			lopOptions() {
				const lops = [...new Set(this.previewRows.map(r => r.tenLop).filter(Boolean))]
				return lops.map(l => ({ key: l, label: l }))
			},

			filteredRows() {
				if (!this.selectedLopFilter) return this.previewRows
				return this.previewRows.filter(r => r.tenLop === this.selectedLopFilter)
			},

			activeTabWarning() {
				if (!this.activeTabMeta || !this.selectedLopFilter) return null
				const activeName = this.activeTabMeta.cls?.name ?? ''
				if (activeName === this.selectedLopFilter) return null
				return `⚠️ Dữ liệu lấy từ "${this.selectedLopFilter}" nhưng sẽ apply vào tab đang active: "${activeName}". Chỉ HocSinhID khớp mới được điền.`
			},

			hasMappingSelected() {
				if (this.fillMode !== 'CB' && this.HK_SKILLS.some(s => !!this.hkMapping[s.apiField])) return true
				if (this.fillMode !== 'HK' && this.CB_SKILLS.some(s => !!this.cbMapping[s.apiField])) return true
				return false
			},

			canApply() {
				return !!this.selectedExam && !!this.selectedKhoiKeyID &&
					this.previewRows.length > 0 && this.hasMappingSelected
			},

			mappingWarnings() {
				const warns = []
				if (this.fillMode !== 'CB') {
					const unmapped = this.HK_SKILLS
						.filter(s => s.apiField !== 'DiemTong' && !this.hkMapping[s.apiField])
					if (unmapped.length)
						warns.push(`HK chưa map: ${unmapped.map(s => s.label).join(', ')}`)
				}
				if (this.fillMode !== 'HK') {
					const unmapped = this.CB_SKILLS
						.filter(s => s.isNumeric && !this.cbMapping[s.apiField])
					if (unmapped.length)
						warns.push(`CB chưa map: ${unmapped.map(s => s.label).join(', ')}`)
				}
				return warns
			},

			previewHeaders() {
				const base = [
					{ title: 'Mã HS',    key: 'hocSinhID', width: '110px' },
					{ title: 'Họ và tên',key: 'hoTen',     width: '180px' },
					{ title: 'Lớp',      key: 'tenLop',    width: '80px' },
				]
				const hkCols = this.fillMode !== 'CB'
					? this.HK_SKILLS.map(s => ({ title: s.label, key: s.apiField, align: 'center', width: '88px' }))
					: []
				const cbCols = this.fillMode !== 'HK'
					? this.CB_SKILLS
						.filter(s => ['NgheTL', 'DocTL', 'VietTL', 'NoiTL', 'PhanTramChung', 'DanhGiaChung'].includes(s.apiField))
						.map(s => ({ title: s.label, key: s.apiField, align: 'center', width: '88px' }))
					: []
				return [...base, ...hkCols, ...cbCols]
			},

			skillSummary() {
				const keys = this.fillMode !== 'CB'
					? this.HK_SKILLS.filter(s => ['Nghe', 'Doc', 'Viet', 'Noi'].includes(s.apiField))
					: this.CB_SKILLS.filter(s => ['NgheTL', 'DocTL', 'VietTL', 'NoiTL'].includes(s.apiField))
				return keys.map(s => {
					const vals = this.filteredRows
						.map(r => r[s.apiField])
						.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
						.map(Number)
					return {
						key: s.apiField,
						label: s.label,
						avg: vals.length
							? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
							: '—',
					}
				})
			},
		},

		watch: {
			filteredRows(rows) {
				this.selectedStudentIDs = rows.map(r => String(r.hocSinhID))
			},
			scoreDescOptions() { this._autoMap() },
			fillMode() { this._autoMap() },
		},

		methods: {
			onDialogToggle(val) {
				if (val) { this._reset(); this.fetchExams() }
			},

			_reset() {
				this.selectedExam = null
				this.selectedKhoiKeyID = null
				this.selectedLopFilter = null
				this.rawHK = []; this.rawCB = []
				this.previewRows = []
				this.selectedStudentIDs = []
				this.fillMode = 'BOTH'
				this.hkMapping = Object.fromEntries(this.HK_SKILLS.map(s => [s.apiField, null]))
				this.cbMapping = Object.fromEntries(this.CB_SKILLS.map(s => [s.apiField, null]))
			},

			async fetchExams() {
				if (this.exams.length) return
				this.loadingExams = true
				try {
					const data = await fetchPromise('qlktt/LMS_DanhSachKyThi', {
						NamHoc: this.nienKhoa ?? new Date().getFullYear(),
						HocKy: this.hocKy,
					})
					this.exams = (data ?? []).map(x => ({
						id: x.KyThiID, name: x.TenKyThi, namHoc: x.NamHoc, hocKy: x.HocKy,
					}))
				} finally { this.loadingExams = false }
			},

			async onExamChange() {
				this.selectedKhoiKeyID = null
				this.khoiOptions = []
				this.selectedLopFilter = null
				this.rawHK = []; this.rawCB = []
				this.previewRows = []
				this.selectedStudentIDs = []
				if (!this.selectedExam) return

				this.loadingKhoi = true
				try {
					const data = await fetchPromise('qlktt/ThongKe_SelectKhoi', {
						KyThiID: String(this.selectedExam.id),
					})
					this.khoiOptions = data ?? []
				} finally { this.loadingKhoi = false }
			},

			async onKhoiChange() {
				this.selectedLopFilter = null
				this.rawHK = []; this.rawCB = []
				this.previewRows = []
				this.selectedStudentIDs = []
				if (!this.selectedExam || !this.selectedKhoiKeyID) return
				await this._loadPreview()
			},

			async _loadPreview() {
				this.loadingPreview = true
				try {
					const kyThiID = String(this.selectedExam.id)
					const [hkData, cbData] = await Promise.all([
						fetchPromise('qlktt/ThongKe_SelectBangDiemTheoMon', {
							KyThiID: kyThiID, KhoiKeyID: this.selectedKhoiKeyID,
							MonHocID: 3, XemChiTiet: false,
						}),
						fetchPromise('qlktt/ThongKe_AnhVan_SelectThongKeDiemAnhVan1_Cambridge', {
							KyThiID: kyThiID, KhoiKeyID: this.selectedKhoiKeyID,
						}),
					])
					this.rawHK = hkData ?? []
					this.rawCB = cbData ?? []
					this.previewRows = this._buildPreviewRows(this.rawHK, this.rawCB)
					this.selectedStudentIDs = this.previewRows.map(r => String(r.hocSinhID))
					this._autoMap()
				} finally { this.loadingPreview = false }
			},

			_buildPreviewRows(hkList, cbList) {
				const map = new Map()

				for (const r of hkList) {
					if (!r.HocSinhID) continue
					map.set(r.HocSinhID, {
						hocSinhID: r.HocSinhID,
						hoTen: r['Họ tên'] ?? '',
						tenLop: r['Lớp'] ?? '',
						Nghe:     r['Nghe']       ?? null,
						NgonNgu:  r['Ngôn ngữ']   ?? null,
						Doc:      r['Đọc']         ?? null,
						Viet:     r['Viết']        ?? null,
						Noi:      r['Nói']         ?? null,
						DiemTong: r['Điểm tổng']   ?? null,
						// CB — merge sau
						NgheTL: null, NghePL: null,
						DocTL: null, DocPL: null,
						VietTL: null, VietPL: null,
						NoiTL: null, NoiPL: null,
						PhanTramChung: null, DanhGiaChung: null,
					})
				}

				// Merge CB theo HocSinhID
				const cbByID = new Map(cbList.map(r => [r.HocSinhID, r]))
				for (const [id, row] of map) {
					const cb = cbByID.get(id)
					if (!cb) continue
					row.NgheTL        = cb.NgheTL        ?? null
					row.NghePL        = cb.NghePL        ?? null
					row.DocTL         = cb.DocTL         ?? null
					row.DocPL         = cb.DocPL         ?? null
					row.VietTL        = cb.VietTL        ?? null
					row.VietPL        = cb.VietPL        ?? null
					row.NoiTL         = cb.NoiTL         ?? null
					row.NoiPL         = cb.NoiPL         ?? null
					row.PhanTramChung = cb.PhanTramChung ?? null
					row.DanhGiaChung  = cb.DanhGiaChung  ?? null
				}

				// HS chỉ có trong CB
				for (const r of cbList) {
					if (!r.HocSinhID || map.has(r.HocSinhID)) continue
					map.set(r.HocSinhID, {
						hocSinhID: r.HocSinhID,
						hoTen: `${r.Ho ?? ''} ${r.Ten ?? ''}`.trim(),
						tenLop: r.TenLop ?? '',
						Nghe: null, NgonNgu: null, Doc: null, Viet: null, Noi: null, DiemTong: null,
						NgheTL: r.NgheTL ?? null, NghePL: r.NghePL ?? null,
						DocTL: r.DocTL ?? null, DocPL: r.DocPL ?? null,
						VietTL: r.VietTL ?? null, VietPL: r.VietPL ?? null,
						NoiTL: r.NoiTL ?? null, NoiPL: r.NoiPL ?? null,
						PhanTramChung: r.PhanTramChung ?? null,
						DanhGiaChung: r.DanhGiaChung ?? null,
					})
				}

				return [...map.values()]
			},

			_autoMap() {
				// HK: map theo suffix cột — _isDirectScore cho skills, _isAvgPoint cho DiemTong
				const hkOpts = this.hkColOptions
				if (hkOpts.length) {
					const m = { ...this.hkMapping }
					for (const s of this.HK_SKILLS) {
						if (m[s.apiField]) continue
						const found = hkOpts.find(o =>
							s.isAvg
								? o.key?.endsWith('_Avg_Point') && !o.key?.includes('_CB_')
								: o.key?.endsWith(s.suffix)
						)
						if (found) m[s.apiField] = found.key
					}
					this.hkMapping = m
				}

				// CB
				const cbOpts = this.cbColOptions
				if (cbOpts.length) {
					const m = { ...this.cbMapping }
					for (const s of this.CB_SKILLS) {
						if (m[s.apiField]) continue
						const found = cbOpts.find(o => o.key?.endsWith(s.suffix))
						if (found) m[s.apiField] = found.key
					}
					this.cbMapping = m
				}
			},

			selectAll() {
				this.selectedStudentIDs = this.filteredRows.map(r => String(r.hocSinhID))
			},

			async doApply(isActive) {
				if (!this.canApply) return
				this.applying = true
				try {
					const selectedSet = new Set(this.selectedStudentIDs.map(String))
					const studentScores = new Map()

					const addScore = (hocSinhID, maCotDiem, val) => {
						if (val === null || val === undefined) return
						if (!studentScores.has(hocSinhID))
							studentScores.set(hocSinhID, { hocSinhID })
						studentScores.get(hocSinhID)[maCotDiem] = val
					}

					for (const row of this.filteredRows) {
						if (!selectedSet.has(String(row.hocSinhID))) continue

						if (this.fillMode !== 'CB') {
							for (const s of this.HK_SKILLS) {
								const col = this.hkMapping[s.apiField]
								if (col) addScore(row.hocSinhID, col, row[s.apiField])
							}
						}

						if (this.fillMode !== 'HK') {
							for (const s of this.CB_SKILLS) {
								const col = this.cbMapping[s.apiField]
								if (col) addScore(row.hocSinhID, col, row[s.apiField])
							}
						}
					}

					this.$emit('apply', {
						exam: this.selectedExam,
						khoiKeyID: this.selectedKhoiKeyID,
						lopFilter: this.selectedLopFilter,
						fillMode: this.fillMode,
						studentScores,
						rawRows: this.filteredRows,
					})

					isActive.value = false
				} finally {
					this.applying = false
				}
			},
		},
	}
</script>