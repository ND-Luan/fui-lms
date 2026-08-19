<template>
	<v-card-text class="pa-2 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và biên soạn Tổng kết cuối năm học.
		</v-alert>

		<div v-else class="d-flex h-100 ga-3">
			<div class="flex-shrink-0 overflow-y-auto"
				style="width: 260px; border-right: 1px solid rgba(0, 0, 0, 0.12);">
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3">
						ĐÁNH GIÁ TỔNG QUAN
					</v-list-subheader>
					<v-list-item v-for="item in navItems.slice(0, 3)" :key="item.key" :value="item.key"
						:active="activeSection === item.key" class="mb-1 rounded" @click="scrollToSection(item)">
						<v-list-item-title class="text-caption font-weight-bold text-wrap">
							{{ item.title }}
						</v-list-item-title>
					</v-list-item>
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3 mt-2">
						KẾT QUẢ CUỐI NĂM
					</v-list-subheader>
					<v-list-item v-for="item in navItems.slice(3)" :key="item.key" :value="item.key"
						:active="activeSection === item.key" class="mb-1 rounded" @click="scrollToSection(item)">
						<v-list-item-title class="text-caption font-weight-bold text-wrap">
							{{ item.title }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

		 	<div ref="scrollContainer" class="flex-grow-1 h-100 overflow-y-auto pr-1">
				<div class="text-h6 text-center font-weight-bold py-3">TỔNG KẾT NĂM HỌC</div>
				<v-card ref="sectionDuyTri" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">1. Công tác duy trì số lượng</v-card-title>
					<v-card-text>
						<v-textarea v-model="localForm.DuyTriSoLuong" rows="4" variant="outlined" density="compact"
							hide-details class="text-body-2" />
					</v-card-text>
				</v-card>
				<v-card ref="sectionNlPc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">2. Về năng lực, phẩm chất</v-card-title>
					<v-card-text>
						<v-textarea v-model="localForm.NangLucPhamChat" rows="4" variant="outlined" density="compact"
							hide-details class="text-body-2" />
					</v-card-text>
				</v-card>
				<v-card ref="sectionKienThuc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">3. Về kiến thức, kĩ năng</v-card-title>
					<v-card-text>
						<v-textarea v-model="localForm.KienThucKyNang" rows="4" variant="outlined" density="compact"
							hide-details class="text-body-2" />
					</v-card-text>
				</v-card>
				<v-card class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold text-primary">
						KẾT QUẢ CUỐI NĂM HỌC
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-0">
						<section ref="sectionKetQuaNlPc" class="pa-3">
							<div class="text-subtitle-2 font-weight-bold text-primary mb-3">
								1. Về năng lực, phẩm chất
							</div>
							<div ref="sheetRef1" class="w-100 so-gvcn-sheet so-gvcn-summary-result-sheet"></div>
						</section>
						<section ref="sectionMonHoc" class="pa-3 border-t">
							<div class="text-subtitle-2 font-weight-bold text-primary mb-3">
								2. Về môn học và hoạt động giáo dục
							</div>
							<div ref="sheetRef2" class="w-100 so-gvcn-sheet so-gvcn-summary-result-sheet"></div>
						</section>
						<section ref="sectionKetQuaGd" class="pa-3 border-t">
							<div class="text-subtitle-2 font-weight-bold text-primary mb-3">
								3. Về đánh giá kết quả giáo dục
							</div>
							<div ref="sheetRef3" class="w-100 so-gvcn-sheet so-gvcn-summary-result-sheet"></div>
						</section>
						<section ref="sectionKhenThuong" class="pa-3 border-t">
							<div class="text-subtitle-2 font-weight-bold text-primary mb-3">
								4. Khen thưởng
							</div>
							<div ref="sheetRef4" class="w-100 so-gvcn-sheet so-gvcn-summary-result-sheet"></div>
						</section>
					</v-card-text>
				</v-card>
				<v-card ref="sectionHoanThanh" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">5. Hoàn thành chương trình lớp học
					</v-card-title>
					<v-card-text>
						<v-textarea v-model="localForm.HoanThanhCT" rows="4" variant="outlined" density="compact"
							hide-details class="text-body-2" />
					</v-card-text>
				</v-card>
				<v-card ref="sectionPhongTrao" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">6. Các hoạt động, phong trào khác
					</v-card-title>
					<v-card-text>
						<v-textarea v-model="localForm.PhongTraoKhac" rows="4" variant="outlined" density="compact"
							hide-details class="text-body-2" />
					</v-card-text>
				</v-card>
			</div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-tong-ket-nam-hoc',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			classSize: { type: Number, default: 0 },
			savedData: { type: Object, default: () => ({}) },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				syncingTargetPercentages: false,
				sheet1Instance: null,
				sheet2Instance: null,
				sheet3Instance: null,
				sheet4Instance: null,
				activeSection: 'duy-tri',
				navItems: [
					{ key: 'duy-tri', refName: 'sectionDuyTri', title: '1. Công tác duy trì số lượng' },
					{ key: 'nang-luc-pham-chat', refName: 'sectionNlPc', title: '2. Về năng lực, phẩm chất' },
					{ key: 'kien-thuc-ky-nang', refName: 'sectionKienThuc', title: '3. Về kiến thức, kĩ năng' },
					{ key: 'ket-qua-nl-pc', refName: 'sectionKetQuaNlPc', title: '1. Về năng lực, phẩm chất' },
					{ key: 'mon-hoc-hdgd', refName: 'sectionMonHoc', title: '2. Về môn học và HĐGD' },
					{ key: 'ket-qua-giao-duc', refName: 'sectionKetQuaGd', title: '3. Đánh giá kết quả giáo dục' },
					{ key: 'khen-thuong', refName: 'sectionKhenThuong', title: '4. Khen thưởng' },
					{ key: 'hoan-thanh-chuong-trinh', refName: 'sectionHoanThanh', title: '5. Hoàn thành chương trình lớp' },
					{ key: 'phong-trao-khac', refName: 'sectionPhongTrao', title: '6. Hoạt động, phong trào khác' }
				],
				localForm: {
					DuyTriSoLuong: '',
					NangLucPhamChat: '',
					KienThucKyNang: '',
					HoanThanhCT: '',
					PhongTraoKhac: ''
				}
			}
		},
		watch: {
			selectedLopID() {
				this.initAllSheets()
			},
			savedData: {
				handler(val) {
					if (val) {
						this.localForm.DuyTriSoLuong = val.DuyTriSoLuong || ''
						this.localForm.NangLucPhamChat = val.NangLucPhamChat || ''
						this.localForm.KienThucKyNang = val.KienThucKyNang || ''
						this.localForm.HoanThanhCT = val.HoanThanhCT || ''
						this.localForm.PhongTraoKhac = val.PhongTraoKhac || ''
					}
					this.initAllSheets()
				}
			},
			classSize() {
				this.initAllSheets()
			}
		},
		mounted() {
			if (this.savedData) {
				this.localForm.DuyTriSoLuong = this.savedData.DuyTriSoLuong || ''
				this.localForm.NangLucPhamChat = this.savedData.NangLucPhamChat || ''
				this.localForm.KienThucKyNang = this.savedData.KienThucKyNang || ''
				this.localForm.HoanThanhCT = this.savedData.HoanThanhCT || ''
				this.localForm.PhongTraoKhac = this.savedData.PhongTraoKhac || ''
			}
			this.initAllSheets()
		},
		beforeUnmount() {
			this.destroyAllSheets()
		},
		methods: {
			scrollToSection(item) {
				this.activeSection = item.key
				let container = this.$refs.scrollContainer
				if (Array.isArray(container)) container = container[0]
				container = container?.$el || container
				let target = this.$refs[item.refName]
				if (Array.isArray(target)) target = target[0]
				target = target?.$el || target
				if (!container || !target) return
				const nextTop = container.scrollTop
					+ target.getBoundingClientRect().top
					- container.getBoundingClientRect().top
					- 8
				container.scrollTo({ top: nextTop, behavior: 'smooth' })
			},
			getData() {
				const getSheetData = (inst) => {
					const sheet = Array.isArray(inst) ? inst[0] : inst
					if (sheet && typeof sheet.closeEditor === 'function') {
						try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (error) {}
					}
					return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
				}

				return {
					Form: { ...this.localForm },
					Sheet1: getSheetData(this.sheet1Instance),
					Sheet2: getSheetData(this.sheet2Instance),
					Sheet3: getSheetData(this.sheet3Instance),
					Sheet4: getSheetData(this.sheet4Instance)
				}
			},

			getStructuredRatings(allMonHoc = []) {
				const getSheetData = (inst) => {
					const sheet = Array.isArray(inst) ? inst[0] : inst
					if (sheet && typeof sheet.closeEditor === 'function') {
						try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (error) {}
					}
					return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
				}

				const ratings = []

				// 1. Sheet 1: Năng lực phẩm chất
				const sheet1Rows = getSheetData(this.sheet1Instance)
				const fields1 = [
					{ name: 'Yêu nước', code: 'PC_YEU_NUOC', type: 'QUALITY' },
					{ name: 'Nhân ái', code: 'PC_NHAN_AI', type: 'QUALITY' },
					{ name: 'Chăm chỉ', code: 'PC_CHAM_CHI', type: 'QUALITY' },
					{ name: 'Trung thực', code: 'PC_TRUNG_THUC', type: 'QUALITY' },
					{ name: 'Trách nhiệm', code: 'PC_TRACH_NHIEM', type: 'QUALITY' },
					{ name: 'Tự chủ và tự học', code: 'NL_TU_CHU', type: 'QUALITY' },
					{ name: 'Giao tiếp và hợp tác', code: 'NL_GIAO_TIEP', type: 'QUALITY' },
					{ name: 'GQVĐ và sáng tạo', code: 'NL_GQVD', type: 'QUALITY' },
					{ name: 'Ngôn ngữ', code: 'NL_NGON_NGU', type: 'QUALITY' },
					{ name: 'Tính toán', code: 'NL_TINH_TOAN', type: 'QUALITY' },
					{ name: 'Khoa học', code: 'NL_KHOA_HOC', type: 'QUALITY' },
					{ name: 'Thẩm mĩ', code: 'NL_THAM_MI', type: 'QUALITY' },
					{ name: 'Thể chất', code: 'NL_THE_CHAT', type: 'QUALITY' },
					{ name: 'Công nghệ', code: 'NL_CONG_NGHE', type: 'QUALITY' },
					{ name: 'Tin học', code: 'NL_TIN_HOC', type: 'QUALITY' }
				]
				const sheet1RatingCodes = ['TOT', 'DAT', 'CAN_CO_GANG']
				sheet1Rows.forEach((row, ratingIdx) => {
					const ratingCode = sheet1RatingCodes[ratingIdx] || 'TOT'
					fields1.forEach((item, fIdx) => {
						const colIdx = 1 + (fIdx * 2)
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
					})
				})

				// 2. Sheet 2: Môn học và HĐGD
				const sheet2Rows = getSheetData(this.sheet2Instance)
				const fields2 = [
					'Tiếng Việt', 'Toán', 'Tiếng Anh', 'Lịch sử & Địa lí', 'Khoa học',
					'Tin học - Công nghệ', 'Đạo đức', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'HĐTN'
				]
				const sheet2RatingCodes = ['HT_TOT', 'HOAN_THANH', 'CHUA_HT']
				sheet2Rows.forEach((row, ratingIdx) => {
					const ratingCode = sheet2RatingCodes[ratingIdx] || 'HT_TOT'
					fields2.forEach((subName, subIdx) => {
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

				// 3. Sheet 3: Đánh giá kết quả giáo dục
				const sheet3Rows = getSheetData(this.sheet3Instance)
				const sheet3RatingCodes = ['HT_XUAT_SAC', 'HT_TOT', 'HOAN_THANH', 'CHUA_HT']
				sheet3Rows.forEach((row, rIdx) => {
					const ratingCode = sheet3RatingCodes[rIdx] || 'HOAN_THANH'
					ratings.push({
						LoaiDanhGia: 'KET_QUA_GD',
						MonHocID: null,
						TieuChiCode: 'KET_QUA_GD',
						TenTieuChi: row[0] || '',
						MucXepLoaiCode: ratingCode,
						SoLuong: parseInt(row[1]) || 0,
						TiLe: parseFloat(row[2]) || 0
					})
				})

				// 4. Sheet 4: Khen thưởng
				const sheet4Rows = getSheetData(this.sheet4Instance)
				sheet4Rows.forEach((row, rIdx) => {
					ratings.push({
						LoaiDanhGia: 'KHEN_THUONG',
						MonHocID: null,
						TieuChiCode: `KHEN_THUONG_${rIdx + 1}`,
						TenTieuChi: row[0] || '',
						MucXepLoaiCode: `KHEN_THUONG_${rIdx + 1}`,
						SoLuong: parseInt(row[1]) || 0,
						TiLe: parseFloat(row[2]) || 0
					})
				})

				return ratings
			},

			getTargetClassSize() {
				return this.classSize > 0 ? this.classSize : (this.students || []).length
			},
			handleSheetChange(sheetKey, worksheet, changedX, changedY) {
				if (this.syncingTargetPercentages) return
				this.syncingTargetPercentages = true
				try {
					this.syncTargetPercentages(sheetKey, worksheet.getData(), worksheet, changedX, changedY)
				} finally {
					this.syncingTargetPercentages = false
				}
			},
				syncTargetPercentages(sheetKey, rows, worksheet = null, changedX = null, changedY = null) {
				const subjectCount = { sheet1: 15, sheet2: 11, sheet3: 1, sheet4: 1 }[sheetKey]
				if (!subjectCount) return
				const classSize = this.getTargetClassSize()
				const changedColumn = Number.isFinite(Number(changedX)) ? Number(changedX) : null
				const changedRow = Number.isFinite(Number(changedY)) ? Number(changedY) : null
				const subjectIndexes = changedColumn !== null && changedColumn >= 1
					? [Math.floor((changedColumn - 1) / 2)]
					: Array.from({ length: subjectCount }, (_, index) => index)
				subjectIndexes.forEach(subjectIndex => {
					if (subjectIndex >= subjectCount) return
					const quantityColumn = 1 + subjectIndex * 2
					const percentageColumn = quantityColumn + 1
					const rowIndexes = rows.map((row, index) => index)
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

			destroyAllSheets() {
				[this.sheet1Instance, this.sheet2Instance, this.sheet3Instance, this.sheet4Instance].forEach(inst => {
					if (!inst) return
					try {
						const sheet = Array.isArray(inst) ? inst[0] : inst
						if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					} catch (e) {}
				})
				this.sheet1Instance = null
				this.sheet2Instance = null
				this.sheet3Instance = null
				this.sheet4Instance = null
				const sheetRefs = ['sheetRef1', 'sheetRef2', 'sheetRef3', 'sheetRef4']
				sheetRefs.forEach(refName => {
					let container = this.$refs[refName]
					if (Array.isArray(container)) container = container[0]
					if (!container) return
					try {
						if (typeof jspreadsheet !== 'undefined' && typeof jspreadsheet.destroy === 'function') {
							jspreadsheet.destroy(container)
						}
					} catch (error) {}
					container.innerHTML = ''
				})
			},

			initAllSheets() {
				if (this.selectedLopID === '__ALL__') {
					this.destroyAllSheets()
					return
				}
				this.$nextTick(() => {
					this.destroyAllSheets()

					// Sheet 1: Năng lực, phẩm chất
					if (this.$refs.sheetRef1 && typeof jspreadsheet === 'function') {
						const savedSheet1 = this.savedData?.Sheet1 || []
						const defaultSheet1Data = [
							['Tốt (T)', savedSheet1[0]?.[1]||'', savedSheet1[0]?.[2]||'', savedSheet1[0]?.[3]||'', savedSheet1[0]?.[4]||'', savedSheet1[0]?.[5]||'', savedSheet1[0]?.[6]||'', savedSheet1[0]?.[7]||'', savedSheet1[0]?.[8]||'', savedSheet1[0]?.[9]||'', savedSheet1[0]?.[10]||'', savedSheet1[0]?.[11]||'', savedSheet1[0]?.[12]||'', savedSheet1[0]?.[13]||'', savedSheet1[0]?.[14]||'', savedSheet1[0]?.[15]||'', savedSheet1[0]?.[16]||'', savedSheet1[0]?.[17]||'', savedSheet1[0]?.[18]||'', savedSheet1[0]?.[19]||'', savedSheet1[0]?.[20]||'', savedSheet1[0]?.[21]||'', savedSheet1[0]?.[22]||'', savedSheet1[0]?.[23]||'', savedSheet1[0]?.[24]||'', savedSheet1[0]?.[25]||'', savedSheet1[0]?.[26]||'', savedSheet1[0]?.[27]||'', savedSheet1[0]?.[28]||'', savedSheet1[0]?.[29]||'', savedSheet1[0]?.[30]||''],
							['Đạt (Đ)', savedSheet1[1]?.[1]||'', savedSheet1[1]?.[2]||'', savedSheet1[1]?.[3]||'', savedSheet1[1]?.[4]||'', savedSheet1[1]?.[5]||'', savedSheet1[1]?.[6]||'', savedSheet1[1]?.[7]||'', savedSheet1[1]?.[8]||'', savedSheet1[1]?.[9]||'', savedSheet1[1]?.[10]||'', savedSheet1[1]?.[11]||'', savedSheet1[1]?.[12]||'', savedSheet1[1]?.[13]||'', savedSheet1[1]?.[14]||'', savedSheet1[1]?.[15]||'', savedSheet1[1]?.[16]||'', savedSheet1[1]?.[17]||'', savedSheet1[1]?.[18]||'', savedSheet1[1]?.[19]||'', savedSheet1[1]?.[20]||'', savedSheet1[1]?.[21]||'', savedSheet1[1]?.[22]||'', savedSheet1[1]?.[23]||'', savedSheet1[1]?.[24]||'', savedSheet1[1]?.[25]||'', savedSheet1[1]?.[26]||'', savedSheet1[1]?.[27]||'', savedSheet1[1]?.[28]||'', savedSheet1[1]?.[29]||'', savedSheet1[1]?.[30]||''],
							['Cần cố gắng (C)', savedSheet1[2]?.[1]||'', savedSheet1[2]?.[2]||'', savedSheet1[2]?.[3]||'', savedSheet1[2]?.[4]||'', savedSheet1[2]?.[5]||'', savedSheet1[2]?.[6]||'', savedSheet1[2]?.[7]||'', savedSheet1[2]?.[8]||'', savedSheet1[2]?.[9]||'', savedSheet1[2]?.[10]||'', savedSheet1[2]?.[11]||'', savedSheet1[2]?.[12]||'', savedSheet1[2]?.[13]||'', savedSheet1[2]?.[14]||'', savedSheet1[2]?.[15]||'', savedSheet1[2]?.[16]||'', savedSheet1[2]?.[17]||'', savedSheet1[2]?.[18]||'', savedSheet1[2]?.[19]||'', savedSheet1[2]?.[20]||'', savedSheet1[2]?.[21]||'', savedSheet1[2]?.[22]||'', savedSheet1[2]?.[23]||'', savedSheet1[2]?.[24]||'', savedSheet1[2]?.[25]||'', savedSheet1[2]?.[26]||'', savedSheet1[2]?.[27]||'', savedSheet1[2]?.[28]||'', savedSheet1[2]?.[29]||'', savedSheet1[2]?.[30]||'']
						]

						const cols1 = [{ title: 'Xếp loại', width: 150, readOnly: true }]
						const fields1 = [
							'Yêu nước', 'Nhân ái', 'Chăm chỉ', 'Trung thực', 'Trách nhiệm',
							'Tự chủ và tự học', 'Giao tiếp và hợp tác', 'GQVĐ và sáng tạo',
							'Ngôn ngữ', 'Tính toán', 'Khoa học', 'Thẩm mĩ', 'Thể chất', 'Công nghệ', 'Tin học'
						]
						fields1.forEach(() => {
							cols1.push({ title: 'SỐ LƯỢNG', width: 95, align: 'center', type: 'numeric' })
							cols1.push({ title: 'TỈ LỆ', width: 85, align: 'center', type: 'numeric' })
						})

						const nested1 = [
							[
								{ title: '', colspan: 1 },
								{ title: 'Phẩm chất', colspan: 10 },
								{ title: 'Năng lực', colspan: 20 }
							],
							[
								{ title: '', colspan: 1 },
								...fields1.map(f => ({ title: f, colspan: 2 }))
							]
						]
						this.syncTargetPercentages('sheet1', defaultSheet1Data)

						this.sheet1Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef1, {
							worksheets: [{
								data: defaultSheet1Data,
								columns: cols1,
								nestedHeaders: nested1,
								tableOverflow: true,
								tableWidth: '100%',
								tableHeight: '100%',
								freezeColumns: 1,
								wordWrap: true,
								allowInsertRow: false,
								allowDeleteRow: false,
								allowInsertColumn: false,
								allowDeleteColumn: false
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y) => this.handleSheetChange('sheet1', worksheet, x, y)
						})
					}

					// Sheet 2: Môn học và hoạt động giáo dục
					if (this.$refs.sheetRef2 && typeof jspreadsheet === 'function') {
						const savedSheet2 = this.savedData?.Sheet2 || []
						const defaultSheet2Data = [
							['Hoàn thành tốt (T)', savedSheet2[0]?.[1]||'', savedSheet2[0]?.[2]||'', savedSheet2[0]?.[3]||'', savedSheet2[0]?.[4]||'', savedSheet2[0]?.[5]||'', savedSheet2[0]?.[6]||'', savedSheet2[0]?.[7]||'', savedSheet2[0]?.[8]||'', savedSheet2[0]?.[9]||'', savedSheet2[0]?.[10]||'', savedSheet2[0]?.[11]||'', savedSheet2[0]?.[12]||'', savedSheet2[0]?.[13]||'', savedSheet2[0]?.[14]||'', savedSheet2[0]?.[15]||'', savedSheet2[0]?.[16]||'', savedSheet2[0]?.[17]||'', savedSheet2[0]?.[18]||'', savedSheet2[0]?.[19]||'', savedSheet2[0]?.[20]||'', savedSheet2[0]?.[21]||'', savedSheet2[0]?.[22]||''],
							['Hoàn thành (H)', savedSheet2[1]?.[1]||'', savedSheet2[1]?.[2]||'', savedSheet2[1]?.[3]||'', savedSheet2[1]?.[4]||'', savedSheet2[1]?.[5]||'', savedSheet2[1]?.[6]||'', savedSheet2[1]?.[7]||'', savedSheet2[1]?.[8]||'', savedSheet2[1]?.[9]||'', savedSheet2[1]?.[10]||'', savedSheet2[1]?.[11]||'', savedSheet2[1]?.[12]||'', savedSheet2[1]?.[13]||'', savedSheet2[1]?.[14]||'', savedSheet2[1]?.[15]||'', savedSheet2[1]?.[16]||'', savedSheet2[1]?.[17]||'', savedSheet2[1]?.[18]||'', savedSheet2[1]?.[19]||'', savedSheet2[1]?.[20]||'', savedSheet2[1]?.[21]||'', savedSheet2[1]?.[22]||''],
							['Chưa hoàn thành (C)', savedSheet2[2]?.[1]||'', savedSheet2[2]?.[2]||'', savedSheet2[2]?.[3]||'', savedSheet2[2]?.[4]||'', savedSheet2[2]?.[5]||'', savedSheet2[2]?.[6]||'', savedSheet2[2]?.[7]||'', savedSheet2[2]?.[8]||'', savedSheet2[2]?.[9]||'', savedSheet2[2]?.[10]||'', savedSheet2[2]?.[11]||'', savedSheet2[2]?.[12]||'', savedSheet2[2]?.[13]||'', savedSheet2[2]?.[14]||'', savedSheet2[2]?.[15]||'', savedSheet2[2]?.[16]||'', savedSheet2[2]?.[17]||'', savedSheet2[2]?.[18]||'', savedSheet2[2]?.[19]||'', savedSheet2[2]?.[20]||'', savedSheet2[2]?.[21]||'', savedSheet2[2]?.[22]||'']
						]

						const cols2 = [{ title: 'Xếp loại', width: 150, readOnly: true }]
						const fields2 = [
							'Tiếng Việt', 'Toán', 'Tiếng Anh', 'Lịch sử & Địa lí', 'Khoa học',
							'Tin học - Công nghệ', 'Đạo đức', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'HĐTN'
						]
						fields2.forEach(() => {
							cols2.push({ title: 'SỐ LƯỢNG', width: 95, align: 'center', type: 'numeric' })
							cols2.push({ title: 'TỈ LỆ', width: 85, align: 'center', type: 'numeric' })
						})

						const nested2 = [
							[
								{ title: '', colspan: 1 },
								{ title: 'Môn học và hoạt động giáo dục', colspan: 22 }
							],
							[
								{ title: '', colspan: 1 },
								...fields2.map(f => ({ title: f, colspan: 2 }))
							]
						]
						this.syncTargetPercentages('sheet2', defaultSheet2Data)

						this.sheet2Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef2, {
							worksheets: [{
								data: defaultSheet2Data,
								columns: cols2,
								nestedHeaders: nested2,
								tableOverflow: true,
								tableWidth: '100%',
								tableHeight: '100%',
								freezeColumns: 1,
								wordWrap: true,
								allowInsertRow: false,
								allowDeleteRow: false,
								allowInsertColumn: false,
								allowDeleteColumn: false
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y) => this.handleSheetChange('sheet2', worksheet, x, y)
						})
					}

					// Sheet 3: Đánh giá kết quả giáo dục
					if (this.$refs.sheetRef3 && typeof jspreadsheet === 'function') {
						const savedSheet3 = this.savedData?.Sheet3 || []
						const defaultSheet3Data = [
							['Hoàn thành xuất sắc', savedSheet3[0]?.[1]||'', savedSheet3[0]?.[2]||''],
							['Hoàn thành tốt', savedSheet3[1]?.[1]||'', savedSheet3[1]?.[2]||''],
							['Hoàn thành', savedSheet3[2]?.[1]||'', savedSheet3[2]?.[2]||''],
							['Chưa hoàn thành', savedSheet3[3]?.[1]||'', savedSheet3[3]?.[2]||'']
						]
						this.syncTargetPercentages('sheet3', defaultSheet3Data)

						this.sheet3Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef3, {
							worksheets: [{
								data: defaultSheet3Data,
								columns: [
									{ title: 'Xếp loại', width: 180, readOnly: true },
									{ title: 'SỐ LƯỢNG', width: 95, align: 'center', type: 'numeric' },
									{ title: 'TỈ LỆ', width: 85, align: 'center', type: 'numeric' }
								],
								tableOverflow: true,
								tableWidth: '100%',
								tableHeight: '100%',
								freezeColumns: 1,
								wordWrap: true,
								rowResize: true,
								allowInsertRow: false,
								allowDeleteRow: false,
								allowInsertColumn: false,
								allowDeleteColumn: false
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y) => this.handleSheetChange('sheet3', worksheet, x, y)
						})
					}

					// Sheet 4: Khen thưởng
					if (this.$refs.sheetRef4 && typeof jspreadsheet === 'function') {
						const savedSheet4 = this.savedData?.Sheet4 || []
						const defaultSheet4Data = [
							['Học sinh Xuất sắc', savedSheet4[0]?.[1]||'', savedSheet4[0]?.[2]||''],
							['Học sinh tiêu biểu hoàn thành tốt trong học tập và rèn luyện', savedSheet4[1]?.[1]||'', savedSheet4[1]?.[2]||'']
						]
						this.syncTargetPercentages('sheet4', defaultSheet4Data)

						this.sheet4Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef4, {
							worksheets: [{
								data: defaultSheet4Data,
								columns: [
									{ title: 'Danh hiệu', width: 320, readOnly: true },
									{ title: 'SỐ LƯỢNG', width: 95, align: 'center', type: 'numeric' },
									{ title: 'TỈ LỆ', width: 85, align: 'center', type: 'numeric' }
								],
								tableOverflow: true,
								tableWidth: '100%',
								tableHeight: '100%',
								freezeColumns: 1,
								wordWrap: true,
								rowResize: true,
								allowInsertRow: false,
								allowDeleteRow: false,
								allowInsertColumn: false,
								allowDeleteColumn: false
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y) => this.handleSheetChange('sheet4', worksheet, x, y)
						})
					}
				})
			}
		}
	}
</script>
