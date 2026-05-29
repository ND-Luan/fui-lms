<template>
	<v-dialog max-width="1000" scrollable>

		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template #default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center ga-2 pa-4">
					<v-icon color="primary">mdi-content-save-outline</v-icon>
					Xác nhận lưu thay đổi
					<v-spacer />
					<v-chip color="primary" size="small">{{ rows.length }} ô thay đổi</v-chip>
					<v-chip v-if="overwriteRows.length > 0" color="warning" size="small">{{ overwriteRows.length }} ghi
						đè</v-chip>
				</v-card-title>

				<v-divider />

				<v-alert v-if="overwriteRows.length > 0" type="warning" variant="tonal" class="mx-4 mt-3"
					density="compact">
					<strong>{{ overwriteRows.length }}</strong> ô đã có giá trị cũ sẽ bị ghi đè. Kiểm tra kỹ trước khi
					lưu.
				</v-alert>

				<!-- Search & Filter -->
				<div class="pa-4 pt-3">
					<v-row dense>
						<v-col cols="12" sm="6">
							<v-text-field v-model="searchText" placeholder="Tìm kiếm (tên, mã, cột...)"
								prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details
								clearable />
						</v-col>
						<v-col cols="12" sm="6">
							<v-select v-model="filterOverwrite" :items="filterOptions" item-title="label"
								item-value="value" label="Lọc theo trạng thái" variant="outlined" density="compact"
								hide-details />
						</v-col>
					</v-row>
				</div>

				<v-divider />

				<v-card-text class="pa-0">
					<v-data-table :headers="headers" :items="filteredRows" :items-per-page="-1" density="compact"
						:row-props="getRowProps" hide-default-footer style="max-height: calc(100dvh - 261px)">

						<!-- Lớp + Mã HS + Họ tên (merge) -->
						<template #[`item.student`]="{ item }">
							<div class="py-2">
								<div class="font-weight-bold text-primary">{{ item.tenNhom }}</div>
								<div class="text-caption text-medium-emphasis">{{ item.maSoHS }} • {{ item.hoTen }}
								</div>
							</div>
						</template>

						<!-- Cột điểm (merge code + title) -->
						<template #[`item.column`]="{ item }">
							<div class="py-2">
								<div class="d-flex align-center ga-1">
									<v-icon v-if="item.type === 'ielts'" x-small color="primary">mdi-target</v-icon>
									<v-icon v-else-if="item.type === 'ta2'" x-small color="info">mdi-pencil</v-icon>
									<v-icon v-else-if="item.type === 'cambridge'" x-small
										color="deep-purple">mdi-school</v-icon>
									<span class="font-weight-medium">{{ item.tenCotDiem }}</span>
								</div>
								<div class="text-caption text-disabled">{{ item.maCotDiem }}</div>
							</div>
						</template>

						<!-- Giá trị cũ -->
						<template #[`item.oldValue`]="{ item }">
							<div class="py-2">
								<span
									v-if="item.oldValue !== null && item.oldValue !== undefined && item.oldValue !== ''"
									class="text-medium-emphasis font-italic">{{ item.oldValue }}</span>
								<span v-else class="text-disabled text-caption">— trống —</span>
							</div>
						</template>

						<!-- Giá trị mới -->
						<template #[`item.newValue`]="{ item }">
							<div class="py-2">
								<v-chip :color="item.oldValue !== null && item.oldValue !== '' ? 'warning' : 'success'"
									size="x-small" label>
									{{ item.newValue !== null ? item.newValue : '— xóa —' }}
								</v-chip>

							</div>
						</template>
					</v-data-table>

					<!-- Empty state -->
					<div v-if="filteredRows.length === 0" class="text-center pa-8 text-medium-emphasis">
						<v-icon size="48" color="medium-emphasis" class="mb-3">mdi-inbox-outline</v-icon>
						<div>Không tìm thấy thay đổi phù hợp với bộ lọc</div>
					</div>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4">
					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" variant="elevated" :loading="loading" @click="confirm(isActive)">
						<v-icon start size="16">mdi-check</v-icon>
						Xác nhận lưu ({{ rows.length }} ô)
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>

	</v-dialog>
</template>

<script>
export default {
	name: 'UcDialogSave',

	props: {
		rows: {
			type: Array,
			default: () => [],
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['confirm'],

	data() {
		return {
			searchText: '',
			filterOverwrite: 'all',
			filterOptions: [
				{ label: 'Tất cả', value: 'all' },
				{ label: 'Chỉ ghi đè', value: 'overwrite' },
				{ label: 'Chỉ thêm mới', value: 'new' },
			],
		}
	},

	computed: {
		overwriteRows() {
			return this.rows.filter(r => r.isOverwrite)
		},

		filteredRows() {
			if (!this.rows?.length) return []  // ✅ guard

			let filtered = this.rows

			if (this.filterOverwrite === 'overwrite') {
				filtered = filtered.filter(r => r.isOverwrite)
			} else if (this.filterOverwrite === 'new') {
				filtered = filtered.filter(r => !r.isOverwrite)
			}

			if (this.searchText.trim()) {
				const query = this.searchText.trim().toLowerCase()
				filtered = filtered.filter(r =>
					r.hoTen?.toLowerCase().includes(query) ||
					r.maSoHS?.toLowerCase().includes(query) ||
					r.tenNhom?.toLowerCase().includes(query) ||
					r.tenCotDiem?.toLowerCase().includes(query) ||
					r.maCotDiem?.toLowerCase().includes(query)
				)
			}

			// ✅ Sort: lớp → học sinh → nhóm cột
			const typeOrder = (maCotDiem) => {
				if (maCotDiem?.includes('__SoCauDung')) return 0
				if (maCotDiem?.includes('_TA2_') && maCotDiem?.includes('_Point')) return 1
				if (maCotDiem?.includes('_TA2_') && maCotDiem?.includes('_Conv')) return 2
				if (maCotDiem?.endsWith('_TA2_Point')) return 3
				if (maCotDiem?.includes('_IELTS_') && !maCotDiem?.includes('Band')) return 4
				if (maCotDiem?.includes('_IELTS_Band')) return 5
				// Cambridge
				if (maCotDiem?.includes('_CB_') && maCotDiem?.includes('_Point')) return 7
				if (maCotDiem?.includes('_CB_') && maCotDiem?.includes('_Conv')) return 8
				if (maCotDiem?.includes('_CB_Avg')) return 9
				return 6
			}

			return [...filtered].sort((a, b) => {
				const clsCompare = (a.tenNhom ?? '').localeCompare(b.tenNhom ?? '')
				if (clsCompare !== 0) return clsCompare
				const studentCompare = String(a.maSoHS ?? '').localeCompare(String(b.maSoHS ?? ''))
				if (studentCompare !== 0) return studentCompare
				return typeOrder(a.maCotDiem) - typeOrder(b.maCotDiem)
			})
		},

		headers() {
			return [
				{ title: 'Học sinh', key: 'student', width: 200 },
				{ title: 'Cột điểm', key: 'column', width: 200 },
				{ title: 'Giá trị cũ', key: 'oldValue', width: 120 },
				{ title: 'Giá trị mới', key: 'newValue', width: 150 },
			]
		},
	},

	methods: {
		// Format số câu đúng dạng "18/20"
		formatCorrectAnswers(value, totalQuestions) {
			if (value === null || value === undefined) return '—'
			if (totalQuestions) {
				return `${value}/${totalQuestions}`
			}
			return value
		},

		confirm(isActive) {
			this.$emit('confirm', { close: () => { isActive.value = false } })
		},
		getRowProps({ item }) {
			return item.isOverwrite ? { class: 'row-overwrite' } : {}
		},
	},
}
</script>

<style scoped>
:deep(.v-data-table__tr) {
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.v-data-table__td) {
	padding: 0 !important;
	padding-left: 16px !important;
}

:deep(.v-data-table__th) {
	background-color: #f5f5f5;
	font-weight: 600;
}
</style>