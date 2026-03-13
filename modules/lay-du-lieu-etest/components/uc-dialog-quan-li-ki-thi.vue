<template>
	<span>
		<slot :activatorProps="activatorProps" />

		<v-dialog v-model="isOpen" max-width="900px" scrollable persistent>
			<v-card>
				<v-toolbar density="compact" color="primary" flat>
					<v-toolbar-title>Quản lí kì thi</v-toolbar-title>
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" color="white" @click="close" />
				</v-toolbar>

				<v-card-text class="pa-4">

					<!-- ── STEP 1: Filter + Danh sách kì thi ── -->
					<div v-if="step === 1">
						<v-row dense class="mb-3">
							<v-col cols="12" sm="6">
								<v-text-field v-model="search" density="compact" variant="outlined" hide-details
									placeholder="Tìm kì thi..." prepend-inner-icon="mdi-magnify" clearable />
							</v-col>
							<v-col cols="12" sm="6">
								<!-- TODO: thêm filter khác nếu cần (môn, năm...) -->
							</v-col>
						</v-row>

						<v-data-table :headers="examHeaders" :items="filteredExams" :loading="loadingExams"
							item-value="id" density="compact" hover no-data-text="Không có dữ liệu"
							@click:row="(_, { item }) => selectExam(item)">
							<template #item.actions="{ item }">
								<v-btn size="small" variant="tonal" color="primary" @click.stop="selectExam(item)">
									Chọn
								</v-btn>
							</template>
						</v-data-table>
					</div>

					<!-- ── STEP 2: Chọn lớp + Preview điểm ── -->
					<div v-if="step === 2">
						<div class="d-flex align-center ga-2 mb-4">
							<v-btn size="small" variant="text" prepend-icon="mdi-arrow-left" @click="step = 1">
								Quay lại
							</v-btn>
							<span class="text-subtitle-2 text-medium-emphasis">
								Kì thi đã chọn:
							</span>
							<v-chip color="primary" size="small">{{ selectedExam?.name }}</v-chip>
						</div>

						<!-- Chọn lớp -->
						<v-select v-model="selectedLopID" :items="lopOptions" item-title="label" item-value="key"
							label="Chọn lớp để apply" density="compact" variant="outlined" hide-details class="mb-4"
							style="max-width: 280px" @update:model-value="loadPreview" />

						<!-- Preview -->
						<div v-if="loadingPreview" class="d-flex justify-center py-6">
							<v-progress-circular indeterminate color="primary" />
						</div>

						<v-data-table v-else-if="previewRows.length" :headers="previewHeaders" :items="previewRows"
							density="compact" hide-default-footer :items-per-page="-1" class="border rounded">
							<!-- TODO: custom cell render nếu cần highlight thay đổi -->
						</v-data-table>

						<div v-else-if="selectedLopID" class="text-center text-medium-emphasis py-6">
							Không có dữ liệu điểm cho lớp này
						</div>
					</div>

				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-3">
					<v-spacer />
					<v-btn variant="text" @click="close">Đóng</v-btn>
					<v-btn v-if="step === 2" color="primary" variant="flat" :disabled="!canApply" :loading="applying"
						@click="doApply">
						<v-icon start size="16">mdi-check</v-icon>
						Apply vào bảng điểm
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</span>
</template>

<script>
	export default {
		name: 'UcDialogQuanLiKiThi',
	
		props: {
			// Danh sách lớp đang load trong spreadsheet (từ wsMeta)
			classes: { type: Array, default: () => [] },
			nienKhoa: { type: Number, default: null },
		},
	
		emits: ['apply'],
	
		data() {
			return {
				isOpen: false,
				step: 1,
	
				// Step 1
				search: '',
				loadingExams: false,
				exams: [],           // TODO: fill từ API
				selectedExam: null,
	
				// Step 2
				selectedLopID: null,
				loadingPreview: false,
				previewRows: [],     // TODO: fill từ API
				applying: false,
	
				examHeaders: [
					// TODO: điều chỉnh theo response API
					{ title: 'Tên kì thi', key: 'name', sortable: true },
					{ title: 'Ngày thi', key: 'date', sortable: true },
					{ title: 'Môn', key: 'subject' },
					{ title: '', key: 'actions', sortable: false, align: 'end' },
				],
	
				previewHeaders: [
					// TODO: điều chỉnh theo response API
					{ title: 'Mã HS', key: 'hocSinhID' },
					{ title: 'Họ và tên', key: 'hoTen' },
					{ title: 'Điểm', key: 'diem' },
				],
			}
		},
	
		computed: {
			activatorProps() {
				return { onClick: this.open }
			},
	
			filteredExams() {
				if (!this.search) return this.exams
				const q = this.search.toLowerCase()
				return this.exams.filter(e =>
					Object.values(e).some(v => String(v).toLowerCase().includes(q))
				)
			},
	
			lopOptions() {
				return this.classes.map(cls => ({ key: cls.id, label: cls.name }))
			},
	
			canApply() {
				return !!this.selectedExam && !!this.selectedLopID && this.previewRows.length > 0
			},
		},
	
		methods: {
			open() {
				this.reset()
				this.isOpen = true
				this.fetchExams()
			},
	
			close() {
				this.isOpen = false
			},
	
			reset() {
				this.step = 1
				this.search = ''
				this.exams = []
				this.selectedExam = null
				this.selectedLopID = null
				this.previewRows = []
			},
	
			async fetchExams() {
				this.loadingExams = true
				try {
					// TODO: thay bằng API thực
					// const data = await fetchPromise('endpoint/exam-list', { NienKhoa: this.nienKhoa })
					// this.exams = data.map(x => ({ id: x.ExamID, name: x.TenKiThi, date: x.NgayThi, subject: x.TenMonHoc }))
					this.exams = []
				} finally {
					this.loadingExams = false
				}
			},
	
			selectExam(exam) {
				this.selectedExam = exam
				this.selectedLopID = null
				this.previewRows = []
				this.step = 2
			},
	
			async loadPreview() {
				if (!this.selectedExam || !this.selectedLopID) return
				this.loadingPreview = true
				this.previewRows = []
				try {
					// TODO: thay bằng API thực
					// const data = await fetchPromise('endpoint/exam-scores', {
					//     ExamID: this.selectedExam.id,
					//     LopID: this.selectedLopID,
					// })
					// this.previewRows = data.map(x => ({ hocSinhID: x.HocSinhID, hoTen: x.HoTen, diem: x.Diem }))
					this.previewRows = []
				} finally {
					this.loadingPreview = false
				}
			},
	
			async doApply() {
				if (!this.canApply) return
				this.applying = true
				try {
					// Emit lên parent để xử lý giống onEtestApply
					this.$emit('apply', {
						exam: this.selectedExam,
						lopID: this.selectedLopID,
						rows: this.previewRows,
						// TODO: bổ sung mapping nếu cần
					})
					this.close()
				} finally {
					this.applying = false
				}
			},
		},
	}
</script>