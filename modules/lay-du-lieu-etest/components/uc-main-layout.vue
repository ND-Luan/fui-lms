<template>
	<v-app>
		<v-app-bar height="56" elevation="1">
			<v-app-bar-title>
				<div class="d-flex align-center ga-2">
					<v-icon color="white" size="20">mdi-table-large</v-icon>
					<span class="text-subtitle-1 font-weight-bold text-white">Lấy dữ liệu eTest</span>
				</div>
			</v-app-bar-title>

			<v-btn-toggle v-model="config.cap" mandatory density="compact" variant="outlined" class="mx-2 bg-white"
				@update:model-value="onConfigChange">
				<v-btn value="cap2" size="small">Cấp 2</v-btn>
				<v-btn value="cap3" size="small">Cấp 3</v-btn>
			</v-btn-toggle>

			<v-select v-model="config.semesterPeriod" :items="semesterPeriodOptions" item-title="label" item-value="key"
				placeholder="Học kì / Kì thi" density="compact" variant="outlined" hide-details bg-color="white"
				class="mx-2" style="max-width:200px" @update:model-value="onConfigChange" />

			<v-select v-model="config.scoreType" :items="scoreTypeOptions" item-title="label" item-value="key"
				placeholder="Loại điểm" density="compact" variant="outlined" hide-details bg-color="white" class="mx-2"
				style="max-width:200px" @update:model-value="onConfigChange" />

			<v-btn variant="outlined" :disabled="!canLoad || loading" :loading="loading" class="mr-2"
				@click="loadAllClasses">
				<v-icon start size="16">mdi-play-circle-outline</v-icon>
				Tải dữ liệu
			</v-btn>

			<v-menu offset-y>
				<template #activator="{ props }">
					<v-btn v-bind="props" variant="outlined" :disabled="!ready" class="mr-2">
						<v-icon start size="16">mdi-dots-vertical</v-icon>
						Hành động
						<v-badge v-if="changedCount > 0" :content="changedCount" color="error" floating />
					</v-btn>
				</template>

				<v-list density="compact" min-width="220">
					<uc-dialog-save :rows="saveRows" :loading="saving" @confirm="onConfirmSaveActual">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" :disabled="changedCount === 0"
								prepend-icon="mdi-content-save-outline">
								<v-list-item-title>Lưu thay đổi</v-list-item-title>
							</v-list-item>
						</template>
					</uc-dialog-save>

					<v-divider class="my-1" />

					<uc-dialog-etest-exam v-if="isTA2Mode || config.cap === 'cap2'"
						:so-cau-dung-options="soCauDungOptions" @apply="onEtestApply">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-file-import-outline">
								<v-list-item-title>Import eTest</v-list-item-title>
								<v-list-item-subtitle>Điền điểm từ file eTest</v-list-item-subtitle>
							</v-list-item>
						</template>
					</uc-dialog-etest-exam>

					<uc-dialog-quan-li-ki-thi :classes="loadedClasses" :nienKhoa="vueData.NienKhoa"
						:hoc-ky="selectedSemesterHocKy" :wsMeta="wsMeta" :active-tab-meta="wsMeta[activeWsIdx]"
						@apply="onQuanLiKiThiApply">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-clipboard-list-outline">
								<v-list-item-title>Quản lí kì thi</v-list-item-title>
								<v-list-item-subtitle>Đẩy điểm từ kì thi</v-list-item-subtitle>
							</v-list-item>
						</template>
					</uc-dialog-quan-li-ki-thi>

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

		<v-main>
			<v-container v-if="!ready" class="fill-height d-flex align-center justify-center">
				<div class="text-center">
					<v-icon size="72" color="primary-lighten-3">mdi-table-large</v-icon>
					<div class="text-h6 mt-4 text-medium-emphasis">
						Chọn cấp, học kì, loại điểm rồi bấm
						<v-chip color="primary" size="small" class="mx-1">Tải dữ liệu</v-chip>
					</div>
					<div class="text-body-2 text-medium-emphasis mt-1">Mỗi lớp sẽ hiển thị thành 1 tab riêng</div>
				</div>
			</v-container>

			<div v-if="ready">
				<v-tabs v-model="activeWsIdx" color="primary" density="compact">
					<v-tab v-for="(meta, idx) in wsMeta" :key="idx" :value="idx">{{ meta.cls.name }}</v-tab>
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
			FREEZE_COLS: GRADE_CONFIG.FREEZE_COLS,
			activeWsIdx: 0,
			spreadsheetRefs: [],
			instances: [],
			worksheetConfigs: [],
			initializedTabs: new Set(),
			_suppressOnChange: false,
			config: { cap: 'cap3', semesterPeriod: null, scoreType: null },
			semesterPeriodOptions: GRADE_CONFIG.SEMESTER_OPTIONS,
			loadedClasses: [],
			templateColsCache: {},
			_thietLapCache: null,
			_ieltsThietLapCache: null,
			changedCells: {},
			wsMeta: [],
			soCauDungOptions: [],
			saving: false,
		}
	},

	computed: {
		saveRows() {
			return buildSaveRows(this.changedCells)
		},
		scoreTypeOptions() { return this.config.cap === 'cap2' ? GRADE_CONFIG.SCORE_TYPES_CAP2 : GRADE_CONFIG.SCORE_TYPES_CAP3 },
		isTA2Mode() { return this.config.cap === 'cap3' && this.config.scoreType === 'TA2' },
		canLoad() { return !!this.config.cap && !!this.config.semesterPeriod && !!this.config.scoreType },
		activeNhomCotDiem() {
			const { semesterPeriod, scoreType } = this.config
			if (!semesterPeriod || !scoreType) return null
			return scoreType === 'HK' ? semesterPeriod : `${semesterPeriod}_${scoreType}`
		},
		cbNhomCotDiem() {
			if (this.config.cap !== 'cap2' || !this.config.semesterPeriod) return null
			return `${this.config.semesterPeriod}_CB`
		},
		changedCount() { return Object.keys(this.changedCells).length },
		selectedSemesterHocKy() {
			const opt = this.semesterPeriodOptions.find(o => o.key === this.config.semesterPeriod)
			return opt?.HocKi ?? 2
		},
	},

	async mounted() { await this.loadAssets() },
	beforeUnmount() { this.destroyAllSpreadsheets() },

	methods: {

		// ════════════════════════════════════════════════
		// CONFIG & LIFECYCLE
		// ════════════════════════════════════════════════

		onConfigChange() {
			const validKeys = this.scoreTypeOptions.map(o => o.key)
			if (!validKeys.includes(this.config.scoreType)) this.config.scoreType = null
			if (this.ready) {
				this.destroyAllSpreadsheets()
				this.ready = false; this.wsMeta = []; this.activeWsIdx = 0; this.changedCells = {}
			}
		},

		async loadAllClasses() {
			if (!this.canLoad || this.loading) return
			this.loading = true
			this.destroyAllSpreadsheets()
			this.templateColsCache = {}; this._thietLapCache = null; this.changedCells = {}; this.wsMeta = []
			try {
				const fetchList = [fetchClasses(vueData.NienKhoa, this.config.cap), this.fetchThietLapKiNang()]
				if (this.isTA2Mode) fetchList.push(this.fetchIeltsThietLap())
				const [classes, thietLapList] = await Promise.all(fetchList)
				this.loadedClasses = classes
				for (const cls of classes) {
					const { students, cols, monHocLopID, gradesMap } = await this.fetchTemplateCols(cls.templateBangDiemID, cls)
					// ✅ Chỉ set nếu chưa có (monHocLopID từ fetchClasses ưu tiên hơn)
					if (!cls.monHocLopID) cls.monHocLopID = monHocLopID
					const { worksheetConfig, scoreDescs } = this.buildClassWorksheet(cls, students, cols, thietLapList, gradesMap)
					// ⚠️ Cảnh báo cột SoCauDung chưa có thiết lập kĩ năng
					const missingSoCau = scoreDescs.filter(d => d.key?.includes('__SoCauDung') && !d._soCau)
					if (missingSoCau.length > 0) {
						console.warn(`[ThiếtLậpKĩNăng] Lớp "${cls.name}" — ${missingSoCau.length} cột chưa có SoCau:`,
							missingSoCau.map(d => d.key))
					}
					const hasIelts = GRADE_CONFIG.IELTS_NHOM_IDS.has(cls.id)
					this.wsMeta.push({ cls, students, scoreDescs, gradesMap, hasIelts })
					this.worksheetConfigs.push(worksheetConfig)
				}
				this.soCauDungOptions = this.buildSoCauDungOptions()
				this.ready = true
			} finally { this.loading = false }
		},

		destroyAllSpreadsheets() {
			this.spreadsheetRefs.forEach(el => { if (el) { try { jspreadsheet.destroy(el) } catch (_) { } } })
			this.instances = []; this.spreadsheetRefs = []; this.worksheetConfigs = []; this.initializedTabs = new Set()
		},

		// ════════════════════════════════════════════════
		// SPREADSHEET INIT
		// ════════════════════════════════════════════════

		tryInitSpreadsheet(idx) {
			if (this.initializedTabs.has(idx)) return
			const el = this.spreadsheetRefs[idx]
			const config = this.worksheetConfigs[idx]
			if (!el || !config) return
			this.initSpreadsheet(el, idx, config)
			this.initializedTabs.add(idx)
		},

		initSpreadsheet(el, idx, worksheetConfig) {
			const meta = this.wsMeta[idx]
			applyColumnFormatters(worksheetConfig, meta.scoreDescs, this.FREEZE_COLS)

			const $this = this
			const instance = jspreadsheet(el, {
				worksheets: [worksheetConfig],
				tabs: false,
				onbeforecreateworksheet: () => false,
				freezeColumns: this.FREEZE_COLS,
				onchange: (el, cell, colIndex, rowIndex, value) => {
					$this._handleCellChange(idx, colIndex, rowIndex, value)
				},
			})
			this.instances[idx] = instance

			// Force render SoCauDung lần đầu load
			requestAnimationFrame(() => {
				const ws = instance[0]
				if (!ws || !meta) return
				const { scoreDescs, students } = meta
				scoreDescs.forEach((desc, scoreIdx) => {
					if (!desc.key?.includes('__SoCauDung') || !desc._soCau) return
					const ci = this.FREEZE_COLS + scoreIdx
					students.forEach((_, rowIdx) => {
						const rec = ws.records?.[rowIdx]?.[ci]
						if (!rec?.element) return
						const val = ws.getValueFromCoords(ci, rowIdx)
						if (val === '' || val === null || val === undefined) return
						rec.element.innerText = `${val}/${desc._soCau}`
					})
				})
			})
		},

		// ════════════════════════════════════════════════
		// CELL CHANGE HANDLER
		// ════════════════════════════════════════════════

		_handleCellChange(idx, colIndex, rowIndex, value) {
			if (this._suppressOnChange) return
			const meta = this.wsMeta[idx]
			if (!meta) return
			const { cls, students, scoreDescs } = meta
			const scoreColIdx = colIndex - this.FREEZE_COLS
			if (scoreColIdx < 0) return
			const desc = scoreDescs[scoreColIdx]
			if (!desc || !desc.key) return
			// ✅ Bỏ qua các cột IELTS formula — không record vào changedCells
			if (desc._isIeltsScore || desc._isIeltsOverallBand) {
				if (!meta.hasIelts) return  // ✅ lớp không có IELTS → bỏ qua hoàn toàn
			}
			const student = students[rowIndex]
			if (!student) return
			const ws = this.instances[idx]?.[0]

			const actualValue = this._parseValue(value)
			const cellKey = `${idx}_${rowIndex}_${colIndex}`
			const prevEntry = this.changedCells[cellKey]
			const existingGrade = meta.gradesMap?.get(`${student.id}_${desc.key}`)
			const oldValueSnapshot = prevEntry?.oldValue ?? null
			const kqhtID = existingGrade?.kqhtID ?? null
			this.changedCells = {
				...this.changedCells,
				[cellKey]: {
					wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
					monHocLopID: cls.monHocLopID,
					hocSinhID: student.id, hoTen: student.hoTen,
					maCotDiem: desc.key, tenCotDiem: desc.title,
					cotDiemID: desc.cotDiemID ?? null,
					value: actualValue, kqhtID, oldValue: oldValueSnapshot,
				},
			}

			// Nếu là ô SoCauDung → tự động tính DiemTho + CB + Avg
			if (desc.key?.includes('__SoCauDung')) {
				const pendingUpdates = this._propagateSoCauDung(idx, rowIndex, desc, actualValue, ws)
				this._propagateAvgPoint(idx, rowIndex, ws, pendingUpdates)
			}
		},

		_propagateSoCauDung(idx, rowIndex, soCauDungDesc, soCauDungVal, ws) {
			const meta = this.wsMeta[idx]
			const { patch = {}, cellUpdates = {} } = propagateSoCauDung(
				{ ...meta, FREEZE_COLS: this.FREEZE_COLS, cap: this.config.cap },
				idx, rowIndex, soCauDungDesc, soCauDungVal, ws
			)
			Object.entries(cellUpdates).forEach(([ci, val]) => this._applyCell(ws, Number(ci), rowIndex, val))
			this.changedCells = { ...this.changedCells, ...patch }
			// Trả về cellUpdates để caller dùng làm pendingUpdates cho _propagateAvgPoint
			return cellUpdates
		},

		_propagateAvgPoint(idx, rowIndex, ws, pendingUpdates = {}) {
			const meta = this.wsMeta[idx]
			const { patch = {}, cellUpdates = {} } = propagateAvgPoint(
				{ ...meta, FREEZE_COLS: this.FREEZE_COLS, cap: this.config.cap },
				idx, rowIndex, ws,
				pendingUpdates
			)
			Object.entries(cellUpdates).forEach(([ci, val]) => this._applyCell(ws, Number(ci), rowIndex, val))
			this.changedCells = { ...this.changedCells, ...patch }
		},

		// async onConfirmSave() {
		// 	this.saveRows = buildSaveRows(this.changedCells)
		// },
		// ════════════════════════════════════════════════
		// ETEST APPLY
		// ════════════════════════════════════════════════

		async onEtestApply({ students, mapping, lopIDs, selectedLopID, convertIelts = true, hasSkillKeys = true }) {
			const norm = String(selectedLopID ?? lopIDs?.[0] ?? '').trim().toLowerCase()
			const targetIdx = this.wsMeta.findIndex(meta => {
				const name = String(meta.cls.name).trim().toLowerCase()
				return name === norm || name.includes(norm) || norm.includes(name)
			})

			if (targetIdx === -1) {
				alert(`Không tìm thấy tab khớp với lớp "${selectedLopID}".\nCác tab hiện có: ${this.wsMeta.map(m => m.cls.name).join(', ')}`)
				return
			}

			this.activeWsIdx = targetIdx
			await this.$nextTick()
			if (!this.initializedTabs.has(targetIdx)) await new Promise(r => setTimeout(r, 300))

			const meta = this.wsMeta[targetIdx]
			const instance = this.instances[targetIdx]
			if (!meta || !instance) return
			const ws = instance[0]
			if (!ws) return

			const { cls, students: clsStudents, scoreDescs } = meta
			const etestMap = new Map(students.map(s => [String(s.StudentID), s]))
			const descMap = new Map(scoreDescs.map((d, i) => [d.key, i]))
			const rowMap = new Map(clsStudents.map((s, i) => [String(s.id), i]))
			const allUpdates = {}
			const changedBuffer = {}

			const oldValueSnapshot = {}
			const snapOldValue = (rowIdx, ci) => {
				const k = `${rowIdx}_${ci}`
				if (oldValueSnapshot[k] !== undefined) return
				const raw = ws.getValueFromCoords(ci, rowIdx)
				if (typeof raw === 'string' && raw.startsWith('=')) {
					oldValueSnapshot[k] = null
					return
				}
				oldValueSnapshot[k] = (raw !== null && raw !== undefined && raw !== '')
					? (isNaN(Number(raw)) ? raw : Number(raw))
					: null
			}

			const recordUpdate = (rowIdx, ci, maCotDiem, val) => {
				if (typeof val === 'string' && val.startsWith('=')) return
				snapOldValue(rowIdx, ci)
				if (!allUpdates[rowIdx]) allUpdates[rowIdx] = {}
				allUpdates[rowIdx][ci] = val

				const d = scoreDescs[ci - this.FREEZE_COLS]
				const student = clsStudents[rowIdx]
				if (!student) return

				const lookupKey = maCotDiem.includes('__SoCauDung')
					? maCotDiem.replace('__SoCauDung', '')
					: maCotDiem
				const existingGrade = meta.gradesMap?.get(`${student.id}_${lookupKey}`)
				const kqhtID = existingGrade?.kqhtID || null
				const cotDiemID = d?.cotDiemID ?? existingGrade?.cotDiemID ?? null
				const monHocLopID = cls.monHocLopID ?? existingGrade?.monHocLopID ?? null

				changedBuffer[`${targetIdx}_${rowIdx}_${ci}`] = {
					wsIdx: targetIdx, nhomID: cls.id, tenNhom: cls.name,
					monHocLopID,
					hocSinhID: student.id, hoTen: student.hoTen,
					maCotDiem, tenCotDiem: d?.title ?? maCotDiem,
					cotDiemID,
					value: val,
					oldValue: oldValueSnapshot[`${rowIdx}_${ci}`],
					kqhtID,
				}
			}

			// Helper: apply 1 cell lên UI + allUpdates + recordUpdate
			const applyAndRecord = (rowIdx, ci, maCotDiem, val) => {
				snapOldValue(rowIdx, ci)
				this._applyCell(ws, ci, rowIdx, val)
				if (!allUpdates[rowIdx]) allUpdates[rowIdx] = {}
				allUpdates[rowIdx][ci] = val
				recordUpdate(rowIdx, ci, maCotDiem, val)
			}

			// ════════════════════════════════════════════════
			// CAP2: không có skill keys — SoCauDung → 1 cột duy nhất
			// ════════════════════════════════════════════════
			if (!hasSkillKeys) {
				const maCotDiem = mapping.__SoCauDung_Direct
				if (!maCotDiem) return
				const di = descMap.get(maCotDiem)
				if (di === undefined) return

				// Pass 1: SoCauDung + DiemTho — apply ngay lên UI
				for (const [sid, eRow] of etestMap) {
					const rowIdx = rowMap.get(sid)
					if (rowIdx === undefined) continue
					const val = eRow.SoCauDung
					if (val === null || val === undefined) continue

					// Ghi SoCauDung
					applyAndRecord(rowIdx, this.FREEZE_COLS + di, maCotDiem, val)

					// Tính DiemTho = (SoCauDung / SoCau) * DiemMax — apply ngay
					const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === maCotDiem)
					if (diemThoDesc) {
						const soCau = diemThoDesc._soCau ?? eRow.SoCauLam ?? null
						const diemMax = diemThoDesc.diemMax ?? 10
						if (soCau) {
							const diemThoVal = parseFloat(((val / soCau) * diemMax).toFixed(2))
							const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
							if (diemThoIdx !== -1)
								applyAndRecord(rowIdx, this.FREEZE_COLS + diemThoIdx, diemThoDesc.key, diemThoVal)
						}
					}
				}

				// Pass 2: Total_Point — đọc DiemTho từ ws.options.data (đã apply ở Pass 1)
				const totalPointDesc = scoreDescs.find(d =>
					d._formulaTemplate &&
					!d._isAvgPoint &&
					d.key?.endsWith('_Total_Point')
				)
				if (totalPointDesc) {
					const totalIdx = scoreDescs.findIndex(d => d.key === totalPointDesc.key)
					const totalCi = this.FREEZE_COLS + totalIdx

					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
						const totalVal = evaluateFormulaString(totalPointDesc._formulaTemplate, valueMap)
						if (totalVal !== null && totalVal !== undefined)
							applyAndRecord(rowIdx, totalCi, totalPointDesc.key, totalVal)
					}
				}

				// Pass 3: Avg_Point — lấy tất cả _isDiemTho chia cho tổng số kỹ năng
				const avgPointDesc = scoreDescs.find(d => d._isAvgPoint)
				if (avgPointDesc) {
					const avgIdx = scoreDescs.findIndex(d => d.key === avgPointDesc.key)
					const avgCi = this.FREEZE_COLS + avgIdx
					const diemThoDescs = scoreDescs.filter(d => d._isDiemTho)
					const totalSkills = diemThoDescs.length

					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)

						const vals = diemThoDescs.map(desc => {
							const ci = this.FREEZE_COLS + scoreDescs.indexOf(desc)
							// ✅ Ưu tiên allUpdates (đã apply), fallback ws.options.data
							const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
							return (v !== null && v !== undefined && v !== '') ? Number(v) : null
						})

						const sum = vals.reduce((a, v) => a + (v ?? 0), 0)
						const avg = parseFloat((sum / totalSkills).toFixed(2))
						applyAndRecord(rowIdx, avgCi, avgPointDesc.key, avg)
					}
				}

				// Pass 4: CB_Point = (DiemTho / DiemMax) * 100
				const cbPointDescs = scoreDescs.filter(d => d._isCambridgePoint && d._hkPointKey && d._diemMax)
				for (const cbDesc of cbPointDescs) {
					const cbIdx = scoreDescs.findIndex(d => d.key === cbDesc.key)
					if (cbIdx === -1) continue
					const cbCi = this.FREEZE_COLS + cbIdx
					const hkIdx = scoreDescs.findIndex(d => d.key === cbDesc._hkPointKey)
					if (hkIdx === -1) continue
					const hkCi = this.FREEZE_COLS + hkIdx
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const hkVal = allUpdates[rowIdx]?.[hkCi] ?? ws.options?.data?.[rowIdx]?.[hkCi]
						if (hkVal === null || hkVal === undefined || hkVal === '') continue
						const cbVal = parseFloat((Number(hkVal) / cbDesc._diemMax * 100).toFixed(2))
						applyAndRecord(rowIdx, cbCi, cbDesc.key, cbVal)
					}
				}

				// Pass 4b: CB_Conv = CB_CONV(cbPoint, khoiID)
				const cbConvDescs = scoreDescs.filter(d => d._isCambridgeConv && d._cbPointKey)
				for (const cbConvDesc of cbConvDescs) {
					const convIdx = scoreDescs.findIndex(d => d.key === cbConvDesc.key)
					if (convIdx === -1) continue
					const convCi = this.FREEZE_COLS + convIdx
					const cbPtIdx = scoreDescs.findIndex(d => d.key === cbConvDesc._cbPointKey)
					if (cbPtIdx === -1) continue
					const cbPtCi = this.FREEZE_COLS + cbPtIdx
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const cbPtVal = allUpdates[rowIdx]?.[cbPtCi] ?? ws.options?.data?.[rowIdx]?.[cbPtCi]
						if (cbPtVal === null || cbPtVal === undefined || cbPtVal === '') continue
						const convVal = calcCambridgeConv(Number(cbPtVal), cls.khoiID) ?? ''
						if (convVal !== '') applyAndRecord(rowIdx, convCi, cbConvDesc.key, convVal)
					}
				}

				// Pass 4c: CB_Avg_Point = trung bình các CB_Point
				const cbAvgPointDesc = scoreDescs.find(d => d._isAvgPoint && d.key?.includes('_CB_'))
				if (cbAvgPointDesc) {
					const cbAvgIdx = scoreDescs.findIndex(d => d.key === cbAvgPointDesc.key)
					const cbAvgCi = this.FREEZE_COLS + cbAvgIdx
					const cbSkillDescs = scoreDescs.filter(d => d._isCambridgePoint && d._hkPointKey)
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const vals = cbSkillDescs.map(d => {
							const ci = this.FREEZE_COLS + scoreDescs.indexOf(d)
							const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
							return (v !== null && v !== undefined && v !== '') ? Number(v) : null
						}).filter(v => v !== null)
						if (!vals.length) continue
						const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
						applyAndRecord(rowIdx, cbAvgCi, cbAvgPointDesc.key, avg)
					}
				}

				// Pass 4d: CB_Avg_Conv = CB_CONV(cbAvgPoint, khoiID)
				if (cbAvgPointDesc) {
					const cbAvgConvKey = cbAvgPointDesc.key.replace('_Avg_Point', '_Avg_Conv')
					const cbAvgConvDesc = scoreDescs.find(d => d.key === cbAvgConvKey)
					if (cbAvgConvDesc) {
						const cbAvgIdx = scoreDescs.findIndex(d => d.key === cbAvgPointDesc.key)
						const cbAvgCi = this.FREEZE_COLS + cbAvgIdx
						const cbAvgConvIdx = scoreDescs.findIndex(d => d.key === cbAvgConvKey)
						const cbAvgConvCi = this.FREEZE_COLS + cbAvgConvIdx
						for (const rowIdxStr of Object.keys(allUpdates)) {
							const rowIdx = Number(rowIdxStr)
							const avgVal = allUpdates[rowIdx]?.[cbAvgCi] ?? ws.options?.data?.[rowIdx]?.[cbAvgCi]
							if (avgVal === null || avgVal === undefined || avgVal === '') continue
							const convVal = calcCambridgeConv(Number(avgVal), cls.khoiID) ?? ''
							if (convVal !== '') applyAndRecord(rowIdx, cbAvgConvCi, cbAvgConvDesc.key, convVal)
						}
					}
				}

				this.changedCells = { ...this.changedCells, ...changedBuffer }
				const totalCells = Object.values(allUpdates).reduce((s, c) => s + Object.keys(c).length, 0)
				console.log(`[onEtestApply][cap2] tab[${targetIdx}] "${cls.name}" — ${totalCells} ô`)
				return
			}

			// ════════════════════════════════════════════════
			// CAP3: có skill keys — mapping từng kỹ năng
			// ════════════════════════════════════════════════
			for (const [sid, eRow] of etestMap) {
				const rowIdx = rowMap.get(sid)
				if (rowIdx === undefined) continue

				for (const [skillKey, descKey] of Object.entries(mapping)) {
					const val = eRow[skillKey]
					if (val === null || val === undefined) continue
					const di = descMap.get(descKey)
					if (di === undefined) continue

					recordUpdate(rowIdx, this.FREEZE_COLS + di, descKey, val)

					if (!descKey.includes('__SoCauDung')) continue
					const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === descKey)
					if (!diemThoDesc || !diemThoDesc._soCau) continue

					const diemThoVal = parseFloat((val * 10 / diemThoDesc._soCau).toFixed(2))
					const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
					if (diemThoIdx === -1) continue
					recordUpdate(rowIdx, this.FREEZE_COLS + diemThoIdx, diemThoDesc.key, diemThoVal)

					// Conv
					const expectedConvKey = diemThoDesc.key.replace('_Point', '_Conv')
					const convDesc = scoreDescs.find(d => d.key === expectedConvKey)
					if (convDesc?._formulaTemplate) {
						const convIdx = scoreDescs.findIndex(d => d.key === convDesc.key)
						if (convIdx !== -1) {
							const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
							valueMap[diemThoDesc.key] = diemThoVal
							const convVal = evaluateFormulaString(convDesc._formulaTemplate, valueMap)
							if (convVal !== null && convVal !== undefined)
								recordUpdate(rowIdx, this.FREEZE_COLS + convIdx, convDesc.key, convVal)
						}
					}

					if (!convertIelts) continue

					const kiNangMatch = descKey.match(/TA2_(Listening|Reading|Writing|Speaking)_Point__SoCauDung/)
					if (!kiNangMatch) continue
					const kiNang = kiNangMatch[1]

					let band
					if (kiNang === 'Writing' || kiNang === 'Speaking') {
						band = calcWritingSpeakingBand(diemThoVal)
					} else {
						band = getBandScoreFromTable(this._ieltsThietLapCache, kiNang, val)
					}

					if (band !== null) {
						const ieltsConvDesc = scoreDescs.find(d => d._kiNang === kiNang && d._isIeltsScore)
						if (ieltsConvDesc) {
							const ieltsConvIdx = scoreDescs.findIndex(d => d.key === ieltsConvDesc.key)
							recordUpdate(rowIdx, this.FREEZE_COLS + ieltsConvIdx, ieltsConvDesc.key, band)
						}
					}
				}

				// Overall Band
				if (convertIelts) {
					const bandScores = GRADE_CONFIG.IELTS_SKILLS.map(kiNang =>
						getIeltsValForRow(kiNang, scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS) ?? 0
					)
					const overall = calcOverallBand(...bandScores)
					if (overall !== null) {
						const bandDesc = scoreDescs.find(d => d._isIeltsOverallBand)
						if (bandDesc) {
							const bandIdx = scoreDescs.findIndex(d => d.key === bandDesc.key)
							recordUpdate(rowIdx, this.FREEZE_COLS + bandIdx, bandDesc.key, overall)
						}
					}
				}

				// TA2_Point
				const ta2PointDesc = scoreDescs.find(d =>
					d.key?.endsWith('_TA2_Point') &&
					!d.key?.includes('_Avg_') &&
					d._formulaTemplate
				)
				if (ta2PointDesc) {
					const ta2PointIdx = scoreDescs.findIndex(d => d.key === ta2PointDesc.key)
					const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
					const ta2Val = evaluateFormulaString(ta2PointDesc._formulaTemplate, valueMap)
					if (ta2Val !== null && ta2Val !== undefined)
						recordUpdate(rowIdx, this.FREEZE_COLS + ta2PointIdx, ta2PointDesc.key, ta2Val)
				}
			}

			// Apply toàn bộ lên UI 1 lần
			for (const [rowIdxStr, cells] of Object.entries(allUpdates)) {
				const rowIdx = Number(rowIdxStr)
				for (const [ciStr, val] of Object.entries(cells))
					this._applyCell(ws, Number(ciStr), rowIdx, val)
			}

			// Force tính Avg_Point + Avg_Conv (cap3)
			const avgPointDesc = scoreDescs.find(d => d._isAvgPoint)
			const avgConvKey = avgPointDesc?.key?.replace('_Avg_Point', '_Avg_Conv')
			const avgConvDesc = avgConvKey ? scoreDescs.find(d => d.key === avgConvKey) : null

			if (avgPointDesc) {
				const avgIdx = scoreDescs.findIndex(d => d.key === avgPointDesc.key)
				const avgCi = this.FREEZE_COLS + avgIdx

				for (const rowIdxStr of Object.keys(allUpdates)) {
					const rowIdx = Number(rowIdxStr)

					const skillKeys = ['Listening', 'Reading', 'Writing', 'Speaking']
					const vals = skillKeys.map(k => {
						const desc = scoreDescs.find(sd => sd.key?.includes(`TA2_${k}_Point`) && sd._isDiemTho)
						if (!desc) return null
						const ci = this.FREEZE_COLS + scoreDescs.indexOf(desc)
						const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
						return (v !== null && v !== undefined && v !== '') ? Number(v) : null
					})

					const valid = vals.filter(v => v !== null && !isNaN(v))
					if (valid.length === 0) continue

					const avg = parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
					snapOldValue(rowIdx, avgCi)
					this._applyCell(ws, avgCi, rowIdx, avg)
					allUpdates[rowIdx][avgCi] = avg
					recordUpdate(rowIdx, avgCi, avgPointDesc.key, avg)

					// Avg_Conv
					if (avgConvDesc?._formulaTemplate) {
						const avgConvIdx = scoreDescs.findIndex(d => d.key === avgConvDesc.key)
						const avgConvCi = this.FREEZE_COLS + avgConvIdx
						snapOldValue(rowIdx, avgConvCi)
						const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
						valueMap[avgPointDesc.key] = avg
						const avgConvVal = evaluateFormulaString(avgConvDesc._formulaTemplate, valueMap)
						if (avgConvVal !== null && avgConvVal !== undefined) {
							this._applyCell(ws, avgConvCi, rowIdx, avgConvVal)
							allUpdates[rowIdx][avgConvCi] = avgConvVal
							recordUpdate(rowIdx, avgConvCi, avgConvDesc.key, avgConvVal)
						}
					}
				}
			}

			this.changedCells = { ...this.changedCells, ...changedBuffer }
			const totalCells = Object.values(allUpdates).reduce((s, c) => s + Object.keys(c).length, 0)
			console.log(`[onEtestApply][cap3] tab[${targetIdx}] "${cls.name}" — ${totalCells} ô`)
		},
		async onQuanLiKiThiApply({ exam, lopID, skillMapping, mappingField, studentScores }) {
			if (!studentScores?.size) return

			// Luôn dùng tab đang active
			const targetIdx = this.activeWsIdx
			if (!this.initializedTabs.has(targetIdx)) await new Promise(r => setTimeout(r, 300))

			const meta = this.wsMeta[targetIdx]
			const instance = this.instances[targetIdx]
			if (!meta || !instance) return
			const ws = instance[0]
			if (!ws) return

			const { cls, students, scoreDescs } = meta
			const hasIelts = meta.hasIelts ?? false

			const rowMap = new Map(students.map((s, i) => [String(s.id), i]))
			const descMap = new Map(scoreDescs.map((d, i) => [d.key, i]))

			const allUpdates = {} // { rowIdx: { ci: val } } — dùng cho _applyCell
			const changedBuffer = {} // gom TẤT CẢ entries để merge vào changedCells cuối cùng

			// ── Snapshot old value ──
			const snapCache = {}
			const snapOldValue = (rowIdx, ci) => {
				const k = `${rowIdx}_${ci}`
				if (snapCache[k] !== undefined) return snapCache[k]
				const raw = ws.getValueFromCoords(ci, rowIdx)
				snapCache[k] = (raw !== null && raw !== undefined && raw !== '' &&
					!(typeof raw === 'string' && raw.startsWith('=')))
					? (isNaN(Number(raw)) ? raw : Number(raw))
					: null
				return snapCache[k]
			}

			// ── Record 1 cell vào allUpdates + changedBuffer ──
			const recordUpdate = (rowIdx, ci, maCotDiem, val) => {
				if (typeof val === 'string' && val.startsWith('=')) return
				snapOldValue(rowIdx, ci) // snapshot trước
				if (!allUpdates[rowIdx]) allUpdates[rowIdx] = {}
				allUpdates[rowIdx][ci] = val

				const d = scoreDescs[ci - this.FREEZE_COLS]
				const student = students[rowIdx]
				if (!student) return

				const lookupKey = maCotDiem.includes('__SoCauDung')
					? maCotDiem.replace('__SoCauDung', '') : maCotDiem
				const existingGrade = meta.gradesMap?.get(`${student.id}_${lookupKey}`)

				changedBuffer[`${targetIdx}_${rowIdx}_${ci}`] = {
					wsIdx: targetIdx,
					nhomID: cls.id, tenNhom: cls.name,
					monHocLopID: cls.monHocLopID,
					hocSinhID: student.id, hoTen: student.hoTen,
					maCotDiem, tenCotDiem: d?.title ?? maCotDiem,
					cotDiemID: d?.cotDiemID ?? existingGrade?.cotDiemID ?? null,
					value: val,
					oldValue: snapCache[`${rowIdx}_${ci}`],
					kqhtID: existingGrade?.kqhtID ?? null,
				}
			}

			// ── Pass 1: apply từng học sinh ──
			let matchCount = 0

			for (const [hocSinhIDRaw, scoreObj] of studentScores) {
				const rowIdx = rowMap.get(String(hocSinhIDRaw))
				if (rowIdx === undefined) continue
				matchCount++

				for (const [maCotDiem, val] of Object.entries(scoreObj)) {
					if (maCotDiem === 'hocSinhID') continue
					if (val === null || val === undefined) continue

					const di = descMap.get(maCotDiem)
					if (di === undefined) continue
					const ci = this.FREEZE_COLS + di

					recordUpdate(rowIdx, ci, maCotDiem, val)

					// Chỉ xử lý tiếp nếu là SoCauDung
					if (!maCotDiem.includes('__SoCauDung')) continue

					// 1. Tính DiemTho
					const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === maCotDiem)
					if (!diemThoDesc || !diemThoDesc._soCau) continue

					// cap2: (SoCauDung / SoCau) * DiemMax | cap3: SoCauDung * 10 / SoCau
					const diemThoVal = this.config.cap === 'cap2'
						? parseFloat((val / diemThoDesc._soCau * (diemThoDesc.diemMax ?? 10)).toFixed(2))
						: parseFloat((val * 10 / diemThoDesc._soCau).toFixed(2))
					const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
					if (diemThoIdx === -1) continue
					recordUpdate(rowIdx, this.FREEZE_COLS + diemThoIdx, diemThoDesc.key, diemThoVal)

					// 2. Tính Conv
					const expectedConvKey = diemThoDesc.key.replace('_Point', '_Conv')
					const convDesc = scoreDescs.find(d => d.key === expectedConvKey)
					if (convDesc?._formulaTemplate) {
						const convIdx = scoreDescs.findIndex(d => d.key === convDesc.key)
						if (convIdx !== -1) {
							const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
							valueMap[diemThoDesc.key] = diemThoVal
							const convVal = evaluateFormulaString(convDesc._formulaTemplate, valueMap)
							if (convVal !== null && convVal !== undefined)
								recordUpdate(rowIdx, this.FREEZE_COLS + convIdx, convDesc.key, convVal)
						}
					}

					// 3. IELTS conversion (nếu lớp có IELTS)
					if (!hasIelts) continue

					const kiNangMatch = maCotDiem.match(/TA2_(Listening|Reading|Writing|Speaking)_Point__SoCauDung/)
					if (!kiNangMatch) continue
					const kiNang = kiNangMatch[1]

					let band
					if (kiNang === 'Writing' || kiNang === 'Speaking') {
						band = calcWritingSpeakingBand(diemThoVal)
					} else {
						// Listening/Reading: lookup bảng theo SoCauDung
						band = getBandScoreFromTable(this._ieltsThietLapCache, kiNang, val)
					}

					if (band !== null) {
						const ieltsConvDesc = scoreDescs.find(d => d._kiNang === kiNang && d._isIeltsScore)
						if (ieltsConvDesc) {
							const ieltsConvIdx = scoreDescs.findIndex(d => d.key === ieltsConvDesc.key)
							recordUpdate(rowIdx, this.FREEZE_COLS + ieltsConvIdx, ieltsConvDesc.key, band)
						}
					}
				}

				// 4. Overall IELTS Band
				// ✅ Dùng calcOverallBandFromAvailable — chỉ tính từ kỹ năng đang có giá trị
				// Vì quanLiKiThi có thể chỉ import 1 kỹ năng (VD: Speaking), các kỹ năng còn lại
				// lấy từ ws (đã có điểm trước) → không ép về 0 như calcOverallBand
				if (hasIelts) {
					const bandScores = GRADE_CONFIG.IELTS_SKILLS.map(kiNang =>
						getIeltsValForRow(kiNang, scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
						// null nếu chưa có — calcOverallBandFromAvailable sẽ bỏ qua
					)
					const overall = calcOverallBandFromAvailable(bandScores)
					if (overall !== null) {
						const bandDesc = scoreDescs.find(d => d._isIeltsOverallBand)
						if (bandDesc) {
							const bandIdx = scoreDescs.findIndex(d => d.key === bandDesc.key)
							recordUpdate(rowIdx, this.FREEZE_COLS + bandIdx, bandDesc.key, overall)
						}
					}
				}

				// 5. TA2_Point
				const ta2PointDesc = scoreDescs.find(d =>
					d.key?.endsWith('_TA2_Point') && !d.key?.includes('_Avg_') && d._formulaTemplate
				)
				if (ta2PointDesc) {
					const ta2PointIdx = scoreDescs.findIndex(d => d.key === ta2PointDesc.key)
					const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
					const ta2Val = evaluateFormulaString(ta2PointDesc._formulaTemplate, valueMap)
					if (ta2Val !== null && ta2Val !== undefined)
						recordUpdate(rowIdx, this.FREEZE_COLS + ta2PointIdx, ta2PointDesc.key, ta2Val)
				}
			}

			if (matchCount === 0) {
				alert(`Không tìm thấy học sinh nào khớp trong tab "${cls.name}".\nKiểm tra lại kì thi hoặc danh sách học sinh.`)
				return
			}

			// ── Pass 2: apply toàn bộ lên UI ──
			this._suppressOnChange = true
			try {
				for (const [rowIdxStr, cells] of Object.entries(allUpdates)) {
					const rowIdx = Number(rowIdxStr)
					for (const [ciStr, val] of Object.entries(cells))
						this._applyCell(ws, Number(ciStr), rowIdx, val)
				}
			} finally {
				this._suppressOnChange = false
			}

			// ── Pass 2b: tính Total_Point từ formula API (cap2 dùng evaluateFormulaString) ──
			if (this.config.cap === 'cap2') {
				const totalPointDesc = scoreDescs.find(d =>
					d._formulaTemplate && !d._isAvgPoint && d.key?.endsWith('_Total_Point')
				)
				if (totalPointDesc) {
					const totalIdx = scoreDescs.findIndex(d => d.key === totalPointDesc.key)
					const totalCi = this.FREEZE_COLS + totalIdx
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
						const totalVal = evaluateFormulaString(totalPointDesc._formulaTemplate, valueMap)
						if (totalVal !== null && totalVal !== undefined) {
							this._applyCell(ws, totalCi, rowIdx, totalVal)
							allUpdates[rowIdx][totalCi] = totalVal
							recordUpdate(rowIdx, totalCi, totalPointDesc.key, totalVal)
						}
					}
				}
			}

			// ── Pass 3: tính Avg_Point + Avg_Conv sau khi UI đã có đủ DiemTho ──
			const avgPointDesc = scoreDescs.find(d => d._isAvgPoint)
			const avgConvKey = avgPointDesc?.key?.replace('_Avg_Point', '_Avg_Conv')
			const avgConvDesc = avgConvKey ? scoreDescs.find(d => d.key === avgConvKey) : null

			if (avgPointDesc && !avgPointDesc.key?.includes('_CB_')) {
				const avgIdx = scoreDescs.findIndex(d => d.key === avgPointDesc.key)
				const avgCi = this.FREEZE_COLS + avgIdx
				const isCap2 = this.config.cap === 'cap2'

				for (const rowIdxStr of Object.keys(allUpdates)) {
					const rowIdx = Number(rowIdxStr)

					// cap2: lấy tất cả _isDiemTho | cap3: lấy TA2_ skills
					let diemThoDescs
					if (isCap2) {
						diemThoDescs = scoreDescs.filter(d => d._isDiemTho)
					} else {
						const skillKeys = ['Listening', 'Reading', 'Writing', 'Speaking']
						diemThoDescs = skillKeys.map(k => scoreDescs.find(sd => sd.key?.includes(`TA2_${k}_Point`) && sd._isDiemTho)).filter(Boolean)
					}

					const vals = diemThoDescs.map(desc => {
						const ci = this.FREEZE_COLS + scoreDescs.indexOf(desc)
						const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
						return (v !== null && v !== undefined && v !== '') ? Number(v) : null
					})

					const valid = vals.filter(v => v !== null && !isNaN(v))
					if (valid.length === 0) continue

					const avg = parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
					this._applyCell(ws, avgCi, rowIdx, avg)
					allUpdates[rowIdx][avgCi] = avg
					recordUpdate(rowIdx, avgCi, avgPointDesc.key, avg)

					// Avg_Conv (chỉ cap3)
					if (!isCap2 && avgConvDesc?._formulaTemplate) {
						const avgConvIdx = scoreDescs.findIndex(d => d.key === avgConvDesc.key)
						const avgConvCi = this.FREEZE_COLS + avgConvIdx
						const valueMap = buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
						valueMap[avgPointDesc.key] = avg
						const avgConvVal = evaluateFormulaString(avgConvDesc._formulaTemplate, valueMap)
						if (avgConvVal !== null && avgConvVal !== undefined) {
							this._applyCell(ws, avgConvCi, rowIdx, avgConvVal)
							allUpdates[rowIdx][avgConvCi] = avgConvVal
							recordUpdate(rowIdx, avgConvCi, avgConvDesc.key, avgConvVal)
						}
					}
				}
			}

			// ── Pass CB (chỉ cap2) ──
			if (this.config.cap === 'cap2') {
				// CB_Point = (DiemTho / DiemMax) * 100
				const cbPointDescs = scoreDescs.filter(d => d._isCambridgePoint && d._hkPointKey && d._diemMax)
				for (const cbDesc of cbPointDescs) {
					const cbIdx = scoreDescs.findIndex(d => d.key === cbDesc.key)
					if (cbIdx === -1) continue
					const cbCi = this.FREEZE_COLS + cbIdx
					const hkIdx = scoreDescs.findIndex(d => d.key === cbDesc._hkPointKey)
					if (hkIdx === -1) continue
					const hkCi = this.FREEZE_COLS + hkIdx
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const hkVal = allUpdates[rowIdx]?.[hkCi] ?? ws.options?.data?.[rowIdx]?.[hkCi]
						if (hkVal === null || hkVal === undefined || hkVal === '') continue
						const cbVal = parseFloat((Number(hkVal) / cbDesc._diemMax * 100).toFixed(2))
						this._applyCell(ws, cbCi, rowIdx, cbVal)
						allUpdates[rowIdx][cbCi] = cbVal
						recordUpdate(rowIdx, cbCi, cbDesc.key, cbVal)
					}
				}
				// CB_Conv = CB_CONV(cbPoint, khoiID)
				const cbConvDescs = scoreDescs.filter(d => d._isCambridgeConv && d._cbPointKey)
				for (const cbConvDesc of cbConvDescs) {
					const convIdx = scoreDescs.findIndex(d => d.key === cbConvDesc.key)
					if (convIdx === -1) continue
					const convCi = this.FREEZE_COLS + convIdx
					const cbPtIdx = scoreDescs.findIndex(d => d.key === cbConvDesc._cbPointKey)
					if (cbPtIdx === -1) continue
					const cbPtCi = this.FREEZE_COLS + cbPtIdx
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const cbPtVal = allUpdates[rowIdx]?.[cbPtCi] ?? ws.options?.data?.[rowIdx]?.[cbPtCi]
						if (cbPtVal === null || cbPtVal === undefined || cbPtVal === '') continue
						const convVal = calcCambridgeConv(Number(cbPtVal), cls.khoiID) ?? ''
						if (convVal !== '') {
							this._applyCell(ws, convCi, rowIdx, convVal)
							allUpdates[rowIdx][convCi] = convVal
							recordUpdate(rowIdx, convCi, cbConvDesc.key, convVal)
						}
					}
				}
				// CB_Avg_Point
				const cbAvgPointDesc = scoreDescs.find(d => d._isAvgPoint && d.key?.includes('_CB_'))
				if (cbAvgPointDesc) {
					const cbAvgIdx = scoreDescs.findIndex(d => d.key === cbAvgPointDesc.key)
					const cbAvgCi = this.FREEZE_COLS + cbAvgIdx
					const cbSkillDescs = scoreDescs.filter(d => d._isCambridgePoint && d._hkPointKey)
					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						const vals = cbSkillDescs.map(d => {
							const ci = this.FREEZE_COLS + scoreDescs.indexOf(d)
							const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
							return (v !== null && v !== undefined && v !== '') ? Number(v) : null
						}).filter(v => v !== null)
						if (!vals.length) continue
						const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
						this._applyCell(ws, cbAvgCi, rowIdx, avg)
						allUpdates[rowIdx][cbAvgCi] = avg
						recordUpdate(rowIdx, cbAvgCi, cbAvgPointDesc.key, avg)
						// CB_Avg_Conv
						const cbAvgConvKey = cbAvgPointDesc.key.replace('_Avg_Point', '_Avg_Conv')
						const cbAvgConvDesc = scoreDescs.find(d => d.key === cbAvgConvKey)
						if (cbAvgConvDesc) {
							const cbAvgConvIdx = scoreDescs.findIndex(d => d.key === cbAvgConvKey)
							const cbAvgConvCi = this.FREEZE_COLS + cbAvgConvIdx
							const convVal = calcCambridgeConv(avg, cls.khoiID) ?? ''
							if (convVal !== '') {
								this._applyCell(ws, cbAvgConvCi, rowIdx, convVal)
								allUpdates[rowIdx][cbAvgConvCi] = convVal
								recordUpdate(rowIdx, cbAvgConvCi, cbAvgConvDesc.key, convVal)
							}
						}
					}
				}
			}

			// ── Merge vào changedCells ──
			this.changedCells = { ...this.changedCells, ...changedBuffer }

			const total = Object.values(allUpdates).reduce((s, c) => s + Object.keys(c).length, 0)
			console.log(`[onQuanLiKiThiApply] tab[${targetIdx}] "${cls.name}" — ${matchCount} HS, ${total} ô, ielts=${hasIelts}`)
		},

		// ════════════════════════════════════════════════
		// BUILD WORKSHEET
		// ════════════════════════════════════════════════

		buildClassWorksheet(cls, students, cols, thietLapList, gradesMap = new Map()) {
			const fixedDescs = [
				{ title: 'STT', key: null, colType: 'text', readOnly: true, width: '60px' },
				{ title: 'Mã học sinh', key: null, colType: 'text', readOnly: true, width: '110px' },
				{ title: 'Họ và tên', key: null, colType: 'text', readOnly: true, width: '180px' },
				{ title: 'English Name', key: null, colType: 'text', readOnly: true, width: '150px' },
				{ title: 'Lớp', key: null, colType: 'text', readOnly: true, width: '80px' },
			]

			const scoreDescs = []
			const prefix = this.activeNhomCotDiem
			const processedKeys = new Set()
			const isCap2 = this.config.cap === 'cap2'

			const colTitle = (c, forcePfx = null) => {
				if (!isCap2) return c.title
				const pfx = forcePfx ?? (c.key?.includes('_CB_') ? 'CB' : 'HK')
				return `${pfx}: ${c.title}`
			}

			for (let i = 0; i < cols.length; i++) {
				const c = cols[i]
				if (c.key?.includes('_IELTS_')) continue
				if (processedKeys.has(c.key)) continue
				// ✅ cap2: ẩn toàn bộ cột _Conv bên HK (không phải CB)
				if (isCap2 && c.key?.endsWith("_Conv") && !c.key?.includes("_CB_")) continue

				// CB col: không có formula từ API, công thức tính từ JS
				const isCBPointCol = c.key?.includes('_CB_') && c.key?.endsWith('_Point') && !c.formula
				if (isCBPointCol) {
					processedKeys.add(c.key)
					const skillSuffix = c.key.replace(/^.*_CB_/, '_')
					const hkCol = cols.find(hk => !hk.key?.includes('_CB_') && hk.key?.endsWith(skillSuffix))
					const diemMax = hkCol?.diemMax ?? null
					const hkPointKey = hkCol?.key ?? null
					// CB_Point
					scoreDescs.push({
						title: colTitle(c), key: c.key,
						colType: 'numeric', readOnly: true, width: '130px',
						_isCambridgePoint: true, _diemMax: diemMax, _hkPointKey: hkPointKey,
						cotDiemID: c.cotDiemID ?? null,
					})
					// CB_Conv — dùng CB_CONV(cbPoint, khoiID), không có formula từ API
					const cbConvKey = c.key.replace('_Point', '_Conv')
					const cbConvColIdx = cols.findIndex((col, ci) => ci > i && col.key === cbConvKey)
					if (cbConvColIdx !== -1) {
						processedKeys.add(cbConvKey)
						i = cbConvColIdx
						scoreDescs.push({
							title: colTitle(cols[cbConvColIdx]), key: cbConvKey,
							colType: 'text', readOnly: true, width: '160px',
							_isCambridgeConv: true, _cbPointKey: c.key,
							cotDiemID: cols[cbConvColIdx].cotDiemID ?? null,
						})
					}
					continue
				}

				const isInputCol = c.type === 'number' && !c.formula && !c.key?.includes('_CB_')

				if (isInputCol) {
					// Skip Conv col
					const expectedConvKey = c.key.replace('_Point', '_Conv')
					const convColIdx = cols.findIndex((col, ci) => ci > i && col.key === expectedConvKey)
					if (convColIdx !== -1) { processedKeys.add(expectedConvKey); i = convColIdx }

					const soCau = getSoCau(thietLapList, cls.id, c.key)
					const soCauDungKey = `${c.key}__SoCauDung`
					processedKeys.add(c.key)

					scoreDescs.push({
						title: `${colTitle(c)} - Số câu đúng`, key: soCauDungKey,
						colType: 'numeric', readOnly: false, width: '150px',
						_soCau: soCau, cotDiemID: null,
					})
					scoreDescs.push({
						title: colTitle(c), key: c.key,
						colType: 'numeric', readOnly: true, width: '130px',
						_isDiemTho: true, _soCauDungKey: soCauDungKey, _soCau: soCau,
						cotDiemID: c.cotDiemID ?? null,
						diemMax: c.diemMax ?? 10,  // ✅ cho cap2 tính (SoCauDung/SoCau)*DiemMax
					})

				} else if (c.type === 'number' && c.formula) {
					processedKeys.add(c.key)
					const isAvgPoint = c.key?.endsWith('_Avg_Point')
					const isCBCol = c.key?.includes('_CB_')

					if (isAvgPoint) {
						const avgConvKey = c.key.replace('_Avg_Point', '_Avg_Conv')
						const avgConvColIdx = cols.findIndex((col, ci) => ci > i && col.key === avgConvKey)
						const avgConvCol = avgConvColIdx !== -1 ? cols[avgConvColIdx] : null
						if (avgConvColIdx !== -1) { processedKeys.add(avgConvCol.key); i = avgConvColIdx }

						scoreDescs.push({
							title: colTitle(c), key: c.key,
							colType: 'numeric', readOnly: true, width: '130px',
							_formulaTemplate: c.formula, _isAvgPoint: true,
							cotDiemID: c.cotDiemID ?? null,
						})

						if (avgConvCol) {
							const isCBAvg = c.key?.includes('_CB_')
							if (isCBAvg) {
								// CB_Avg_Conv: dùng CB_CONV từ JS
								scoreDescs.push({
									title: colTitle(avgConvCol), key: avgConvCol.key,
									colType: 'text', readOnly: true, width: '160px',
									_isCambridgeConv: true, _cbPointKey: c.key,
									cotDiemID: avgConvCol.cotDiemID ?? null,
								})
							} else if (!isCap2) {
								// HK Avg_Conv: chỉ cap3
								scoreDescs.push({
									title: colTitle(avgConvCol), key: avgConvCol.key,
									colType: 'numeric', readOnly: true, width: '200px',
									_formulaTemplate: avgConvCol.formula ?? null,
									_isConv: true, cotDiemID: avgConvCol.cotDiemID ?? null,
								})
							}
						}

					} else {
						scoreDescs.push({
							title: colTitle(c), key: c.key,
							colType: 'numeric', readOnly: true, width: '130px',
							_formulaTemplate: c.formula, cotDiemID: c.cotDiemID ?? null,
						})
					}

				} else if (c.type === 'text' && c.formula) {
					processedKeys.add(c.key)
					scoreDescs.push({
						title: colTitle(c), key: c.key,
						colType: 'text', readOnly: true, width: '200px',
						_formulaTemplate: c.formula, cotDiemID: c.cotDiemID ?? null,
					})

				} else {
					processedKeys.add(c.key)
					scoreDescs.push({
						title: colTitle(c), key: c.key,
						colType: 'numeric', readOnly: true, width: '130px',
						_formulaTemplate: c.formula, cotDiemID: c.cotDiemID ?? null,
					})
				}
			}

			if (this.isTA2Mode) {
				const hasIelts = GRADE_CONFIG.IELTS_NHOM_IDS.has(cls.id)
				if (hasIelts) {
					const ieltsCols = cols.filter(c => c.key?.includes('_IELTS_'))
					const getIeltsColInfo = (keySuffix, defaultTitle) => {
						const found = ieltsCols.find(c => c.key?.endsWith(keySuffix))
						return { key: found?.key ?? `${prefix.replace('_TA2', '')}_${keySuffix}`, title: found?.title ?? defaultTitle, cotDiemID: found?.cotDiemID ?? null }
					}

					for (const { kiNang, suffix, defaultTitle, isWS } of [
						{ kiNang: 'Listening', suffix: 'IELTS_Listening_Conv', defaultTitle: 'IELTS Nghe', isWS: false },
						{ kiNang: 'Reading', suffix: 'IELTS_Reading_Conv', defaultTitle: 'IELTS Đọc', isWS: false },
						{ kiNang: 'Writing', suffix: 'IELTS_Writing_Conv', defaultTitle: 'IELTS Viết', isWS: true },
						{ kiNang: 'Speaking', suffix: 'IELTS_Speaking_Conv', defaultTitle: 'IELTS Nói', isWS: true },
					]) {
						const info = getIeltsColInfo(suffix, defaultTitle)
						scoreDescs.push({
							title: info.title, key: info.key,
							colType: 'numeric', readOnly: true, width: '130px',
							cotDiemID: info.cotDiemID,
							_isIeltsScore: true, _kiNang: kiNang, _ieltsFormulaKiNang: kiNang, _isWS: isWS,
						})
					}

					const bandConv = getIeltsColInfo('IELTS_Band_Conv', 'IELTS Overall Band')
					scoreDescs.push({
						title: bandConv.title, key: bandConv.key,
						colType: 'numeric', readOnly: true, width: '160px',
						cotDiemID: bandConv.cotDiemID, _isIeltsOverallBand: true,
					})
				}
			}

			const allDescs = [...fixedDescs, ...scoreDescs]
			const allColDefs = buildColDefs(allDescs)

			const columns = allDescs.map(d => ({
				type: d.colType, title: d.title,
				width: d.width ?? getColumnWidth(d.title, d.colType),
				readOnly: !!d.readOnly,
				...(d.colType === 'numeric' && !d._isConv ? { mask: '0.00' } : {}),
			}))

			const data = students.map((s, sIdx) => {
				const rowIndex = sIdx + 1
				const fixedVals = [s.soTT, s.id, s.hoTen, s.englishName, s.tenLop]
				const scoreVals = scoreDescs.map(d => {
					if (!d.key) return ''
					const existingVal = gradesMap.get(`${s.id}_${d.key}`)?.value ?? null

					// Cambridge Point: (DiemKiNang / DiemMax) * 100
					if (d._isCambridgePoint) {
						if (existingVal !== null) return existingVal
						if (!d._hkPointKey || !d._diemMax) return ''
						const hkDef = allColDefs.find(c => c.key === d._hkPointKey)
						if (!hkDef) return ''
						// Guard NaN: nếu HK Point rỗng thì trả ''
						return `=IF(${hkDef.colLetter}${rowIndex}="","",${hkDef.colLetter}${rowIndex}/${d._diemMax}*100)`
					}

					// Cambridge Conv: dùng CB_CONV(cbPoint, khoiID)
					if (d._isCambridgeConv) {
						if (existingVal !== null) return existingVal
						if (!d._cbPointKey) return ''
						const cbDef = allColDefs.find(c => c.key === d._cbPointKey)
						if (!cbDef) return ''
						return `=IF(${cbDef.colLetter}${rowIndex}="","",CB_CONV(${cbDef.colLetter}${rowIndex},${cls.khoiID}))`
					}

					// SoCauDung
					if (d.key?.includes('__SoCauDung')) return existingVal ?? ''

					// DiemTho
					if (d._isDiemTho) {
						if (existingVal !== null) return existingVal
						if (!d._soCau) return ''
						const def = allColDefs.find(c => c.key === d._soCauDungKey)
						// ✅ cap2: (SoCauDung / SoCau) * DiemMax | cap3: SoCauDung * 10 / SoCau
						if (isCap2) {
							return def ? `=${def.colLetter}${rowIndex}/${d._soCau}*${d.diemMax ?? 10}` : ''
						}
						return def ? `=${def.colLetter}${rowIndex}*10/${d._soCau}` : ''
					}

					// IELTS
					if (d._ieltsFormulaKiNang) {
						if (d._isWS) {
							if (existingVal !== null) return existingVal
							const diemThoDef = allColDefs.find(c =>
								c.key === scoreDescs.find(sd => sd.key?.includes(`TA2_${d._ieltsFormulaKiNang}_Point`) && sd._isDiemTho)?.key
							)
							return diemThoDef ? `=IELTS_BAND_WS(${diemThoDef.colLetter}${rowIndex})` : ''
						} else {
							if (existingVal !== null) return existingVal
							const soCauDef = allColDefs.find(c =>
								c.key === scoreDescs.find(sd => sd.key?.includes(`TA2_${d._ieltsFormulaKiNang}_Point__SoCauDung`))?.key
							)
							return soCauDef ? `=IELTS_BAND(${soCauDef.colLetter}${rowIndex},"${d._ieltsFormulaKiNang}")` : ''
						}
					}

					if (d._isIeltsOverallBand) {
						if (existingVal !== null) return existingVal
						const defs = GRADE_CONFIG.IELTS_SKILLS.map(kiNang =>
							allColDefs.find(c => c.key === scoreDescs.find(sd => sd._kiNang === kiNang && sd._isIeltsScore)?.key)
						)
						return defs.every(Boolean)
							? `=IELTS_OVERALL(${defs.map(d => `${d.colLetter}${rowIndex}`).join(',')})`
							: ''
					}

					// Avg_Point
					if (d._isAvgPoint) {
						if (isCap2) {
							// ✅ cap2: tính từ tất cả _isDiemTho / tổng số kỹ năng
							const diemThoDescs = scoreDescs.filter(sd => sd._isDiemTho)
							const defs = diemThoDescs.map(sd => allColDefs.find(c => c.key === sd.key))
							if (defs.every(Boolean)) {
								const sum = defs.map(def => `${def.colLetter}${rowIndex}`).join('+')
								return `=(${sum})/${diemThoDescs.length}`
							}
							return ''
						}
						// cap3: TA2_AVG_POINT / CB_AVG_POINT
						const skillKeys = ['Listening', 'Reading', 'Writing', 'Speaking']
						const avgPrefix = d.key?.match(/_(TA2|CB)_Avg_Point$/)?.[1] ?? 'TA2'
						const formulaFn = avgPrefix === 'CB' ? 'CB_AVG_POINT' : 'TA2_AVG_POINT'
						const isPointFlag = avgPrefix === 'CB' ? '_isCambridgePoint' : '_isDiemTho'
						const defs = skillKeys.map(k =>
							allColDefs.find(c =>
								c.key === scoreDescs.find(sd =>
									sd.key?.includes(`${avgPrefix}_${k}_Point`) && sd[isPointFlag]
								)?.key
							)
						)
						if (defs.every(Boolean))
							return `=${formulaFn}(${defs.map(def => `${def.colLetter}${rowIndex}`).join(',')})`
						if (d._formulaTemplate) return resolveFormula(d._formulaTemplate, allColDefs, rowIndex)
						return ''
					}

					if (d._formulaTemplate) return resolveFormula(d._formulaTemplate, allColDefs, rowIndex)
					return ''
				})
				return [...fixedVals, ...scoreVals]
			})

			return { scoreDescs, worksheetConfig: { worksheetName: cls.name, columns, data, allowInsertRow: false, allowDeleteRow: false } }
		},

		// ════════════════════════════════════════════════
		// SAVE
		// ════════════════════════════════════════════════
		async onConfirmSaveActual({ close }) {
			this.saving = true
			try {
				// ✅ Group saveRows theo wsIdx — mỗi lớp gọi API riêng
				const groupByWs = new Map()
				for (const row of this.saveRows) {
					const wsIdx = row._internal.wsIdx
					if (!groupByWs.has(wsIdx)) groupByWs.set(wsIdx, [])
					groupByWs.get(wsIdx).push(row)
				}

				for (const [wsIdx, rows] of groupByWs) {
					const meta = this.wsMeta[wsIdx]
					const cls = meta?.cls
					if (!cls) continue

					const items = rows.map(row => ({
						KQHTID: row._internal.kqhtID ?? 0,
						KhoaCotDiemID: null,
						HocSinhID: row._internal.hocSinhID,
						CotDiemID: row._internal.cotDiemID,
						KetQuaDanhGia_VI: row.newValue,
						KetQuaDanhGia_EN: null,
					}))

					await saveGrades({
						NienKhoa: vueData.NienKhoa,
						MonHocLopID: cls.monHocLopID,
						LopID: cls.id,
						MonHocID: this.config.cap === 'cap2' ? GRADE_CONFIG.MON_HOC_ID_CAP2 : GRADE_CONFIG.MON_HOC_ID,
						TemplateBangDiemID: cls.templateBangDiemID,
						MaNhomCotDiem: this.activeNhomCotDiem,
						KetQuaObjArr: JSON.stringify(items),
					})
				}

				this.changedCells = {}
				close()
			} catch (error) {
				console.error('❌', error)
			} finally {
				this.saving = false
			}
		},

		// ════════════════════════════════════════════════
		// UTILITIES
		// ════════════════════════════════════════════════

		// Parse value: '' / null / undefined → null, số → number, khác → string
		_parseValue(value) {
			if (value === '' || value === null || value === undefined) return null
			const parsed = Number(value)
			return isNaN(parsed) ? String(value) : parsed
		},

		// Apply 1 cell lên DOM, KHÔNG trigger onchange
		_applyCell(ws, ci, rowIdx, val) {
			if (!ws) return
			const displayVal = (val !== null && val !== undefined && val !== '') ? String(val) : ''
			if (ws.options?.data?.[rowIdx]) ws.options.data[rowIdx][ci] = val ?? ''
			const rec = ws.records?.[rowIdx]?.[ci]
			if (rec) {
				// ✅ Update records.value để getValueFromCoords + readVal đọc đúng
				rec.value = val ?? ''
				if (rec.element) rec.element.innerHTML = displayVal
			}
		},

		buildSoCauDungOptions() {
			if (!this.wsMeta.length) return []
			const seen = new Set()
			return this.wsMeta[0].scoreDescs
				.filter(d => !d.readOnly && d.key?.endsWith('__SoCauDung') && !d._isIeltsSoCauDung && !seen.has(d.key) && seen.add(d.key))
				.map(d => ({ key: d.key, label: d.title }))
		},

		// ════════════════════════════════════════════════
		// IELTS FORMULAS & ASSET LOADING
		// ════════════════════════════════════════════════

		registerIeltsFormulas() {
			if (typeof formula === 'undefined') { console.warn('Formula engine not found'); return }
			const self = this
			formula.setFormula({
				// Listening/Reading: lookup bảng theo số câu đúng
				IELTS_BAND(soCauDung, kiNang) {
					const tbl = self._ieltsThietLapCache
					if (!tbl || !kiNang || soCauDung === '' || soCauDung === null || soCauDung === undefined) return ''
					const num = Number(soCauDung)
					if (isNaN(num)) return ''
					const band = getBandScoreFromTable(tbl, String(kiNang), num)
					return band !== null ? band : ''
				},
				// Writing/Speaking: công thức MROUND từ điểm kỹ năng (thang 10)
				IELTS_BAND_WS(diemKiNang) {
					if (diemKiNang === '' || diemKiNang === null || diemKiNang === undefined) return ''
					const val = Number(diemKiNang)
					if (isNaN(val) || val <= 0) return ''  // ✅ fix: bỏ qua khi chưa có điểm
					const band = calcWritingSpeakingBand(val)
					return band !== null ? band : ''
				},
				// Overall: trung bình 4 kỹ năng, cho phép thiếu (trả '' nếu tất cả rỗng)
				IELTS_OVERALL(l, r, w, s) {
					const vals = [l, r, w, s]
					// ✅ '' hoặc null → 0, vẫn chia 4
					const nums = vals.map(v => (v === '' || v === null || v === undefined) ? 0 : Number(v))
					if (nums.some(v => isNaN(v))) return ''
					const result = calcOverallBand(...nums)
					return result !== null ? result : ''
				},
				TA2_AVG_POINT(l, r, w, s) {
					const vals = [l, r, w, s].map(v =>
						(v === '' || v === null || v === undefined) ? null : Number(v)
					)
					const valid = vals.filter(v => v !== null && !isNaN(v))
					if (valid.length === 0) return ''
					// ✅ Tính trung bình các kỹ năng có giá trị (không bắt buộc đủ 4)
					return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
				},
				CB_CONV(cbPoint, khoiID) {
					if (cbPoint === '' || cbPoint === null || cbPoint === undefined) return ''
					return calcCambridgeConv(Number(cbPoint), khoiID) ?? ''
				},
				CB_AVG_POINT(l, r, w, s) {
					const vals = [l, r, w, s].map(v =>
						(v === '' || v === null || v === undefined) ? null : Number(v)
					)
					const valid = vals.filter(v => v !== null && !isNaN(v))
					if (valid.length === 0) return ''
					return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
				},
			})
		},

		async fetchIeltsThietLap() {
			if (this._ieltsThietLapCache) return this._ieltsThietLapCache
			const data = await fetchIeltsConfig(vueData.NienKhoa)
			this._ieltsThietLapCache = data; return data
		},

		async fetchThietLapKiNang() {
			if (this._thietLapCache) return this._thietLapCache
			const data = await fetchSkillConfig(vueData.NienKhoa)
			this._thietLapCache = data; return data
		},

		async fetchTemplateCols(templateBangDiemID, cls) {
			if (!templateBangDiemID || !cls) return { students: [], cols: [], monHocLopID: null, gradesMap: new Map() }
			const isCap2 = this.config.cap === 'cap2'
			const monHocID = isCap2 ? GRADE_CONFIG.MON_HOC_ID_CAP2 : GRADE_CONFIG.MON_HOC_ID
			const cacheKey = `${cls.id}_${templateBangDiemID}_${this.activeNhomCotDiem}`
			if (!this.templateColsCache[cacheKey]) {
				const semester = this.config.semesterPeriod?.includes('S2') ? 'HK2' : 'HK1'
				const basePayload = { LopID: cls.id, MonHocID: monHocID, TemplateBangDiemID: templateBangDiemID, Semester: semester }
				const ieltsNhomCotDiem = this.activeNhomCotDiem?.replace('_TA2', '_IELTS')
				// Cấp 2: không truyền ThuTuNhom; cấp 3: ThuTuNhom=14
				const mainPayload = isCap2
					? { ...basePayload, MaNhomCotDiem: this.activeNhomCotDiem }
					: { ...basePayload, MaNhomCotDiem: this.activeNhomCotDiem, ThuTuNhom: 14 }

				const [data, ieltsData, cbData] = await Promise.all([
					fetchPromise(GRADE_CONFIG.API_ENDPOINTS.TEMPLATE_COLS, mainPayload),
					(!isCap2 && this.isTA2Mode)
						? fetchPromise(GRADE_CONFIG.API_ENDPOINTS.TEMPLATE_COLS, { ...basePayload, MaNhomCotDiem: ieltsNhomCotDiem, ThuTuNhom: 15 })
						: Promise.resolve([]),
					isCap2
						? fetchPromise(GRADE_CONFIG.API_ENDPOINTS.TEMPLATE_COLS, { ...basePayload, MaNhomCotDiem: `${this.config.semesterPeriod}_CB` })
						: Promise.resolve([]),
				])

				const colsMap = new Map()
				const studentsMap = new Map()
				const monHocLopIDRef = { value: null }
				const gradesMap = new Map()
				processApiRecords(data, colsMap, studentsMap, monHocLopIDRef, gradesMap)
				processApiRecords(ieltsData, colsMap, studentsMap, monHocLopIDRef, gradesMap)
				processApiRecords(cbData, colsMap, studentsMap, monHocLopIDRef, gradesMap)
				this.templateColsCache[cacheKey] = { cols: Array.from(colsMap.values()), students: Array.from(studentsMap.values()), monHocLopID: monHocLopIDRef.value, gradesMap }
			}

			const cached = this.templateColsCache[cacheKey]
			const ieltsNhomCotDiem = this.activeNhomCotDiem?.replace('_TA2', '_IELTS')
			return {
				students: cached.students,
				cols: filterAndSortCols(cached.cols, this.activeNhomCotDiem, ieltsNhomCotDiem, this.cbNhomCotDiem),
				monHocLopID: cached.monHocLopID,
				gradesMap: cached.gradesMap,
			}
		},

		loadAssets() {
			;['https://bossanova.uk/jspreadsheet/v5/jspreadsheet.css', 'https://jsuites.net/v5/jsuites.css', 'https://fonts.googleapis.com/css?family=Material+Icons'].forEach(href => {
				if (!document.querySelector(`link[href="${href}"]`))
					document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }))
			})
			return this.loadScript('https://jsuites.net/v5/jsuites.js')
				.then(() => this.loadScript('https://bossanova.uk/jspreadsheet/v5/jspreadsheet.js'))
				.then(() => this.registerIeltsFormulas())
		},

		loadScript(src) {
			return new Promise((resolve, reject) => {
				if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
				const s = document.createElement('script')
				s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s)
			})
		},
	},
}
</script>