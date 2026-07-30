<template>
	<v-card-text class="pa-0" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi sơ kết Học kỳ I.
		</v-alert>
		<v-row v-else no-gutters class="h-100">
			<v-col cols="12" md="3" lg="2" class="border-e h-100 overflow-y-auto">
				<v-list density="compact" nav>
					<v-list-subheader>ĐÁNH GIÁ HOẠT ĐỘNG LỚP</v-list-subheader>
					<v-list-item v-for="card in cards.slice(0, 3)" :key="card.key"
						:title="card.navTitle" @click="scrollToCard(card)" />
					<v-list-subheader>KẾT QUẢ HỌC KỲ I</v-list-subheader>
					<v-list-item v-for="card in cards.slice(3, 5)" :key="card.key"
						:title="card.navTitle" @click="scrollToCard(card)" />
					<v-list-subheader>PHƯƠNG HƯỚNG HỌC KỲ II</v-list-subheader>
					<v-list-item :title="cards[5].navTitle" @click="scrollToCard(cards[5])" />
				</v-list>
			</v-col>

			<v-col ref="scrollContainer" cols="12" md="9" lg="10" class="h-100 overflow-y-auto pa-3">
				<div class="text-h6 text-center font-weight-bold mb-1">SƠ KẾT HỌC KỲ I</div>
				<div class="text-body-2 text-center mb-4">
					Đánh giá nội dung hoạt động của lớp theo kế hoạch đã xây dựng đầu năm
				</div>
				<v-card v-for="card in cards" :key="card.key" :ref="card.cardRef"
					variant="outlined" class="mb-4">
					<v-card-title class="text-subtitle-1 font-weight-bold">{{ card.title }}</v-card-title>
					<v-card-text class="pa-2">
						<div :ref="card.sheetRef" class="w-100 so-gvcn-sheet"></div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-so-ket-tong-ket',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				instances: {},
				cards: [
					{
						key: 'duy-tri-si-so',
						navTitle: '1. Công tác duy trì số lượng',
						title: '1. Công tác duy trì số lượng',
						cardRef: 'cardDuyTriSiSo',
						sheetRef: 'sheetDuyTriSiSo',
						type: 'note'
					},
					{
						key: 'danh-gia-nl-pc',
						navTitle: '2. Về năng lực, phẩm chất',
						title: '2. Về năng lực, phẩm chất',
						cardRef: 'cardDanhGiaNlPc',
						sheetRef: 'sheetDanhGiaNlPc',
						type: 'note'
					},
					{
						key: 'danh-gia-kien-thuc',
						navTitle: '3. Về kiến thức, kĩ năng',
						title: '3. Về kiến thức, kĩ năng',
						cardRef: 'cardDanhGiaKienThuc',
						sheetRef: 'sheetDanhGiaKienThuc',
						type: 'note'
					},
					{
						key: 'ket-qua-nl-pc',
						navTitle: '1. Về năng lực, phẩm chất',
						title: 'KẾT QUẢ HỌC KỲ I — 1. Về năng lực, phẩm chất',
						cardRef: 'cardKetQuaNlPc',
						sheetRef: 'sheetKetQuaNlPc',
						type: 'quality'
					},
					{
						key: 'ket-qua-mon-hoc',
						navTitle: '2. Về môn học và HĐGD',
						title: 'KẾT QUẢ HỌC KỲ I — 2. Về môn học và hoạt động giáo dục',
						cardRef: 'cardKetQuaMonHoc',
						sheetRef: 'sheetKetQuaMonHoc',
						type: 'subject'
					},
					{
						key: 'phuong-huong-hk2',
						navTitle: 'Nội dung phương hướng',
						title: 'PHƯƠNG HƯỚNG HỌC KỲ II',
						cardRef: 'cardPhuongHuongHk2',
						sheetRef: 'sheetPhuongHuongHk2',
						type: 'note'
					}
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheets()
			},
			savedRows: {
				deep: false,
				handler() {
					this.initSheets()
				}
			}
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
			buildGroupedConfig(categories, ratings) {
				const groups = categories.flatMap(category => category.items)
				const columns = [{ title: 'Xếp loại', width: 170, readOnly: true }]
				const nestedCategory = [{ title: '', colspan: 1 }]
				const nestedGroup = [{ title: '', colspan: 1 }]
				const nestedMetric = [{ title: '', colspan: 1 }]
				categories.forEach(category => {
					nestedCategory.push({ title: category.title, colspan: category.items.length * 2 })
					category.items.forEach(group => {
						columns.push(
							{ title: '', width: 90, type: 'numeric', align: 'center' },
							{ title: '', width: 90, align: 'center' }
						)
						nestedGroup.push({ title: group, colspan: 2 })
						nestedMetric.push(
							{ title: 'Số lượng', colspan: 1 },
							{ title: 'Tỉ lệ', colspan: 1 }
						)
					})
				})
				return {
					data: ratings.map(rating => [
						rating,
						...Array.from({ length: groups.length * 2 }, () => '')
					]),
					columns,
					nestedHeaders: [nestedCategory, nestedGroup, nestedMetric],
					freezeColumns: 1
				}
			},
			buildCardConfig(card) {
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
								'Ngôn ngữ', 'Tính toán', 'Khoa học', 'Thẩm mĩ', 'Thể chất',
								'Công nghệ', 'Tin học'
							]
						}
					], ['Tốt (T)', 'Đạt (Đ)', 'Cần cố gắng (C)'])
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
					], ['Hoàn thành tốt (T)', 'Hoàn thành (H)', 'Chưa hoàn thành (C)'])
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
						const container = this.getSheet(card)
						if (!container) return
						container.innerHTML = ''
						const config = this.buildCardConfig(card)
						this.instances[card.key] = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								...config,
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: card.type === 'note' ? '260px' : '360px',
								lazyLoading: false,
								wordWrap: true,
								allowInsertColumn: false,
								allowInsertRow: false,
								showHeader: true
							}],
							contextMenu: () => false
						})
					})
				})
			}
		}
	}
</script>