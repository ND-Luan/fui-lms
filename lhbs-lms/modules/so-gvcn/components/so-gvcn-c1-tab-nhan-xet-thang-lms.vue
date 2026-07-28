<template>
	<div class="pa-4">
		<v-alert type="info" variant="tonal" class="mb-4">
			Quản lý Nhận xét tháng học sinh trên hệ thống LMS (Tháng 8 đến Tháng 5, HKI & HKII).
		</v-alert>
		<v-card variant="outlined" class="d-flex align-center justify-center py-12 text-medium-emphasis">
			<div class="text-center">
				<v-icon size="48" class="mb-2 opacity-50">mdi-comment-text-multiple-outline</v-icon>
				<div class="text-body-1 font-weight-medium">Tab 4: Nhận xét tháng học sinh (LMS)</div>
				<div class="text-caption">Tương ứng sheet: NHẬN XÉT THÁNG HỌC SINH (LMS)</div>
			</div>
		</v-card>
	</div>
</template>

<script>
export default {
	name: 'so-gvcn-c1-tab-nhan-xet-thang-lms',
	props: {
		selectedLopID: { type: String, default: '__ALL__' }
	}
}
</script>
