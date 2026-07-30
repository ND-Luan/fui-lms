<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và biên soạn nội dung các buổi họp Phụ huynh học sinh.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-noi-dung-hop-ph-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-noi-dung-hop-ph',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				instance: null,
				columns: [
					{ title: 'STT', width: 60, readOnly: true, align: 'center' },
					{ title: 'Hội PHHS', width: 140, readOnly: true },
					{ title: 'NỘI DUNG HỌP PHỤ HUYNH', width: 280, readOnly: true },
					{ title: 'THỜI GIAN / NGÀY HỌP', width: 160 },
					{ title: 'ĐỊA ĐIỂM / HÌNH THỨC', width: 180 },
					{ title: 'NỘI DUNG CHÍNH CUỘC HỌP', width: 420 },
					{ title: 'Ý KIẾN NGHỊ / THỎA THUẬN CỦA PHHS', width: 400 },
					{ title: 'KẾT LUẬN / THÔNG QUA BIÊN BẢN', width: 320 }
				],
				defaultMeetings: [
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 1',
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 2',
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 3'
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
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
		computed: {
			nestedHeaders() {
				return [
					[
						{ title: '', colspan: 3 },
						{ title: 'THÔNG TIN VÀ NỘI DUNG BIÊN BẢN HỌP PHỤ HUYNH HỌC SINH', colspan: 5 }
					]
				]
			}
		},
		methods: {
			getInstance() {
				return this.instance
			},
			getRows() {
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			buildRows() {
				const findSaved = (meetingIndex, meetingTitle) => {
					return (this.savedRows || []).find(r => r.MeetingIndex === meetingIndex || r.DotHop === meetingTitle) || {}
				}

				return this.defaultMeetings.map((meetingTitle, idx) => {
					const saved = findSaved(idx, meetingTitle)
					return [
						idx + 1,
						'Hội PHHS',
						meetingTitle,
						saved.ThoiGian || '',
						saved.DiaDiem || '',
						saved.NoiDungChinh || '',
						saved.YKienPHHS || '',
						saved.KetLuan || ''
					]
				})
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
					if (typeof jspreadsheet === 'function') {
						this.instance = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								data: this.buildRows(),
								columns: this.columns,
								nestedHeaders: this.nestedHeaders,
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: this.sheetHeight,
								lazyLoading: false,
								freezeColumns: 3,
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