<template>
	<v-card>
		<v-dialog v-model="isLoading" persistent max-width="420">
			<v-card>
				<v-card-title>Đang tải dữ liệu</v-card-title>
				<v-card-text>
					<div class="text-caption text-primary mb-3">Đang chạy song song dữ liệu của 2 giai đoạn...</div>
					<div v-for="stage in DSGiaiDoan" :key="`loading-${stage.value}`" class="mb-3">
						<div class="text-body-2 font-weight-medium">Đang tải dữ liệu {{ stage.title }}</div>
						<div class="text-caption mb-1">{{ stageCurrentClass[stage.value] || 'Đang chuẩn bị...' }}
							({{ stageProgress[stage.value]?.loaded || 0 }}/{{ stageProgress[stage.value]?.total || 0 }} lượt API)</div>
						<v-progress-linear :model-value="getStageLoadingPercent(stage.value)" color="primary" height="7" rounded />
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>
		<v-card-title class="d-flex align-center flex-wrap ga-2">
			<span>TỔNG SỐ TIẾT THEO MÔN VÀ LỚP</span>
			<v-spacer />
			<v-btn color="primary" :loading="isLoading" @click="onSearch">
				<v-icon start>mdi-magnify</v-icon>
				Tìm kiếm
			</v-btn>
			<v-btn color="success" variant="tonal" :disabled="!BaoCaoGiaiDoan.length || isLoading" @click="onExportExcel">
				<v-icon start>mdi-file-excel</v-icon>
				Xuất Excel
			</v-btn>
		</v-card-title>

		<v-card-text>
			<v-row dense>
				<v-col cols="12" sm="3">
					<v-select v-model="KhoiID" label="Khối" :items="DSKhoi" item-title="TenKhoi"
						item-value="KhoiID" :loading="isLoadingKhoi" clearable />
				</v-col>
			</v-row>

			<v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
				{{ errorMessage }}
			</v-alert>

			<div v-if="isLoading" class="text-center pa-8">
				<v-progress-circular indeterminate color="primary" />
			</div>
			<v-alert v-else-if="!BaoCaoGiaiDoan.length" type="info" variant="tonal">
				Chưa có dữ liệu trong các giai đoạn đã chọn.
			</v-alert>
			<div v-else>
				<v-card v-for="report in BaoCaoGiaiDoan" :key="report.value" class="mb-4" variant="outlined">
					<v-card-title>{{ report.title }}</v-card-title>
					<div class="report-table-wrapper">
					<table class="report-table">
					<thead>
						<tr>
							<th class="subject-column">Môn học</th>
							<th v-for="lop in report.DSLop" :key="lop.LopHocID">{{ lop.TenLop }}</th>
							<th class="total-column">Tổng số tiết môn</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="mon in report.DSMonHoc" :key="`${report.value}-${mon}`">
							<td class="subject-column">{{ mon }}</td>
							<td v-for="lop in report.DSLop" :key="`${report.value}-${mon}-${lop.LopHocID}`">
								{{ getSubjectClassTotal(report, mon, lop.LopHocID) || '' }}
							</td>
							<td class="total-column">{{ getSubjectTotal(report, mon) }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th class="subject-column">Tổng số tiết</th>
							<th v-for="lop in report.DSLop" :key="`total-${report.value}-${lop.LopHocID}`">
								{{ getClassTotal(report, lop.LopHocID) }}
							</th>
							<th class="total-column">{{ getGrandTotal(report) }}</th>
						</tr>
					</tfoot>
				</table>
					</div>
				</v-card>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		data() {
		const nienKhoa = Number(vueData.NamHocID || vueData.NienKhoa || vueData.nienkhoa || 2025)
		return {
			DonViID: 1,
			NamHocID: nienKhoa,
			KhoiID: null,
			GiaiDoan: 1,
			DSGiaiDoan: [
				{ title: 'Giai đoạn 1 (01/08/2025 - 05/04/2026)', sheetName: '01-08-2025_05-04-2026', value: 1, TuNgay: '2025-08-01', DenNgay: '2026-04-05' },
				{ title: 'Giai đoạn 2 (06/04/2026 - 06/06/2026)', sheetName: '06-04-2026_06-06-2026', value: 2, TuNgay: '2026-04-06', DenNgay: '2026-06-06' }
			],
			DSKhoi: [],
			DSLop: [],
			BaoCaoGiaiDoan: [],
			DSMonHoc: [],
			DetailByClass: {},
			TuNgay: '2025-08-01',
			DenNgay: '2026-04-05',
			isLoading: false,
			loadedClassCount: 0,
			totalClassCount: 0,
			currentClassName: '',
			stageProgress: {},
			stageCurrentClass: {},
			isLoadingKhoi: false,
			isLoadingLop: false,
			errorMessage: ''
		}
	},
	computed: {
		loadingPercent() {
			if (!this.totalClassCount) return 0
			return Math.round((this.loadedClassCount / this.totalClassCount) * 100)
		},
	},
	mounted() {
		this.loadKhoi()
	},
	watch: {
		GiaiDoan(value) {
			const giaiDoan = this.DSGiaiDoan.find(item => item.value === value)
			if (giaiDoan) {
				this.TuNgay = giaiDoan.TuNgay
				this.DenNgay = giaiDoan.DenNgay
			}
		},
		KhoiID() {
			this.loadLop()
		}
	},
	methods: {
		normalizeResponse(response) {
			if (Array.isArray(response)) return response
			if (Array.isArray(response?.data)) return response.data
			if (Array.isArray(response?.[0]?.data)) return response[0].data
			return []
		},
		async loadKhoi() {
			this.isLoadingKhoi = true
			try {
				const response = await ajaxCALLPromise('quansinh/Basic_KhoiSelectByNamHocID', {
					NamHocID: this.NamHocID,
					DonViID: this.DonViID
				})
				this.DSKhoi = this.normalizeResponse(response)
			} catch (error) {
				this.errorMessage = 'Không tải được danh sách khối.'
				console.error(error)
			} finally {
				this.isLoadingKhoi = false
			}
		},
		async loadLop() {
			this.DSLop = []
			this.clearReport()
			if (!this.KhoiID) return
			this.isLoadingLop = true
			try {
				const response = await ajaxCALLPromise('quansinh/Basic_LopHocSelectByKhoiNamHocID', {
					NamHocID: this.NamHocID,
					KhoiID: this.KhoiID
				})
				this.DSLop = this.normalizeResponse(response)
			} catch (error) {
				this.errorMessage = 'Không tải được danh sách lớp.'
				console.error(error)
			} finally {
				this.isLoadingLop = false
			}
		},
		clearReport() {
			this.DetailByClass = {}
			this.DSMonHoc = []
			this.BaoCaoGiaiDoan = []
			this.errorMessage = ''
		},
		getStageLoadingPercent(stageValue) {
			const progress = this.stageProgress[stageValue]
			if (!progress?.total) return 0
			return Math.round((progress.loaded / progress.total) * 100)
		},
		async onSearch() {
			if (!this.KhoiID) {
				this.errorMessage = 'Vui lòng chọn khối có lớp học.'
				return
			}
			if (this.isLoadingLop) return
			if (!this.DSLop.length) await this.loadLop()
			if (!this.DSLop.length) {
				this.errorMessage = 'Khối đã chọn chưa có lớp học hoặc không tải được danh sách lớp.'
				return
			}
			this.isLoading = true
			this.loadedClassCount = 0
			this.totalClassCount = this.DSLop.length * this.DSGiaiDoan.reduce(
				(total, stage) => total + this.getDateRanges(stage.value).length, 0
			)
			this.stageProgress = Object.fromEntries(this.DSGiaiDoan.map(stage => [stage.value, {
				loaded: 0,
				total: this.DSLop.length * this.getDateRanges(stage.value).length
			}]))
			this.stageCurrentClass = Object.fromEntries(this.DSGiaiDoan.map(stage => [stage.value, 'Đang chuẩn bị...']))
			this.currentClassName = ''
			this.errorMessage = ''
			try {
			this.BaoCaoGiaiDoan = await Promise.all(this.DSGiaiDoan.map(stage => this.loadStageReport(stage)))
			} catch (error) {
				this.clearReport()
				this.errorMessage = 'Không tải được dữ liệu sổ đầu bài.'
				console.error(error)
			} finally {
				this.isLoading = false
			}
		},
		async loadStageReport(stage) {
			const results = []
			for (const lop of this.DSLop) {
				const classRows = []
				for (const [fromDate, toDate, rangeLabel] of this.getDateRanges(stage.value)) {
					this.currentClassName = `${stage.title} - ${lop.TenLop || `Lớp ${lop.LopHocID}`} - ${rangeLabel}`
					this.stageCurrentClass[stage.value] = `${lop.TenLop || `Lớp ${lop.LopHocID}`} - ${rangeLabel}`
					try {
						const response = await ajaxCALLPromise('quansinh/GVCN_SoDauBai_ChiTiet', {
							TuNgay: fromDate,
							DenNgay: toDate,
							LopHocID: lop.LopHocID
						})
						classRows.push(...this.normalizeResponse(response))
					} catch (error) {
						console.error(`Không tải được dữ liệu ${this.currentClassName}`, error)
					}
					this.loadedClassCount++
					this.stageProgress[stage.value].loaded++
				}
				results.push([lop.LopHocID, classRows])
			}
			return {
				...stage,
				DSLop: [...this.DSLop],
				DetailByClass: Object.fromEntries(results),
				DSMonHoc: [...new Set(results.flatMap(([, rows]) => rows
					.map(row => String(row.TenMonHoc || '').trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'vi'))
			}
		},
		getSubjectClassTotal(report, mon, lopHocID) {
			return (report.DetailByClass[lopHocID] || []).filter(row => String(row.TenMonHoc || '').trim() === mon).length
		},
		getSubjectTotal(report, mon) {
			return report.DSLop.reduce((total, lop) => total + this.getSubjectClassTotal(report, mon, lop.LopHocID), 0)
		},
		getClassTotal(report, lopHocID) {
			return report.DSMonHoc.reduce((total, mon) => total + this.getSubjectClassTotal(report, mon, lopHocID), 0)
		},
		getGrandTotal(report) {
			return report.DSMonHoc.reduce((total, mon) => total + this.getSubjectTotal(report, mon), 0)
		},
		exportNumber(value) {
			return value || ''
		},
		getDateRanges(giaiDoan) {
			if (giaiDoan === 1) return [
				['2025-08-01', '2025-12-31', '08-12/2025'],
				['2026-01-01', '2026-04-05', '01-05/2026']
			]
			return [['2026-04-06', '2026-06-06', '06/04-06/06/2026']]
		},
		ensureXLSX() {
			if (window.XLSX) return Promise.resolve(window.XLSX)
			return new Promise((resolve, reject) => {
				const script = document.createElement('script')
				script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
				script.onload = () => resolve(window.XLSX)
				script.onerror = reject
				document.head.appendChild(script)
			})
		},
		async onExportExcel() {
			if (!this.BaoCaoGiaiDoan.length) return
			try {
				const XLSX = await this.ensureXLSX()
				const workbook = XLSX.utils.book_new()
				this.BaoCaoGiaiDoan.forEach(report => {
					const headers = ['Môn học', ...report.DSLop.map(lop => lop.TenLop), 'Tổng số tiết môn']
					const rows = report.DSMonHoc.map(mon => [
						mon,
						...report.DSLop.map(lop => this.exportNumber(this.getSubjectClassTotal(report, mon, lop.LopHocID))),
						this.exportNumber(this.getSubjectTotal(report, mon))
					])
					const totalRow = [
						'Tổng số tiết',
						...report.DSLop.map(lop => this.exportNumber(this.getClassTotal(report, lop.LopHocID))),
						this.exportNumber(this.getGrandTotal(report))
					]
					const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow])
					worksheet['!cols'] = [{ wch: 30 }, ...report.DSLop.map(() => ({ wch: 14 })), { wch: 14 }]
					XLSX.utils.book_append_sheet(workbook, worksheet, report.sheetName)
				})
				const khoiName = this.DSKhoi.find(khoi => khoi.KhoiID === this.KhoiID)?.TenKhoi || 'Khoi'
				XLSX.writeFile(workbook, `Tong_So_Tiet_${khoiName}.xlsx`)
			} catch (error) {
				this.errorMessage = 'Không thể xuất file Excel.'
				console.error(error)
			}
		}
	}
	}
</script>