<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, overflow: 'auto' }">
    <v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact">
      Chọn một lớp ở thanh trên để lập kế hoạch chủ nhiệm.
    </v-alert>
    <template v-else>
      <v-tabs v-model="innerTab" color="primary" density="compact" class="mb-2">
        <v-tab value="nam-hoc">Kế hoạch năm học</v-tab>
        <v-tab value="thang">Công tác chủ nhiệm tháng</v-tab>
      </v-tabs>

      <v-window v-model="innerTab">
        <v-window-item value="nam-hoc">
          <div class="text-h6 text-center font-weight-bold py-3">
            KẾ HOẠCH CHỦ NHIỆM NĂM HỌC
            <div class="text-body-2 mt-1">
              LỚP {{ selectedClass?.TenLop || '.....' }} - NĂM HỌC {{ schoolYearText }}
            </div>
          </div>

          <v-card variant="outlined" class="mb-3">
            <v-card-title class="text-subtitle-1 font-weight-bold">I. ĐẶC ĐIỂM TÌNH HÌNH</v-card-title>
            <v-card-text>
              <div class="text-body-2 font-weight-bold mb-2">1. Thống kê tình hình lớp học</div>
              <div class="overflow-x-auto mb-4">
                <v-table density="compact" class="annual-plan-table">
                  <thead>
                    <tr>
                      <th>Thời điểm</th>
                      <th v-for="column in statisticColumns" :key="column.key">{{ column.title }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in plan.statistics" :key="row.period">
                      <td class="font-weight-medium text-no-wrap">{{ row.period }}</td>
                      <td v-for="column in statisticColumns" :key="column.key">
                        <v-text-field v-model="row[column.key]" hide-details density="compact" variant="underlined" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
              <v-textarea v-model="plan.advantages" label="2. Thuận lợi" rows="3" auto-grow variant="outlined"
                density="compact" class="mb-2" />
              <v-textarea v-model="plan.difficulties" label="3. Khó khăn" rows="3" auto-grow variant="outlined"
                density="compact" hide-details />
            </v-card-text>
          </v-card>

          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              II. NỘI DUNG KẾ HOẠCH CHỦ NHIỆM
            </v-card-title>
            <v-card-text>
              <div v-for="section in planSections" :key="section.key" class="mb-4">
                <div class="text-body-2 font-weight-bold mb-2">{{ section.title }}</div>
                <v-row dense>
                  <v-col cols="12" md="5">
                    <v-textarea v-model="plan.sections[section.key].target" label="Chỉ tiêu phấn đấu" rows="3" auto-grow
                      density="compact" variant="outlined" hide-details />
                  </v-col>
                  <v-col cols="12" md="7">
                    <v-textarea v-model="plan.sections[section.key].solution" label="Nhiệm vụ và giải pháp" rows="3"
                      auto-grow density="compact" variant="outlined" hide-details />
                  </v-col>
                </v-row>
                <v-divider v-if="section.key !== 'socialization'" class="mt-4" />
              </div>
              <v-text-field v-model="plan.classTitle" label="Lớp phấn đấu đạt danh hiệu" variant="outlined"
                density="compact" hide-details />
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="thang">
          <v-alert type="info" variant="tonal" density="compact" class="mb-2">
            Cập nhật đánh giá tháng trước, kế hoạch tháng sau và kế hoạch thực hiện từng tuần từ tháng 8 đến tháng 5.
          </v-alert>
          <div ref="monthSheetRef" class="w-100 so-gvcn-sheet so-gvcn-ke-hoach-sheet"
            :style="{ height: monthSheetHeight }"></div>
        </v-window-item>
      </v-window>
    </template>
  </v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-ke-hoach-cong-tac',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			selectedClass: { type: Object, default: null },
			schoolYearText: { type: String, default: '' },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			monthSheetHeight: { type: String, default: 'calc(100vh - 310px)' },
			annualPlan: { type: [String, Object], default: '' },
			columns: { type: Array, default: () => [] },
			dataAoA: { type: Array, default: () => [] },
			sheetStyle: { type: Object, default: () => ({}) },
			nestedHeaders: { type: Array, default: () => [] },
			getKeHoachExportMonths: { type: Function, required: true },
			getKeHoachMonthRowCount: { type: Function, required: true }
		},
		data() {
			return {
				innerTab: 'nam-hoc',
				monthInstance: null,
				plan: this.parseAnnualPlan(this.annualPlan),
				statisticColumns: [
					{ key: 'total', title: 'Tổng số' },
					{ key: 'female', title: 'Nữ' },
					{ key: 'ethnic', title: 'Dân tộc' },
					{ key: 'repeater', title: 'Lưu ban' },
					{ key: 'special', title: 'Cần quan tâm' },
					{ key: 'wounded', title: 'Con thương binh' },
					{ key: 'martyr', title: 'Con liệt sĩ' },
					{ key: 'poor', title: 'Hộ nghèo' },
					{ key: 'nearPoor', title: 'Hộ cận nghèo' },
					{ key: 'official', title: 'CB/CCVC' },
					{ key: 'note', title: 'Ghi chú' }
				],
				planSections: [
					{ key: 'attendance', title: '1. Duy trì số lượng' },
					{ key: 'qualities', title: '2.1. Phẩm chất - Năng lực' },
					{ key: 'subjects', title: '2.2. Môn học và hoạt động giáo dục' },
					{ key: 'handwriting', title: '2.3. Phong trào vở sạch viết chữ đẹp' },
					{ key: 'extracurricular', title: '3.1. Hoạt động ngoài giờ lên lớp' },
					{ key: 'classroom', title: '3.2. Trang trí lớp học, giữ gìn và bảo quản CSVC của lớp' },
					{ key: 'labor', title: '3.3. Công tác lao động, xây dựng trường lớp xanh - sạch - đẹp' },
					{ key: 'socialization', title: '3.4. Công tác xã hội hóa giáo dục' }
				]
			}
		},
		watch: {
			selectedLopID() {
				this.plan = this.parseAnnualPlan(this.annualPlan)
				this.initMonthSheet()
			},
			annualPlan(value) {
				this.plan = this.parseAnnualPlan(value)
			},
			dataAoA() {
				this.initMonthSheet()
			},
			innerTab(value) {
				if (value === 'thang') this.initMonthSheet()
			}
		},
		beforeUnmount() {
			this.destroyMonthSheet()
		},
		methods: {
			getInstance() {
				return this.monthInstance
			},
			getAnnualPlan() {
				return JSON.parse(JSON.stringify(this.plan))
			},
			createDefaultPlan() {
				const periods = ['Đầu năm', 'Giữa HKI', 'Cuối HKI', 'Đầu HKII', 'Giữa HKII', 'Cuối năm']
				const sections = {}
				;['attendance', 'qualities', 'subjects', 'handwriting', 'extracurricular', 'classroom', 'labor', 'socialization']
					.forEach(key => { sections[key] = { target: '', solution: '' } })
				return {
					version: 1,
					type: 'c1-annual-plan',
					statistics: periods.map(period => ({ period })),
					advantages: '',
					difficulties: '',
					sections,
					classTitle: ''
				}
			},
			parseAnnualPlan(value) {
				const defaults = this.createDefaultPlan()
				if (!value) return defaults
				try {
					const parsed = typeof value === 'string' ? JSON.parse(value) : value
					if (parsed?.type !== 'c1-annual-plan') return defaults
					return {
						...defaults,
						...parsed,
						statistics: defaults.statistics.map((row, index) => ({
							...row,
							...(parsed.statistics?.[index] || {})
						})),
						sections: Object.keys(defaults.sections).reduce((result, key) => {
							result[key] = { ...defaults.sections[key], ...(parsed.sections?.[key] || {}) }
							return result
						}, {})
					}
				} catch (error) {
					return defaults
				}
			},
			destroyMonthSheet() {
				if (!this.monthInstance) return
				try {
					const sheet = Array.isArray(this.monthInstance) ? this.monthInstance[0] : this.monthInstance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (error) {}
				this.monthInstance = null
			},
			initMonthSheet() {
				if (this.selectedLopID === '__ALL__' || this.innerTab !== 'thang') return
				this.$nextTick(() => {
					const container = this.$refs.monthSheetRef
					if (!container || typeof jspreadsheet !== 'function') return
					this.destroyMonthSheet()
					container.innerHTML = ''
					this.monthInstance = jspreadsheet(container, {
						worksheets: [{
							data: this.dataAoA,
							columns: this.columns.map(column => (
								!column.readOnly && column.type !== 'numeric' && column.align !== 'center'
									? { ...column, align: 'justify' }
									: column
							)),
							nestedHeaders: this.nestedHeaders,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.monthSheetHeight,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							style: this.sheetStyle,
							showHeader: true
						}],
						contextMenu: () => false,
						onload: () => setTimeout(this.applyMonthLayout, 100)
					})
				})
			},
			applyMonthLayout() {
				const sheet = Array.isArray(this.monthInstance) ? this.monthInstance[0] : this.monthInstance
				if (!sheet) return
				const rowCount = this.getKeHoachMonthRowCount()
				this.getKeHoachExportMonths().forEach((month, index) => {
					const start = 1 + (index * rowCount)
					this.applyMerge(sheet, 'A' + start, 1, rowCount)
					this.applyMerge(sheet, 'I' + start, 1, rowCount)
				})
			},
			applyMerge(sheet, cell, colspan, rowspan) {
				try {
					if (sheet.setMerge) sheet.setMerge(cell, colspan, rowspan)
					else if (sheet.setMergeCells) sheet.setMergeCells(cell, colspan, rowspan)
				} catch (error) {}
			}
		}
	}
</script>