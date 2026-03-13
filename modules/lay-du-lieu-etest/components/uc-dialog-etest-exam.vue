<template>
	<v-dialog max-width="1000" persistent scrollable>

		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template #default="{ isActive }">
			<v-card>

				<!-- Header -->
				<v-card-title class="d-flex align-center ga-2 pa-4 bg-primary">
					<v-icon color="white">mdi-file-document-check-outline</v-icon>
					<span class="text-white text-subtitle-1 font-weight-bold">Xem dữ liệu bài thi eTest</span>
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" color="white" size="small"
						@click="isActive.value = false" />
				</v-card-title>

				<v-divider />

				<v-card-text class="pa-4">

					<!-- ══ Quick select ══ -->
					<div class="mb-3">
						<div class="text-caption text-medium-emphasis mb-2">
							<v-icon size="14" class="mr-1">mdi-lightning-bolt</v-icon>
							Chọn nhanh Exam Code
						</div>
						<div class="d-flex flex-wrap ga-1">
							<v-chip v-for="preset in examPresets" :key="preset.code" size="small"
								variant="outlined" color="primary"
								:class="{ 'bg-primary': examCode === preset.code }"
								style="cursor:pointer" @click="selectPreset(preset)">
								<span :class="examCode === preset.code ? 'text-white' : ''">
									{{ preset.label }}
								</span>
								<v-icon v-if="preset.hasIelts" end size="12"
									:color="examCode === preset.code ? 'white' : 'primary'">
									mdi-translate
								</v-icon>
							</v-chip>
						</div>
					</div>

					<!-- ══ BƯỚC 1: Nhập exam code ══ -->
					<div class="d-flex align-center ga-2 mb-4">
						<v-text-field v-model="examCode" label="Exam Code"
							placeholder="VD: 3666089F-2C1D-43FA-9483-04B8D4921416"
							density="compact" variant="outlined" hide-details clearable
							class="flex-grow-1" :disabled="loading" @keyup.enter="fetchData" />
						<v-btn color="primary" :disabled="!examCode || loading" :loading="loading"
							@click="fetchData">
							<v-icon start size="16">mdi-magnify</v-icon>
							Tải
						</v-btn>
					</div>

					<!-- Error -->
					<v-alert v-if="error" type="error" variant="tonal" density="compact"
						class="mb-4" closable @click:close="error = ''">
						{{ error }}
					</v-alert>

					<!-- Empty state -->
					<div v-if="!students && !loading && !error" class="text-center py-10">
						<v-icon size="60" color="grey-lighten-1">mdi-clipboard-search-outline</v-icon>
						<div class="text-body-2 text-medium-emphasis mt-2">
							Chọn nhanh hoặc nhập exam code rồi bấm <strong>Tải</strong>
						</div>
					</div>

					<!-- Loading -->
					<v-skeleton-loader v-if="loading" type="table-heading, table-row@6" />

					<!-- ══ BƯỚC 2 + 3 ══ -->
					<template v-if="students && !loading">

						<!-- Summary + chọn lớp -->
						<div class="d-flex align-center ga-2 mb-3 flex-wrap">
							<v-chip size="small" color="primary" prepend-icon="mdi-account-group-outline">
								{{ students.length }} học sinh
							</v-chip>
							<v-chip v-for="sk in skillKeys" :key="sk" size="small" color="teal-darken-1">
								{{ sk.trim() }}: TB {{ skillAvg(sk) }}
							</v-chip>

							<!-- Chọn lớp nếu có nhiều lớp -->
							<v-select v-if="lopOptions.length > 1" v-model="selectedLopID"
								:items="lopOptions" item-title="title" item-value="value"
								label="Chọn lớp áp dụng" density="compact" variant="outlined"
								hide-details style="max-width:200px" />
							<v-chip v-else size="small" color="secondary"
								prepend-icon="mdi-google-classroom">
								{{ lopOptions[0]?.value }}
							</v-chip>
						</div>

						<!-- Bảng dữ liệu -->
						<v-data-table :headers="tableHeaders" :items="filteredStudentsByLop"
							:items-per-page="-1" density="compact" class="border rounded mb-4"
							fixed-header height="280" hide-default-footer />

						<!-- Mapping -->
						<v-card variant="outlined" class="pa-3">
							<div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center ga-1">
								<v-icon size="18" color="primary">mdi-swap-horizontal</v-icon>
								Chọn cột bảng điểm tương ứng cho từng kĩ năng eTest
							</div>
							<div class="text-caption text-medium-emphasis mb-3">
								Mỗi kĩ năng eTest cần được chỉ định đúng cột
								<strong>Số câu đúng</strong> trong bảng điểm.
								Bỏ trống nếu không muốn áp dụng.
							</div>
							<v-row dense>
								<v-col v-for="sk in skillKeys" :key="sk" cols="12" md="6">
									<div class="d-flex align-center ga-2">
										<v-chip size="small" color="teal-darken-1"
											class="flex-shrink-0" style="min-width:160px">
											{{ sk.trim() }}
										</v-chip>
										<v-icon size="18" color="grey">mdi-arrow-right</v-icon>
										<v-select v-model="mapping[sk]" :items="soCauDungOptions"
											item-title="label" item-value="key"
											placeholder="-- Không áp dụng --" density="compact"
											variant="outlined" hide-details clearable
											class="flex-grow-1" />
									</div>
								</v-col>
							</v-row>
						</v-card>

					</template>

				</v-card-text>

				<v-divider />

				<!-- Actions -->
				<v-card-actions class="pa-3 d-flex align-center">

					<template v-if="students">
						<!-- IELTS indicator -->
						<v-chip :color="localConvertIelts ? 'primary' : 'default'"
							size="small" variant="tonal"
							:prepend-icon="localConvertIelts ? 'mdi-translate' : 'mdi-translate-off'"
							style="cursor:pointer"
							@click="localConvertIelts = !localConvertIelts">
							{{ localConvertIelts ? 'Convert IELTS' : 'Không convert IELTS' }}
						</v-chip>

						<div class="text-caption text-medium-emphasis ml-3">
							<v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
							Chỉ kĩ năng đã chọn cột mới được điền
						</div>
					</template>

					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" variant="elevated"
						:disabled="!canApply"
						prepend-icon="mdi-table-arrow-down"
						@click="apply(isActive)">
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
		soCauDungOptions: { type: Array, default: () => [] },
		convertIelts: { type: Boolean, default: true },
	},

	emits: ['apply'],

	data() {
		return {
			examCode: '',
			loading: false,
			error: '',
			students: null,
			skillKeys: [],
			mapping: {},
			selectedLopID: null,
			localConvertIelts: this.convertIelts,

			examPresets: [
				{ label: '10AV1,2', code: 'DB02F88A-C193-44E6-BADF-6A662BC019C5', hasIelts: false },
				{ label: '10AV3,4', code: '2C9CD69F-2869-49F5-9503-CE4932E861F0', hasIelts: false },
				{ label: '10AV5',   code: 'E9CB6CF6-C3AC-437C-B761-EEBDF40C391B', hasIelts: false },
				{ label: '11AV1,2', code: '64DC968C-5D9F-4F4B-A1AF-58D541DB4D2E', hasIelts: true  },
				{ label: '11AV3-5', code: '02C0916A-0D08-40F8-A003-0670B48B90CA', hasIelts: false },
				{ label: '12AV1-4', code: 'CECB5FCD-D0BC-4F05-A420-15BAC2E66E8C', hasIelts: true  },
				{ label: '12AV5,6', code: 'EB4DC3EB-C4B2-46EC-BFEE-C67846848CAB', hasIelts: true  },
			],
		}
	},

	watch: {
		convertIelts(val) { this.localConvertIelts = val },
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

		lopOptions() {
			if (!this.students) return []
			return [...new Set(this.students.map(s => s.LopID).filter(Boolean))]
				.map(id => ({ title: id, value: id }))
		},

		filteredStudentsByLop() {
			if (!this.students) return []
			if (!this.selectedLopID) return this.students
			return this.students.filter(s => s.LopID === this.selectedLopID)
		},

		tableHeaders() {
			if (!this.students?.length) return []
			return Object.keys(this.students[0]).map(k => ({
				title: k, key: k, sortable: true,
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

		canApply() {
			if (!this.students || !this.hasMappingSelected) return false
			if (this.lopOptions.length > 1 && !this.selectedLopID) return false
			return true
		},
	},

	methods: {
		selectPreset(preset) {
			this.examCode = preset.code
			this.localConvertIelts = preset.hasIelts
			// Reset
			this.students = null
			this.skillKeys = []
			this.mapping = {}
			this.selectedLopID = null
			this.error = ''
		},

		async fetchData() {
			if (!this.examCode) return
			this.loading = true
			this.error = ''
			this.students = null
			this.skillKeys = []
			this.mapping = {}
			this.selectedLopID = null

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

				// Auto-select lớp nếu chỉ có 1
				const lopIDs = [...new Set(studentList.map(s => s.LopID).filter(Boolean))]
				this.selectedLopID = lopIDs.length === 1 ? lopIDs[0] : null

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

		apply(isActive) {
			if (!this.canApply) return

			const activeMapping = Object.fromEntries(
				Object.entries(this.mapping).filter(([, v]) => !!v)
			)
			const lopIDs = [...new Set(this.students.map(s => s.LopID).filter(Boolean))]

			this.$emit('apply', {
				examCode: this.examCode.trim(),
				students: this.students,
				mapping: activeMapping,
				lopIDs,
				selectedLopID: this.selectedLopID,
				convertIelts: this.localConvertIelts,
			})

			isActive.value = false
		},
	},
}
</script>