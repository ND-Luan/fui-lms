<template>
	<v-card-text class="pa-2 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi sơ kết Học KÌ I.
		</v-alert>
		<div v-else class="d-flex h-100 ga-3">
			<div class="flex-shrink-0 overflow-y-auto"
				style="width: 260px; border-right: 1px solid rgba(0, 0, 0, 0.12);">
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3">
						ĐÁNH GIÁ HOẠT ĐỘNG LỚP
					</v-list-subheader>
					<v-list-item v-for="card in cards.slice(0, 3)" :key="card.key"
						:value="card.key" :active="activeCardKey === card.key" class="mb-1 rounded"
						@click="scrollToCard(card)">
						<v-list-item-title class="text-caption font-weight-bold text-wrap">
							{{ card.navTitle }}
						</v-list-item-title>
					</v-list-item>
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3 mt-2">
						KẾT QUẢ HỌC KÌ I
					</v-list-subheader>
					<v-list-item v-for="card in cards.slice(3, 5)" :key="card.key"
						:value="card.key" :active="activeCardKey === card.key" class="mb-1 rounded"
						@click="scrollToCard(card)">
						<v-list-item-title class="text-caption font-weight-bold text-wrap">
							{{ card.navTitle }}
						</v-list-item-title>
					</v-list-item>
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3 mt-2">
						PHƯƠNG HƯỚNG HỌC KÌ II
					</v-list-subheader>
					<v-list-item :value="cards[5].key" :active="activeCardKey === cards[5].key"
						class="mb-1 rounded" @click="scrollToCard(cards[5])">
						<v-list-item-title class="text-caption font-weight-bold text-wrap">
							{{ cards[5].navTitle }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

			<div ref="scrollContainer"
				class="flex-grow-1 h-100 overflow-y-auto pr-1 so-gvcn-so-ket-content">
				<div class="text-h6 text-center font-weight-bold pt-3 mb-1">SƠ KẾT HỌC KÌ I</div>
				<div class="text-body-2 text-center mb-4">
					Đánh giá nội dung hoạt động của lớp theo kế hoạch đã xây dựng đầu năm
				</div>
				<v-card v-for="card in cards.slice(0, 3)" :key="card.key" :ref="card.cardRef"
					variant="outlined" class="mb-4">
					<v-card-title class="text-subtitle-1 font-weight-bold">{{ card.title }}</v-card-title>
					<v-card-text class="pa-2">
						<v-textarea v-model="noteValues[card.key]"
							label="Nội dung nhận xét" variant="outlined" rows="8" auto-grow hide-details />
					</v-card-text>
				</v-card>

				<v-card variant="outlined" class="mb-4">
					<v-card-title class="text-subtitle-1 font-weight-bold text-primary">
						KẾT QUẢ HỌC KÌ I
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-0">
						<section v-for="(card, index) in cards.slice(3, 5)" :key="card.key"
							:ref="card.cardRef" class="pa-3" :class="{ 'border-t': index > 0 }">
							<div class="text-subtitle-2 font-weight-bold text-primary mb-3">
								{{ card.title }}
							</div>
							<div :ref="card.sheetRef"
								class="w-100 so-gvcn-sheet so-gvcn-so-ket-result-sheet"></div>
						</section>
					</v-card-text>
				</v-card>

				<v-card :ref="cards[5].cardRef" variant="outlined" class="mb-4">
					<v-card-title class="text-subtitle-1 font-weight-bold">{{ cards[5].title }}</v-card-title>
					<v-card-text class="pa-2">
						<v-textarea v-model="noteValues[cards[5].key]" label="Nội dung phương hướng"
							variant="outlined" rows="8" auto-grow hide-details />
					</v-card-text>
				</v-card>
			</div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-so-ket-tong-ket',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			classSize: { type: Number, default: 0 },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				instances: {},
				syncingTargetPercentages: false,
				noteValues: {},
				activeCardKey: 'duy-tri-si-so',
				cards: [
					{
						key: 'duy-tri-si-so',
						navTitle: '1. Công tác duy trì số lượng',
						title: '1. Công tác duy trì số lượng',
						cardRef: 'cardDuyTriSiSo',
						sheetRef: 'sheetDuyTriSiSo',
						type: 'note',
						inputType: 'textarea'
					},
					{
						key: 'danh-gia-nl-pc',
						navTitle: '2. Về năng lực, phẩm chất',
						title: '2. Về năng lực, phẩm chất',
						cardRef: 'cardDanhGiaNlPc',
						sheetRef: 'sheetDanhGiaNlPc',
						type: 'note',
						inputType: 'textarea'
					},
					{
						key: 'danh-gia-kien-thuc',
						navTitle: '3. Về kiến thức, kĩ năng',
						title: '3. Về kiến thức, kĩ năng',
						cardRef: 'cardDanhGiaKienThuc',
						sheetRef: 'sheetDanhGiaKienThuc',
						type: 'note',
						inputType: 'textarea'
					},
					{
						key: 'ket-qua-nl-pc',
						navTitle: '1. Về năng lực, phẩm chất',
						title: '1. Về năng lực, phẩm chất',
						cardRef: 'cardKetQuaNlPc',
						sheetRef: 'sheetKetQuaNlPc',
						type: 'quality'
					},
					{
						key: 'ket-qua-mon-hoc',
						navTitle: '2. Về môn học và HĐGD',
						title: '2. Về môn học và hoạt động giáo dục',
						cardRef: 'cardKetQuaMonHoc',
						sheetRef: 'sheetKetQuaMonHoc',
						type: 'subject'
					},
					{
						key: 'phuong-huong-hk2',
						navTitle: 'Nội dung phương hướng',
						title: 'PHƯƠNG HƯỚNG HỌC KÌ II',
						cardRef: 'cardPhuongHuongHk2',
						sheetRef: 'sheetPhuongHuongHk2',
						type: 'note',
						inputType: 'textarea'
					}
				]
			}
		},
		watch: {
			selectedLopID() {
				this.syncNoteValues()
				this.initSheets()
			},
			savedRows: {
				deep: false,
				handler() {
					this.syncNoteValues()
					this.initSheets()
				}
			}
		},
		created() {
			this.syncNoteValues()
		},
		mounted() {
			this.initSheets()
		},
		beforeUnmount() {
			this.destroySheets()
		},
		methods: {
			getInstance() {
				return this.instances
			},
			getNoteValues() {
				return { ...this.noteValues }
			},
			parseSavedData() {
				const source = Array.isArray(this.savedRows) ? (this.savedRows[0] || {}) : (this.savedRows || {})
				const json = source.JsonData ?? source
				if (!json) return {}
				try {
					return typeof json === 'string' ? JSON.parse(json) : json
				} catch (error) {
					return {}
				}
			},
			syncNoteValues() {
				const saved = this.parseSavedData()
				const textareaCards = (this.cards || []).filter(card => card.inputType === 'textarea')
				textareaCards.forEach(card => {
					const value = saved.notes?.[card.key]
					this.noteValues[card.key] = Array.isArray(value) ? value.join('\n') : (value || '')
				})
			},
			getData() {
				const readSheet = key => {
					const instance = this.instances[key]
					const sheet = Array.isArray(instance) ? instance[0] : instance
					if (sheet && typeof sheet.closeEditor === 'function') {
						try { sheet.closeEditor(true) } catch (error) {}
					}
					return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
				}
				return {
					version: 1,
					type: 'c1-semester-1-summary',
					notes: { ...this.noteValues },
					qualityResults: readSheet('ket-qua-nl-pc'),
					subjectResults: readSheet('ket-qua-mon-hoc')
				}
			},
			getStructuredRatings(allMonHoc = []) {
				const readSheet = key => {
					const instance = this.instances[key]
					const sheet = Array.isArray(instance) ? instance[0] : instance
					if (sheet && typeof sheet.closeEditor === 'function') {
						try { sheet.closeEditor(true) } catch (error) {}
					}
					return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
				}

				const ratings = []
				const qualityRows = readSheet('ket-qua-nl-pc')
				const qualityCategories = [
					{
						title: 'Phẩm chất',
						type: 'QUALITY',
						items: [
							{ name: 'Yêu nước', code: 'PC_YEU_NUOC' },
							{ name: 'Nhân ái', code: 'PC_NHAN_AI' },
							{ name: 'Chăm chỉ', code: 'PC_CHAM_CHI' },
							{ name: 'Trung thực', code: 'PC_TRUNG_THUC' },
							{ name: 'Trách nhiệm', code: 'PC_TRACH_NHIEM' }
						]
					},
					{
						title: 'Năng lực',
						type: 'QUALITY',
						items: [
							{ name: 'Tự chủ và tự học', code: 'NL_TU_CHU' },
							{ name: 'Giao tiếp và hợp tác', code: 'NL_GIAO_TIEP' },
							{ name: 'GQVĐ và sáng tạo', code: 'NL_GQVD' },
							{ name: 'Ngôn ngữ', code: 'NL_NGON_NGU' },
							{ name: 'Tính toán', code: 'NL_TINH_TOAN' },
							{ name: 'Khoa học', code: 'NL_KHOA_HOC' },
							{ name: 'Công nghệ', code: 'NL_CONG_NGHE' },
							{ name: 'Tin học', code: 'NL_TIN_HOC' },
							{ name: 'Thẩm mĩ', code: 'NL_THAM_MI' },
							{ name: 'Thể chất', code: 'NL_THE_CHAT' }
						]
					}
				]

				const qualityRatingCodes = ['TOT', 'DAT', 'CAN_CO_GANG']
				qualityRows.forEach((row, ratingIdx) => {
					const ratingCode = qualityRatingCodes[ratingIdx] || 'TOT'
					let colIdx = 1
					qualityCategories.forEach(cat => {
						cat.items.forEach(item => {
							const qty = parseInt(row[colIdx]) || 0
							const rate = parseFloat(row[colIdx + 1]) || 0
							ratings.push({
								LoaiDanhGia: 'QUALITY',
								MonHocID: null,
								TieuChiCode: item.code,
								TenTieuChi: item.name,
								MucXepLoaiCode: ratingCode,
								SoLuong: qty,
								TiLe: rate
							})
							colIdx += 2
						})
					})
				})

				const subjectRows = readSheet('ket-qua-mon-hoc')
				const subjectItems = [
					'Tiếng Việt', 'Toán', 'Tiếng Anh', 'Lịch sử & Địa lí', 'Khoa học',
					'Tin học - Công nghệ', 'Đạo đức', 'Giáo dục thể chất',
					'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm'
				]
				const subjectRatingCodes = ['HT_TOT', 'HOAN_THANH', 'CHUA_HT']
				subjectRows.forEach((row, ratingIdx) => {
					const ratingCode = subjectRatingCodes[ratingIdx] || 'HT_TOT'
					subjectItems.forEach((subName, subIdx) => {
						const colIdx = 1 + (subIdx * 2)
						const qty = parseInt(row[colIdx]) || 0
						const rate = parseFloat(row[colIdx + 1]) || 0
						const foundMon = (allMonHoc || []).find(m => m.TenMonHoc_HienThi === subName || m.TenMonHoc === subName)
						ratings.push({
							LoaiDanhGia: 'SUBJECT',
							MonHocID: foundMon ? foundMon.MonHocID : null,
							TieuChiCode: foundMon ? null : subName,
							TenTieuChi: subName,
							MucXepLoaiCode: ratingCode,
							SoLuong: qty,
							TiLe: rate
						})
					})
				})

				return ratings
			},
			getSheet(card) {
				let target = this.$refs[card.sheetRef]
				if (Array.isArray(target)) target = target[0]
				return target
			},
			getCard(card) {
				let target = this.$refs[card.cardRef]
				if (Array.isArray(target)) target = target[0]
				return target?.$el || target
			},
			scrollToCard(card) {
				this.activeCardKey = card.key
				let container = this.$refs.scrollContainer
				if (Array.isArray(container)) container = container[0]
				container = container?.$el || container
				const target = this.getCard(card)
				if (!container || !target) return
				const nextTop = container.scrollTop
					+ target.getBoundingClientRect().top
					- container.getBoundingClientRect().top
					- 8
				container.scrollTo({ top: nextTop, behavior: 'smooth' })
			},
			buildNoteConfig(card) {
				const saved = (this.savedRows || []).find(row => row.SectionKey === card.key) || {}
				const values = Array.isArray(saved.Rows) ? saved.Rows : []
				return {
					data: Array.from({ length: Math.max(8, values.length) },
						(_, index) => [values[index] || '']),
					columns: [{ title: 'Nội dung', width: 900, type: 'text' }],
					freezeColumns: 0
				}
			},
			buildGroupedConfig(categories, ratings, savedRows = []) {
				const groups = categories.flatMap(category => category.items)
				const columns = [{ title: 'Xếp loại', width: 150, readOnly: true }]
				const nestedCategory = [{ title: '', colspan: 1 }]
				const nestedGroup = [{ title: '', colspan: 1 }]
				categories.forEach(category => {
					nestedCategory.push({ title: category.title, colspan: category.items.length * 2 })
					category.items.forEach(group => {
						columns.push(
							{ title: 'Số lượng', width: 95, type: 'numeric', align: 'center' },
							{ title: 'Tỉ lệ', width: 85, type: 'numeric', align: 'center' }
						)
						nestedGroup.push({ title: group, colspan: 2 })
					})
				})
				return {
					data: ratings.map((rating, index) => Array.isArray(savedRows[index])
						? [rating, ...savedRows[index].slice(1)]
						: [rating, ...Array.from({ length: groups.length * 2 }, () => '')]),
					columns,
					nestedHeaders: [nestedCategory, nestedGroup],
					freezeColumns: 1
				}
			},
			buildCardConfig(card) {
				const saved = this.parseSavedData()
				if (card.type === 'quality') {
					return this.buildGroupedConfig([
						{
							title: 'Phẩm chất',
							items: ['Yêu nước', 'Nhân ái', 'Chăm chỉ', 'Trung thực', 'Trách nhiệm']
						},
						{
							title: 'Năng lực',
							items: [
								'Tự chủ và tự học', 'Giao tiếp và hợp tác', 'GQVĐ và sáng tạo',
								'Ngôn ngữ', 'Tính toán', 'Khoa học', 'Công nghệ', 'Tin học',
								'Thẩm mĩ', 'Thể chất'
							]
						}
					], ['Tốt (T)', 'Đạt (Đ)', 'Cần cố gắng (C)'], saved.qualityResults)
				}
				if (card.type === 'subject') {
					return this.buildGroupedConfig([
						{
							title: 'Môn học và hoạt động giáo dục',
							items: [
								'Tiếng Việt', 'Toán', 'Tiếng Anh', 'Lịch sử & Địa lí', 'Khoa học',
								'Tin học - Công nghệ', 'Đạo đức', 'Giáo dục thể chất',
								'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm'
							]
						}
					], ['Hoàn thành tốt (T)', 'Hoàn thành (H)', 'Chưa hoàn thành (C)'], saved.subjectResults)
				}
				return this.buildNoteConfig(card)
			},
			destroySheets() {
				Object.values(this.instances).forEach(instance => {
					try {
						const sheet = Array.isArray(instance) ? instance[0] : instance
						if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					} catch (error) {}
				})
				this.instances = {}
			},
			initSheets() {
				if (this.selectedLopID === '__ALL__') {
					this.destroySheets()
					return
				}
				this.$nextTick(() => {
					this.destroySheets()
					if (typeof jspreadsheet !== 'function') return
					this.cards.forEach(card => {
						if (card.inputType === 'textarea') return
						const container = this.getSheet(card)
						if (!container) return
						container.innerHTML = ''
						const config = this.buildCardConfig(card)
						this.syncTargetPercentages(card, config.data)
						this.instances[card.key] = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								...config,
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: '205px',
								lazyLoading: false,
								wordWrap: true,
								allowInsertColumn: false,
								allowInsertRow: false,
								showHeader: true
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y) => {
								if (this.syncingTargetPercentages) return
								this.syncingTargetPercentages = true
								try {
									this.syncTargetPercentages(card, worksheet.getData(), worksheet, x, y)
								} finally {
									this.syncingTargetPercentages = false
								}
							}
						})
					})
				})
			},
			getTargetClassSize() {
				return this.classSize > 0 ? this.classSize : (this.students || []).length
			},
			syncTargetPercentages(card, rows, worksheet = null, changedX = null, changedY = null) {
				if (!['quality', 'subject'].includes(card?.type)) return
				const classSize = this.getTargetClassSize()
				const changedColumn = Number.isFinite(Number(changedX)) ? Number(changedX) : null
				const changedRow = Number.isFinite(Number(changedY)) ? Number(changedY) : null
				const subjectCount = Math.floor(((card.type === 'quality' ? 30 : 22)) / 2)
				const subjectIndexes = changedColumn !== null && changedColumn >= 1
					? [Math.floor((changedColumn - 1) / 2)]
					: Array.from({ length: subjectCount }, (_, index) => index)
				subjectIndexes.forEach(subjectIndex => {
					if (subjectIndex >= subjectCount) return
					const quantityColumn = 1 + subjectIndex * 2
					const percentageColumn = quantityColumn + 1
					const rowIndexes = changedRow !== null ? [changedRow] : rows.map((row, index) => index)
					rowIndexes.forEach(rowIndex => {
						const row = rows[rowIndex]
						if (!Array.isArray(row)) return
						const quantity = row[quantityColumn] === '' || row[quantityColumn] == null
							? null : Number(row[quantityColumn])
						const percentage = quantity === null || !Number.isFinite(quantity) || classSize <= 0
							? '' : Math.round((quantity / classSize) * 10000) / 100
						const changed = row[percentageColumn] !== percentage
						row[percentageColumn] = percentage
						if (changed && worksheet && typeof worksheet.setValueFromCoords === 'function') {
							worksheet.setValueFromCoords(percentageColumn, rowIndex, percentage, true)
						}
					})
				})
			},
		}
	}
</script>
