<template>
	<div class="pa-4">
		<v-alert type="info" variant="tonal" class="mb-4">
			Quản lý Hồ sơ theo dõi quá trình rèn luyện của Học sinh cần hỗ trợ đặc biệt (Theo dõi hàng tháng T8 -> T5, Nhận xét HKI & Cuối năm).
		</v-alert>
		<v-card variant="outlined" class="d-flex align-center justify-center py-12 text-medium-emphasis">
			<div class="text-center">
				<v-icon size="48" class="mb-2 opacity-50">mdi-heart-pulse-outline</v-icon>
				<div class="text-body-1 font-weight-medium">Tab 3: Theo dõi HS cần quan tâm (Cấp 1)</div>
				<div class="text-caption">Tương ứng sheet: HỒ SƠ THEO DÕI HS CẦN QUAN TÂM</div>
			</div>
		</v-card>
	</div>
</template>

<script>
export default {
	name: 'so-gvcn-c1-tab-hs-can-quan-tam',
	props: {
		selectedLopID: { type: String, default: '__ALL__' }
	}
}
</script>
