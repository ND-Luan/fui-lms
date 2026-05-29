<!-- === uc-sach-list (Sử dụng Vuetify Grid) === -->
<template>
	<div>
		<!-- Trạng thái Loading -->
		<v-row v-if="isLoading">
			<v-col v-for="i in 4" :key="'loader-' + i" cols="12" sm="6" md="4" lg="3">
				<v-skeleton-loader type="card-avatar"></v-skeleton-loader>
			</v-col>
		</v-row>

		<!-- Hiển thị danh sách đã được nhóm -->
		<div v-else-if="items && items.length > 0">
			<div v-for="nhom in items" :key="nhom.tenNhom" class="nhom-sach-section">
				<h3 class="nhom-sach-title">
					<v-icon color="green" class="mr-2">mdi-leaf</v-icon>
					{{ nhom.tenNhom }}
				</h3>
				<!-- Sử dụng v-row và v-col của Vuetify -->
				<v-row>
					<v-col v-for="sach in nhom.sachs" :key="sach.HocLieuID" cols="12" sm="6" md="4" lg="3">
						<uc-sach-card :item="sach"></uc-sach-card>
					</v-col>
				</v-row>
			</div>
		</div>

		<!-- Trạng thái rỗng -->
		<div v-else class="text-center text-grey pa-5">
			Không tìm thấy học liệu nào phù hợp.
		</div>
	</div>
</template>

<script>
	export default {
    name: 'uc-sach-list',
    props: {
        items: { type: Array, default: () => [] },
        isLoading: { type: Boolean, default: false }
    }
}
</script>

<style scoped>
	/* CSS chỉ còn lại phần style cho tiêu đề nhóm */
	.nhom-sach-section {
		margin-bottom: 32px;
	}

	.nhom-sach-title {
		display: flex;
		align-items: center;
		font-size: 1.25rem;
		font-weight: 600;
		color: #34495e;
		margin-bottom: 16px;
	}
</style>