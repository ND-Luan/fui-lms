<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact">
			Chọn một lớp ở thanh trên để cập nhật công tác chủ nhiệm tháng.
		</v-alert>
		<div v-else class="d-flex h-100 ga-3">
			<div class="flex-shrink-0 overflow-y-auto" 
				:style="{ width: isMonthSidebarCollapsed ? '44px' : '220px', borderRight: '1px solid rgba(0, 0, 0, 0.12)' }">
				<div class="d-flex align-center py-1" :class="isMonthSidebarCollapsed ? 'justify-center' : 'justify-end px-1'">
					<v-btn :icon="isMonthSidebarCollapsed" size="small" variant="text" color="primary"
						:aria-label="isMonthSidebarCollapsed ? 'Mở danh sách tháng' : 'Ẩn danh sách tháng'"
						:title="isMonthSidebarCollapsed ? 'Mở danh sách tháng' : 'Ẩn danh sách tháng'"
						@click="isMonthSidebarCollapsed = !isMonthSidebarCollapsed">
						<template v-if="isMonthSidebarCollapsed">
							<v-icon>mdi-chevron-right</v-icon>
						</template>
						<template v-else>
							<v-icon start>mdi-chevron-left</v-icon>
							<span>Ẩn danh sách tháng</span>
						</template>
					</v-btn>
				</div>
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-item v-for="month in months" :key="month.value" :value="month.value"
						:active="Number(activeMonth) === Number(month.value)" class="mb-1 rounded"
						@click="selectMonth(month.value)">
						<template #prepend>
							<v-icon size="small" class="mr-2"
								:color="Number(activeMonth) === Number(month.value) ? 'primary' : ''"
								v-if="!isMonthSidebarCollapsed">
								mdi-calendar-month-outline
							</v-icon>
						</template>
						<v-list-item-title class="text-caption font-weight-bold">
							{{ isMonthSidebarCollapsed ? `T${month.label}` : `Công tác CN tháng ${month.label}` }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

			<div ref="contentContainer" class="flex-grow-1 h-100 overflow-auto pr-1" style="min-width: 0;">
				<div class="text-h6 text-center font-weight-bold py-3">
					{{ pageTitle }}
				</div>

				<v-row dense class="mb-3">
					<v-col v-if="Number(activeMonth) !== 8" cols="12">
						<v-card variant="outlined" height="100%">
							<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
								I. ĐÁNH GIÁ CÔNG TÁC THÁNG {{ resultMonthLabel }}
							</v-card-title>
							<v-card-text>
								<v-textarea v-if="currentPlan" v-model="currentPlan.DanhGia" rows="6" auto-grow
									variant="outlined" density="compact" hide-details class="text-body-2"
									placeholder="Nhập nội dung đánh giá kết quả thực hiện trong tháng..."
									@update:model-value="$emit('changed')" />
							</v-card-text>
						</v-card>
					</v-col>
					<v-col v-if="Number(activeMonth) !== 5" cols="12">
						<v-card variant="outlined" height="100%">
							<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
								II. KẾ HOẠCH THÁNG {{ activeMonthLabel }}
							</v-card-title>
							<v-card-text>
								<v-textarea v-if="currentPlan" v-model="currentPlan.MucTieu" rows="6" auto-grow
									variant="outlined" density="compact" hide-details class="text-body-2"
									placeholder="Nhập nội dung và nhiệm vụ trọng tâm của tháng..."
									@update:model-value="$emit('changed')" />
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>

				<v-card variant="outlined" class="mb-8">
					<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
						III. KẾ HOẠCH HÀNG TUẦN CỦA THÁNG {{ activeMonthLabel }}/{{ activeYearLabel }}
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-2">
						<div class="wrapper-jexcel so-gvcn-cong-tac-thang-wrapper">
							<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-cong-tac-thang-sheet"
								></div>
						</div>
					</v-card-text>
				</v-card>
			</div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-cong-tac-chu-nhiem',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			monthSheetHeight: { type: String, default: 'calc(100vh - 310px)' },
			monthList: { type: Array, default: () => [] },
			weekList: { type: Array, default: () => [] },
			nienKhoa: { type: [String, Number], default: null },
			getKeHoachExportMonths: { type: Function, default: () => () => [] }
		},
		emits: ['changed'],
		data() {
			const months = this.getMonths()
			return {
				months,
				activeMonth: months[0]?.value || 8,
				isMonthSidebarCollapsed: false,
				localPlans: {},
				instance: null,
				weeklyColumns: [
					{ title: 'THÁNG', width: 80, align: 'center' },
					{ title: 'TUẦN', width: 90, align: 'center' },
					{ title: 'THỜI GIAN', width: 150, align: 'center' },
					{ title: 'KẾ HOẠCH THỰC HIỆN', width: 540, align: 'justify', type: 'note' },
					{ title: 'KẾT QUẢ', width: 480, align: 'justify', type: 'note' },
					{ title: 'NGUYÊN NHÂN ĐẠT ĐƯỢC KẾT QUẢ', width: 540, align: 'justify', type: 'note' }
				]
			}
		},
		computed: {
			pageTitle() {
				const activeMonth = Number(this.activeMonth)
				if (activeMonth === 8) {
					return 'KẾ HOẠCH THÁNG ' + this.activeMonthLabel + '/' + this.activeYearLabel
				}
				const activeIndex = this.months.findIndex(month => Number(month.value) === activeMonth)
				const previousMonth = this.months[activeIndex - 1]
				const resultLabel = previousMonth?.label || activeMonth - 1
				const resultYear = activeMonth === 1 ? this.activeYearLabel - 1 : this.activeYearLabel
				const resultTitle = 'KẾT QUẢ ĐÁNH GIÁ CÔNG TÁC THÁNG ' + resultLabel + '/' + resultYear
				if (activeMonth === 5) return resultTitle
				return resultTitle + ' VÀ KẾ HOẠCH THÁNG ' + this.activeMonthLabel + '/' + this.activeYearLabel
			},
			resultMonthLabel() {
				const activeIndex = this.months.findIndex(month => Number(month.value) === Number(this.activeMonth))
				return this.months[activeIndex - 1]?.label || Number(this.activeMonth) - 1
			},
			resultYearLabel() {
				return Number(this.activeMonth) === 1 ? this.activeYearLabel - 1 : this.activeYearLabel
			},
			activeMonthLabel() {
				return this.months.find(month => Number(month.value) === Number(this.activeMonth))?.label
					|| this.activeMonth
			},
			currentPlan() {
				return this.localPlans[String(this.activeMonth)] || null
			},
			activeYearLabel() {
				const schoolYear = Number(this.nienKhoa) || new Date().getFullYear()
				return Number(this.activeMonth) >= 8 ? schoolYear : schoolYear + 1
			},
			planMonthLabel() {
				if (Number(this.activeMonth) === 1) return '1,2'
				const nextMonth = Number(this.activeMonth) + 1
				return nextMonth === 13 ? '1,2' : nextMonth
			},
			planYearLabel() {
				return Number(this.activeMonth) === 12 ? this.activeYearLabel + 1 : this.activeYearLabel
			},
			weeklyPlanMonthLabel() {
				return Number(this.activeMonth) === 5 ? this.activeMonthLabel : this.planMonthLabel
			},
			weeklyPlanYearLabel() {
				return Number(this.activeMonth) === 5 ? this.activeYearLabel : this.planYearLabel
			},
		},
		watch: {
			selectedLopID() {
				this.buildPlans()
			},
			monthList: {
				handler() {
					this.buildPlans()
				}
			},
			weekList: {
				handler() {
					this.buildPlans()
				}
			},
			nienKhoa() {
				this.buildPlans()
			}
		},
		created() {
			this.buildPlans()
		},
		mounted() {
			this.initSheet()
		},
		beforeUnmount() {
			this.commitCurrentSheet()
			this.destroySheet()
		},
		methods: {
			getMonths() {
				const source = this.getKeHoachExportMonths()
				return source.length ? source : [
					{ label: '8', value: 8 },
					{ label: '9', value: 9 },
					{ label: '10', value: 10 },
					{ label: '11', value: 11 },
					{ label: '12', value: 12 },
					{ label: '1,2', value: 1 },
					{ label: '3', value: 3 },
					{ label: '4', value: 4 },
					{ label: '5', value: 5 }
				]
			},
			buildPlans() {
				this.commitCurrentSheet()
				const savedMap = new Map((this.monthList || []).map(row => [String(row.Thang), row]))
				const plans = {}
				this.months.forEach(month => {
					const saved = savedMap.get(String(month.value)) || {}
					const savedWeeks = (this.weekList || [])
						.filter(row => Number(row.Thang) === Number(month.value))
						.sort((a, b) =>
							Number(a.ThangThucTe) - Number(b.ThangThucTe)
							|| Number(a.TuanTrongThang) - Number(b.TuanTrongThang))
					plans[String(month.value)] = {
						Thang: month.value,
						DanhGia: saved.DanhGia || '',
						MucTieu: saved.MucTieu || saved.ChuDe || '',
						weeklyRows: this.normalizeWeeklyRows(savedWeeks, month, savedMap.has(String(month.value)))
					}
				})
				this.localPlans = plans
				if (!this.localPlans[String(this.activeMonth)]) {
					this.activeMonth = this.months[0]?.value || 8
				}
				this.initSheet()
			},
			normalizeWeeklyRows(rows, month = null, preserveMissing = false) {
				const targetMonth = month || this.months.find(item =>
					Number(item.value) === Number(this.activeMonth))
				const calendarRows = this.buildCalendarWeekRows(targetMonth)
				const periods = this.getCalendarWeekPeriods(targetMonth)
				const persistedRows = (rows || []).filter(row => row && !Array.isArray(row))
				return calendarRows.map((calendarRow, index) => {
					const period = periods[index]
					const source = persistedRows.length
						? persistedRows.find(row => Number(row.ThangThucTe) === Number(period?.actualMonth) &&
							Number(row.TuanTrongThang) === Number(period?.week))
						: rows?.[index]
					if (!source && preserveMissing) return ['', '', '', '', '', '']
					const normalizedSource = source || []
					if (!Array.isArray(normalizedSource)) {
						return [
							calendarRow[0],
							calendarRow[1],
							normalizedSource.ThoiGian || this.formatSavedWeekTime(normalizedSource, calendarRow[2]),
							normalizedSource.KeHoachThucHien || '',
							normalizedSource.KetQua || '',
							normalizedSource.NguyenNhan || ''
						]
					}
					const hasSavedTime = normalizedSource.length >= 6
					if (hasSavedTime) {
						return [normalizedSource[0], normalizedSource[1], normalizedSource[2], normalizedSource[3] || '', normalizedSource[4] || '', normalizedSource[5] || '']
					}
					const contentStart = normalizedSource.length >= 5 ? 2 : 1
					return [
						calendarRow[0],
						calendarRow[1],
						calendarRow[2],
						normalizedSource[contentStart] || '',
						normalizedSource[contentStart + 1] || '',
						normalizedSource[contentStart + 2] || ''
					]
				})
			},
			buildCalendarWeekRows(month) {
				return this.getCalendarWeekPeriods(month).map(period => [
					'Tháng ' + period.actualMonth,
					'Tuần ' + period.week,
					this.formatWeekDate(period.fromDate) + ' – ' + this.formatWeekDate(period.toDate)
				])
			},
			formatWeekDate(value) {
				const day = String(value.getDate()).padStart(2, '0')
				const month = String(value.getMonth() + 1).padStart(2, '0')
				return day + '/' + month
			},
			formatSqlDate(value) {
				const year = value.getFullYear()
				const month = String(value.getMonth() + 1).padStart(2, '0')
				const day = String(value.getDate()).padStart(2, '0')
				return year + '-' + month + '-' + day
			},
			formatSavedWeekTime(source, fallback) {
				if (!source) return fallback
				if (source.ThoiGian) return source.ThoiGian
				const from = source.TuNgay ? this.formatDisplayDate(source.TuNgay) : ''
				const to = source.DenNgay ? this.formatDisplayDate(source.DenNgay) : ''
				return from && to ? `${from} – ${to}` : fallback
			},
			formatDisplayDate(value) {
				const date = new Date(value)
				if (Number.isNaN(date.getTime())) return ''
				return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
			},
			getEditableWeekDates(value, fallbackPeriod) {
				const text = String(value || '')
				const matches = [...text.matchAll(/(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?/g)]
				if (matches.length < 2) return fallbackPeriod
				const schoolYear = Number(this.nienKhoa) || new Date().getFullYear()
				const toDate = (match, fallbackDate) => {
					const month = Number(match[2])
					const year = Number(match[3]) || (month >= 8 ? schoolYear - 1 : schoolYear)
					return new Date(year, month - 1, Number(match[1]))
				}
				const fromDate = toDate(matches[0], fallbackPeriod.fromDate)
				const endDate = toDate(matches[1], fallbackPeriod.toDate)
				if (endDate < fromDate) endDate.setFullYear(endDate.getFullYear() + 1)
				return { fromDate, toDate: endDate }
			},
			getCalendarWeekPeriods(month) {
				if (!month) return []
				const schoolYear = Number(this.nienKhoa) || new Date().getFullYear()
				const monthNumber = Number(month.value)
				const actualMonths = monthNumber === 1 && String(month.label).includes('2')
					? [1, 2]
					: [monthNumber]
				const periods = []
				actualMonths.forEach(actualMonth => {
					const calendarYear = actualMonth >= 8 ? schoolYear - 1 : schoolYear
					const rangeStart = new Date(calendarYear, actualMonth - 1, 1)
					const rangeEnd = new Date(calendarYear, actualMonth, 0)
					const cursor = new Date(rangeStart)
					const day = cursor.getDay()
					cursor.setDate(cursor.getDate() - (day === 0 ? 6 : day - 1))
					let week = 1
					while (cursor <= rangeEnd) {
						const fromDate = new Date(cursor)
						const toDate = new Date(cursor)
						toDate.setDate(toDate.getDate() + 6)
						periods.push({ actualMonth, week, fromDate, toDate })
						cursor.setDate(cursor.getDate() + 7)
						week += 1
					}
				})
				return periods
			},
			selectMonth(month) {
				if (Number(month) === Number(this.activeMonth)) return
				this.commitCurrentSheet()
				this.activeMonth = month
				this.initSheet()
			},
			commitCurrentSheet() {
				const plan = this.currentPlan
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
				if (plan && sheet && typeof sheet.getData === 'function') {
					try {
						if (typeof sheet.closeEditor === 'function') sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true)
						plan.weeklyRows = this.normalizeWeeklyRows(sheet.getData())
					} catch (error) {}
				}
			},
			destroySheet() {
				if (!this.instance) return
				try {
					const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (error) {}
				this.instance = null
			},
			initSheet() {
				if (this.selectedLopID === '__ALL__') {
					this.destroySheet()
					return
				}
				this.$nextTick(() => {
					const container = this.$refs.sheetRef
					if (!container || !this.currentPlan || typeof jspreadsheet !== 'function') return
					
					let scrollTop = 0;
					if (this.$refs.contentContainer) {
						scrollTop = this.$refs.contentContainer.scrollTop;
					}

					this.destroySheet()
					container.innerHTML = ''
					this.instance = jspreadsheet(container, {
						worksheets: [{
							data: this.currentPlan.weeklyRows,
							columns: this.weeklyColumns,
							rowResize: true,
							columnDrag: false,
						rowDrag: false,
						columnSorting: false,
							tableWidth: '100%',
							tableOverflow: false,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
						showHeader: true
						}],
						contextMenu: (worksheet, x, y) => y === null || y === undefined ? [] : [{
							title: 'Xóa dữ liệu tuần',
							onclick: () => this.clearWeekRow(worksheet, Number(y))
						}],
						onchange: worksheet => {
							if (this.currentPlan) {
								this.currentPlan.weeklyRows = this.normalizeWeeklyRows(worksheet.getData())
								this.$emit('changed')
							}
						},
						onbeforepaste: (worksheet, data, x, y) => {
							const col = worksheet.options.columns ? worksheet.options.columns[x] : null;
							this.$emit('changed');
							if (Array.isArray(data)) {
								const normalizedData = data.map(row => row.map(cell => {
									if (cell === null || cell === undefined) return '';
									if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
									if (typeof cell === 'object') {
										return cell.innerHTML || cell.textContent || cell.innerText || cell.value || cell.v || '';
									}
									return String(cell);
								}));
								
								if (col && (col.type === 'note' || col.type === 'html')) {
									let text = normalizedData.map(row => row.join('\t')).join('\n');
									if (text.startsWith('"') && text.endsWith('"')) {
										text = text.substring(1, text.length - 1).replace(/""/g, '"');
									}
									return [[text]];
								}
								
								return normalizedData;
							}
							return data;
						}
					})
					const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
					if (sheet && typeof sheet.setHeight === 'function') {
						this.currentPlan.weeklyRows.forEach((_, rowIndex) => sheet.setHeight(rowIndex, 68))
					}

					this.$nextTick(() => {
						if (this.$refs.contentContainer) {
							this.$refs.contentContainer.scrollTop = scrollTop;
						}
					})
				})
			},
			clearWeekRow(worksheet, rowIndex) {
				if (!worksheet || !Number.isInteger(rowIndex) || typeof worksheet.setValueFromCoords !== 'function') return
				for (let columnIndex = 0; columnIndex <= 5; columnIndex++) {
					worksheet.setValueFromCoords(columnIndex, rowIndex, '')
				}
				if (this.currentPlan) {
					this.currentPlan.weeklyRows = this.normalizeWeeklyRows(worksheet.getData())
					this.$emit('changed')
				}
			},
			getInstance() {
				return this.instance
			},
			getSaveRows(soGVCNID) {
				this.commitCurrentSheet()
				return this.months.map(month => {
					const plan = this.localPlans[String(month.value)] || {}
					return {
						SoGVCNID: soGVCNID,
						Thang: month.value,
						ChuDe: '',
						MucTieu: plan.MucTieu || '',
						NhiemVu: '',
						KeHoachTuan: '',
						DanhGia: plan.DanhGia || ''
					}
				})
			},
			getSaveWeekRows(soGVCNID) {
				this.commitCurrentSheet()
				const rows = []
				this.months.forEach(month => {
					const plan = this.localPlans[String(month.value)] || {}
					const weeklyRows = this.normalizeWeeklyRows(plan.weeklyRows || [], month)
					const periods = this.getCalendarWeekPeriods(month)
					weeklyRows.forEach((week, index) => {
						if (!week.some(value => String(value || '').trim())) return
						rows.push({
							SoGVCNID: soGVCNID,
							Thang: month.value,
							ThangThucTe: periods[index].actualMonth,
							TuanTrongThang: periods[index].week,
							...(() => {
								const period = this.getEditableWeekDates(week[2], periods[index])
								return {
									TuNgay: this.formatSqlDate(period.fromDate),
									DenNgay: this.formatSqlDate(period.toDate)
								}
							})(),
							KeHoachThucHien: week[3] || '',
							KetQua: week[4] || '',
							NguyenNhan: week[5] || ''
						})
					})
				})
				return rows
			}
		}
	}
</script>