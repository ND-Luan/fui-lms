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
							<div :ref="`sheetRef_${card.key}`" class="w-100 so-gvcn-sheet"></div>
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
		data() {
			return {
				sheetInstances: {}
			}
		},
		emits: ['update-card-rows', 'handle-card-change'],
		methods: {
			destroySheet(cardKey) {
				const instance = this.sheetInstances[cardKey]
				if (!instance) return
				try {
					const sheet = Array.isArray(instance) ? instance[0] : instance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (e) {}
				delete this.sheetInstances[cardKey]
			},
			initSheet(card) {
				this.$nextTick(() => {
					const container = this.$refs[`sheetRef_${card.key}`]
					if (!container || !card.rows || !card.rows.length) {
						this.destroySheet(card.key)
						return
					}

					this.destroySheet(card.key)
					container.innerHTML = ''

					if (typeof jspreadsheet === 'function') {
						const sheet = jspreadsheet(container, {
							worksheets: [{
								data: card.rows,
								columns: card.columns,
								nestedHeaders: card.nestedHeaders || [],
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: card.height || 'auto',
								lazyLoading: false,
								freezeColumns: card.freezeColumns || 0,
								wordWrap: true,
								allowInsertColumn: false,
								allowInsertRow: false,
								showHeader: true
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y, value) => {
								const rows = worksheet.getData()
								this.$emit('update-card-rows', card, rows)
								this.$emit('handle-card-change', card, { worksheet, cell, x, y, value, rows })
							}
						})
						this.sheetInstances[card.key] = sheet
					}
				})
			},
			initAllSheets() {
				;(this.chiTieuCards || []).forEach(card => this.initSheet(card))
			},
			destroyAllSheets() {
				Object.keys(this.sheetInstances).forEach(key => this.destroySheet(key))
			}
		},
		watch: {
			chiTieuCards: {
				deep: true,
				handler() {
					this.initAllSheets()
				}
			},
			sheetKey() {
				this.initAllSheets()
			}
		},
		mounted() {
			this.initAllSheets()
		},
		beforeUnmount() {
			this.destroyAllSheets()
		}
	}
</script>