<template>
	<v-dialog max-width="860" scrollable>

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
				</v-card-title>

				<v-divider />

				<v-alert v-if="overwriteRows.length > 0" type="warning" variant="tonal" class="mx-4 mt-3"
					density="compact">
					<strong>{{ overwriteRows.length }}</strong> ô đã có giá trị cũ sẽ bị ghi đè. Kiểm tra kỹ trước khi
					lưu.
				</v-alert>

				<v-card-text class="pa-0">
					<v-data-table :headers="headers" :items="rows" :items-per-page="-1" density="compact"
						hide-default-footer>
						<template #[`item.oldValue`]="{ item }">
							<span v-if="item.oldValue !== null && item.oldValue !== undefined && item.oldValue !== ''"
								class="text-medium-emphasis font-italic">{{ item.oldValue }}</span>
							<span v-else class="text-disabled text-caption">— trống —</span>
						</template>

						<template #[`item.newValue`]="{ item }">
							<v-chip :color="item.oldValue !== null && item.oldValue !== '' ? 'warning' : 'success'"
								size="x-small" label>
								{{ item.newValue !== null ? item.newValue : '— xóa —' }}
							</v-chip>
						</template>

						<template #[`item.hoTen`]="{ item }">
							<span :class="item.isOverwrite ? 'font-weight-bold' : ''">{{ item.hoTen }}</span>
						</template>
					</v-data-table>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4">
					<v-spacer />
					<v-btn variant="text" @click="isActive.value = false">Hủy</v-btn>
					<v-btn color="primary" variant="elevated" :loading="loading" @click="confirm(isActive)">
						<v-icon start size="16">mdi-check</v-icon>
						Xác nhận lưu
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
			// Danh sách rows đã được build từ parent trước khi mở
			// Mỗi row: { tenNhom, hoTen, tenCotDiem, oldValue, newValue, isOverwrite }
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
			overwriteRows() {
				return this.rows.filter(r => r.isOverwrite)
			},
	
			headers() {
				return [
					{ title: 'Lớp', key: 'tenNhom', width: 100 },
					{ title: 'Họ và tên', key: 'hoTen', width: 160 },
					{ title: 'Cột điểm', key: 'tenCotDiem', width: 180 },
					{ title: 'Giá trị cũ', key: 'oldValue', width: 120 },
					{ title: 'Giá trị mới', key: 'newValue', width: 120 },
				]
			},
		},
	
		methods: {
			confirm(isActive) {
				this.$emit('confirm', { close: () => { isActive.value = false } })
			},
		},
	}
</script>