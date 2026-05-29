<template>
	<v-dialog max-width="900" scrollable>

		<template #activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template #default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center ga-2 pa-4">
					<v-icon color="blue-darken-2">mdi-upload-outline</v-icon>
					Đẩy điểm IELTS
					<v-spacer />
					<v-btn icon variant="text" size="small" @click="isActive.value = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>

				<v-divider />

				<v-card-text>
					<div class="text-subtitle-2 mb-3">
						<v-icon size="16" class="mr-1">mdi-eye-outline</v-icon>
						Xem trước dữ liệu IELTS sẽ được đẩy lên hệ thống:
					</div>

					<v-data-table :headers="headers" :items="rows" :items-per-page="-1" density="compact" class="mb-4"
						hide-default-footer>
						<template #[`item.status`]="{ item }">
							<v-chip :color="item.status === 'ok' ? 'success' : 'error'" size="x-small" label>
								{{ item.status === 'ok' ? 'Hợp lệ' : 'Thiếu dữ liệu' }}
							</v-chip>
						</template>
					</v-data-table>

					<v-row dense>
						<v-col cols="4">
							<v-card variant="tonal" color="success" class="text-center pa-3">
								<div class="text-h5 font-weight-bold">{{ stats.valid }}</div>
								<div class="text-caption">Hợp lệ</div>
							</v-card>
						</v-col>
						<v-col cols="4">
							<v-card variant="tonal" color="error" class="text-center pa-3">
								<div class="text-h5 font-weight-bold">{{ stats.invalid }}</div>
								<div class="text-caption">Thiếu dữ liệu</div>
							</v-card>
						</v-col>
						<v-col cols="4">
							<v-card variant="tonal" color="primary" class="text-center pa-3">
								<div class="text-h5 font-weight-bold">{{ stats.total }}</div>
								<div class="text-caption">Tổng học sinh</div>
							</v-card>
						</v-col>
					</v-row>

					<v-alert v-if="stats.invalid > 0" type="warning" variant="tonal" class="mt-3" density="compact">
						Có {{ stats.invalid }} học sinh thiếu dữ liệu IELTS. Những học sinh này sẽ bị bỏ qua khi đẩy
						điểm.
					</v-alert>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4">
					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Hủy</v-btn>
					<v-btn color="blue-darken-2" variant="elevated" :disabled="stats.valid === 0" :loading="loading"
						@click="confirm(isActive)">
						<v-icon start size="16">mdi-upload</v-icon>
						Đẩy {{ stats.valid }} học sinh
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>

	</v-dialog>
</template>

<script>
	export default {
		name: 'UcDialogSaveIelts',
	
		props: {
			// Mỗi row: { tenNhom, hoTen, listening, reading, writing, speaking, band, status }
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
	
		computed: {
			stats() {
				const valid = this.rows.filter(r => r.status === 'ok').length
				const invalid = this.rows.filter(r => r.status !== 'ok').length
				return { valid, invalid, total: this.rows.length }
			},
	
			headers() {
				return [
					{ title: 'Lớp', key: 'tenNhom', width: 100 },
					{ title: 'Họ và tên', key: 'hoTen', width: 160 },
					{ title: 'Listening', key: 'listening', width: 100 },
					{ title: 'Reading', key: 'reading', width: 100 },
					{ title: 'Writing', key: 'writing', width: 100 },
					{ title: 'Speaking', key: 'speaking', width: 100 },
					{ title: 'Band', key: 'band', width: 90 },
					{ title: 'Trạng thái', key: 'status', width: 110 },
				]
			},
		},
	
		methods: {
			confirm(isActive) {
				this.$emit('confirm', {
					rows: this.rows.filter(r => r.status === 'ok'),
					close: () => { isActive.value = false },
				})
			},
		},
	}
</script>