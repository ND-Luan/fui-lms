<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<div class="pa-2 pb-0">
			<v-expansion-panels class="mb-2">
				<v-expansion-panel>
					<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary" style="min-height: 48px;">
						<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
						NHẬN XÉT SỔ LIÊN LẠC HẰNG THÁNG
					</v-expansion-panel-title>
					<v-expansion-panel-text class="text-caption text-medium-emphasis">
						<div class="font-weight-bold mb-1">Hướng dẫn:</div>
						<div class="mb-1">
							Căn cứ sheet HỒ SƠ THEO DÕI QTRL, GVCN soạn nhận xét để cập nhật MLS cho PHHS. Nhận xét học sinh cần phù hợp với các minh chứng trong sheet HỒ SƠ THEO DÕI QTRL.
						</div>
						<div class="font-weight-bold mb-1">Cấu trúc nhận xét từng tháng:</div>
						<ul class="pl-4 mb-0">
							<li>Tinh thần, thái độ học tập và mức độ tiến bộ của học sinh (Chú trọng ghi nhận sự tiến bộ)</li>
							<li>Việc tuân thủ nội quy, nền nếp, chuyên cần trong tháng</li>
							<li>Đề xuất PHHS phối hợp giáo dục</li>
						</ul>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</div>
		<uc-jexcel :key="`sll-${sheetKey}`" v-model="sheetInstance"
			v-model:dataSource="rowsModel" :columns="columns" :freeze-columns="2"
			:nestedHeaders="nestedHeaders" :table-height="soLienLacSheetHeight" table-width="100%"
			:disable-lazy-loading="true" class="so-gvcn-sheet" />
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-so-lien-lac',
	props: {
		rows: { type: Array, default: () => [] },
		columns: { type: Array, default: () => [] },
		nestedHeaders: { type: Array, default: () => [] },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		soLienLacSheetHeight: { type: String, default: 'calc(100vh - 385px)' },
		sheetKey: { type: [Number, String], default: 0 }
	},
	emits: ['update:rows'],
	data() {
		return {
			sheetInstance: null
		}
	},
	computed: {
		rowsModel: {
			get() { return this.rows },
			set(val) { this.$emit('update:rows', val) }
		}
	},
	methods: {
		getInstance() {
			return this.sheetInstance
		}
	}
	}
</script>