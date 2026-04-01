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

					<!-- ✅ eTest chỉ hiện với cap3 TA2 mode -->
					<uc-dialog-etest-exam v-if="isTA2Mode" :so-cau-dung-options="soCauDungOptions"
						@apply="onEtestApply">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-file-import-outline">
								<v-list-item-title>Import eTest</v-list-item-title>
								<v-list-item-subtitle>Điền điểm từ file eTest</v-list-item-subtitle>
							</v-list-item>
						</template>
					</uc-dialog-etest-exam>

					<uc-dialog-quan-li-ki-thi-cap2 v-if="config.cap === 'cap2'" :nienKhoa="vueData.NienKhoa"
						:hoc-ky="selectedSemesterHocKy" :wsMeta="wsMeta" :active-tab-meta="wsMeta[activeWsIdx]"
						@apply="onQuanLiKiThiApply_cap2">
						<template #default="{ activatorProps }">
							<v-list-item v-bind="activatorProps" prepend-icon="mdi-clipboard-list-outline">
								<v-list-item-title>Quản lí kì thi</v-list-item-title>
								<v-list-item-subtitle>Đẩy điểm từ kì thi</v-list-item-subtitle>
							</v-list-item>
						</template>
					</uc-dialog-quan-li-ki-thi-cap2>

					<uc-dialog-quan-li-ki-thi v-if="config.cap === 'cap3'" :classes="loadedClasses"
						:nienKhoa="vueData.NienKhoa" :hoc-ky="selectedSemesterHocKy" :wsMeta="wsMeta"
						:active-tab-meta="wsMeta[activeWsIdx]" @apply="onQuanLiKiThiApply">
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
					<div class="text-body-2 text-medium-emphasis mt-1">Cấp 2: mỗi khối là 1 tab, các lớp gộp chung · Cấp 3: mỗi lớp là 1 tab</div>
				</div>
			</v-container>

			<div v-if="ready">
				<v-tabs v-model="activeWsIdx" color="primary" density="compact">
					<v-tab v-for="(meta, idx) in wsMeta" :key="idx" :value="idx">{{ meta.tabName ?? meta.cls?.name }}</v-tab>
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

					const isCap2 = this.config.cap === 'cap2'

					if (isCap2) {
						// ── Cap2: group by khoiID → mỗi khối = 1 tab ──
						const khoiMap = new Map()
						for (const cls of classes) {
							if (!khoiMap.has(cls.khoiID)) khoiMap.set(cls.khoiID, [])
							khoiMap.get(cls.khoiID).push(cls)
						}
						// Sort khối theo khoiID tăng dần (K6→K9)
						const sortedKhois = [...khoiMap.entries()].sort((a, b) => a[0] - b[0])

						for (const [khoiID, khoiClasses] of sortedKhois) {
							// Fetch data song song cho tất cả lớp trong khối
							const fetchResults = await Promise.all(
								khoiClasses.map(cls => this.fetchTemplateCols(cls.templateBangDiemID, cls))
							)
							// Patch monHocLopID vào cls
							fetchResults.forEach((res, i) => {
								if (!khoiClasses[i].monHocLopID) khoiClasses[i].monHocLopID = res.monHocLopID
							})

							// Gộp students + gradesMap; build rowClassMap
							const allStudents = []
							const mergedGradesMap = new Map()
							const rowClassMap = new Map()

							// Dùng cols + scoreDescs từ class đầu tiên có data
							const firstValidIdx = fetchResults.findIndex(r => r.cols.length > 0)
							if (firstValidIdx === -1) continue
							const cols = fetchResults[firstValidIdx].cols

							khoiClasses.forEach((cls, ci) => {
								const { students, gradesMap } = fetchResults[ci]
								const startRow = allStudents.length
								students.forEach((s, si) => {
									rowClassMap.set(startRow + si, cls)
									allStudents.push(s)
								})
								for (const [k, v] of gradesMap) mergedGradesMap.set(k, v)
							})

							const { worksheetConfig, scoreDescs } = this.buildClassWorksheet(
								khoiClasses[firstValidIdx], allStudents, cols, thietLapList, mergedGradesMap
							)

							const khoiName = khoiClasses[0].khoiName ?? `Khối ${khoiID}`
							this.wsMeta.push({
								tabName: khoiName,
								cls: null,
								classes: khoiClasses,
								khoiID,
								students: allStudents,
								scoreDescs,
								gradesMap: mergedGradesMap,
								rowClassMap,
								hasIelts: false,
							})
							this.worksheetConfigs.push(worksheetConfig)
						}
					} else {
						// ── Cap3: giữ nguyên — mỗi lớp = 1 tab ──
						for (const cls of classes) {
							const { students, cols, monHocLopID, gradesMap } = await this.fetchTemplateCols(cls.templateBangDiemID, cls)
							if (!cls.monHocLopID) cls.monHocLopID = monHocLopID
							const { worksheetConfig, scoreDescs } = this.buildClassWorksheet(cls, students, cols, thietLapList, gradesMap)
							if (this.config.cap === 'cap3') {
								const missingSoCau = scoreDescs.filter(d => d.key?.includes('__SoCauDung') && !d._soCau)
								if (missingSoCau.length > 0) {
									console.warn(`[ThiếtLậpKĩNăng] Lớp "${cls.name}" — ${missingSoCau.length} cột chưa có SoCau:`,
										missingSoCau.map(d => d.key))
								}
							}
							const hasIelts = GRADE_CONFIG.IELTS_NHOM_IDS.has(cls.id)
							this.wsMeta.push({ tabName: cls.name, cls, classes: [cls], students, scoreDescs, gradesMap, rowClassMap: null, hasIelts })
							this.worksheetConfigs.push(worksheetConfig)
						}
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
					worksheets: [{ ...worksheetConfig, tableOverflow: true, tableHeight: 'calc(100dvh - 93px)', tableWidth: '100%' }],
					tabs: false,
					onbeforecreateworksheet: () => false,
					freezeColumns: this.FREEZE_COLS,
					onchange: (el, cell, colIndex, rowIndex, value) => {
						$this._handleCellChange(idx, colIndex, rowIndex, value)
					},
				})
				this.instances[idx] = instance

				// Force render SoCauDung lần đầu load (chỉ cap3)
				if (this.config.cap === 'cap3') {
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
				}
			},

			// ════════════════════════════════════════════════
			// CELL CHANGE HANDLER
			// ════════════════════════════════════════════════

			_handleCellChange(idx, colIndex, rowIndex, value) {
				if (this._suppressOnChange) return
				const meta = this.wsMeta[idx]
				if (!meta) return
				const { students, scoreDescs, rowClassMap } = meta
				const cls = rowClassMap?.get(rowIndex) ?? meta.cls
				const scoreColIdx = colIndex - this.FREEZE_COLS
				if (scoreColIdx < 0) return
				const desc = scoreDescs[scoreColIdx]
				if (!desc || !desc.key) return
				if (desc._isIeltsScore || desc._isIeltsOverallBand) {
					if (!meta.hasIelts) return
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
						lopID: cls.id, templateBangDiemID: cls.templateBangDiemID,
						hocSinhID: student.id, hoTen: student.hoTen,
						maCotDiem: desc.key, tenCotDiem: desc.title,
						cotDiemID: desc.cotDiemID ?? null,
						value: actualValue, kqhtID, oldValue: oldValueSnapshot,
					},
				}

				// SoCauDung propagation (chỉ cap3)
				if (desc.key?.includes('__SoCauDung')) {
					const pendingUpdates = this._propagateSoCauDung(idx, rowIndex, desc, actualValue, ws)
					this._propagateAvgPoint(idx, rowIndex, ws, pendingUpdates)
					if (this.config.cap === 'cap3' && meta.hasIelts) {
						this._propagateIelts_cap3(idx, rowIndex, ws, desc, pendingUpdates)
					}
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

			_propagateIelts_cap3(idx, rowIndex, ws, soCauDungDesc, pendingUpdates = {}) {
				const meta = this.wsMeta[idx]
				const { cls, students, scoreDescs, gradesMap } = meta
				const student = students[rowIndex]
				if (!student) return

				const kiNangMatch = soCauDungDesc.key.match(/TA2_(Listening|Reading|Writing|Speaking)_Point__SoCauDung/)
				if (!kiNangMatch) return
				const kiNang = kiNangMatch[1]

				const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === soCauDungDesc.key)
				if (!diemThoDesc) return
				const diemThoCi = this.FREEZE_COLS + scoreDescs.indexOf(diemThoDesc)

				const diemThoVal = pendingUpdates[diemThoCi] ?? ws.getValueFromCoords(diemThoCi, rowIndex)
				const isEmpty = diemThoVal === '' || diemThoVal === null || diemThoVal === undefined

				const soCauDungCi = this.FREEZE_COLS + scoreDescs.indexOf(soCauDungDesc)
				const soCauDungVal = pendingUpdates[soCauDungCi] ?? ws.getValueFromCoords(soCauDungCi, rowIndex)

				const changedBuffer = {}
				const snapOld = (ci) => {
					const raw = ws?.getValueFromCoords(ci, rowIndex)
					return (raw === null || raw === undefined || raw === '' ||
						(typeof raw === 'string' && raw.startsWith('=')))
						? null : (isNaN(Number(raw)) ? raw : Number(raw))
				}
				const makeEntry = (desc, value, oldValue) => {
					const existingGrade = gradesMap?.get(`${student.id}_${desc.key}`)
					return {
						wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
						monHocLopID: cls.monHocLopID,
						hocSinhID: student.id, hoTen: student.hoTen,
						maCotDiem: desc.key, tenCotDiem: desc.title,
						cotDiemID: desc.cotDiemID ?? existingGrade?.cotDiemID ?? null,
						value, oldValue,
						kqhtID: existingGrade?.kqhtID ?? null,
					}
				}

				const ieltsConvDesc = scoreDescs.find(d => d._kiNang === kiNang && d._isIeltsScore)
				const ieltsCi = ieltsConvDesc ? this.FREEZE_COLS + scoreDescs.indexOf(ieltsConvDesc) : null
				const allUpdatesForRow = { [rowIndex]: { ...pendingUpdates } }

				if (isEmpty) {
					if (ieltsConvDesc && ieltsCi !== null) {
						const oldBand = snapOld(ieltsCi)
						this._applyCell(ws, ieltsCi, rowIndex, '')
						changedBuffer[`${idx}_${rowIndex}_${ieltsCi}`] = makeEntry(ieltsConvDesc, '', oldBand)
						allUpdatesForRow[rowIndex][ieltsCi] = null
					}
				} else {
					let band = null
					if (kiNang === 'Writing' || kiNang === 'Speaking') {
						band = calcWritingSpeakingBand(Number(diemThoVal))
					} else {
						const soCauVal = (soCauDungVal !== null && soCauDungVal !== undefined && soCauDungVal !== '')
							? Number(soCauDungVal) : null
						band = soCauVal !== null
							? getBandScoreFromTable(this._ieltsThietLapCache, kiNang, soCauVal)
							: null
					}

					if (band !== null && ieltsConvDesc && ieltsCi !== null) {
						const oldBand = snapOld(ieltsCi)
						this._applyCell(ws, ieltsCi, rowIndex, band)
						changedBuffer[`${idx}_${rowIndex}_${ieltsCi}`] = makeEntry(ieltsConvDesc, band, oldBand)
						allUpdatesForRow[rowIndex][ieltsCi] = band
					}
				}

				const bandScores = GRADE_CONFIG.IELTS_SKILLS.map(k =>
					getIeltsValForRow(k, scoreDescs, rowIndex, allUpdatesForRow, ws, this.FREEZE_COLS)
				)
				const overall = calcOverallBandFromAvailable(bandScores)
				const bandDesc = scoreDescs.find(d => d._isIeltsOverallBand)
				if (bandDesc) {
					const bandCi = this.FREEZE_COLS + scoreDescs.indexOf(bandDesc)
					const oldOverall = snapOld(bandCi)
					const newOverall = overall !== null ? overall : ''
					this._applyCell(ws, bandCi, rowIndex, newOverall)
					changedBuffer[`${idx}_${rowIndex}_${bandCi}`] = makeEntry(bandDesc, newOverall, oldOverall)
				}

				this.changedCells = { ...this.changedCells, ...changedBuffer }
			},

			// ════════════════════════════════════════════════
			// ETEST APPLY (cap3 only)
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

				const applyAndRecord = (rowIdx, ci, maCotDiem, val) => {
					snapOldValue(rowIdx, ci)
					this._applyCell(ws, ci, rowIdx, val)
					if (!allUpdates[rowIdx]) allUpdates[rowIdx] = {}
					allUpdates[rowIdx][ci] = val
					recordUpdate(rowIdx, ci, maCotDiem, val)
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

			// ════════════════════════════════════════════════
			// QUAN LI KI THI — CAP3
			// ════════════════════════════════════════════════

			async onQuanLiKiThiApply({ exam, lopID, skillMapping, mappingField, studentScores }) {
				if (!studentScores?.size) return

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
				const allUpdates = {}
				const changedBuffer = {}

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

				const recordUpdate = (rowIdx, ci, maCotDiem, val) => {
					if (typeof val === 'string' && val.startsWith('=')) return
					snapOldValue(rowIdx, ci)
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

						if (!maCotDiem.includes('__SoCauDung')) continue

						const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === maCotDiem)
						if (!diemThoDesc || !diemThoDesc._soCau) continue

						const diemThoVal = parseFloat((val * 10 / diemThoDesc._soCau).toFixed(2))
						const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
						if (diemThoIdx === -1) continue
						recordUpdate(rowIdx, this.FREEZE_COLS + diemThoIdx, diemThoDesc.key, diemThoVal)

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

						if (!hasIelts) continue

						const kiNangMatch = maCotDiem.match(/TA2_(Listening|Reading|Writing|Speaking)_Point__SoCauDung/)
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

					if (hasIelts) {
						const bandScores = GRADE_CONFIG.IELTS_SKILLS.map(kiNang =>
							getIeltsValForRow(kiNang, scoreDescs, rowIdx, allUpdates, ws, this.FREEZE_COLS)
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

				// Pass 3: Avg_Point + Avg_Conv
				const avgPointDesc = scoreDescs.find(d => d._isAvgPoint)
				const avgConvKey = avgPointDesc?.key?.replace('_Avg_Point', '_Avg_Conv')
				const avgConvDesc = avgConvKey ? scoreDescs.find(d => d.key === avgConvKey) : null

				if (avgPointDesc && !avgPointDesc.key?.includes('_CB_')) {
					const avgIdx = scoreDescs.findIndex(d => d.key === avgPointDesc.key)
					const avgCi = this.FREEZE_COLS + avgIdx

					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)

						const skillKeys = ['Listening', 'Reading', 'Writing', 'Speaking']
						const diemThoDescs = skillKeys.map(k => scoreDescs.find(sd => sd.key?.includes(`TA2_${k}_Point`) && sd._isDiemTho)).filter(Boolean)

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

						if (avgConvDesc?._formulaTemplate) {
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

				this.changedCells = { ...this.changedCells, ...changedBuffer }
				const total = Object.values(allUpdates).reduce((s, c) => s + Object.keys(c).length, 0)
				console.log(`[onQuanLiKiThiApply] tab[${targetIdx}] "${cls.name}" — ${matchCount} HS, ${total} ô, ielts=${hasIelts}`)
			},

			// ════════════════════════════════════════════════
			// QUAN LI KI THI — CAP2
			// ✅ Điền thẳng điểm từ API, không qua SoCauDung
			// ════════════════════════════════════════════════

			async onQuanLiKiThiApply_cap2({ studentScores }) {
				const tabIdx = this.activeWsIdx
				const meta = this.wsMeta[tabIdx]
				const instance = this.instances[tabIdx]
				if (!meta || !instance) return
				const ws = instance[0]
				if (!ws) return

				const { students, scoreDescs, rowClassMap } = meta
				const rowMap = new Map(students.map((s, i) => [String(s.id), i]))
				const descMap = new Map(scoreDescs.map((d, i) => [d.key, i]))
				const allUpdates = {}
				const changedBuffer = {}

				// ── Snapshot old value ──
				const snapOld = (ci, rowIdx) => {
					const raw = ws.getValueFromCoords(ci, rowIdx)
					return (raw !== null && raw !== undefined && raw !== '' &&
						!(typeof raw === 'string' && raw.startsWith('=')))
						? (isNaN(Number(raw)) ? raw : Number(raw))
						: null
				}

				// ── Apply 1 cell + ghi vào allUpdates + changedBuffer ──
				const applyAndRecord = (rowIdx, maCotDiem, val) => {
					const di = descMap.get(maCotDiem)
					if (di === undefined) return
					const ci = this.FREEZE_COLS + di
					const student = students[rowIdx]
					if (!student) return
					const cls = rowClassMap?.get(rowIdx) ?? meta.cls
					if (!cls) return
					const d = scoreDescs[di]
					const existingGrade = meta.gradesMap?.get(`${student.id}_${maCotDiem}`)
					const oldValue = snapOld(ci, rowIdx)

					this._applyCell(ws, ci, rowIdx, val)
					if (!allUpdates[rowIdx]) allUpdates[rowIdx] = {}
					allUpdates[rowIdx][ci] = val

					changedBuffer[`${tabIdx}_${rowIdx}_${ci}`] = {
						wsIdx: tabIdx,
						nhomID: cls.id, tenNhom: cls.name,
						monHocLopID: cls.monHocLopID,
						lopID: cls.id, templateBangDiemID: cls.templateBangDiemID,
						hocSinhID: student.id, hoTen: student.hoTen,
						maCotDiem, tenCotDiem: d?.title ?? maCotDiem,
						cotDiemID: d?.cotDiemID ?? existingGrade?.cotDiemID ?? null,
						value: val,
						oldValue,
						kqhtID: existingGrade?.kqhtID ?? null,
					}
				}

				// ── Pass 1: apply HK + CB scores thẳng ──
				let matchCount = 0
				for (const [hocSinhID, scoreObj] of studentScores) {
					const rowIdx = rowMap.get(String(hocSinhID))
					if (rowIdx === undefined) continue
					matchCount++
					for (const [maCotDiem, val] of Object.entries(scoreObj)) {
						if (maCotDiem === 'hocSinhID') continue
						if (val === null || val === undefined) continue
						applyAndRecord(rowIdx, maCotDiem, val)
					}
				}

				if (matchCount === 0) {
					alert('Không tìm thấy học sinh nào khớp.')
					return
				}

				// ── Pass 2: CB_Point từ HK_Point (nếu chưa được map trực tiếp từ CB) ──
				const cbPointDescs = scoreDescs.filter(d => d._isCambridgePoint && d._hkPointKey && d._diemMax)
				for (const cbDesc of cbPointDescs) {
					const hkDi = descMap.get(cbDesc._hkPointKey)
					if (hkDi === undefined) continue
					const hkCi = this.FREEZE_COLS + hkDi
					const cbDi = descMap.get(cbDesc.key)
					if (cbDi === undefined) continue
					const cbCi = this.FREEZE_COLS + cbDi

					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						if (allUpdates[rowIdx]?.[cbCi] !== undefined) continue
						const hkVal = allUpdates[rowIdx]?.[hkCi] ?? ws.options?.data?.[rowIdx]?.[hkCi]
						if (hkVal === null || hkVal === undefined || hkVal === '') continue
						const cbVal = parseFloat((Number(hkVal) / cbDesc._diemMax * 100).toFixed(2))
						applyAndRecord(rowIdx, cbDesc.key, cbVal)
					}
				}

				// ── Pass 3: CB_Conv ──
				const cbConvDescs = scoreDescs.filter(d => d._isCambridgeConv && d._cbPointKey)
				for (const cbConvDesc of cbConvDescs) {
					const cbPtDi = descMap.get(cbConvDesc._cbPointKey)
					if (cbPtDi === undefined) continue
					const cbPtCi = this.FREEZE_COLS + cbPtDi
					const cbConvDi = descMap.get(cbConvDesc.key)
					if (cbConvDi === undefined) continue
					const cbConvCi = this.FREEZE_COLS + cbConvDi

					for (const rowIdxStr of Object.keys(allUpdates)) {
						const rowIdx = Number(rowIdxStr)
						if (allUpdates[rowIdx]?.[cbConvCi] !== undefined) continue
						const cbPtVal = allUpdates[rowIdx]?.[cbPtCi] ?? ws.options?.data?.[rowIdx]?.[cbPtCi]
						if (cbPtVal === null || cbPtVal === undefined || cbPtVal === '') continue
						const cls = rowClassMap?.get(rowIdx) ?? meta.cls
						const convVal = calcCambridgeConv(Number(cbPtVal), cls?.khoiID) ?? ''
						if (convVal !== '') applyAndRecord(rowIdx, cbConvDesc.key, convVal)
					}
				}

				// ── Pass 4: HK Avg_Point = trung bình các _isDirectScore có giá trị ──
				const avgPointDesc = scoreDescs.find(d => d._isAvgPoint && !d.key?.includes('_CB_'))
				if (avgPointDesc) {
					const directDescs = scoreDescs.filter(d => d._isDirectScore)
					const avgDi = descMap.get(avgPointDesc.key)
					if (avgDi !== undefined) {
						for (const rowIdxStr of Object.keys(allUpdates)) {
							const rowIdx = Number(rowIdxStr)
							const vals = directDescs.map(d => {
								const di = descMap.get(d.key)
								if (di === undefined) return null
								const ci = this.FREEZE_COLS + di
								const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
								return (v !== null && v !== undefined && v !== '') ? Number(v) : null
							}).filter(v => v !== null && !isNaN(v))
							if (!vals.length) continue
							const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
							applyAndRecord(rowIdx, avgPointDesc.key, avg)
						}
					}
				}

				// ── Pass 5: CB_Avg_Point + CB_Avg_Conv ──
				const cbAvgDesc = scoreDescs.find(d => d._isAvgPoint && d.key?.includes('_CB_'))
				if (cbAvgDesc) {
					const cbSkillDescs = scoreDescs.filter(d => d._isCambridgePoint)
					const cbAvgDi = descMap.get(cbAvgDesc.key)
					if (cbAvgDi !== undefined) {
						for (const rowIdxStr of Object.keys(allUpdates)) {
							const rowIdx = Number(rowIdxStr)
							const vals = cbSkillDescs.map(d => {
								const di = descMap.get(d.key)
								if (di === undefined) return null
								const ci = this.FREEZE_COLS + di
								const v = allUpdates[rowIdx]?.[ci] ?? ws.options?.data?.[rowIdx]?.[ci]
								return (v !== null && v !== undefined && v !== '') ? Number(v) : null
							}).filter(v => v !== null && !isNaN(v))
							if (!vals.length) continue
							const cbAvg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
							applyAndRecord(rowIdx, cbAvgDesc.key, cbAvg)

							const cbAvgConvKey = cbAvgDesc.key.replace('_Avg_Point', '_Avg_Conv')
							const cbAvgConvDesc = scoreDescs.find(d => d.key === cbAvgConvKey)
							if (cbAvgConvDesc) {
								const cls = rowClassMap?.get(rowIdx) ?? meta.cls
								const convVal = calcCambridgeConv(cbAvg, cls?.khoiID) ?? ''
								if (convVal !== '') applyAndRecord(rowIdx, cbAvgConvDesc.key, convVal)
							}
						}
					}
				}

				this.changedCells = { ...this.changedCells, ...changedBuffer }
				console.log(`[onQuanLiKiThiApply_cap2] tab[${tabIdx}] "${meta.tabName}" — ${matchCount} HS, ${Object.keys(changedBuffer).length} ô`)
			},

			// ════════════════════════════════════════════════
			// BUILD WORKSHEET
			// ════════════════════════════════════════════════

			buildClassWorksheet(cls, students, cols, thietLapList, gradesMap = new Map()) {
				const fixedDescs = [
					{ title: 'STT',          key: null, colType: 'text', readOnly: true, width: '60px' },
					{ title: 'Mã học sinh',  key: null, colType: 'text', readOnly: true, width: '110px' },
					{ title: 'Họ và tên',    key: null, colType: 'text', readOnly: true, width: '180px' },
					{ title: 'English Name', key: null, colType: 'text', readOnly: true, width: '150px' },
					{ title: 'Lớp',          key: null, colType: 'text', readOnly: true, width: '80px' },
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
					// cap2: ẩn _Conv bên HK
					if (isCap2 && c.key?.endsWith('_Conv') && !c.key?.includes('_CB_')) continue

					// CB col
					const isCBPointCol = c.key?.includes('_CB_') && c.key?.endsWith('_Point') && !c.formula
					if (isCBPointCol) {
						processedKeys.add(c.key)
						const skillSuffix = c.key.replace(/^.*_CB_/, '_')
						const hkCol = cols.find(hk => !hk.key?.includes('_CB_') && hk.key?.endsWith(skillSuffix))
						const diemMax = hkCol?.diemMax ?? null
						const hkPointKey = hkCol?.key ?? null
						scoreDescs.push({
							title: colTitle(c), key: c.key,
							colType: 'numeric', readOnly: true, width: '130px',
							_isCambridgePoint: true, _diemMax: diemMax, _hkPointKey: hkPointKey,
							cotDiemID: c.cotDiemID ?? null,
						})
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
						const expectedConvKey = c.key.replace('_Point', '_Conv')
						const convColIdx = cols.findIndex((col, ci) => ci > i && col.key === expectedConvKey)
						const convCol = convColIdx !== -1 ? cols[convColIdx] : null
						if (convColIdx !== -1) { processedKeys.add(expectedConvKey); i = convColIdx }

						processedKeys.add(c.key)

						if (isCap2) {
							// ✅ cap2: KHÔNG có SoCauDung/DiemTho
							// Điền thẳng điểm từ QuanLiKiThi, không cần nhập tay
							scoreDescs.push({
								title: colTitle(c), key: c.key,
								colType: 'numeric', readOnly: false, width: '130px',
								_isDirectScore: true,
								cotDiemID: c.cotDiemID ?? null,
								diemMax: c.diemMax ?? 10,
							})
						} else {
							// cap3: SoCauDung → DiemTho → Conv
							const soCau = getSoCau(thietLapList, cls.id, c.key)
							const soCauDungKey = `${c.key}__SoCauDung`

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
								diemMax: c.diemMax ?? 10,
							})
							if (convCol) {
								scoreDescs.push({
									title: colTitle(convCol), key: convCol.key,
									colType: 'numeric', readOnly: true, width: '130px',
									_formulaTemplate: convCol.formula ?? null,
									_isConv: true, cotDiemID: convCol.cotDiemID ?? null,
								})
							}
						}

					} else if (c.type === 'number' && c.formula) {
						processedKeys.add(c.key)
						const isAvgPoint = c.key?.endsWith('_Avg_Point')

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
									scoreDescs.push({
										title: colTitle(avgConvCol), key: avgConvCol.key,
										colType: 'text', readOnly: true, width: '160px',
										_isCambridgeConv: true, _cbPointKey: c.key,
										cotDiemID: avgConvCol.cotDiemID ?? null,
									})
								} else if (!isCap2) {
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
								...(isCap2 && c.key?.endsWith('_Total_Point') ? { _isTotal: true } : {}),
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

				// IELTS (chỉ cap3 TA2 mode)
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
							{ kiNang: 'Reading',   suffix: 'IELTS_Reading_Conv',   defaultTitle: 'IELTS Đọc',  isWS: false },
							{ kiNang: 'Writing',   suffix: 'IELTS_Writing_Conv',   defaultTitle: 'IELTS Viết', isWS: true },
							{ kiNang: 'Speaking',  suffix: 'IELTS_Speaking_Conv',  defaultTitle: 'IELTS Nói',  isWS: true },
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

						// Cambridge Point
						if (d._isCambridgePoint) {
							if (existingVal !== null) return existingVal
							if (!d._hkPointKey || !d._diemMax) return ''
							const hkDef = allColDefs.find(c => c.key === d._hkPointKey)
							if (!hkDef) return ''
							return `=IF(${hkDef.colLetter}${rowIndex}="","",${hkDef.colLetter}${rowIndex}/${d._diemMax}*100)`
						}

						// Cambridge Conv
						if (d._isCambridgeConv) {
							if (existingVal !== null) return existingVal
							if (!d._cbPointKey) return ''
							const cbDef = allColDefs.find(c => c.key === d._cbPointKey)
							if (!cbDef) return ''
							return `=IF(${cbDef.colLetter}${rowIndex}="","",CB_CONV(${cbDef.colLetter}${rowIndex},${cls.khoiID}))`
						}

						// ✅ cap2: DirectScore — existingVal từ DB hoặc rỗng
						if (d._isDirectScore) {
							return existingVal ?? ''
						}

						// SoCauDung (cap3)
						if (d.key?.includes('__SoCauDung')) return existingVal ?? ''

						// DiemTho (cap3)
						if (d._isDiemTho) {
							if (existingVal !== null) return existingVal
							if (!d._soCau) return ''
							const def = allColDefs.find(c => c.key === d._soCauDungKey)
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
								// ✅ cap2: existingVal từ DB hoặc rỗng — giá trị được điền bởi onQuanLiKiThiApply_cap2
								return existingVal ?? ''
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

						// Conv (cap3)
						if (d._isConv) {
							if (existingVal !== null) return existingVal
							if (d._formulaTemplate) return resolveFormula(d._formulaTemplate, allColDefs, rowIndex)
							return ''
						}

						// Total_Point (cap2)
						if (d._isTotal) {
							if (existingVal !== null) return existingVal
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
					// Group by monHocLopID — each class in a khoi tab has its own monHocLopID
					const groupByMHL = new Map()
					for (const row of this.saveRows) {
						const key = row._internal.monHocLopID ?? `ws_${row._internal.wsIdx}`
						if (!groupByMHL.has(key)) groupByMHL.set(key, [])
						groupByMHL.get(key).push(row)
					}

					for (const [, rows] of groupByMHL) {
						const internal = rows[0]._internal
						const monHocLopID = internal.monHocLopID
						const lopID = internal.lopID ?? internal.nhomID
						const templateBangDiemID = internal.templateBangDiemID

						// Fallback: get from wsMeta for cap3 (meta.cls still valid)
						let resolvedLopID = lopID
						let resolvedTemplateBDID = templateBangDiemID
						let resolvedMonHocLopID = monHocLopID
						if (!resolvedMonHocLopID) {
							const meta = this.wsMeta[internal.wsIdx]
							const cls = meta?.cls
							if (!cls) continue
							resolvedLopID = cls.id
							resolvedTemplateBDID = cls.templateBangDiemID
							resolvedMonHocLopID = cls.monHocLopID
						}

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
							MonHocLopID: resolvedMonHocLopID,
							LopID: resolvedLopID,
							MonHocID: this.config.cap === 'cap2' ? GRADE_CONFIG.MON_HOC_ID_CAP2 : GRADE_CONFIG.MON_HOC_ID,
							TemplateBangDiemID: resolvedTemplateBDID,
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

			_parseValue(value) {
				if (value === '' || value === null || value === undefined) return null
				const parsed = Number(value)
				return isNaN(parsed) ? String(value) : parsed
			},

			_applyCell(ws, ci, rowIdx, val) {
				if (!ws) return
				const displayVal = (val !== null && val !== undefined && val !== '') ? String(val) : ''
				if (ws.options?.data?.[rowIdx]) ws.options.data[rowIdx][ci] = val ?? ''
				const rec = ws.records?.[rowIdx]?.[ci]
				if (rec) {
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
					IELTS_BAND(soCauDung, kiNang) {
						const tbl = self._ieltsThietLapCache
						if (!tbl || !kiNang || soCauDung === '' || soCauDung === null || soCauDung === undefined) return ''
						const num = Number(soCauDung)
						if (isNaN(num)) return ''
						const band = getBandScoreFromTable(tbl, String(kiNang), num)
						return band !== null ? band : ''
					},
					IELTS_BAND_WS(diemKiNang) {
						if (diemKiNang === '' || diemKiNang === null || diemKiNang === undefined) return ''
						const val = Number(diemKiNang)
						if (isNaN(val) || val <= 0) return ''
						const band = calcWritingSpeakingBand(val)
						return band !== null ? band : ''
					},
					IELTS_OVERALL(l, r, w, s) {
						const vals = [l, r, w, s]
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