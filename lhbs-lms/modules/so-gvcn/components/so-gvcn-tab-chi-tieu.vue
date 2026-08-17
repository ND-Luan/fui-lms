<template>
	<v-card-text class="pa-2 so-gvcn-tab-chi-tieu" :style="{ height: sheetHeight, 'overflow': 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
			Chọn một lớp ở thanh trên để nhập chỉ tiêu và giải pháp giáo dục của lớp đó.
		</v-alert>
		<div v-else class="d-flex h-100 ga-3">
			<!-- Vertical Navigation Sidebar -->
			<div class="chi-tieu-vertical-tabs flex-shrink-0"
				style="width: 260px; border-right: 1px solid rgba(0, 0, 0, 0.12); overflow-y: auto;">
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-item v-for="card in chiTieuCards" :key="card.key" :value="card.key"
						:active="activeCardKey === card.key" :ripple="false"
						@click.stop="scrollToCard(card.key)" class="mb-1 rounded">
						<template #prepend>
							<v-icon size="small" class="mr-2" :color="activeCardKey === card.key ? 'primary' : ''">
								{{ getCardIcon(card.key) }}
							</v-icon>
						</template>
						<v-list-item-title class="text-caption font-weight-bold text-wrap" style="line-height: 1.3;">
							{{ getNavTitle(card) }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

			<!-- Main content: show one JSpreadsheet at a time and let it use the full tab height. -->
			<div class="flex-grow-1 h-100" style="min-width: 0; min-height: 0;">
				<v-card v-if="activeCard" :id="`card_section_${activeCard.key}`"
					class="so-gvcn-chi-tieu-card d-flex flex-column h-100" outlined elevation="0">
					<v-card-title class="px-3 py-2 text-subtitle-2 font-weight-bold text-primary d-flex align-center flex-shrink-0">
						<v-icon start color="primary" class="mr-2" size="small">{{ getCardIcon(activeCard.key) }}</v-icon>
						{{ activeCard.key === 'chi-tieu-giao-duc' ? chiTieuGiaoDucTitle : activeCard.title }}
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-0 so-gvcn-card-sheet-wrap so-gvcn-chi-tieu-sheet-wrap flex-grow-1">
						<div :ref="`sheetRef_${activeCard.key}`" class="w-100 h-100 so-gvcn-sheet"></div>
					</v-card-text>
				</v-card>
			</div>
		</div>
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
				activeCardKey: 'chi-tieu-giao-duc',
				sheetInstances: {}
			}
		},
		computed: {
			activeCard() {
				return (this.chiTieuCards || []).find(card => card.key === this.activeCardKey)
					|| (this.chiTieuCards || [])[0]
			}
		},
		emits: ['update-card-rows', 'handle-card-change'],
		methods: {
			getNavTitle(card) {
				if (card.key === 'chi-tieu-giao-duc') return 'I. Chỉ tiêu 2 mặt giáo dục'
				return card.title
			},
			getCardIcon(key) {
				switch (key) {
					case 'chi-tieu-giao-duc': return 'mdi-target'
					case 'danh-hieu': return 'mdi-trophy-outline'
					case 'hoat-dong-phong-trao': return 'mdi-run-fast'
					case 'theo-doi-si-so': return 'mdi-account-group-outline'
					case 'giao-vien-bo-mon': return 'mdi-account-tie-outline'
					case 'ban-dai-dien-cmhs': return 'mdi-human-male-female-child'
					case 'can-bo-lop': return 'mdi-account-star-outline'
					default: return 'mdi-file-document-outline'
				}
			},
			scrollToCard(key) {
				this.activeCardKey = key
				this.destroyAllSheets()
				this.$nextTick(() => this.initSheet(this.activeCard))
			},
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
				if (!card) return
				this.$nextTick(() => {
					let container = this.$refs[`sheetRef_${card.key}`]
					if (Array.isArray(container)) container = container[0]
					if (!container || !card.rows || !card.rows.length) {
						this.destroySheet(card.key)
						return
					}

					this.destroySheet(card.key)
					container.innerHTML = ''

					if (typeof jspreadsheet === 'function') {
						const wsConfig = {
							data: card.rows,
							columns: (card.columns || []).map(column => (
								!column.readOnly && column.type !== 'numeric' && column.align !== 'center'
									? { ...column, align: column.align || 'justify' }
									: column
							)),
							rowResize: true,
							columnDrag: false,
						rowDrag: false,
						columnSorting: false,
							tableWidth: '100%',
							tableOverflow: true,
							// Each worksheet fills the available work area and owns its vertical
							// scrollbar, including the sheets with only a few rows.
							tableHeight: `${container.clientHeight || 360}px`,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							showHeader: true
						}
						if (card.nestedHeaders && card.nestedHeaders.length > 0) {
							wsConfig.nestedHeaders = card.nestedHeaders
						}
						if (card.freezeColumns && card.freezeColumns > 0) {
							wsConfig.freezeColumns = card.freezeColumns
						}

						try {
							const sheet = soGvcnJspreadsheet.create(container, {
								worksheets: [wsConfig],
								contextMenu: () => false,
								onchange: (worksheet, cell, x, y, value) => {
									console.log('[so-gvcn-tab-chi-tieu onchange]', card.key, { x, y, value, worksheet })
									const rows = worksheet.getData()
									this.$emit('update-card-rows', card, rows)
									this.$emit('handle-card-change', card, { instance: worksheet, worksheet, cell, x, y, value, rows })
								}
							})
							this.sheetInstances[card.key] = sheet
						} catch (err) {
							console.error('Error initializing jspreadsheet for card:', card.key, err)
						}
					}
				})
			},
			initAllSheets() {
				this.destroyAllSheets()
				this.initSheet(this.activeCard)
			},
			destroyAllSheets() {
				Object.keys(this.sheetInstances).forEach(key => this.destroySheet(key))
			}
		},
		watch: {
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

<style scoped>
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap {
	min-height: 0;
	overflow: hidden !important;
}
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .wrapper-jexcel,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jexcel_container,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jspreadsheet_container,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jss_container,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jexcel_content,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jspreadsheet_content,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jss_content {
	height: 100% !important;
	max-height: 100% !important;
}
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jexcel_content,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jspreadsheet_content,
.so-gvcn-tab-chi-tieu .so-gvcn-chi-tieu-card .so-gvcn-chi-tieu-sheet-wrap .jss_content {
	overflow: auto !important;
}
</style>