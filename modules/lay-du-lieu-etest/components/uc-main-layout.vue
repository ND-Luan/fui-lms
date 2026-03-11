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
								prepend-icon="mdi-content-save-outline" @click="onConfirmSave">
								<v-list-item-title>Lưu thay đổi</v-list-item-title>
							</v-list-item>
						</template>
					</uc-dialog-save>

					<v-divider class="my-1" />

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
				saveRows: [],
			}
		},
	
		computed: {
			scoreTypeOptions() { return this.config.cap === 'cap2' ? GRADE_CONFIG.SCORE_TYPES_CAP2 : GRADE_CONFIG.SCORE_TYPES_CAP3 },
			isTA2Mode() { return this.config.cap === 'cap3' && this.config.scoreType === 'TA2' },
			canLoad() { return !!this.config.cap && !!this.config.semesterPeriod && !!this.config.scoreType },
			activeNhomCotDiem() {
				const { semesterPeriod, scoreType } = this.config
				if (!semesterPeriod || !scoreType) return null
				return scoreType === 'HK' ? semesterPeriod : `${semesterPeriod}_${scoreType}`
			},
			changedCount() { return Object.keys(this.changedCells).length },
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
					const fetchList = [fetchClasses(vueData.NienKhoa), this.fetchThietLapKiNang()]
					if (this.isTA2Mode) fetchList.push(this.fetchIeltsThietLap())
					const [classes, thietLapList] = await Promise.all(fetchList)
					this.loadedClasses = classes
					for (const cls of classes) {
						const { students, cols, monHocLopID, gradesMap } = await this.fetchTemplateCols(cls.templateBangDiemID, cls)
						// ✅ Chỉ set nếu chưa có (monHocLopID từ fetchClasses ưu tiên hơn)
						if (!cls.monHocLopID) cls.monHocLopID = monHocLopID
						const { worksheetConfig, scoreDescs } = this.buildClassWorksheet(cls, students, cols, thietLapList)
						this.wsMeta.push({ cls, students, scoreDescs, gradesMap })
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
	
				// Nếu là ô SoCauDung → tự động tính DiemTho
				if (desc.key?.includes('__SoCauDung')) {
					this._propagateSoCauDung(idx, rowIndex, desc, actualValue, ws)
				}
			},
	
			// Tính DiemTho từ SoCauDung và ghi vào changedCells
			_propagateSoCauDung(idx, rowIndex, soCauDungDesc, soCauDungVal, ws) {
				const meta = this.wsMeta[idx]
				const { cls, students, scoreDescs } = meta
				const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === soCauDungDesc.key)
				if (!diemThoDesc || !diemThoDesc._soCau) return
				const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
				if (diemThoIdx === -1) return
	
				const diemThoVal = soCauDungVal !== null
					? parseFloat((soCauDungVal * 10 / diemThoDesc._soCau).toFixed(2))
					: ''
				const diemThoCi = this.FREEZE_COLS + diemThoIdx
				const rawOld = ws?.options?.data?.[rowIndex]?.[diemThoCi]
				const oldDiemTho = this._parseValue(rawOld)
	
				this._applyCell(ws, diemThoCi, rowIndex, diemThoVal)
	
				const student = students[rowIndex]
				this.changedCells = {
					...this.changedCells,
					[`${idx}_${rowIndex}_${diemThoCi}`]: {
						wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
						monHocLopID: cls.monHocLopID,
						hocSinhID: student.id, hoTen: student.hoTen,
						maCotDiem: diemThoDesc.key, tenCotDiem: diemThoDesc.title,
						cotDiemID: diemThoDesc.cotDiemID ?? null,
						value: diemThoVal, oldValue: oldDiemTho,
					},
				}
			},
	
			// ════════════════════════════════════════════════
			// ETEST APPLY
			// ════════════════════════════════════════════════
	
			async onEtestApply({ students, mapping, lopID, convertIelts = true }) {
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
	
				// ✅ Snapshot oldValues TRƯỚC KHI apply bất cứ thứ gì
				const oldValueSnapshot = {}
				const snapOldValue = (rowIdx, ci) => {
					const k = `${rowIdx}_${ci}`
					if (oldValueSnapshot[k] !== undefined) return
					const raw = ws.getValueFromCoords(ci, rowIdx)
					oldValueSnapshot[k] = (raw !== null && raw !== undefined && raw !== '' &&
						!(typeof raw === 'string' && raw.startsWith('=')))
						? (isNaN(Number(raw)) ? raw : Number(raw))
						: null
				}
	
				const recordUpdate = (rowIdx, ci, maCotDiem, val) => {
					// ✅ Snapshot trước khi ghi
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
						oldValue: oldValueSnapshot[`${rowIdx}_${ci}`], // ✅ dùng snapshot
						kqhtID,
					}
				}
	
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
	
						// ✅ Tìm conv bằng key thay vì index+1
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
	
				// ✅ Force tính Avg_Point + Avg_Conv sau khi apply xong
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
	
						snapOldValue(rowIdx, avgCi) // ✅ snapshot trước khi apply
						this._applyCell(ws, avgCi, rowIdx, avg)
						allUpdates[rowIdx][avgCi] = avg
						recordUpdate(rowIdx, avgCi, avgPointDesc.key, avg)
	
						// Tính Avg_Conv
						if (avgConvDesc?._formulaTemplate) {
							const avgConvIdx = scoreDescs.findIndex(d => d.key === avgConvDesc.key)
							const avgConvCi = this.FREEZE_COLS + avgConvIdx
							snapOldValue(rowIdx, avgConvCi) // ✅ snapshot trước khi apply
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
				console.log(`[onEtestApply] tab[${targetIdx}] "${cls.name}" — ${totalCells} ô`)
			},
	
			// ════════════════════════════════════════════════
			// BUILD WORKSHEET
			// ════════════════════════════════════════════════
	
			buildClassWorksheet(cls, students, cols, thietLapList) {
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
	
				for (let i = 0; i < cols.length; i++) {
					const c = cols[i]
					if (c.key?.includes('_IELTS_')) continue
					if (processedKeys.has(c.key)) continue
	
					const isInputCol = c.type === 'number' && !c.formula
	
					if (isInputCol) {
						const expectedConvKey = c.key.replace('_Point', '_Conv')
						const convColIdx = cols.findIndex((col, ci) => ci > i && col.key === expectedConvKey)
						const convCol = convColIdx !== -1 ? cols[convColIdx] : null
						if (convColIdx !== -1) { processedKeys.add(convCol.key); i = convColIdx }
	
						const soCau = getSoCau(thietLapList, cls.id, c.key)
						const soCauDungKey = `${c.key}__SoCauDung`
						processedKeys.add(c.key)
	
						scoreDescs.push({
							title: `${c.title} - Số câu đúng`, key: soCauDungKey, colType: 'numeric', readOnly: false, width: '150px', _soCau: soCau, cotDiemID: null
						})
						// Cột DiemTho
						scoreDescs.push({
							title: c.title, key: c.key, colType: 'numeric', readOnly: true, width: '130px', _isDiemTho: true,
							_soCauDungKey: soCauDungKey, _soCau: soCau, cotDiemID: c.cotDiemID ?? null
						})
						if (convCol)
							scoreDescs.push({
								title: convCol.title, key: convCol.key, colType: 'numeric', readOnly: true, width: '200px',
								_formulaTemplate: convCol.formula ?? null, _isConv: true, cotDiemID: convCol.cotDiemID ?? null
							})
					} else if (c.type === 'number' && c.formula) {
						processedKeys.add(c.key)
						const isAvgPoint = c.key?.includes('_TA2_Avg_Point')
	
						if (isAvgPoint) {
							// ✅ Tìm và ghép Avg_Conv ngay phía sau
							const avgConvKey = c.key.replace('_Avg_Point', '_Avg_Conv')
							const avgConvColIdx = cols.findIndex((col, ci) => ci > i && col.key === avgConvKey)
							const avgConvCol = avgConvColIdx !== -1 ? cols[avgConvColIdx] : null
							if (avgConvColIdx !== -1) { processedKeys.add(avgConvCol.key); i = avgConvColIdx }
	
							scoreDescs.push({
								title: c.title, key: c.key, colType: 'numeric', readOnly: true,
								width: '130px', _formulaTemplate: c.formula,
								_isAvgPoint: true,
								cotDiemID: c.cotDiemID ?? null,
							})
	
							if (avgConvCol) {
								scoreDescs.push({
									title: avgConvCol.title, key: avgConvCol.key, colType: 'numeric', readOnly: true,
									width: '200px', _formulaTemplate: avgConvCol.formula ?? null,
									_isConv: true, cotDiemID: avgConvCol.cotDiemID ?? null,
								})
							}
						}
					} else if (c.type === 'text' && c.formula) {
						processedKeys.add(c.key)
						// Cột formula text
						scoreDescs.push({ title: c.title, key: c.key, colType: 'text', readOnly: true, width: '200px', _formulaTemplate: c.formula, cotDiemID: c.cotDiemID ?? null })
					} else {
						processedKeys.add(c.key)
						// Cột text thường
						scoreDescs.push({
							title: c.title, key: c.key, colType: 'numeric', readOnly: true,
							width: '130px', _formulaTemplate: c.formula,
							cotDiemID: c.cotDiemID ?? null,
						})
					}
				}
	
				if (this.isTA2Mode) {
					const ieltsCols = cols.filter(c => c.key?.includes('_IELTS_'))
					const getIeltsColInfo = (keySuffix, defaultTitle) => {
						const found = ieltsCols.find(c => c.key?.endsWith(keySuffix))
						return { key: found?.key ?? `${prefix.replace('_TA2', '')}_${keySuffix}`, title: found?.title ?? defaultTitle, cotDiemID: found?.cotDiemID ?? null }
					}
	
					// 4 kỹ năng IELTS
					for (const { kiNang, suffix, defaultTitle, isWS } of [
						{ kiNang: 'Listening', suffix: 'IELTS_Listening_Conv', defaultTitle: 'IELTS Nghe', isWS: false },
						{ kiNang: 'Reading', suffix: 'IELTS_Reading_Conv', defaultTitle: 'IELTS Đọc', isWS: false },
						{ kiNang: 'Writing', suffix: 'IELTS_Writing_Conv', defaultTitle: 'IELTS Viết', isWS: true },
						{ kiNang: 'Speaking', suffix: 'IELTS_Speaking_Conv', defaultTitle: 'IELTS Nói', isWS: true },
					]) {
						const info = getIeltsColInfo(suffix, defaultTitle)
						scoreDescs.push({ title: info.title, key: info.key, colType: 'numeric', readOnly: true, width: '130px', cotDiemID: info.cotDiemID, _isIeltsScore: true, _kiNang: kiNang, _ieltsFormulaKiNang: kiNang, _isWS: isWS })
					}
	
					const bandConv = getIeltsColInfo('IELTS_Band_Conv', 'IELTS Overall Band')
					scoreDescs.push({ title: bandConv.title, key: bandConv.key, colType: 'numeric', readOnly: true, width: '160px', cotDiemID: bandConv.cotDiemID, _isIeltsOverallBand: true })
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
						if (d._isDiemTho) {
							if (!d._soCau) return ''
							const def = allColDefs.find(c => c.key === d._soCauDungKey)
							return def ? `=${def.colLetter}${rowIndex}*10/${d._soCau}` : ''
						}
	
						if (d._ieltsFormulaKiNang) {
							if (d._isWS) {
								// Writing/Speaking: IELTS_BAND_WS(DiemTho)
								const diemThoDef = allColDefs.find(c =>
									c.key === scoreDescs.find(sd => sd.key?.includes(`TA2_${d._ieltsFormulaKiNang}_Point`) && sd._isDiemTho)?.key
								)
								return diemThoDef ? `=IELTS_BAND_WS(${diemThoDef.colLetter}${rowIndex})` : ''
							} else {
								// Listening/Reading: IELTS_BAND(SoCauDung, kiNang)
								const soCauDef = allColDefs.find(c =>
									c.key === scoreDescs.find(sd => sd.key?.includes(`TA2_${d._ieltsFormulaKiNang}_Point__SoCauDung`))?.key
								)
								return soCauDef ? `=IELTS_BAND(${soCauDef.colLetter}${rowIndex},"${d._ieltsFormulaKiNang}")` : ''
							}
						}
						if (d._isIeltsOverallBand) {
							const defs = GRADE_CONFIG.IELTS_SKILLS.map(kiNang =>
								allColDefs.find(c => c.key === scoreDescs.find(sd => sd._kiNang === kiNang && sd._isIeltsScore)?.key)
							)
							return defs.every(Boolean)
								? `=IELTS_OVERALL(${defs.map(d => `${d.colLetter}${rowIndex}`).join(',')})`
								: ''
						}
	
						// ✅ Thêm case Avg_Point
						if (d._isAvgPoint) {
							const skillKeys = ['Listening', 'Reading', 'Writing', 'Speaking']
							const defs = skillKeys.map(k =>
								allColDefs.find(c =>
									c.key === scoreDescs.find(sd =>
										sd.key?.includes(`TA2_${k}_Point`) && sd._isDiemTho
									)?.key
								)
							)
							// ✅ Dùng custom formula thay vì tính thủ công
							return defs.every(Boolean)
								? `=TA2_AVG_POINT(${defs.map(def => `${def.colLetter}${rowIndex}`).join(',')})`
								: ''
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
	
			async onConfirmSave() {
				const saveRows = []
				for (const cellKey of Object.keys(this.changedCells)) {
					const cell = this.changedCells[cellKey]
					if (cell.maCotDiem?.includes('__SoCauDung')) continue // ✅
					const [wsIdx, rowIndex, colIndex] = cellKey.split('_').map(Number)
					saveRows.push({
						tenNhom: cell.tenNhom, maSoHS: cell.hocSinhID, hoTen: cell.hoTen,
						maCotDiem: cell.maCotDiem, tenCotDiem: cell.tenCotDiem,
						oldValue: cell.oldValue ?? null, newValue: cell.value,
						isOverwrite: cell.oldValue !== null && cell.oldValue !== undefined && cell.oldValue !== '',
						type: classifyColumnType(cell.maCotDiem),
						_internal: {
							wsIdx, rowIndex, colIndex,
							hocSinhID: cell.hocSinhID, cotDiemID: cell.cotDiemID,
							maCotDiem: cell.maCotDiem, monHocLopID: cell.monHocLopID,
							kqhtID: cell.kqhtID ?? null,
						},
					})
				}
				this.saveRows = saveRows
			},
	
			async onConfirmSaveActual({ close }) {
				this.saving = true
				try {
					const meta = this.wsMeta[this.activeWsIdx]
					const cls = meta?.cls
	
					const items = this.saveRows.map(row => ({
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
						MonHocID: GRADE_CONFIG.MON_HOC_ID,
						TemplateBangDiemID: cls.templateBangDiemID,
						MaNhomCotDiem: this.activeNhomCotDiem,
						KetQuaObjArr: JSON.stringify(items),
					})
	
					this.changedCells = {}
					this.saveRows = []
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
				if (rec?.element) rec.element.innerHTML = displayVal
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
				const cacheKey = `${templateBangDiemID}_${this.activeNhomCotDiem}`
				if (!this.templateColsCache[cacheKey]) {
					const semester = this.config.semesterPeriod?.includes('S2') ? 'HK2' : 'HK1'
					const basePayload = { LopID: cls.id, MonHocID: GRADE_CONFIG.MON_HOC_ID, TemplateBangDiemID: templateBangDiemID, Semester: semester }
					const ieltsNhomCotDiem = this.activeNhomCotDiem?.replace('_TA2', '_IELTS')
	
					const [data, ieltsData] = await Promise.all([
						fetchPromise(GRADE_CONFIG.API_ENDPOINTS.TEMPLATE_COLS, { ...basePayload, MaNhomCotDiem: this.activeNhomCotDiem, ThuTuNhom: 14 }),
						this.isTA2Mode
							? fetchPromise(GRADE_CONFIG.API_ENDPOINTS.TEMPLATE_COLS, { ...basePayload, MaNhomCotDiem: ieltsNhomCotDiem, ThuTuNhom: 15 })
							: Promise.resolve([]),
					])
	
					const colsMap = new Map()
					const studentsMap = new Map()
					const monHocLopIDRef = { value: null }
					const gradesMap = new Map()
					processApiRecords(data, colsMap, studentsMap, monHocLopIDRef, gradesMap)
					processApiRecords(ieltsData, colsMap, studentsMap, monHocLopIDRef, gradesMap)
					this.templateColsCache[cacheKey] = { cols: Array.from(colsMap.values()), students: Array.from(studentsMap.values()), monHocLopID: monHocLopIDRef.value, gradesMap }
				}
	
				const cached = this.templateColsCache[cacheKey]
				const ieltsNhomCotDiem = this.activeNhomCotDiem?.replace('_TA2', '_IELTS')
				return {
					students: cached.students,
					cols: filterAndSortCols(cached.cols, this.activeNhomCotDiem, ieltsNhomCotDiem),
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