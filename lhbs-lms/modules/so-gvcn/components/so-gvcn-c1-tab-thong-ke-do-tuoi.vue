<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem thống kê độ tuổi học sinh.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-thong-ke-do-tuoi-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-thong-ke-do-tuoi',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				instance: null
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
			},
			students: {
				deep: true,
				handler() {
					this.initSheet()
				}
			},
			savedRows: {
				deep: false,
				handler() {
					this.initSheet()
				}
			}
		},
		mounted() {
			this.initSheet()
		},
		beforeUnmount() {
			this.destroySheet()
		},
		methods: {
			getInstance() {
				return this.instance
			},
			getRows() {
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			// Tự động phân tích danh sách dân tộc xuất hiện trong lớp
			getEthnicList() {
				const ethnicSet = new Set()
				;(this.students || []).forEach(st => {
					const dt = (st.TenDanToc || st.DanToc || '').trim()
					if (dt) ethnicSet.add(dt)
				})
				const list = Array.from(ethnicSet)
				// Ưu tiên đưa 'Kinh' lên đầu nếu có
				if (list.includes('Kinh')) {
					return ['Kinh', ...list.filter(e => e !== 'Kinh')]
				}
				return list.length ? list : ['Kinh']
			},
			buildColumnsAndHeaders() {
				const ethnicList = this.getEthnicList()
				const columns = [
					{ title: 'Các độ tuổi', width: 220 },
					{ title: 'Nam', width: 100, align: 'center', type: 'numeric' },
					{ title: 'Nữ', width: 100, align: 'center', type: 'numeric' }
				]

				// Cột Dân tộc
				ethnicList.forEach(eth => {
					columns.push({ title: eth, width: 110, align: 'center', type: 'numeric' })
				})

				// Cột Khuyết tật (nhập số lượng)
				columns.push({ title: 'Khuyết tật', width: 140, align: 'center', type: 'numeric' })

				const nestedHeaders = [
					[
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: 'Dân tộc', colspan: ethnicList.length },
						{ title: '', colspan: 1 }
					]
				]

				return { columns, nestedHeaders, ethnicList }
			},

			buildRows(ethnicList) {
				const savedRows = this.savedRows || []
				const rowCount = Math.max(20, savedRows.length)
				return Array.from({ length: rowCount }, (_, index) => {
					const saved = savedRows[index] || {}
					let ethnicCounts = saved.EthnicCounts || saved.DanToc || {}
					if (saved.DanTocJson) {
						try {
							ethnicCounts = JSON.parse(saved.DanTocJson)
						} catch (error) {}
					}
					return [
						saved.AgeLabel || '',
						saved.Nam ?? '',
						saved.Nu ?? '',
						...ethnicList.map(eth => ethnicCounts[eth] ?? ''),
						saved.KhuyetTat ?? ''
					]
				})
			},

			getSerializableRows() {
				const ethnicList = this.getEthnicList()
				return this.getRows().map(row => {
					const ethnicCounts = {}
					ethnicList.forEach((eth, index) => {
						ethnicCounts[eth] = row[3 + index] ?? ''
					})
					return {
						AgeLabel: row[0] ?? '',
						Nam: row[1] ?? '',
						Nu: row[2] ?? '',
						DanTocJson: JSON.stringify(ethnicCounts),
						KhuyetTat: row[3 + ethnicList.length] ?? ''
					}
				}).filter(row => row.AgeLabel || row.Nam || row.Nu
					|| row.KhuyetTat || Object.values(JSON.parse(row.DanTocJson)).some(value => value !== ''))
			},

			destroySheet() {
				if (!this.instance) return
				try {
					const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					else if (this.$refs.sheetRef && typeof jspreadsheet !== 'undefined'
						&& typeof jspreadsheet.destroy === 'function') {
						jspreadsheet.destroy(this.$refs.sheetRef)
					}
				} catch (error) {}
				this.instance = null
			},

			initSheet() {
				if (this.selectedLopID === '__ALL__') {
					this.destroySheet()
					return
				}
				this.$nextTick(() => {
					const container = this.$refs.sheetRef
					if (!container) return
					this.destroySheet()
					container.innerHTML = ''

					const { columns, nestedHeaders, ethnicList } = this.buildColumnsAndHeaders()
					const data = this.buildRows(ethnicList)

					if (typeof jspreadsheet === 'function') {
						this.instance = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								data: data,
								columns: columns,
								nestedHeaders: nestedHeaders,
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: this.sheetHeight,
								lazyLoading: false,
								freezeColumns: 1,
								wordWrap: true,
								allowInsertColumn: false,
								allowInsertRow: false,
								showHeader: true
							}],
							contextMenu: () => false
						})
					}
				})
			}
		}
	}
</script>