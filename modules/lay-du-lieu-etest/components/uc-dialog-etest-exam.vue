<template>
	<v-dialog max-width="1000" persistent scrollable>

		<!-- ── Trigger button ── -->
		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<!-- ── Dialog content ── -->
		<template #default="{ isActive }">
			<v-card>

				<!-- Header -->
				<v-card-title class="d-flex align-center ga-2 pa-4 bg-primary">
					<v-icon color="white">mdi-file-document-check-outline</v-icon>
					<span class="text-white text-subtitle-1 font-weight-bold">Xem dữ liệu bài thi eTest</span>
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" color="white" size="small" @click="isActive.value = false" />
				</v-card-title>

				<v-divider />

				<v-card-text class="pa-4">

					<!-- ══ BƯỚC 1: Nhập exam code ══ -->
					<div class="d-flex align-center ga-2 mb-4">
						<v-text-field v-model="examCode" label="Exam Code"
							placeholder="VD: 3666089F-2C1D-43FA-9483-04B8D4921416" density="compact" variant="outlined"
							hide-details clearable class="flex-grow-1" :disabled="loading" @keyup.enter="fetchData" />
						<v-btn color="primary" :disabled="!examCode || loading" :loading="loading" @click="fetchData">
							<v-icon start size="16">mdi-magnify</v-icon>
							Tải
						</v-btn>
					</div>

					<!-- Error -->
					<v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable
						@click:close="error = ''">
						{{ error }}
					</v-alert>

					<!-- Empty state -->
					<div v-if="!students && !loading && !error" class="text-center py-10">
						<v-icon size="60" color="grey-lighten-1">mdi-clipboard-search-outline</v-icon>
						<div class="text-body-2 text-medium-emphasis mt-2">
							Nhập exam code rồi bấm <strong>Tải</strong> để xem dữ liệu
						</div>
					</div>

					<!-- Loading -->
					<v-skeleton-loader v-if="loading" type="table-heading, table-row@6" />

					<!-- ══ BƯỚC 2 + 3: Bảng & Mapping ══ -->
					<template v-if="students && !loading">

						<!-- Summary chips -->
						<div class="d-flex align-center ga-2 mb-3 flex-wrap">
							<v-chip size="small" color="primary" prepend-icon="mdi-account-group-outline">
								{{ students.length }} học sinh
							</v-chip>
							<v-chip v-for="sk in skillKeys" :key="sk" size="small" color="teal-darken-1">
								{{ sk.trim() }}: TB {{ skillAvg(sk) }}
							</v-chip>
						</div>

						<!-- Bảng dữ liệu -->
						<v-data-table :headers="tableHeaders" :items="students" :items-per-page="-1" density="compact"
							class="border rounded mb-4" fixed-header height="340" hide-default-footer>

						</v-data-table>

						<!-- Mapping kĩ năng → cột bảng điểm -->
						<v-card variant="outlined" class="pa-3">
							<div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center ga-1">
								<v-icon size="18" color="primary">mdi-swap-horizontal</v-icon>
								Chọn cột bảng điểm tương ứng cho từng kĩ năng eTest
							</div>

							<div class="text-caption text-medium-emphasis mb-3">
								Mỗi kĩ năng eTest cần được chỉ định đúng cột <strong>Số câu đúng</strong> trong bảng
								điểm.
								Bỏ trống nếu không muốn áp dụng kĩ năng đó.
							</div>

							<v-row dense>
								<v-col v-for="sk in skillKeys" :key="sk" cols="12" md="6">
									<div class="d-flex align-center ga-2">
										<v-chip size="small" color="teal-darken-1" class="flex-shrink-0"
											style="min-width:220px">
											{{ sk.trim() }}
										</v-chip>
										<v-icon size="18" color="grey">mdi-arrow-right</v-icon>
										<v-select v-model="mapping[sk]" :items="soCauDungOptions" item-title="label"
											item-value="key" placeholder="-- Không áp dụng --" density="compact"
											variant="outlined" hide-details clearable class="flex-grow-1" />
									</div>
								</v-col>
							</v-row>
						</v-card>

					</template>

				</v-card-text>

				<v-divider />

				<!-- Actions -->
				<v-card-actions class="pa-3">
					<div v-if="students" class="d-flex align-center ga-3">
						<div class="text-caption text-medium-emphasis">
							<v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
							Chỉ những kĩ năng đã chọn cột mới được điền vào bảng điểm
						</div>
						<!-- ✅ Thêm checkbox -->
						<v-checkbox v-model="convertIelts" label="Convert sang điểm IELTS" density="compact"
							hide-details color="primary" />
					</div>
					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" variant="elevated" :disabled="!students || !hasMappingSelected"
						prepend-icon="mdi-table-arrow-down" @click="apply(isActive)">
						Áp dụng vào bảng điểm
					</v-btn>
				</v-card-actions>

			</v-card>
		</template>

	</v-dialog>
</template>

<script>
	export default {
		name: 'UcDialogEtestExam',
	
		props: {
			soCauDungOptions: {
				type: Array,
				default: () => [],
			},
		},
	
		emits: ['apply'],
	
		data() {
			return {
				examCode: '64DC968C-5D9F-4F4B-A1AF-58D541DB4D2E',
				loading: false,
				error: '',
				students: null,
				skillKeys: [],
				mapping: {},
				convertIelts: true,
			}
		},
	
		computed: {
			fixedCols() {
				return [
					'STT', 'ExamID', 'MaDanhSach', 'StudentID', 'StudentTestID',
					'HoSV', 'TenSV', 'LopID', 'NgaySinh', 'GioiTinh',
					'SoLanLamBai', 'SoCauLam', 'SoCauDung', 'DiemThi',
					'GiaoVienCham', 'StartTime', 'TrangThai',
				]
			},
	
			tableHeaders() {
				if (!this.students?.length) return []
				return Object.keys(this.students[0]).map(k => ({
					title: k,
					key: k,
					sortable: true,
					width: k === 'HoSV' ? '140px'
						: k === 'TrangThai' ? '220px'
							: this.skillKeys.includes(k) ? '120px'
								: '100px',
					align: this.skillKeys.includes(k) ? 'center' : 'start',
				}))
			},
	
			hasMappingSelected() {
				return Object.values(this.mapping).some(v => !!v)
			},
		},
	
		methods: {
			async fetchData() {
				if (!this.examCode) return
				this.loading = true
				this.error = ''
				this.students = null
				this.skillKeys = []
				this.mapping = {}
	
				try {
					const raw = await fetchPromise('etest/ET_GV_Exam_BaiThiSelect', {
						examcode: this.examCode.trim(),
					})
	
					if (!Array.isArray(raw) || raw.length < 2) {
						this.error = 'Dữ liệu trả về không đúng định dạng.'
						return
					}
	
					const [studentList] = raw
	
					if (!Array.isArray(studentList) || studentList.length === 0) {
						this.error = 'Không tìm thấy dữ liệu học sinh cho exam code này.'
						return
					}
	
					this.students = studentList
					this.skillKeys = Object.keys(studentList[0]).filter(k => !this.fixedCols.includes(k))
					this.mapping = Object.fromEntries(this.skillKeys.map(k => [k, null]))
	
				} catch (err) {
					this.error = `Lỗi khi tải dữ liệu: ${err?.message ?? String(err)}`
				} finally {
					this.loading = false
				}
			},
	
			skillAvg(skillKey) {
				if (!this.students) return '—'
				const vals = this.students
					.map(r => r[skillKey])
					.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
					.map(Number)
				if (!vals.length) return '—'
				return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
			},
	
			scoreColor(value, skillKey) {
				if (!this.students) return 'grey'
				const vals = this.students
					.map(r => r[skillKey])
					.filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
					.map(Number)
				const max = Math.max(...vals)
				if (!max || isNaN(max)) return 'grey'
				const pct = Number(value) / max
				if (pct >= 0.8) return 'green'
				if (pct >= 0.5) return 'orange'
				return 'red'
			},
	
			apply(isActive) {
				if (!this.students || !this.hasMappingSelected) return
	
				const activeMapping = Object.fromEntries(
					Object.entries(this.mapping).filter(([, v]) => !!v)
				)
				const lopID = this.students[0]?.LopID ?? null
	
				this.$emit('apply', {
					examCode: this.examCode.trim(),
					students: this.students,
					mapping: activeMapping,
					lopID,
					convertIelts: this.convertIelts, // ✅
				})
	
				isActive.value = false
			},
		},
	}
</script>