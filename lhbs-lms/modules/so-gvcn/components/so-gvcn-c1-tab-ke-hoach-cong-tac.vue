<template>
	<div class="pa-4">
		<v-alert type="info" variant="tonal" class="mb-4">
			Quản lý Kế hoạch chủ nhiệm năm học và Kế hoạch công tác chủ nhiệm từng tháng (Tháng 8 đến Tháng 5).
		</v-alert>
		<v-card variant="outlined" class="d-flex align-center justify-center py-12 text-medium-emphasis">
			<div class="text-center">
				<v-icon size="48" class="mb-2 opacity-50">mdi-calendar-multiselect</v-icon>
				<div class="text-body-1 font-weight-medium">Tab 2: Kế hoạch & Công tác CN Tháng (Cấp 1)</div>
				<div class="text-caption">Bao gồm các sheet: KH CHỦ NHIỆM NĂM HỌC và 9 sheet CÔNG TÁC CN T8 -> T5</div>
			</div>
		</v-card>
	</div>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-ke-hoach-cong-tac',
	props: {
		selectedLopID: { type: String, default: '__ALL__' }
	}
	}
</script>