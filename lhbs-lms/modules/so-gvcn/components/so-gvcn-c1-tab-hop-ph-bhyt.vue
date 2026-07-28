<template>
	<div class="pa-4">
		<v-alert type="info" variant="tonal" class="mb-4">
			Quản lý Theo dõi Phụ huynh đi họp, Nội dung biên bản họp PHHS các lần và Quản lý đóng nộp BHYT, BHTN của học sinh.
		</v-alert>
		<v-card variant="outlined" class="d-flex align-center justify-center py-12 text-medium-emphasis">
			<div class="text-center">
				<v-icon size="48" class="mb-2 opacity-50">mdi-human-male-female-child</v-icon>
				<div class="text-body-1 font-weight-medium">Tab 6: Họp PHHS & BHYT/BHTN (Cấp 1)</div>
				<div class="text-caption">Bao gồm các sheet: THEO DÕI PH ĐI HỌP, NỘI DUNG HỌP PHHS, THEO DÕI BHYT BHTN CỦA HS</div>
			</div>
		</v-card>
	</div>
</template>

<script>
export default {
	name: 'so-gvcn-c1-tab-hop-ph-bhyt',
	props: {
		selectedLopID: { type: String, default: '__ALL__' }
	}
}
</script>
