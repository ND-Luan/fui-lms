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
						:active="activeCardKey === card.key" @click="scrollToCard(card.key)" class="mb-1 rounded">
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

			<!-- Main Content Area on the Right (All cards rendered in scrollable container) -->
			<div ref="scrollContainer" class="flex-grow-1 h-100 overflow-y-auto pr-1">
				<v-row dense class="pb-16">
					<v-col v-for="card in chiTieuCards" :key="card.key" cols="12" class="py-1 mb-16">
						<v-card :id="`card_section_${card.key}`" outlined elevation="0" style="margin-bottom: 180px;">
							<v-card-title
								class="px-3 py-2 text-subtitle-2 font-weight-bold text-primary d-flex align-center">
								<v-icon start color="primary" class="mr-2" size="small">{{ getCardIcon(card.key) }}
								</v-icon>
								{{ card.key === 'chi-tieu-giao-duc' ? chiTieuGiaoDucTitle : card.title }}
							</v-card-title>
							<v-divider />
							<v-card-text class="pa-0 so-gvcn-card-sheet-wrap">
								<div :ref="`sheetRef_${card.key}`" class="w-100 so-gvcn-sheet"></div>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
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
				const targetEl = document.getElementById(`card_section_${key}`)
				if (targetEl) {
					targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
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
							tableWidth: '100%',
							tableOverflow: true,
							// The tables with fixed small rows grow to their natural height
							// so word wrap does not create an inner vertical scrollbar.
							tableHeight: ['chi-tieu-giao-duc', 'danh-hieu'].includes(card.key) ? 'auto' : (card.height || 'auto'),
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
				;(this.chiTieuCards || []).forEach(card => this.initSheet(card))
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
