<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<div class="pa-2 pb-0">
			<v-expansion-panels class="mb-2">
				<v-expansion-panel>
					<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary" style="min-height: 48px;">
						<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
						ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)
					</v-expansion-panel-title>
					<v-expansion-panel-text class="text-caption text-medium-emphasis">
						<div class="font-weight-bold mb-1">Hướng dẫn:</div>
						<ul class="pl-4 mb-0">
							<li>Cập nhật môn HS dự kiến sẽ chọn thi TN cùng 2 môn bắt buộc.</li>
							<li>Cập nhật dữ liệu từ phòng tham vấn (nếu có) hoặc qua tìm hiểu của GVCN.</li>
						</ul>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</div>
		<uc-jexcel :key="'hn-' + sheetKey" v-model="sheetInstance"
			:data-source="rows" :columns="columns"
			:nestedHeaders="nestedHeaders" :freeze-columns="2"
			:table-height="huongNghiepSheetHeight" table-width="100%" :disable-lazy-loading="true"
			class="so-gvcn-sheet so-gvcn-huong-nghiep-sheet"
			@update:dataSource="$emit('update-rows', $event)" />
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-huong-nghiep',
	props: {
		rows: { type: Array, default: () => [] },
		columns: { type: Array, default: () => [] },
		nestedHeaders: { type: Array, default: () => [] },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		huongNghiepSheetHeight: { type: String, default: 'calc(100vh - 360px)' },
		sheetKey: { type: [Number, String], default: 0 }
	},
	emits: ['update-rows'],
	data() {
		return {
			sheetInstance: null
		}
	},
	methods: {
		getInstance() {
			return this.sheetInstance
		}
	}
	}
</script>