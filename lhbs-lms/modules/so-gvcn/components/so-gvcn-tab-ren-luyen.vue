<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
			Chọn một lớp ở thanh trên để xem và nhập hồ sơ theo dõi quá trình rèn luyện của học sinh lớp đó.
		</v-alert>
		<template v-else>
			<v-expansion-panels class="mb-2">
				<v-expansion-panel>
					<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary"
						style="min-height: 48px;">
						<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
						THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP {{ selectedClass?.TenLop || '.......' }} NĂM HỌC
						{{ schoolYearText }}
					</v-expansion-panel-title>
					<v-expansion-panel-text class="text-caption text-medium-emphasis">
						<div class="font-weight-bold mb-1">Cột từng tháng:</div>
						<ul class="pl-4 mb-0">
							<li>Ghi tóm tắt vi phạm, tái phạm, số ngày nghỉ, thời gian/xử lí/có mời PH/có cam kết lần...
							</li>
							<li>Ghi nhận tiến bộ về mặt nào đó, thành tích, đóng góp.</li>
						</ul>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
			<div class="so-gvcn-sheet-wrap">
				<uc-jexcel :key="`ren-${sheetKey}`" v-model="sheetInstance" v-model:dataSource="rowsModel"
					:columns="columns" :freeze-columns="2" :nestedHeaders="nestedHeaders"
					:table-height="renLuyenSheetHeight" table-width="100%" :disable-lazy-loading="true"
					class="so-gvcn-sheet" />
			</div>
		</template>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-ren-luyen',
	props: {
		selectedLopID: { type: String, default: '__ALL__' },
		selectedClass: { type: Object, default: null },
		schoolYearText: { type: String, default: '' },
		rows: { type: Array, default: () => [] },
		columns: { type: Array, default: () => [] },
		nestedHeaders: { type: Array, default: () => [] },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		renLuyenSheetHeight: { type: String, default: 'calc(100vh - 370px)' },
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