<template>
	<Global>
		<v-card>
			<v-card-title class="d-flex align-center flex-wrap ga-2">
				<span>Sổ GVCN</span>
				<v-chip color="primary" variant="text" size="small" class="font-weight-medium">
					{{ currentNienKhoa }}
				</v-chip>
				<v-chip v-if="selectedClass" color="primary" variant="text" size="small" class="font-weight-medium">
					{{ selectedClass.TenLop }}
				</v-chip>
				<v-chip v-if="form.SoGVCNID" :color="statusColor(detail.TrangThai)" variant="tonal" size="small" label>
					{{ statusText(detail.TrangThai) }}
				</v-chip>
				<v-select v-model="filter.CapID" :items="capOptions" item-title="text" item-value="value"
					label="Cấp học" density="compact" variant="outlined" hide-details style="max-width: 180px"
					disabled />
				<v-select v-model="selectedLopID" :items="classOptions" item-title="TenLop" item-value="LopID"
					label="Lớp" density="compact" variant="outlined" hide-details style="max-width: 220px"
					:loading="loading.list" @update:model-value="onClassChange" />
				<v-spacer />
				<v-btn color="primary" variant="outlined" size="small" :loading="loading.list" @click="getList">
					<v-icon start>mdi-refresh</v-icon>
					Làm mới
				</v-btn>
			</v-card-title>

			<v-card-text class="py-1 text-caption text-medium-emphasis">
				{{ selectedLopID === '__ALL__' ? 'Đang xem dữ liệu nền toàn cấp' : 'Đang nhập sổ cho lớp đã chọn' }}
			</v-card-text>

			<v-divider />

			<v-card-text class="pa-0">
				<v-row no-gutters>
					<v-col cols="12">
						<v-tabs v-model="tab" density="compact">
							<v-tab value="du-lieu-hs">Dữ liệu HS lớp</v-tab>
							<v-tab value="chi-tieu">XD chỉ tiêu_giải pháp</v-tab>
							<v-tab value="ke-hoach">KH GD tháng_tuần</v-tab>
							<v-tab value="ren-luyen">Hồ sơ theo dõi QTRL của HS</v-tab>
							<v-tab value="so-lien-lac">Sổ liên lạc điện tử</v-tab>
							<v-tab value="huong-nghiep">Hướng nghiệp</v-tab>
						</v-tabs>
						<v-divider />

						<v-window v-model="tab">
							<v-window-item value="du-lieu-hs">
								<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
									<uc-jexcel v-if="studentSheetRows.length" :key="sheetKey" v-model="sheetInstance"
										v-model:dataSource="studentSheetRows" :columns="studentSheetColumns" :freeze-columns="5"
										:nestedHeaders="studentNestedHeaders" :table-height="sheetHeight" table-width="100%"
										class="so-gvcn-sheet" />
									<uc-card-empty v-else />
								</v-card-text>
							</v-window-item>

							<v-window-item value="chi-tieu">
								<v-card-text>
									<div class="d-flex align-center justify-end mb-2">
										<v-btn color="primary" variant="outlined" size="small" :disabled="!form.SoGVCNID || loading.save"
											:loading="loading.save" @click="onSaveDraft">
											<v-icon start>mdi-content-save</v-icon>
											Lưu chỉ tiêu
										</v-btn>
									</div>
									<v-row dense>
										<v-col cols="12">
											<v-textarea v-model="form.ThongTinLop" label="Thông tin lớp" rows="2" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12">
											<v-textarea v-model="form.ChiTieu" label="Chỉ tiêu và giải pháp" rows="3" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12" md="6">
											<v-textarea v-model="form.SiSo" label="Sĩ số" rows="2" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12" md="6">
											<v-textarea v-model="form.CanBoLop" label="Cán bộ lớp" rows="2" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12" md="6">
											<v-textarea v-model="form.GiaoVienBoMon" label="Giáo viên bộ môn" rows="2" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12" md="6">
											<v-textarea v-model="form.BanDaiDienCMHS" label="Ban đại diện CMHS" rows="2" auto-grow hide-details="auto" />
										</v-col>
										<v-col cols="12">
											<v-textarea v-model="form.HuongNghiep" label="Hướng nghiệp" rows="2" auto-grow hide-details="auto" />
										</v-col>
									</v-row>
								</v-card-text>
							</v-window-item>

							<v-window-item value="ke-hoach">
								<v-card-text class="pa-2">
									<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
										Chọn một lớp ở thanh trên để xem và nhập kế hoạch giáo dục của lớp đó.
									</v-alert>
									<template v-else>
										<v-expansion-panels class="mb-2">
											<v-expansion-panel>
												<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary" style="min-height: 48px;">
													<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
													KHUNG KẾ HOẠCH GIÁO DỤC HỌC SINH THEO THÁNG LỚP {{ selectedClass?.TenLop || '.....' }} - NĂM HỌC {{ getCurrentSchoolYearText() }}
												</v-expansion-panel-title>
												<v-expansion-panel-text class="text-caption text-medium-emphasis">
													<div class="font-weight-bold mb-1">Gợi ý thực hiện:</div>
													<ul class="pl-4">
														<li>Căn cứ Khung chủ đề giáo dục của nhà trường để cập nhật tên Chủ đề hàng tháng và Mục tiêu giáo dục chính thông qua chủ đề của tháng đó.</li>
														<li>Căn cứ chủ đề - mục tiêu giáo dục đã xác định và các gợi ý nhiệm vụ để lên kế hoạch cho các nội dung giáo dục sẽ triển khai trong 15 phút đầu ngày, sinh hoạt cuối tuần, các sinh hoạt tập trung khác... cho từng tuần trong tháng.</li>
														<li style="list-style-type: none; margin-left: -10px;" class="text-grey-darken-1 py-1">
															• Video tư liệu liên quan đến giáo dục hành vi trái phép (nếu cần).<br>
															• Video tư liệu về các ngày lễ, kỉ niệm.<br>
															• Phim ngắn liên quan đến chủ đề giáo dục tháng.
														</li>
														<li>Cuối tháng, GVCN cập nhật đánh giá ngắn gọn tình hình cả lớp trong tháng đó.</li>
													</ul>
												</v-expansion-panel-text>
											</v-expansion-panel>
										</v-expansion-panels>

										<div class="d-flex align-center justify-end mb-2">
											<v-btn color="primary" variant="outlined" size="small" :disabled="!form.SoGVCNID"
												:loading="loading.month" @click="saveKeHoachSheet">
												<v-icon start>mdi-calendar-check</v-icon>
												Lưu kế hoạch tháng
											</v-btn>
										</div>
										<div class="so-gvcn-sheet-wrap">
											<uc-jexcel :key="'kh-' + sheetKey" v-model="keHoachSheetInstance"
												:data-source="keHoachSheetRows" :columns="keHoachSheetColumns"
												:freeze-columns="3" :table-height="keHoachSheetHeight" table-width="100%"
												:table-header="true" :table-row-number="false" :disable-lazy-loading="true"
												:style-sheet="keHoachSheetStyle" :on-load="onKeHoachSheetLoad"
												class="so-gvcn-sheet so-gvcn-ke-hoach-sheet"
												@update:dataSource="updateKeHoachSheetRows" />
										</div>
									</template>
								</v-card-text>
							</v-window-item>

							<v-window-item value="ren-luyen">
								<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
									<uc-jexcel :key="`ren-${sheetKey}`" v-model="renLuyenSheetInstance"
										v-model:dataSource="renLuyenRows" :columns="renLuyenColumns" :freeze-columns="4"
										:nestedHeaders="renLuyenNestedHeaders" :table-height="renLuyenSheetHeight" table-width="100%"
										class="so-gvcn-sheet" />
								</v-card-text>
							</v-window-item>

							<v-window-item value="so-lien-lac">
								<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
									<uc-jexcel :key="`sll-${sheetKey}`" v-model="soLienLacSheetInstance"
										v-model:dataSource="soLienLacRows" :columns="soLienLacColumns" :freeze-columns="3"
										:table-height="soLienLacSheetHeight" table-width="100%" class="so-gvcn-sheet" />
								</v-card-text>
							</v-window-item>

							<v-window-item value="huong-nghiep">
								<v-card-text>
									<div class="d-flex align-center justify-end mb-2">
										<v-btn color="primary" variant="outlined" size="small" :disabled="!form.SoGVCNID || loading.save"
											:loading="loading.save" @click="onSaveDraft">
											<v-icon start>mdi-content-save</v-icon>
											Lưu hướng nghiệp
										</v-btn>
									</div>
									<v-textarea v-model="form.HuongNghiep" label="Hướng nghiệp" rows="8" auto-grow hide-details="auto" />
								</v-card-text>
							</v-window-item>
						</v-window>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</Global>
</template>

<script>
	export default {
		name: 'SoGVCNGiaoVien',
	data() {
		return {
			vueData,
			tab: 'du-lieu-hs',
			filter: this.getDefaultFilter(),
			loading: { list: false, detail: false, students: false, save: false, submit: false, month: false, tongKet: false, family: false },
			classList: [],
			allStudentRows: [],
			selectedLopID: '__ALL__',
			studentSheetRows: [],
			sheetInstance: null,
			renLuyenRows: [],
			renLuyenSheetInstance: null,
			soLienLacRows: [],
			soLienLacSheetInstance: null,
			sheetKey: 0,
			sheetHeight: 'calc(100vh - 230px)',
			keHoachSheetHeight: 'calc(100vh - 430px)',
			renLuyenSheetHeight: 'calc(100vh - 370px)',
			soLienLacSheetHeight: 'calc(100vh - 385px)',
			monthList: [],
			selectedClass: null,
			detail: {},
			form: {
				SoGVCNID: 0,
				ThongTinLop: '',
				ChiTieu: '',
				SiSo: '',
				GiaoVienBoMon: '',
				BanDaiDienCMHS: '',
				CanBoLop: '',
				HuongNghiep: ''
			},
			monthForm: { Thang: 9, ChuDe: '', MucTieu: '', NhiemVu: '', KeHoachTuan: '', DanhGia: '' },
			keHoachSheetRows: [],
			keHoachSheetInstance: null,
			keHoachSheetStyle: {},
			keHoachSheetColumns: [
				{ title: 'Tháng', width: 70, readOnly: true },
				{ title: 'Mục tiêu giáo dục tháng', width: 220 },
				{ title: 'Gợi ý nhiệm vụ', width: 230 },
				{ title: 'Tuần 1', width: 210 },
				{ title: 'Tuần 2', width: 210 },
				{ title: 'Tuần 3', width: 210 },
				{ title: 'Tuần 4', width: 210 },
				{ title: 'Tuần 5', width: 210 },
				{ title: 'Ưu điểm - Hạn chế + giải pháp khắc phục', width: 300 }
			],
			capOptions: [
				{ text: 'Trung học', value: '2,3' }
			],
			studentSheetColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 220, readOnly: true },
				{ title: 'Mã học sinh', width: 110, readOnly: true },
				{ title: 'Lớp mới', width: 90, readOnly: true },
				{ title: 'Lớp cũ', width: 90, readOnly: true },
				{ title: 'Toán', width: 80, readOnly: true },
				{ title: 'Tiếng Việt/Văn', width: 120, readOnly: true },
				{ title: 'Anh', width: 80, readOnly: true },
				{ title: 'KHTN', width: 80, readOnly: true },
				{ title: 'LS-ĐL', width: 80, readOnly: true },
				{ title: 'GDCD/GDKTPL', width: 120, readOnly: true },
				{ title: 'Tin', width: 80, readOnly: true },
				{ title: 'CN', width: 80, readOnly: true },
				{ title: 'Địa lí', width: 80, readOnly: true },
				{ title: 'Vật lí', width: 80, readOnly: true },
				{ title: 'Hóa', width: 80, readOnly: true },
				{ title: 'Sinh', width: 80, readOnly: true },
				{ title: 'KQRL', width: 90, readOnly: true },
				{ title: 'KQHT', width: 90, readOnly: true },
				{ title: 'Nhận xét GVCN', width: 500, align: 'left', readOnly: true },
				{ title: 'Cha', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp cha', width: 160, readOnly: true },
				{ title: 'SDT cha', width: 120, readOnly: true },
				{ title: 'Mẹ', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp mẹ', width: 160, readOnly: true },
				{ title: 'SDT mẹ', width: 120, readOnly: true },
				{ title: 'Người đỡ đầu', width: 160, readOnly: true },
				{ title: 'SDT người đỡ đầu', width: 140, readOnly: true },
				{ title: 'Địa chỉ', width: 380, align: 'left', readOnly: true },
				{ title: 'Ghi chú', width: 220, readOnly: true }
			],
			renLuyenColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'HỌ TÊN HỌC SINH', width: 220, readOnly: true },
				{ title: 'HS cần hỗ trợ đặc biệt (ghi rõ vấn đề nếu có)', width: 240 },
				{ title: 'BAN CÁN SỰ (ghi rõ nhiệm vụ)', width: 200 },
				{ title: 'THÁNG 8', width: 150 },
				{ title: 'THÁNG 9', width: 150 },
				{ title: 'THÁNG 10', width: 150 },
				{ title: 'THÁNG 11', width: 150 },
				{ title: 'THÁNG 12', width: 150 },
				{ title: 'NHẬN XÉT HKI', width: 220 },
				{ title: 'KQRL HKI', width: 100 },
				{ title: 'KQHT HKI', width: 100 },
				{ title: 'THÁNG 01 VÀ 02', width: 150 },
				{ title: 'THÁNG 3', width: 150 },
				{ title: 'THÁNG 4', width: 150 },
				{ title: 'THÁNG 5', width: 150 },
				{ title: 'NHẬN XÉT HKII', width: 220 },
				{ title: 'KQRL HKII', width: 100 },
				{ title: 'KQHT HKII', width: 100 },
				{ title: 'DANH HIỆU', width: 150 },
				{ title: 'THÀNH TÍCH KHÁC', width: 200 }
			],
			soLienLacColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 220, readOnly: true },
				{ title: 'Lớp', width: 90, readOnly: true },
				{ title: 'Tháng', width: 80 },
				{ title: 'Nhận xét', width: 320 },
				{ title: 'Đề nghị PHHS', width: 280 }
			],
			monthHeaders: [
				{ title: 'Tháng', key: 'Thang', width: 80 },
				{ title: 'Chủ đề', key: 'ChuDe' },
				{ title: 'Đánh giá', key: 'DanhGia' }
			],
		}
	},
	computed: {
		currentNienKhoa() {
			return vueData.NienKhoa || new Date().getFullYear()
		},
		classOptions() {
			return [
				{ LopID: '__ALL__', TenLop: 'Tất cả lớp' },
				...this.classList
			]
		},
		userSystemRight() {
			return Number(vueData?.user?.SystemRight || 0)
		},
		isTeacher() {
			return this.userSystemRight === 1
		},
		isBghOrAdmin() {
			return [3, 9].includes(this.userSystemRight)
		},
		studentNestedHeaders() {
			var nienKhoaDiem = Number(this.currentNienKhoa || 0) - 1
			var namHocDiem = nienKhoaDiem + '-' + this.currentNienKhoa
			return [
				[
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: 'ĐTB môn cả năm ' + namHocDiem, colspan: 12 },
					{ title: 'KQ ' + namHocDiem, colspan: 2 },
					{ title: 'NHẬN XÉT CỦA GVCN ' + namHocDiem, colspan: 1 },
					{ title: 'THÔNG TIN GIA ĐÌNH', colspan: 8 },
					{ title: 'Địa chỉ', colspan: 1 },
					{ title: 'GHI CHÚ', colspan: 1 }
				]
			]
		},
		renLuyenNestedHeaders() {
			return [
				[
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: 'GHI NHẬN/ THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH', colspan: 17 }
				]
			]
		}
	},
	mounted() {
		this.getList()
		window.addEventListener('resize', this.onResize)
		this.onResize()
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.onResize)
	},
	watch: {
		currentNienKhoa() {
			this.filter.NienKhoa = this.currentNienKhoa
			this.selectedLopID = '__ALL__'
			this.getList()
		},
		tab() {
			this.ensureSpecificClassForInputTabs()
		}
	},
	methods: {
		getDefaultFilter() {
			return {
				NienKhoa: vueData.NienKhoa || new Date().getFullYear(),
				CapID: '2,3',
				KhoiID: 0,
				LopID: '',
				Keyword: ''
			}
		},
		onResize() {
			const vh = window.innerHeight
			this.sheetHeight = Math.max(300, vh - 200) + 'px'
			this.keHoachSheetHeight = Math.max(250, vh - 380) + 'px'
			this.renLuyenSheetHeight = Math.max(250, vh - 310) + 'px'
			this.soLienLacSheetHeight = Math.max(250, vh - 310) + 'px'
		},
		statusText(status) {
			return ({ NEW: 'Chưa tạo', DRAFT: 'Đã lưu', SUBMITTED: 'Đã lưu' })[status] || status || 'Chưa tạo'
		},
		statusColor(status) {
			return ({ NEW: 'grey', DRAFT: 'warning', SUBMITTED: 'success' })[status] || 'grey'
		},
		notify(message) {
			if (window.showMessage) return showMessage(message)
			alert(message)
		},
			async getList() {
				this.loading.list = true
				try {
					this.allStudentRows = await ajaxCALLPromise('lms/SoGVCNDanhSachHocSinhLop', {
						NienKhoa: this.filter.NienKhoa,
						CapID: this.filter.CapID,
						LopID: ''
					})
					this.classList = this.buildClassList(this.allStudentRows)
					await this.mergeTongKetDiem(this.classList)
					await this.mergeThongTinGiaDinh()
					if (!this.classOptions.some(x => x.LopID === this.selectedLopID)) this.selectedLopID = '__ALL__'
				await this.onClassChange(this.selectedLopID)
				await this.ensureSpecificClassForInputTabs()
			} finally {
					this.loading.list = false
				}
			},
		async ensureSpecificClassForInputTabs() {
			if (!this.isTeacher || this.tab === 'du-lieu-hs' || this.selectedLopID !== '__ALL__') return
			const firstClass = this.classList[0]
			if (firstClass) await this.onClassChange(firstClass.LopID)
		},
		buildClassList(rows) {
			const map = new Map()
			;(rows || []).forEach(row => {
				if (!row.LopID || map.has(row.LopID)) return
				map.set(row.LopID, {
					NienKhoa: this.filter.NienKhoa,
					LopID: row.LopID,
					TenLop: row.LopMoi || row.TenLop || row.LopID,
					KhoiID: row.KhoiID,
					TrangThai: 'NEW'
				})
			})
			return [...map.values()].sort((a, b) => {
				if ((a.KhoiID || 0) !== (b.KhoiID || 0)) return (a.KhoiID || 0) - (b.KhoiID || 0)
				return `${a.TenLop}`.localeCompare(`${b.TenLop}`)
			})
		},
		async mergeTongKetDiem(classes) {
			this.loading.tongKet = true
			try {
				const targets = this.buildTongKetTargets(this.allStudentRows).filter(item => item.KhoiID >= 6)
				const chunks = await Promise.all(targets.map(item => ajaxCALLPromise(`${this.getDiemSub(item.KhoiID)}/LMS_GetTongKetDTBMonHocByLop`, {
					KhoiID: item.KhoiID,
					LopID: item.LopID,
					HocKy: 0,
					NienKhoa: this.filter.NienKhoa - 1
				}).catch(() => [])))
				const cap1Rows = await this.getTongKetCap1Rows(this.allStudentRows)
				const map = new Map()
				chunks.flat().concat(cap1Rows).forEach(row => {
					if (row.HocSinhLopID) map.set(`hsl:${row.HocSinhLopID}`, row)
					if (row.HocSinhID) map.set(`hs:${row.HocSinhID}`, row)
				})
				this.allStudentRows = this.allStudentRows.map(row => {
					const tongKet = map.get(`hsl:${row.HSLopID}`) || map.get(`hs:${row.HocSinhID}`)
					return tongKet ? this.applyTongKet(row, tongKet) : row
				})
			} finally {
				this.loading.tongKet = false
			}
		},
		buildTongKetTargets(rows) {
			const map = new Map()
			;(rows || []).forEach(row => {
				const lopID = row.LopCuID
				if (!lopID || map.has(lopID)) return
				const khoiCu = Number(row.KhoiID || 0) - 1
				if (khoiCu < 1) return
				map.set(lopID, {
					LopID: lopID,
					KhoiID: khoiCu
				})
			})
			return [...map.values()]
		},
		getDiemSub(khoiID) {
			const khoi = Number(khoiID)
			if (khoi >= 10) return 'diemc3'
			return 'diemc2'
		},
		async getTongKetCap1Rows(rows) {
			const cap1Targets = this.buildTongKetTargets(rows).filter(item => item.KhoiID >= 1 && item.KhoiID <= 5)
			if (!cap1Targets.length) return []
			const hasCap1LopCu = (rows || []).some(row => {
				const khoiCu = Number(row.KhoiID || 0) - 1
				return khoiCu >= 1 && khoiCu <= 5 && row.LopCuID
			})
			if (!hasCap1LopCu) return []
			const data = await ajaxCALLPromise('lms/SoGVCNTongKetCap1LenCap2', {
				NienKhoa: this.filter.NienKhoa - 1,
				JsonLop: JSON.stringify(cap1Targets.map(item => ({ LopID: item.LopID })))
			}).catch(() => [])
			if (Array.isArray(data?.[0])) return data[0]
			return Array.isArray(data) ? data : []
		},
		applyTongKet(row, tongKet) {
			return {
				...row,
				Toan: this.pickTongKetValue(tongKet, ['toan', 'Toan', 'DiemToan', 'Diem_Toan', 'Toán'], row.Toan || row['Toán'] || ''),
				Van: this.pickTongKetValue(tongKet, ['van', 'Van', 'DiemVan', 'Diem_Van', 'DiemTV', 'Diem_TV', 'DiemTiengViet', 'Diem_TiengViet', 'TiengViet', 'Tiếng Việt', 'Văn'], row.Van || row['Văn'] || ''),
				Anh: this.pickTongKetValue(tongKet, ['anh', 'Anh', 'DiemAnh', 'Diem_Anh', 'DiemTA', 'Diem_TA', 'TiengAnh', 'Tiếng Anh'], row.Anh || ''),
				KHTN: tongKet.KHTN || tongKet.HKTN || row.KHTN || '',
				'LS-ĐL': tongKet['LS-ĐL'] || tongKet['LS-DL'] || tongKet.su || row['LS-ĐL'] || '',
				'GDCD/GDKTPL': tongKet.gdcd || tongKet.GDCD || tongKet.gdktpl || tongKet.GDKTPL || tongKet['GDCD/GDKTPL'] || row['GDCD/GDKTPL'] || '',
				Tin: tongKet.tin || row.Tin || '',
				CN: tongKet.CN || row.CN || '',
				'Địa lí': tongKet.dia || row['Địa lí'] || '',
				'Vật lí': tongKet.ly || row['Vật lí'] || '',
				Hoa: tongKet.hoa || row.Hoa || row['Hóa'] || '',
				Sinh: tongKet.sinh || row.Sinh || '',
				DTB: tongKet.DTB || row.DTB || '',
				KQHT: tongKet.HocLuc || row.KQHT || '',
				KQRL: tongKet.KQRenLuyen || row.KQRL || '',
				DanhHieu: tongKet.DanhHieu || row.DanhHieu || '',
				Phep: tongKet.Phep ?? row.Phep,
				KhongPhep: tongKet.KhongPhep ?? row.KhongPhep,
				TongBuoiNghi: tongKet.TongBuoiNghi ?? row.TongBuoiNghi
			}
		},
		pickTongKetValue(source, keys, fallback) {
			for (const key of keys) {
				const value = source?.[key]
				if (value !== undefined && value !== null && value !== '') return value
			}
			return fallback
		},
		async mergeThongTinGiaDinh() {
			this.loading.family = true
			try {
				const targets = this.buildCapHocGiaDinhTargets(this.allStudentRows)
				const chunks = await Promise.all(targets.map(capHoc => ajaxCALLPromise('student/LMS_GetThongTinPhuHuynh', {
					CapHoc: capHoc
				}).catch(() => [])))
				const map = new Map()
				chunks.flat().forEach(row => {
					if (!row.HocSinhID || map.has(`${row.HocSinhID}`)) return
					map.set(`${row.HocSinhID}`, row)
				})
				this.allStudentRows = this.allStudentRows.map(row => {
					const info = map.get(`${row.HocSinhID}`)
					return info ? this.applyThongTinGiaDinh(row, info) : row
				})
			} finally {
				this.loading.family = false
			}
		},
		buildCapHocGiaDinhTargets(rows) {
			const set = new Set()
			;(rows || []).forEach(row => {
				const khoi = Number(row.KhoiID || 0)
				const khoiCu = khoi - 1
				this.addCapHocByKhoi(set, khoiCu)
				this.addCapHocByKhoi(set, khoi)
			})
			return [...set.values()].sort((a, b) => a - b)
		},
		addCapHocByKhoi(set, khoi) {
			if (khoi >= 1 && khoi <= 5) set.add(1)
			else if (khoi >= 6 && khoi <= 9) set.add(2)
			else if (khoi >= 10 && khoi <= 12) set.add(3)
		},
		applyThongTinGiaDinh(row, info) {
			return {
				...row,
				Cha: info.Cha || row.Cha || '',
				NgheNghiepCha: info.NgheNghiepCha || row.NgheNghiepCha || '',
				SDTCha: info.DienThoaiCha || row.SDTCha || '',
				Me: info.Me || row.Me || '',
				NgheNghiepMe: info.NgheNghiepMe || row.NgheNghiepMe || '',
				SDTMe: info.DienThoaiMe || row.SDTMe || '',
				NguoiDoDau: info.NguoiDoDau || row.NguoiDoDau || '',
				SDTNguoiDoDau: info.DienThoaiDoDau || row.SDTNguoiDoDau || '',
				DiaChi: info.DiaChi || row.DiaChi || ''
			}
		},
		async onClassChange(lopID) {
			this.selectedLopID = lopID
			this.resetSo()
			if (lopID === '__ALL__') {
				this.setStudentSheets(this.allStudentRows)
				return
			}
			const item = this.classList.find(x => x.LopID === lopID)
			if (item) await this.openSo(item)
		},
		resetSo() {
			this.selectedClass = null
			this.detail = {}
			this.monthList = []
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			this.form = {
				SoGVCNID: 0,
				ThongTinLop: '',
				ChiTieu: '',
				SiSo: '',
				GiaoVienBoMon: '',
				BanDaiDienCMHS: '',
				CanBoLop: '',
				HuongNghiep: ''
			}
		},
		async openSo(item) {
			this.selectedClass = item
			this.filter.LopID = item.LopID
			this.loading.detail = true
			try {
				const created = await ajaxCALLPromise('lms/SoGVCNEnsure', { NienKhoa: item.NienKhoa, LopID: item.LopID })
				this.form.SoGVCNID = created.SoGVCNID
				await Promise.all([this.getDetail(), this.getStudents()])
			} finally {
				this.loading.detail = false
			}
		},
		async getDetail() {
			if (!this.form.SoGVCNID) return
			const data = await ajaxCALLPromise(`lms/SoGVCNGet/${this.form.SoGVCNID}`)
			this.detail = Array.isArray(data) ? (data[0]?.[0] || {}) : data
			this.monthList = Array.isArray(data?.[1]) ? data[1] : []
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			Object.keys(this.form).forEach(key => {
				if (key !== 'SoGVCNID') this.form[key] = this.detail[key] || ''
			})
		},
		async getStudents() {
			this.loading.students = true
			try {
				const rows = this.allStudentRows.filter(x => x.LopID === this.filter.LopID)
				this.setStudentSheets(rows)
			} finally {
				this.loading.students = false
			}
		},
		setStudentSheets(rows) {
			this.studentSheetRows = this.toSheetRows(rows)
			this.renLuyenRows = this.toRenLuyenRows(rows)
			this.soLienLacRows = this.toSoLienLacRows(rows)
			this.sheetKey++
		},
		toSheetRows(rows) {
			return (rows || []).map((x, index) => [
				index + 1,
				x.HoTen || '',
				x.MaHocSinh || '',
				x.LopMoi || x.TenLop || '',
				x.LopCu || '',
				x.Toan || x['Toán'] || '',
				x.Van || x['Văn'] || '',
				x.Anh || x['Anh'] || '',
				x.KHTN || '',
				x['LS-ĐL'] || '',
				x['GDCD/GDKTPL'] || '',
				x.Tin || '',
				x.CN || '',
				x['Địa lí'] || '',
				x['Vật lí'] || '',
				x.Hoa || x['Hóa'] || '',
				x.Sinh || '',
				x.KQRL || '',
				x.KQHT || '',
				x.NhanXetGVCN || '',
				x.Cha || '',
				x.NgheNghiepCha || '',
				x.SDTCha || '',
				x.Me || '',
				x.NgheNghiepMe || '',
				x.SDTMe || '',
				x.NguoiDoDau || '',
				x.SDTNguoiDoDau || '',
				x.DiaChi || '',
				x.GhiChu || ''
			])
		},
		toRenLuyenRows(rows) {
			return (rows || []).map((x, index) => [
				index + 1,
				x.HoTen || '',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				'',
				''
			])
		},
		toSoLienLacRows(rows) {
			return (rows || []).map((x, index) => [
				index + 1,
				x.HoTen || '',
				x.LopMoi || x.TenLop || '',
				'',
				'',
				''
			])
		},
		async onSaveDraft() {
			this.loading.save = true
			try {
				await ajaxCALLPromise('lms/SoGVCNSave', this.form)
				await this.getDetail()
				await this.getList()
				this.notify('Đã lưu')
			} finally {
				this.loading.save = false
			}
		},
		async saveMonth() {
			this.loading.month = true
			try {
				await ajaxCALLPromise('lms/SoGVCNKeHoachThangSave', {
					SoGVCNID: this.form.SoGVCNID,
					...this.monthForm
				})
				await this.getDetail()
				this.notify('Đã lưu kế hoạch tháng')
			} finally {
				this.loading.month = false
			}
		},
		getSchoolYearText() {
			const endYear = Number(this.currentNienKhoa || new Date().getFullYear())
			return (endYear - 1) + '-' + endYear
		},
		getCurrentSchoolYearText() {
			const startYear = Number(this.currentNienKhoa || new Date().getFullYear())
			return startYear + '-' + (startYear + 1)
		},
		getKeHoachExportMonths() {
			return [
				{ label: '8', value: 8 },
				{ label: '9', value: 9 },
				{ label: '10', value: 10 },
				{ label: '11', value: 11 },
				{ label: '12', value: 12 },
				{ label: '1,2/' + this.currentNienKhoa, value: 1 },
				{ label: '3', value: 3 },
				{ label: '4', value: 4 },
				{ label: '5', value: 5 }
			]
		},
		getKeHoachTaskLabels() {
			return ['15 phút đầu giờ', 'Sinh hoạt lớp cuối tuần', '....', 'Dặn dò khác']
		},
		getDefaultKeHoachChuDe(thang) {
			return Number(thang) === 8 ? 'Ổn định lớp, học tập nội quy' : ''
		},
		getKeHoachWeekValue(text, label, week) {
			if (!text) return ''
			const lines = String(text).split(/\r?\n/)
			const start = lines.findIndex(line => line.trim() === label)
			if (start < 0) return ''
			const nextLabelIndex = lines.slice(start + 1).findIndex(line => this.getKeHoachTaskLabels().includes(line.trim()))
			const end = nextLabelIndex < 0 ? lines.length : start + 1 + nextLabelIndex
			const prefix = 'Tuần ' + week + ':'
			const line = lines.slice(start + 1, end).find(item => item.trim().startsWith(prefix))
			return line ? line.trim().slice(prefix.length).trim() : ''
		},
		findMonthPlan(thang) {
			return (this.monthList || []).find(x => Number(x.Thang) === Number(thang)) || {}
		},
		updateKeHoachSheetRows(rows) {
			this.keHoachSheetRows = rows || []
		},
		getKeHoachMonthRowCount() {
			return this.getKeHoachTaskLabels().length + 2
		},
		buildKeHoachThangTuanExportAoA(includeGuidelines = false, excludeHeaderRow = false) {
			const rows = []
			if (includeGuidelines) {
				rows.push(
					['', '', 'KHUNG KẾ HOẠCH GIÁO DỤC HỌC SINH THEO THÁNG LỚP ' + (this.selectedClass?.TenLop || '.....') + ' NĂM HỌC ' + this.getCurrentSchoolYearText(), '', '', '', '', '', ''],
					['', '', 'Gợi ý', '', '', '', '', '', ''],
					['', '', '- Căn cứ Khung chủ đề giáo dục của nhà trường để cập nhật tên Chủ đề hàng tháng và Mục tiêu giáo dục chính thông qua chủ đề của tháng đó.', '', '', '', '', '', ''],
					['', '', '- Căn cứ chủ đề - mục tiêu giáo dục đã xác định và các gợi ý nhiệm vụ để lên kế hoạch cho các nội dung giáo dục sẽ triển khai trong 15 phút đầu ngày, sinh hoạt cuối tuần, các sinh hoạt tập trung khác... cho từng tuần trong tháng.', '', '', '', '', '', ''],
					['', '', '+ Video tư liệu liên quan đến giáo dục hành vi trái phép (nếu cần).', '', '', '', '', '', ''],
					['', '', '+ Video tư liệu về các ngày lễ, kỉ niệm', '', '', '', '', '', ''],
					['', '', '+ Phim ngắn liên quan đến chủ đề giáo dục tháng', '', '', '', '', '', ''],
					['', '', '- Cuối tháng, GVCN cập nhật đánh giá ngắn gọn tình hình cả lớp trong tháng đó.', '', '', '', '', '', '']
				)
			}
			if (!excludeHeaderRow) {
				rows.push(['Tháng', 'Mục tiêu giáo dục tháng', 'Gợi ý nhiệm vụ', 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Ưu điểm - Hạn chế + giải pháp khắc phục'])
			}

			this.getKeHoachExportMonths().forEach(month => {
				const item = this.findMonthPlan(month.value)
				rows.push([month.label, 'Chủ đề:', item.ChuDe || this.getDefaultKeHoachChuDe(month.value), '', '', '', '', '', item.DanhGia || ''])
				rows.push(['', 'Mục tiêu:', item.MucTieu || '', '', '', '', '', '', ''])
				this.getKeHoachTaskLabels().forEach(label => {
					rows.push([
						'',
						'',
						label,
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 1),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 2),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 3),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 4),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 5),
						''
					])
				})
			})

			return rows
		},
		buildKeHoachSheetStyle(includeGuidelines = false) {
			const style = {}
			const border = 'border:1px solid #000;'
			const black = 'color:#000000;'
			const center = 'text-align:center;vertical-align:middle;'
			const bold = 'font-weight:700;'
			const wrap = 'white-space:normal;'
			const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
			const offset = includeGuidelines ? 8 : 0
			const rowCount = this.getKeHoachMonthRowCount()

			for (let r = 1; r <= (rowCount * this.getKeHoachExportMonths().length) + offset; r++) {
				cols.forEach(col => {
					style[col + r] = wrap
				})
			}
			if (includeGuidelines) {
				for (let r = 1; r <= 8; r++) {
					style['C' + r] = black + wrap
				}
				style.C1 = black + bold + 'text-align:center;'
				style.C2 = bold + black
			}

			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + offset + (index * rowCount)
				cols.forEach(col => {
					for (let r = start; r < start + rowCount; r++) {
						style[col + r] = border + black + wrap
					}
				})
				style['A' + start] = border + center
				style['I' + start] = border + wrap
			})
			return style
		},
		onKeHoachSheetLoad() {
			this.$nextTick(() => {
				setTimeout(this.applyKeHoachSheetLayout, 100)
			})
		},
		applyKeHoachSheetLayout() {
			const sheet = Array.isArray(this.keHoachSheetInstance) ? this.keHoachSheetInstance[0] : this.keHoachSheetInstance
			if (!sheet) return
			const includeGuidelines = false
			if (includeGuidelines) {
				this.applySheetMerge(sheet, 'C1', 6, 1)
				for (let row = 2; row <= 8; row++) this.applySheetMerge(sheet, 'C' + row, 6, 1)
			}
			const rowCount = this.getKeHoachMonthRowCount()
			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + (index * rowCount)
				this.applySheetMerge(sheet, 'A' + start, 1, rowCount)
				this.applySheetMerge(sheet, 'B' + start, 1, rowCount)
				this.applySheetMerge(sheet, 'C' + start, 1, rowCount)
				this.applySheetMerge(sheet, 'I' + start, 1, rowCount)
			})
		},
		applySheetMerge(sheet, cell, colspan, rowspan) {
			const originalAlert = window.alert
			try {
				window.alert = function (msg) {
					if (msg && String(msg).toLowerCase().indexOf('merged') !== -1) {
						console.warn('JExcel merge bypassed:', msg)
						return
					}
					if (typeof originalAlert === 'function') {
						originalAlert(msg)
					}
				}
				if (sheet.setMerge) sheet.setMerge(cell, colspan, rowspan)
				else if (sheet.setMergeCells) sheet.setMergeCells(cell, colspan, rowspan)
			} catch (e) {
				// Merge is cosmetic
			} finally {
				window.alert = originalAlert
			}
		},
		parseKeHoachSheetRows() {
			const source = this.keHoachSheetRows && this.keHoachSheetRows.length
				? this.keHoachSheetRows
				: this.buildKeHoachThangTuanExportAoA(false, true)
			const rowCount = this.getKeHoachMonthRowCount()
			return this.getKeHoachExportMonths().map((month, index) => {
				const start = index * rowCount
				const chuDeRow = source[start] || []
				const mucTieuRow = source[start + 1] || []
				const weekRows = source.slice(start + 2, start + rowCount)
				const keHoachTuan = weekRows.map(row => {
					const label = row[2] || ''
					const weeks = [row[3], row[4], row[5], row[6], row[7]].map((value, weekIndex) => {
						return value ? 'Tuần ' + (weekIndex + 1) + ': ' + value : ''
					}).filter(Boolean).join('\n')
					return [label, weeks].filter(Boolean).join('\n')
				}).filter(Boolean).join('\n\n')

				return {
					SoGVCNID: this.form.SoGVCNID,
					Thang: month.value,
					ChuDe: this.cleanSheetValue(chuDeRow[2]),
					MucTieu: this.cleanSheetValue(mucTieuRow[2]),
					NhiemVu: this.cleanSheetValue(chuDeRow[2]),
					KeHoachTuan: this.cleanSheetValue(keHoachTuan),
					DanhGia: this.cleanSheetValue(chuDeRow[8])
				}
			})
		},
		cleanSheetValue(value) {
			return value == null ? '' : String(value).trim()
		},
		async saveKeHoachSheet() {
			if (!this.form.SoGVCNID) return
			this.loading.month = true
			try {
				const rows = this.parseKeHoachSheetRows()
				await Promise.all(rows.map(row => ajaxCALLPromise('lms/SoGVCNKeHoachThangSave', row)))
				await this.getDetail()
				this.notify('Đã lưu kế hoạch tháng')
			} finally {
				this.loading.month = false
			}
		}
	}
	}
</script>