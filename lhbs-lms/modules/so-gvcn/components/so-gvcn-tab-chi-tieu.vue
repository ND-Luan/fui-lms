<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
			Chọn một lớp ở thanh trên để nhập chỉ tiêu và giải pháp giáo dục của lớp đó.
		</v-alert>
		<template v-else>
			<v-row dense>
				<v-col v-for="card in chiTieuCards" :key="card.key" cols="12" :md="card.md" class="py-1">
					<v-card outlined elevation="0" class="mb-1">
						<v-card-title class="px-3 py-1 subtitle-2 font-weight-bold error--text">
							{{ card.key === 'chi-tieu-giao-duc' ? chiTieuGiaoDucTitle : card.title }}
						</v-card-title>
						<v-divider />
						<v-card-text class="pa-0 so-gvcn-card-sheet-wrap">
							<uc-jexcel :key="card.key + '-' + sheetKey" :data-source="card.rows"
								:columns="card.columns" :nestedHeaders="card.nestedHeaders || []"
								:freeze-columns="card.freezeColumns || 0" table-height="auto"
								table-width="100%" :disable-lazy-loading="true" class="so-gvcn-sheet"
								@update:dataSource="$emit('update-card-rows', card, $event)"
								@on-change="$emit('handle-card-change', card, $event)" />
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</template>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-chi-tieu',
	props: {
		selectedLopID: { type: String, default: '__ALL__' },
		chiTieuCards: { type: Array, default: () => [] },
		chiTieuGiaoDucTitle: { type: String, default: '' },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		sheetKey: { type: [Number, String], default: 0 }
	},
	emits: ['update-card-rows', 'handle-card-change']
	}
</script>