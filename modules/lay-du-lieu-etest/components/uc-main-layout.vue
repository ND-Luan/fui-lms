<template>
	<v-app>
		<!-- ═══════════════════════════════════════ APP BAR ══════════════════════════════════════ -->
		<v-app-bar height="56" elevation="1">
			<v-app-bar-title>
				<div class="d-flex align-center ga-2">
					<v-icon color="white" size="20">mdi-table-large</v-icon>
					<span class="text-subtitle-1 font-weight-bold text-white">
						Lấy dữ liệu eTest, qlDiem &amp; xử lí dữ liệu
					</span>
				</div>
			</v-app-bar-title>

			<!-- Cấp -->
			<v-btn-toggle v-model="config.cap" mandatory density="compact" variant="outlined" class="mx-2 bg-white"
				@update:model-value="onConfigChange">
				<v-btn value="cap2" size="small">Cấp 2</v-btn>
				<v-btn value="cap3" size="small">Cấp 3</v-btn>
			</v-btn-toggle>

			<!-- Học kì -->
			<v-select v-model="config.semesterPeriod" :items="semesterPeriodOptions" item-title="label" item-value="key"
				placeholder="Học kì / Kì thi" density="compact" variant="outlined" hide-details bg-color="white"
				class="mx-2" style="max-width:200px" @update:model-value="onConfigChange" />

			<!-- Loại điểm -->
			<v-select v-model="config.scoreType" :items="scoreTypeOptions" item-title="label" item-value="key"
				placeholder="Loại điểm" density="compact" variant="outlined" hide-details bg-color="white" class="mx-2"
				style="max-width:200px" @update:model-value="onConfigChange" />

			<!-- Tải dữ liệu -->
			<v-btn variant="outlined" :disabled="!canLoad || loading" :loading="loading" class="mr-2"
				@click="loadAllClasses">
				<v-icon start size="16">mdi-play-circle-outline</v-icon>
				Tải dữ liệu
			</v-btn>

			<!-- Hành động -->
			<v-menu offset-y>
				<template #activator="{ props }">
					<v-btn v-bind="props" variant="outlined" :disabled="!ready" class="mr-2">
						<v-icon start size="16">mdi-dots-vertical</v-icon>
						Hành động
						<v-badge v-if="changedCount > 0" :content="changedCount" color="error" floating />
					</v-btn>
				</template>

				<v-list density="compact" min-width="220">
					<!-- Lưu thay đổi -->
					<uc-dialog-save :rows="saveRows" :loading="saving" @confirm="onConfirmSave">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" :disabled="changedCount === 0"
								prepend-icon="mdi-content-save-outline">
								<v-list-item-title>Lưu thay đổi</v-list-item-title>
							</v-list-item>
						</template>
					</uc-dialog-save>

					<!-- Đẩy điểm IELTS — chỉ hiện khi TA2 / Cấp 3 -->
					<template v-if="isTA2Mode">
						<uc-dialog-save-ielts :rows="ieltsPreviewRows" :loading="savingIelts"
							@confirm="onConfirmSaveIelts">
							<template #default="{ activatorProps }">
								<v-list-item v-bind="activatorProps" prepend-icon="mdi-upload-outline"
									@click="buildIeltsPreview">
									<v-list-item-title>Đẩy điểm IELTS</v-list-item-title>
								</v-list-item>
							</template>
						</uc-dialog-save-ielts>
					</template>

					<v-divider class="my-1" />

					<!-- Import eTest — chỉ TA2 -->
					<uc-dialog-etest-exam v-if="isTA2Mode" :so-cau-dung-options="soCauDungOptions"
						@apply="onEtestApply">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-file-import-outline">
								<v-list-item-title>Import eTest</v-list-item-title>
								<v-list-item-subtitle>Điền điểm từ file eTest</v-list-item-subtitle>
							</v-list-item>
						</template>
					</uc-dialog-etest-exam>

					<uc-dialog-thiet-lap-ki-nang :nienKhoa="vueData.NienKhoa" :classes="loadedClasses">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-cog-outline">
								<v-list-item-title>Thiết lập kĩ năng</v-list-item-title>
							</v-list-item>
						</template>
					</uc-dialog-thiet-lap-ki-nang>
				</v-list>
			</v-menu>
		</v-app-bar>

		<!-- ═══════════════════════════════════════ MAIN ══════════════════════════════════════ -->
		<v-main>
			<v-container v-if="!ready" class="fill-height d-flex align-center justify-center">
				<div class="text-center">
					<v-icon size="72" color="primary-lighten-3">mdi-table-large</v-icon>
					<div class="text-h6 mt-4 text-medium-emphasis">
						Chọn cấp, học kì, loại điểm rồi bấm
						<v-chip color="primary" size="small" class="mx-1">Tải dữ liệu</v-chip>
					</div>
					<div class="text-body-2 text-medium-emphasis mt-1">
						Mỗi lớp sẽ hiển thị thành 1 tab riêng
					</div>
				</div>
			</v-container>

			<div v-if="ready">
				<v-tabs v-model="activeWsIdx" color="primary" density="compact">
					<v-tab v-for="(meta, idx) in wsMeta" :key="idx" :value="idx">
						{{ meta.cls.name }}
					</v-tab>
				</v-tabs>
				<v-divider />
				<v-tabs-window v-model="activeWsIdx">
					<v-tabs-window-item v-for="(meta, idx) in wsMeta" :key="idx" :value="idx">
						<v-card-text class="pa-0">
							<div :ref="el => { if (el) { spreadsheetRefs[idx] = el; tryInitSpreadsheet(idx) } }"
								class="spreadsheet-wrap" />
						</v-card-text>
					</v-tabs-window-item>
				</v-tabs-window>
			</div>
		</v-main>
	</v-app>
</template>

<script>
	export default {
		name: 'Spreadsheet',
	
		data() {
			return {
				vueData,
				ready: false,
				loading: false,
				FREEZE_COLS: 5,
				activeWsIdx: 0,
	
				spreadsheetRefs: [],
				instances: [],
				worksheetConfigs: [],
				initializedTabs: new Set(),
	
				config: {
					cap: 'cap3',
					semesterPeriod: null,
					scoreType: null,
				},
	
				semesterPeriodOptions: [
					{ key: 'S1_Mid', label: 'HK1 - Giữa kì' },
					{ key: 'S1_Final', label: 'HK1 - Cuối kì' },
					{ key: 'S2_Mid', label: 'HK2 - Giữa kì' },
					{ key: 'S2_Final', label: 'HK2 - Cuối kì' },
				],
	
				SCORE_TYPES_CAP2: [
					{ key: 'HK', label: 'Điểm HK' },
					// Cambridge ẩn hoàn toàn — chưa build
				],
				SCORE_TYPES_CAP3: [
					{ key: 'HK', label: 'Điểm HK' },
					{ key: 'TA2', label: 'Điểm TA2 + IELTS' },
				],
	
				// Tất cả suffix hợp lệ để filter cột từ DB
				// IELTS _Point được thêm vào để detect kỹ năng nào có SoCauDung
				// (nếu DB không có _Point thì col đó sẽ không xuất hiện → nhập tay _Conv)
				VALID_COT_DIEM_SUFFIXES: [
					// HK chung
					'Listening_Point', 'Listening_Conv',
					'Language_Point', 'Language_Conv',
					'Reading_Point', 'Reading_Conv',
					'Writing_Point', 'Writing_Conv',
					'Speaking_Point', 'Speaking_Conv',
					'Total_Point', 'Total_Conv',
					// TA2
					'TA2_Listening_Point', 'TA2_Listening_Conv',
					'TA2_Reading_Point', 'TA2_Reading_Conv',
					'TA2_Writing_Point', 'TA2_Writing_Conv',
					'TA2_Speaking_Point', 'TA2_Speaking_Conv',
					'TA2_Avg_Point', 'TA2_Avg_Conv',
					'TA2_Point',
					// IELTS — _Point để detect, _Conv là cột lưu band score
					'IELTS_Listening_Point', 'IELTS_Listening_Conv',
					'IELTS_Reading_Point', 'IELTS_Reading_Conv',
					'IELTS_Writing_Point', 'IELTS_Writing_Conv',
					'IELTS_Speaking_Point', 'IELTS_Speaking_Conv',
					'IELTS_Band_Conv',
				],
	
				IELTS_SKILLS: ['Listening', 'Reading', 'Writing', 'Speaking'],
	
				loadedClasses: [],
				templateColsCache: {},
				_thietLapCache: null,
				_ieltsThietLapCache: null,
				changedCells: {},
				wsMeta: [],
				soCauDungOptions: [],
	
				saving: false,
				savingIelts: false,
				saveRows: [],
				ieltsPreviewRows: [],
			}
		},
	
		computed: {
			scoreTypeOptions() {
				return this.config.cap === 'cap2' ? this.SCORE_TYPES_CAP2 : this.SCORE_TYPES_CAP3
			},
	
			isTA2Mode() {
				return this.config.cap === 'cap3' && this.config.scoreType === 'TA2'
			},
	
			canLoad() {
				return !!this.config.cap && !!this.config.semesterPeriod && !!this.config.scoreType
			},
	
			// HK → 'S1_Mid' | TA2 → 'S1_Mid_TA2'
			activeNhomCotDiem() {
				const { semesterPeriod, scoreType } = this.config
				if (!semesterPeriod || !scoreType) return null
				return scoreType === 'HK' ? semesterPeriod : `${semesterPeriod}_${scoreType}`
			},
	
			changedCount() {
				return Object.keys(this.changedCells).length
			},
		},
	
		async mounted() {
			await this.loadAssets()
		},
	
		beforeUnmount() {
			this.destroyAllSpreadsheets()
		},
	
		methods: {
	
			// ─────────────────────────────────────────────────────────────────────────
			// CONFIG
			// ─────────────────────────────────────────────────────────────────────────
	
			onConfigChange() {
				// Reset scoreType nếu không còn hợp lệ với cấp mới
				const validKeys = this.scoreTypeOptions.map(o => o.key)
				if (!validKeys.includes(this.config.scoreType)) {
					this.config.scoreType = null
				}
				if (this.ready) {
					this.destroyAllSpreadsheets()
					this.ready = false
					this.wsMeta = []
					this.activeWsIdx = 0
					this.changedCells = {}
				}
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// LOAD
			// ─────────────────────────────────────────────────────────────────────────
	
			async loadAllClasses() {
				if (!this.canLoad || this.loading) return
				this.loading = true
				this.destroyAllSpreadsheets()
				this.templateColsCache = {}
				this._thietLapCache = null
				this.changedCells = {}
				this.wsMeta = []
	
				try {
					const fetchList = [this.fetchClasses(), this.fetchThietLapKiNang()]
					if (this.isTA2Mode) fetchList.push(this.fetchIeltsThietLap())
					const [classes, thietLapList] = await Promise.all(fetchList)
					this.loadedClasses = classes
	
					for (const cls of classes) {
						const [{ students, monHocLopID }, cols] = await Promise.all([
							this.fetchStudentsByClass(cls.id),
							this.fetchTemplateCols(cls.templateBangDiemID),
						])
						cls.monHocLopID = monHocLopID
						const { worksheetConfig, scoreDescs } = this.buildClassWorksheet(cls, students, cols, thietLapList)
						this.wsMeta.push({ cls, students, scoreDescs })
						this.worksheetConfigs.push(worksheetConfig)
					}
	
					this.soCauDungOptions = this.buildSoCauDungOptions()
					this.ready = true
				} finally {
					this.loading = false
				}
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// SPREADSHEET
			// ─────────────────────────────────────────────────────────────────────────
	
			tryInitSpreadsheet(idx) {
				if (this.initializedTabs.has(idx)) return
				const el = this.spreadsheetRefs[idx]
				const config = this.worksheetConfigs[idx]
				if (!el || !config) return
				this.initSpreadsheet(el, idx, config)
				this.initializedTabs.add(idx)
			},
	
			initSpreadsheet(el, idx, worksheetConfig) {
				const instance = jspreadsheet(el, {
					worksheets: [worksheetConfig],
					tabs: false,
					onbeforecreateworksheet: () => false,
					freezeColumns: this.FREEZE_COLS,
					onchange: async (el, cell, colIndex, rowIndex, value) => {
						const meta = this.wsMeta[idx]
						if (!meta) return
						const { cls, students, scoreDescs } = meta
						const scoreColIdx = colIndex - this.FREEZE_COLS
						if (scoreColIdx < 0) return
						const desc = scoreDescs[scoreColIdx]
						if (!desc || !desc.key) return
						const student = students[rowIndex]
						if (!student) return
	
						const ws = this.instances[idx]?.[0]
						const record = ws?.records?.[rowIndex]?.[colIndex]
						const rawValue = record?.element
							? (record.element.innerHTML ?? record.element.innerText ?? value)
							: value
	
						let actualValue
						if (rawValue === '' || rawValue === null || rawValue === undefined) {
							actualValue = null
						} else {
							const parsed = Number(rawValue)
							actualValue = isNaN(parsed) ? String(rawValue) : parsed
						}
	
						// Ghi vào changedCells
						const cellKey = `${idx}_${rowIndex}_${colIndex}`
						this.changedCells = {
							...this.changedCells,
							[cellKey]: {
								wsIdx: idx,
								nhomID: cls.id, tenNhom: cls.name,
								monHocLopID: cls.monHocLopID,
								hocSinhID: student.id, hoTen: student.hoTen,
								maCotDiem: desc.key, tenCotDiem: desc.title,
								cotDiemID: desc.cotDiemID ?? null,
								value: actualValue,
							},
						}
	
						// ── IELTS auto-calc ─────────────────────────────────────────────
						if (!this.isTA2Mode) return
						if (!desc.key?.includes('_IELTS_')) return
	
						// Ghi 1 ô vào spreadsheet + changedCells
						const setCell = (maCotDiem, bandVal) => {
							const di = scoreDescs.findIndex(d => d.key === maCotDiem)
							if (di === -1) return
							const ci = this.FREEZE_COLS + di
							const d = scoreDescs[di]
							if (ws) ws.setValueFromCoords(ci, rowIndex, bandVal ?? '', true)
							const k = `${idx}_${rowIndex}_${ci}`
							this.changedCells = {
								...this.changedCells,
								[k]: {
									wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
									monHocLopID: cls.monHocLopID,
									hocSinhID: student.id, hoTen: student.hoTen,
									maCotDiem, tenCotDiem: d.title,
									cotDiemID: d.cotDiemID ?? null,
									value: bandVal,
								},
							}
						}
	
						// Đọc Conv hiện tại từ changedCells
						const getConv = (kiNang) => {
							const hit = Object.values(this.changedCells).find(c =>
								c.wsIdx === idx &&
								c.hocSinhID === student.id &&
								c.maCotDiem?.includes(`_IELTS_${kiNang}_Conv`) &&
								!c.maCotDiem?.includes('__SoCauDung')
							)
							return hit !== undefined ? hit.value : null
						}
	
						// ── Case 1: User nhập SoCauDung → tính Conv qua bảng ───────────
						const lookupSkill = this.IELTS_SKILLS.find(k =>
							desc._isIeltsSoCauDung && desc._kiNang === k
						)
						if (lookupSkill) {
							const tbl = await this.fetchIeltsThietLap()
							const band = this.getBandScoreFromTable(tbl, lookupSkill, actualValue)
							const convDesc = scoreDescs.find(d =>
								d.key?.includes(`_IELTS_${lookupSkill}_Conv`) &&
								!d.key?.includes('__SoCauDung')
							)
							if (convDesc) setCell(convDesc.key, band)
						}
	
						// ── Case 2: User nhập tay Conv (Writing/Speaking) ───────────────
						// Đã ghi changedCells ở trên, không cần làm thêm
	
						// ── Tính lại Overall Band ───────────────────────────────────────
						await this.$nextTick()
						const scores = this.IELTS_SKILLS.map(k => getConv(k))
						const overall = this.calcOverallBand(...scores)
						const bandDesc = scoreDescs.find(d => d.key?.includes('_IELTS_Band_Conv'))
						if (bandDesc && overall !== null) setCell(bandDesc.key, overall)
					},
				})
				this.instances[idx] = instance
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// BUILD WORKSHEET
			// ─────────────────────────────────────────────────────────────────────────
	
			buildClassWorksheet(cls, students, cols, thietLapList) {
				const fixedDescs = [
					{ title: 'STT', key: null, colType: 'text', readOnly: true, width: '60px' },
					{ title: 'Mã học sinh', key: null, colType: 'text', readOnly: true, width: '110px' },
					{ title: 'Họ và tên', key: null, colType: 'text', readOnly: true, width: '180px' },
					{ title: 'English Name', key: null, colType: 'text', readOnly: true, width: '150px' },
					{ title: 'Lớp', key: null, colType: 'text', readOnly: true, width: '80px' },
				]
	
				const scoreDescs = []
				const prefix = this.activeNhomCotDiem  // e.g. "S2_Mid_TA2"
	
				// ── Phần 1: Cột TA2 từ DB (logic gốc, lọc bỏ IELTS nếu có) ─────────────
				for (let i = 0; i < cols.length; i++) {
					const c = cols[i]
	
					// Bỏ qua bất kỳ cột IELTS nào từ DB — sẽ inject thủ công ở Phần 2
					if (c.key?.includes('_IELTS_')) continue
	
					const isInputCol = c.type === 'number' && !c.formula
					if (isInputCol) {
						const convCol = (cols[i + 1]?.type === 'text' && cols[i + 1]?.formula) ? cols[i + 1] : null
						if (convCol) i++
						const soCau = this.getSoCau(thietLapList, cls.id, c.key)
						const soCauDungKey = `${c.key}__SoCauDung`
						scoreDescs.push({
							title: `${c.title} - Số câu đúng`, key: soCauDungKey,
							colType: 'numeric', readOnly: false, width: '150px',
						})
						scoreDescs.push({
							title: c.title, key: c.key,
							colType: 'numeric', readOnly: true, width: '130px',
							_isDiemTho: true, _soCauDungKey: soCauDungKey, _soCau: soCau,
						})
						scoreDescs.push({
							title: convCol ? convCol.title : `${c.title} - Quy đổi`,
							key: convCol ? convCol.key : null,
							colType: 'text', readOnly: true, width: '200px',
							_formulaTemplate: convCol?.formula ?? null,
						})
					} else if (c.type === 'number' && c.formula) {
						scoreDescs.push({
							title: c.title, key: c.key,
							colType: 'numeric', readOnly: true, width: '130px',
							_formulaTemplate: c.formula,
						})
					} else if (c.type === 'text' && c.formula) {
						scoreDescs.push({
							title: c.title, key: c.key,
							colType: 'text', readOnly: true, width: '200px',
							_formulaTemplate: c.formula,
						})
					} else {
						scoreDescs.push({
							title: c.title, key: c.key,
							colType: 'text', readOnly: false, width: '130px',
						})
					}
				}
	
				// ── Phần 2: Inject cột IELTS thủ công sau tất cả TA2 ────────────────────
				if (this.isTA2Mode) {
					// Lấy cột IELTS từ DB nếu có (để lấy title & cotDiemID)
					// Key pattern trong DB: S2_Mid_IELTS_Listening_Conv (MaNhomCotDiem = S2_Mid_TA2)
					const ieltsCols = cols.filter(c => c.key?.includes('_IELTS_'))
					const ieltsColMap = new Map(ieltsCols.map(c => [c.key, c]))
	
					// Helper lấy thông tin cột IELTS từ DB hoặc fallback default
					const getIeltsColInfo = (keySuffix, defaultTitle) => {
						// Tìm theo suffix, ví dụ 'IELTS_Listening_Conv'
						const found = ieltsCols.find(c => c.key?.endsWith(keySuffix))
						return {
							key: found?.key ?? `${prefix.replace('_TA2', '')}_${keySuffix}`,
							title: found?.title ?? defaultTitle,
							cotDiemID: found?.cotDiemID ?? null,
						}
					}
	
					// Listening — có SoCauDung → tính band
					const lConv = getIeltsColInfo('IELTS_Listening_Conv', 'IELTS Nghe')
					scoreDescs.push({
						title: 'IELTS Nghe - Số câu đúng',
						key: `${lConv.key}__SoCauDung`,
						colType: 'numeric', readOnly: false, width: '170px',
						_isIeltsSoCauDung: true, _kiNang: 'Listening',
					})
					scoreDescs.push({
						title: lConv.title, key: lConv.key,
						colType: 'numeric', readOnly: true, width: '130px',
						cotDiemID: lConv.cotDiemID,
					})
	
					// Reading — có SoCauDung → tính band
					const rConv = getIeltsColInfo('IELTS_Reading_Conv', 'IELTS Đọc')
					scoreDescs.push({
						title: 'IELTS Đọc - Số câu đúng',
						key: `${rConv.key}__SoCauDung`,
						colType: 'numeric', readOnly: false, width: '170px',
						_isIeltsSoCauDung: true, _kiNang: 'Reading',
					})
					scoreDescs.push({
						title: rConv.title, key: rConv.key,
						colType: 'numeric', readOnly: true, width: '130px',
						cotDiemID: rConv.cotDiemID,
					})
	
					// Writing — nhập tay
					const wConv = getIeltsColInfo('IELTS_Writing_Conv', 'IELTS Viết')
					scoreDescs.push({
						title: wConv.title, key: wConv.key,
						colType: 'numeric', readOnly: false, width: '130px',
						cotDiemID: wConv.cotDiemID,
					})
	
					// Speaking — nhập tay
					const sConv = getIeltsColInfo('IELTS_Speaking_Conv', 'IELTS Nói')
					scoreDescs.push({
						title: sConv.title, key: sConv.key,
						colType: 'numeric', readOnly: false, width: '130px',
						cotDiemID: sConv.cotDiemID,
					})
	
					// Overall Band — readonly, tự tính
					const bandConv = getIeltsColInfo('IELTS_Band_Conv', 'IELTS Overall Band')
					scoreDescs.push({
						title: bandConv.title, key: bandConv.key,
						colType: 'numeric', readOnly: true, width: '160px',
						cotDiemID: bandConv.cotDiemID,
					})
				}
	
				// ── Build columns + data ─────────────────────────────────────────────────
				const allDescs = [...fixedDescs, ...scoreDescs]
				const allColDefs = allDescs.map((d, i) => ({
					key: d.key, colLetter: this.colIndexToLetter(i), index: i,
				}))
				const columns = allDescs.map(d => ({
					type: d.colType,
					title: d.title,
					width: d.width ?? this.getColumnWidth(d.title, d.colType),
					readOnly: !!d.readOnly,
					...(d.colType === 'numeric' ? { mask: '0.00' } : {}),
				}))
	
				const data = students.map((s, sIdx) => {
					const rowIndex = sIdx + 1
					const fixedVals = [s.soTT, s.id, s.hoTen, s.englishName, s.tenLop]
					const scoreVals = scoreDescs.map(d => {
						if (d._isIeltsSoCauDung) return ''
						if (d._isDiemTho) {
							if (!d._soCau) return ''
							const def = allColDefs.find(c => c.key === d._soCauDungKey)
							if (!def) return ''
							return `=${def.colLetter}${rowIndex}*10/${d._soCau}`
						}
						if (d._formulaTemplate) return this.resolveFormula(d._formulaTemplate, allColDefs, rowIndex)
						return ''
					})
					return [...fixedVals, ...scoreVals]
				})
	
				return {
					scoreDescs,
					worksheetConfig: {
						worksheetName: cls.name, columns, data,
						allowInsertRow: false, allowDeleteRow: false,
					},
				}
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// IELTS PREVIEW
			// ─────────────────────────────────────────────────────────────────────────
	
			async buildIeltsPreview() {
				const tbl = await this.fetchIeltsThietLap()
	
				// Tìm key thực tế từ scoreDescs (không hardcode prefix)
				const getConvKey = (kiNang) => {
					for (const meta of this.wsMeta) {
						const d = meta.scoreDescs.find(d =>
							d.key?.includes(`_IELTS_${kiNang}_Conv`) &&
							!d.key?.includes('__SoCauDung')
						)
						if (d) return d.key
					}
					return null
				}
				const getBandKey = () => {
					for (const meta of this.wsMeta) {
						const d = meta.scoreDescs.find(d => d.key?.includes('_IELTS_Band_Conv'))
						if (d) return d.key
					}
					return null
				}
				const CONV_KEYS = Object.fromEntries(this.IELTS_SKILLS.map(k => [k, getConvKey(k)]))
				const BAND_KEY = getBandKey()
	
				// Đọc giá trị ô: changedCells → spreadsheet instance
				const getCellValue = (wsIdx, hocSinhID, maCotDiem) => {
					if (!maCotDiem) return null
					const hit = Object.values(this.changedCells).find(c =>
						c.wsIdx === wsIdx && c.hocSinhID === hocSinhID && c.maCotDiem === maCotDiem
					)
					if (hit) return hit.value
					const meta = this.wsMeta[wsIdx]
					if (!meta) return null
					const rowIdx = meta.students.findIndex(s => s.id === hocSinhID)
					if (rowIdx === -1) return null
					const di = meta.scoreDescs.findIndex(d => d.key === maCotDiem)
					if (di === -1) return null
					const ws = this.instances[wsIdx]?.[0]
					const raw = ws?.getValue?.(this.FREEZE_COLS + di, rowIdx)
					if (raw === '' || raw === null || raw === undefined) return null
					const num = Number(raw)
					return isNaN(num) ? raw : num
				}
	
				// Lấy band của 1 kỹ năng:
				//   Conv có giá trị → dùng luôn
				//   Conv null + có SoCauDung col → tính lại từ bảng
				const getSkillBand = (wsIdx, hocSinhID, kiNang, meta) => {
					const conv = getCellValue(wsIdx, hocSinhID, CONV_KEYS[kiNang])
					if (conv !== null) return conv
	
					const soCauDungKey = CONV_KEYS[kiNang] ? `${CONV_KEYS[kiNang]}__SoCauDung` : null
					if (soCauDungKey && meta.scoreDescs.some(d => d.key === soCauDungKey)) {
						const soCauDung = getCellValue(wsIdx, hocSinhID, soCauDungKey)
						if (soCauDung !== null) return this.getBandScoreFromTable(tbl, kiNang, soCauDung)
					}
					return null
				}
	
				const rows = []
				for (let wsIdx = 0; wsIdx < this.wsMeta.length; wsIdx++) {
					const meta = this.wsMeta[wsIdx]
					for (const student of meta.students) {
						const [listening, reading, writing, speaking] = this.IELTS_SKILLS.map(k =>
							getSkillBand(wsIdx, student.id, k, meta)
						)
						const hasAny = [listening, reading, writing, speaking].some(v => v !== null)
						if (!hasAny) continue
	
						let band = getCellValue(wsIdx, student.id, BAND_KEY)
						if (band === null) band = this.calcOverallBand(listening, reading, writing, speaking)
	
						const allFilled = [listening, reading, writing, speaking, band]
							.every(v => v !== null && v !== '')
	
						rows.push({
							tenNhom: meta.cls.name, hoTen: student.hoTen,
							listening, reading, writing, speaking, band,
							status: allFilled ? 'ok' : 'missing',
						})
					}
				}
				this.ieltsPreviewRows = rows
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// IELTS HELPERS
			// ─────────────────────────────────────────────────────────────────────────
	
			async fetchIeltsThietLap() {
				if (this._ieltsThietLapCache) return this._ieltsThietLapCache
				const data = await fetchPromise("lms/ThietLap_KiNang_IELTS_Get", { NienKhoa: vueData.NienKhoa })
				this._ieltsThietLapCache = data
				return data
			},
	
			getBandScoreFromTable(thietLapList, kiNang, soCauDung) {
				if (soCauDung === null || soCauDung === undefined || soCauDung === '') return null
				const num = Number(soCauDung)
				if (isNaN(num)) return null
				const row = thietLapList.find(t =>
					t.TenKiNang === kiNang &&
					num >= t.MinCorrectAns &&
					num <= t.MaxCorrectAns
				)
				return row ? row.BandScore : null
			},
	
			calcOverallBand(l, r, w, s) {
				const scores = [l, r, w, s]
				if (scores.some(v => v === null || v === undefined || v === '')) return null
				const avg = scores.reduce((a, b) => a + Number(b), 0) / 4
				// Quy tắc làm tròn IELTS: <0.25→floor | <0.75→floor+0.5 | >=0.75→ceil
				const dec = avg - Math.floor(avg)
				if (dec < 0.25) return Math.floor(avg)
				else if (dec < 0.75) return Math.floor(avg) + 0.5
				else return Math.ceil(avg)
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// API
			// ─────────────────────────────────────────────────────────────────────────
	
			async fetchClasses() {
				const data = await fetchPromise("lms/NhomAV_Get", { NienKhoa: vueData.NienKhoa })
				return data
					.filter(x => x.MonHocID === 76 && x.IsNhomLMS_GiaoBai === false)
					.map(x => ({
						id: x.NhomID, name: x.TenNhom,
						khoiID: x.KhoiID, templateBangDiemID: x.TemplateBangDiemID,
					}))
			},
	
			async fetchStudentsByClass(classId) {
				const data = await fetchPromise("lms/HocSinhNhom_Get_ByNhomID", {
					NienKhoa: vueData.NienKhoa, NhomID: classId,
				})
				const monHocLopID = data[0]?.MonHocLopID ?? null
				return {
					monHocLopID,
					students: data.map(x => ({
						id: x.HocSinhID, soTT: x.SoTT, hoTen: x.HoTen,
						englishName: x.EnglishName || '', tenLop: x.TenLop || '',
					})),
				}
			},
	
			async fetchTemplateCols(templateBangDiemID) {
				if (!templateBangDiemID) return []
				if (!this.templateColsCache[templateBangDiemID]) {
					const data = await fetchPromise(
						"lms/NhomCauTrucDiem_Get_All_ByTemplateBangDiemID",
						{ TemplateBangDiemID: templateBangDiemID }
					)
					this.templateColsCache[templateBangDiemID] = data
				}
				const allCols = this.templateColsCache[templateBangDiemID]
				const targetNhom = this.activeNhomCotDiem
				return allCols
					.filter(c => {
						if (c.MaNhomCotDiem !== targetNhom) return false
						return this.VALID_COT_DIEM_SUFFIXES.some(s => c.MaCotDiem.endsWith(s))
					})
					.sort((a, b) => a.ThuTuCotDiem - b.ThuTuCotDiem)
					.map(c => ({
						key: c.MaCotDiem, title: c.TenCotDiem_VI,
						type: c.GiaTriCotDiem, formula: c.Formula || null,
						cotDiemID: c.CotDiemID,
					}))
			},
	
			async fetchThietLapKiNang() {
				if (this._thietLapCache) return this._thietLapCache
				const data = await fetchPromise("lms/ThietLap_KiNang_Get", { NienKhoa: vueData.NienKhoa })
				this._thietLapCache = data
				return data
			},
	
			getSoCau(thietLapList, nhomID, maCotDiem) {
				const row = thietLapList.find(t =>
					t.MaCotDiem === maCotDiem &&
					t.Enable !== false &&
					t.List_NhomID.split(',').map(s => s.trim()).includes(String(nhomID))
				)
				return row ? row.SoCau : null
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// CONFIRM HANDLERS
			// ─────────────────────────────────────────────────────────────────────────
	
			async onConfirmSave({ close }) {
				// await fetchPromise(...)
				this.changedCells = {}
				close()
			},
	
			async onConfirmSaveIelts({ rows, close }) {
				// await fetchPromise(...)
				close()
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// ETEST
			// ─────────────────────────────────────────────────────────────────────────
	
			async onEtestApply({ students, mapping, lopID }) {
				let targetIdx = this.activeWsIdx
				if (lopID) {
					const norm = String(lopID).trim().toLowerCase()
					const found = this.wsMeta.findIndex(meta =>
						String(meta.cls.name).trim().toLowerCase().includes(norm) ||
						norm.includes(String(meta.cls.name).trim().toLowerCase())
					)
					if (found !== -1) targetIdx = found
					else { alert(`Không tìm thấy tab khớp với lớp "${lopID}".`); return }
				}
				this.activeWsIdx = targetIdx
				await this.$nextTick()
				if (!this.initializedTabs.has(targetIdx)) {
					await new Promise(r => setTimeout(r, 300))
				}
				const meta = this.wsMeta[targetIdx]
				const instance = this.instances[targetIdx]
				if (!meta || !instance) return
				const ws = instance[0]
				if (!ws) return
	
				const { students: cls, scoreDescs } = meta
				const etestMap = new Map(students.map(s => [String(s.StudentID), s]))
				const descMap = new Map(scoreDescs.map((d, i) => [d.key, i]))
				const rowMap = new Map(cls.map((s, i) => [String(s.id), i]))
				let total = 0
	
				for (const [sid, eRow] of etestMap) {
					const rowIdx = rowMap.get(sid)
					if (rowIdx === undefined) continue
					for (const [skillKey, descKey] of Object.entries(mapping)) {
						const val = eRow[skillKey]
						if (val === null || val === undefined) continue
						const di = descMap.get(descKey)
						if (di === undefined) continue
						const ci = this.FREEZE_COLS + di
						try {
							if (ws.options?.data?.[rowIdx]) ws.options.data[rowIdx][ci] = val
							const rec = ws.records?.[rowIdx]?.[ci]
							if (rec?.element) rec.element.innerHTML = val
							ws.setValueFromCoords(ci, rowIdx, val, true)
							total++
						} catch (e) { console.error(e) }
					}
				}
				console.log(`[onEtestApply] tab[${targetIdx}] "${meta.cls.name}" — ${total} ô`)
			},
	
			// ─────────────────────────────────────────────────────────────────────────
			// MISC
			// ─────────────────────────────────────────────────────────────────────────
	
			buildSoCauDungOptions() {
				if (!this.wsMeta.length) return []
				const seen = new Set()
				return this.wsMeta[0].scoreDescs
					.filter(d => !d.readOnly && d.key?.endsWith('__SoCauDung') && !d._isIeltsSoCauDung && !seen.has(d.key) && seen.add(d.key))
					.map(d => ({ key: d.key, label: d.title }))
			},
	
			colIndexToLetter(index) {
				let letter = '', n = index + 1
				while (n > 0) {
					const rem = (n - 1) % 26
					letter = String.fromCharCode(65 + rem) + letter
					n = Math.floor((n - 1) / 26)
				}
				return letter
			},
	
			resolveFormula(formula, allColDefs, rowIndex) {
				if (!formula) return ''
				let f = formula.replace(/\bIIF\b/g, 'IF')
				f = f.replace(/\b([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+)\b/g, match => {
					const found = allColDefs.find(c => c.key === match)
					return found ? `${found.colLetter}${rowIndex}` : match
				})
				return `=${f}`
			},
	
			destroyAllSpreadsheets() {
				this.spreadsheetRefs.forEach(el => {
					if (el) { try { jspreadsheet.destroy(el) } catch (_) { } }
				})
				this.instances = []
				this.spreadsheetRefs = []
				this.worksheetConfigs = []
				this.initializedTabs = new Set()
			},
	
			getColumnWidth(title, colType, options = {}) {
				const { minWidth = 60, maxWidth = 400, charWidth = 8, padding = 24, extraForNumeric = 20 } = options
				if (!title) return `${minWidth}px`
				const base = title.length * charWidth + padding
				const w = colType === 'numeric' ? base + extraForNumeric : base
				return `${Math.ceil(Math.min(Math.max(w, minWidth), maxWidth) / 10) * 10}px`
			},
	
			loadAssets() {
				;[
					'https://bossanova.uk/jspreadsheet/v5/jspreadsheet.css',
					'https://jsuites.net/v5/jsuites.css',
					'https://fonts.googleapis.com/css?family=Material+Icons',
				].forEach(href => {
					if (!document.querySelector(`link[href="${href}"]`)) {
						document.head.appendChild(
							Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
						)
					}
				})
				return this.loadScript('https://jsuites.net/v5/jsuites.js')
					.then(() => this.loadScript('https://bossanova.uk/jspreadsheet/v5/jspreadsheet.js'))
			},
	
			loadScript(src) {
				return new Promise((resolve, reject) => {
					if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
					const s = document.createElement('script')
					s.src = src; s.onload = resolve; s.onerror = reject
					document.head.appendChild(s)
				})
			},
		},
	}
</script>