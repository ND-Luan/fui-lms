<template>
	<v-card-text class="pa-0" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và biên soạn Tổng kết cuối năm học.
		</v-alert>

		<v-row v-else no-gutters class="h-100">
			<v-col cols="12" md="3" lg="2" class="border-e h-100 overflow-y-auto">
				<v-list density="compact" nav>
					<v-list-subheader>ĐÁNH GIÁ TỔNG QUAN</v-list-subheader>
					<v-list-item title="1. Công tác duy trì số lượng" @click="scrollToSection('sectionDuyTri')" />
					<v-list-item title="2. Về năng lực, phẩm chất" @click="scrollToSection('sectionNlPc')" />
					<v-list-item title="3. Về kiến thức, kĩ năng" @click="scrollToSection('sectionKienThuc')" />
					<v-list-subheader>KẾT QUẢ CUỐI NĂM</v-list-subheader>
					<v-list-item title="1. Về năng lực, phẩm chất" @click="scrollToSection('sectionKetQuaNlPc')" />
					<v-list-item title="2. Về môn học và HĐGD" @click="scrollToSection('sectionMonHoc')" />
					<v-list-item title="3. Đánh giá kết quả giáo dục" @click="scrollToSection('sectionKetQuaGd')" />
					<v-list-item title="4. Khen thưởng" @click="scrollToSection('sectionKhenThuong')" />
					<v-list-item title="5. Hoàn thành chương trình lớp" @click="scrollToSection('sectionHoanThanh')" />
					<v-list-item title="6. Hoạt động, phong trào khác" @click="scrollToSection('sectionPhongTrao')" />
				</v-list>
			</v-col>

			<v-col ref="scrollContainer" cols="12" md="9" lg="10" class="h-100 overflow-y-auto pa-3 bg-grey-lighten-4">
				<div class="text-h6 text-center font-weight-bold mb-4">TỔNG KẾT NĂM HỌC</div>
				<v-card ref="sectionDuyTri" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">1. Công tác duy trì số lượng</v-card-title>
					<v-card-text><v-textarea v-model="localForm.DuyTriSoLuong" rows="4" variant="outlined" density="compact" hide-details /></v-card-text>
				</v-card>
				<v-card ref="sectionNlPc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">2. Về năng lực, phẩm chất</v-card-title>
					<v-card-text><v-textarea v-model="localForm.NangLucPhamChat" rows="4" variant="outlined" density="compact" hide-details /></v-card-text>
				</v-card>
				<v-card ref="sectionKienThuc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">3. Về kiến thức, kĩ năng</v-card-title>
					<v-card-text><v-textarea v-model="localForm.KienThucKyNang" rows="4" variant="outlined" density="compact" hide-details /></v-card-text>
				</v-card>
				<v-card ref="sectionKetQuaNlPc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">KẾT QUẢ CUỐI NĂM — 1. Về năng lực, phẩm chất</v-card-title>
					<div class="pa-2"><div ref="sheetRef1" class="w-100 so-gvcn-sheet"></div></div>
				</v-card>
				<v-card ref="sectionMonHoc" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">2. Về môn học và hoạt động giáo dục</v-card-title>
					<div class="pa-2"><div ref="sheetRef2" class="w-100 so-gvcn-sheet"></div></div>
				</v-card>
				<v-card ref="sectionKetQuaGd" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">3. Về đánh giá kết quả giáo dục</v-card-title>
					<div class="pa-2"><div ref="sheetRef3" class="w-100 so-gvcn-sheet"></div></div>
				</v-card>
				<v-card ref="sectionKhenThuong" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">4. Khen thưởng</v-card-title>
					<div class="pa-2"><div ref="sheetRef4" class="w-100 so-gvcn-sheet"></div></div>
				</v-card>
				<v-card ref="sectionHoanThanh" class="mb-4" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">5. Hoàn thành chương trình lớp học</v-card-title>
					<v-card-text><v-textarea v-model="localForm.HoanThanhCT" rows="4" variant="outlined" density="compact" hide-details /></v-card-text>
				</v-card>
				<v-card ref="sectionPhongTrao" variant="outlined">
					<v-card-title class="text-subtitle-1 font-weight-bold">6. Các hoạt động, phong trào khác</v-card-title>
					<v-card-text><v-textarea v-model="localForm.PhongTraoKhac" rows="4" variant="outlined" density="compact" hide-details /></v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-tong-ket-nam-hoc',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			savedData: { type: Object, default: () => ({}) },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				sheet1Instance: null,
				sheet2Instance: null,
				sheet3Instance: null,
				sheet4Instance: null,
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
				deep: true,
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
			scrollToSection(refName) {
				let container = this.$refs.scrollContainer
				if (Array.isArray(container)) container = container[0]
				container = container?.$el || container
				let target = this.$refs[refName]
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

						const cols1 = [{ title: 'Xếp loại', width: 140, readOnly: true }]
						const fields1 = [
							'Yêu nước', 'Nhân ái', 'Chăm chỉ', 'Trung thực', 'Trách nhiệm',
							'Tự chủ và tự học', 'Giao tiếp và hợp tác', 'GQVĐ và sáng tạo',
							'Ngôn ngữ', 'Tính toán', 'Khoa học', 'Thẩm mĩ', 'Thể chất', 'Công nghệ', 'Tin học'
						]
						fields1.forEach(() => {
							cols1.push({ title: 'SỐ LƯỢNG', width: 80, align: 'center', type: 'numeric' })
							cols1.push({ title: 'TỈ LỆ', width: 80, align: 'center' })
						})

						const nested1 = [
							[
								{ title: 'Xếp loại', colspan: 1 },
								{ title: 'Phẩm chất', colspan: 10 },
								{ title: 'Năng lực', colspan: 20 }
							],
							[
								{ title: '', colspan: 1 },
								...fields1.map(f => ({ title: f, colspan: 2 }))
							]
						]

						this.sheet1Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef1, {
							worksheets: [{
								data: defaultSheet1Data,
								columns: cols1,
								nestedHeaders: nested1,
								tableOverflow: true,
								tableWidth: '100%',
								freezeColumns: 1,
								wordWrap: true
							}],
							contextMenu: () => false
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

						const cols2 = [{ title: 'Xếp loại', width: 160, readOnly: true }]
						const fields2 = [
							'Tiếng Việt', 'Toán', 'Tiếng Anh', 'Lịch sử & Địa lí', 'Khoa học',
							'Tin học - Công nghệ', 'Đạo đức', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'HĐTN'
						]
						fields2.forEach(() => {
							cols2.push({ title: 'SỐ LƯỢNG', width: 80, align: 'center', type: 'numeric' })
							cols2.push({ title: 'TỈ LỆ', width: 80, align: 'center' })
						})

						const nested2 = [
							[
								{ title: 'Xếp loại', colspan: 1 },
								{ title: 'Môn học và hoạt động giáo dục', colspan: 22 }
							],
							[
								{ title: '', colspan: 1 },
								...fields2.map(f => ({ title: f, colspan: 2 }))
							]
						]

						this.sheet2Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef2, {
							worksheets: [{
								data: defaultSheet2Data,
								columns: cols2,
								nestedHeaders: nested2,
								tableOverflow: true,
								tableWidth: '100%',
								freezeColumns: 1,
								wordWrap: true
							}],
							contextMenu: () => false
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

						this.sheet3Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef3, {
							worksheets: [{
								data: defaultSheet3Data,
								columns: [
									{ title: 'Xếp loại', width: 180, readOnly: true },
									{ title: 'SỐ LƯỢNG', width: 100, align: 'center', type: 'numeric' },
									{ title: 'TỈ LỆ', width: 100, align: 'center' }
								],
								tableOverflow: true,
								tableWidth: '100%'
							}],
							contextMenu: () => false
						})
					}

					// Sheet 4: Khen thưởng
					if (this.$refs.sheetRef4 && typeof jspreadsheet === 'function') {
						const savedSheet4 = this.savedData?.Sheet4 || []
						const defaultSheet4Data = [
							['Học sinh Xuất sắc', savedSheet4[0]?.[1]||'', savedSheet4[0]?.[2]||''],
							['Học sinh tiêu biểu hoàn thành tốt trong học tập và rèn luyện', savedSheet4[1]?.[1]||'', savedSheet4[1]?.[2]||'']
						]

						this.sheet4Instance = soGvcnJspreadsheet.create(this.$refs.sheetRef4, {
							worksheets: [{
								data: defaultSheet4Data,
								columns: [
									{ title: 'Danh hiệu', width: 320, readOnly: true },
									{ title: 'SỐ LƯỢNG', width: 100, align: 'center', type: 'numeric' },
									{ title: 'TỈ LỆ', width: 100, align: 'center' }
								],
								tableOverflow: true,
								tableWidth: '100%'
							}],
							contextMenu: () => false
						})
					}
				})
			}
		}
	}
</script>