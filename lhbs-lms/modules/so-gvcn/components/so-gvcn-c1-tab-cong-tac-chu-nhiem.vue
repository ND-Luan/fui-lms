<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact">
			Chọn một lớp ở thanh trên để cập nhật công tác chủ nhiệm tháng.
		</v-alert>
		<div v-else class="d-flex h-100 ga-3">
			<div class="flex-shrink-0 overflow-y-auto"
				style="width: 220px; border-right: 1px solid rgba(0, 0, 0, 0.12);">
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-item v-for="month in months" :key="month.value" :value="month.value"
						:active="Number(activeMonth) === Number(month.value)" class="mb-1 rounded"
						@click="selectMonth(month.value)">
						<template #prepend>
							<v-icon size="small" class="mr-2"
								:color="Number(activeMonth) === Number(month.value) ? 'primary' : ''">
								mdi-calendar-month-outline
							</v-icon>
						</template>
						<v-list-item-title class="text-caption font-weight-bold">
							Công tác CN tháng {{ month.label }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

			<div class="flex-grow-1 h-100 overflow-y-auto pr-1">
				<div class="text-h6 text-center font-weight-bold py-3">
					KẾT QUẢ THỰC HIỆN THÁNG {{ activeMonthLabel }}/{{ activeYearLabel }}
					VÀ KẾ HOẠCH THÁNG {{ planMonthLabel }}/{{ planYearLabel }}
				</div>

				<v-row dense class="mb-3">
					<v-col cols="12" md="6">
						<v-card variant="outlined" height="100%">
							<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
								I. ĐÁNH GIÁ CÔNG TÁC THÁNG {{ activeMonthLabel }}
							</v-card-title>
							<v-card-text>
								<v-textarea v-if="currentPlan" v-model="currentPlan.DanhGia" rows="6" auto-grow
									variant="outlined" density="compact" hide-details
									placeholder="Nhập nội dung đánh giá kết quả thực hiện trong tháng..." />
							</v-card-text>
						</v-card>
					</v-col>
					<v-col cols="12" md="6">
						<v-card variant="outlined" height="100%">
							<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
								II. KẾ HOẠCH THÁNG {{ planMonthLabel }}
							</v-card-title>
							<v-card-text>
								<v-textarea v-if="currentPlan" v-model="currentPlan.MucTieu" rows="6" auto-grow
									variant="outlined" density="compact" hide-details
									placeholder="Nhập nội dung và nhiệm vụ trọng tâm của tháng..." />
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>

				<v-card variant="outlined" class="mb-8">
					<v-card-title class="text-subtitle-2 font-weight-bold text-primary">
						III. KẾ HOẠCH HÀNG TUẦN CỦA THÁNG {{ planMonthLabel }}/{{ planYearLabel }}
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-2">
						<div class="wrapper-jexcel">
							<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-cong-tac-thang-sheet"
								:style="{ height: weeklySheetHeight }"></div>
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
		data() {
			const months = this.getMonths()
			return {
				months,
				activeMonth: months[0]?.value || 8,
				localPlans: {},
				instance: null,
				weeklyColumns: [
					{ title: 'THÁNG', width: 80, readOnly: true, align: 'center' },
					{ title: 'TUẦN', width: 90, readOnly: true, align: 'center' },
					{ title: 'THỜI GIAN', width: 150, readOnly: true, align: 'center' },
					{ title: 'KẾ HOẠCH THỰC HIỆN', width: 390, align: 'justify' },
					{ title: 'KẾT QUẢ', width: 330, align: 'justify' },
					{ title: 'NGUYÊN NHÂN ĐẠT ĐƯỢC KẾT QUẢ', width: 390, align: 'justify' }
				]
			}
		},
		computed: {
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
			weeklySheetHeight() {
				return '360px'
			}
		},
		watch: {
			selectedLopID() {
				this.buildPlans()
			},
			monthList: {
				deep: true,
				handler() {
					this.buildPlans()
				}
			},
			weekList: {
				deep: true,
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
						weeklyRows: this.normalizeWeeklyRows(savedWeeks, month)
					}
				})
				this.localPlans = plans
				if (!this.localPlans[String(this.activeMonth)]) {
					this.activeMonth = this.months[0]?.value || 8
				}
				this.initSheet()
			},
			normalizeWeeklyRows(rows, month = null) {
				const targetMonth = month || this.months.find(item =>
					Number(item.value) === Number(this.activeMonth))
				const calendarRows = this.buildCalendarWeekRows(targetMonth)
				return calendarRows.map((calendarRow, index) => {
					const source = rows?.[index] || []
					if (!Array.isArray(source)) {
						return [
							calendarRow[0],
							calendarRow[1],
							calendarRow[2],
							source.KeHoachThucHien || '',
							source.KetQua || '',
							source.NguyenNhan || ''
						]
					}
					const contentStart = source.length >= 6 ? 3 : (source.length >= 5 ? 2 : 1)
					return [
						calendarRow[0],
						calendarRow[1],
						calendarRow[2],
						source[contentStart] || '',
						source[contentStart + 1] || '',
						source[contentStart + 2] || ''
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
						if (typeof sheet.closeEditor === 'function') sheet.closeEditor(true)
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
					this.destroySheet()
					container.innerHTML = ''
					this.instance = jspreadsheet(container, {
						worksheets: [{
							data: this.currentPlan.weeklyRows,
							columns: this.weeklyColumns,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.weeklySheetHeight,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							showHeader: true
						}],
						contextMenu: () => false,
						onchange: worksheet => {
							if (this.currentPlan) {
								this.currentPlan.weeklyRows = this.normalizeWeeklyRows(worksheet.getData())
							}
						}
					})
				})
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
						rows.push({
							SoGVCNID: soGVCNID,
							Thang: month.value,
							ThangThucTe: periods[index].actualMonth,
							TuanTrongThang: periods[index].week,
							TuNgay: this.formatSqlDate(periods[index].fromDate),
							DenNgay: this.formatSqlDate(periods[index].toDate),
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
