<template>
	<div class="pa-4">
		<v-alert type="info" variant="tonal" class="mb-4">
			Quản lý Đánh giá Sơ kết HKI và Tổng kết cuối năm học (5 Phẩm chất & Năng lực TT27) cùng Thành tích khen thưởng học sinh.
		</v-alert>
		<v-card variant="outlined" class="d-flex align-center justify-center py-12 text-medium-emphasis">
			<div class="text-center">
				<v-icon size="48" class="mb-2 opacity-50">mdi-trophy-award</v-icon>
				<div class="text-body-1 font-weight-medium">Tab 5: Sơ kết, Tổng kết & Thành tích (Cấp 1)</div>
				<div class="text-caption">Bao gồm các sheet: SƠ KẾT HKI, TỔNG KẾT NĂM HỌC, THEO DÕI THÀNH TÍCH HS</div>
			</div>
		</v-card>
	</div>
</template>

<script>
export default {
	name: 'so-gvcn-c1-tab-so-ket-tong-ket',
	props: {
		selectedLopID: { type: String, default: '__ALL__' }
	}
}
</script>
