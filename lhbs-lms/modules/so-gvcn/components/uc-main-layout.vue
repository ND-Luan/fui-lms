<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title class="d-flex align-center flex-wrap ga-2">
					<span>Sổ GVCN</span>
					<v-chip color="primary" variant="text" size="small" class="font-weight-medium">
						{{ currentNienKhoa }}
					</v-chip>
					<v-chip v-if="selectedClass" color="primary" variant="text" size="small" class="font-weight-medium">
						{{ selectedClass.TenLop }}
					</v-chip>
					<v-spacer />
				</v-card-title>
				<v-card-text class="py-1">
					<v-row dense align="center">
						<v-col cols="12" sm="2">
							<v-select v-model="filter.CapID" :items="capOptions" item-title="text" item-value="value"
								label="Cấp học" density="compact" variant="outlined" hide-details />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="selectedLopID" :items="classOptions" item-title="TenLop"
								item-value="LopID" label="Lớp" density="compact" variant="outlined" hide-details
								:loading="loading.list" @update:model-value="onClassChange" />
						</v-col>
						<v-col cols="12" sm="7" class="d-flex align-center justify-end ga-2">
							<v-btn color="primary" variant="outlined" size="small" :loading="loading.list"
								@click="onRefreshCurrentTab">
								<v-icon start>mdi-refresh</v-icon>
								Làm mới
							</v-btn>
							<v-btn color="success" variant="outlined" size="small" :disabled="!studentSheetRows.length"
								:loading="loading.export" @click="onExportExcel">
								<v-icon start>mdi-file-excel</v-icon>
								Xuất Excel
							</v-btn>
							<v-btn v-if="showSaveButton && canSave" color="primary" variant="flat" size="small"
								:disabled="saveButtonDisabled" :loading="saveButtonLoading" @click="onSaveButtonClick">
								<v-icon start>mdi-content-save</v-icon>
								{{ saveButtonText }}
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-card>
			<v-card-text class="pa-0" style="height: calc(100vh - 78px);">
				<v-row no-gutters>
					<v-col cols="12">
						<v-tabs v-model="tab" density="compact">
							<v-tab value="du-lieu-hs">{{ isCap1 ? 'TT & Tổ chức lớp' : 'Dữ liệu HS lớp' }}</v-tab>
							<v-tab value="chi-tieu">{{ isCap1 ? 'KH & Công tác CN' : 'XD chỉ tiêu_giải pháp' }}</v-tab>
							<v-tab value="ke-hoach">{{ isCap1 ? 'HS cần quan tâm' : 'KH GD tháng_tuần' }}</v-tab>
							<v-tab value="ren-luyen">{{ isCap1 ? 'Nhận xét tháng (LMS)' : 'Hồ sơ theo dõi QTRL' }}
							</v-tab>
							<v-tab v-if="isCap1" value="so-ket-tong-ket">Sơ kết, Tổng kết & Thành tích</v-tab>
							<v-tab value="so-lien-lac">{{ isCap1 ? 'Họp PHHS & BHYT' : 'Sổ liên lạc điện tử' }}</v-tab>
							<v-tab v-if="!isCap1" value="huong-nghiep">Hướng nghiệp</v-tab>
						</v-tabs>
						<v-divider />

						<v-window v-model="tab">
							<!-- Tab 1 -->
							<v-window-item value="du-lieu-hs">
								<so-gvcn-c1-tab-thong-tin-to-chuc v-if="isCap1" :rows="studentSheetRows"
									:sheet-height="sheetHeight" :sheet-key="sheetKey" :selected-lop-i-d="selectedLopID"
									ref="tabDuLieuHsRef" />
								<so-gvcn-tab-du-lieu-hs v-else :rows="studentSheetRows" :sheet-height="sheetHeight"
									:sheet-key="sheetKey" :nested-headers="studentNestedHeaders" ref="tabDuLieuHsRef" />
							</v-window-item>

							<!-- Tab 2 -->
							<v-window-item value="chi-tieu" eager>
								<so-gvcn-c1-tab-ke-hoach-cong-tac v-if="isCap1" :selected-lop-i-d="selectedLopID" />
								<so-gvcn-tab-chi-tieu v-else ref="tabChiTieuRef" :selected-lop-i-d="selectedLopID"
									:chi-tieu-cards="chiTieuCards" :chi-tieu-giao-duc-title="chiTieuGiaoDucTitle"
									:sheet-height="sheetHeight" :sheet-key="sheetKey"
									@update-card-rows="updateChiTieuCardRows"
									@handle-card-change="handleChiTieuCardChange" />
							</v-window-item>

							<!-- Tab 3 -->
							<v-window-item value="ke-hoach" eager>
								<so-gvcn-c1-tab-hs-can-quan-tam v-if="isCap1" :selected-lop-i-d="selectedLopID" />
								<so-gvcn-tab-ke-hoach v-else ref="tabKeHoachRef" :selected-lop-i-d="selectedLopID"
									:selected-class="selectedClass" :school-year-text="getCurrentSchoolYearText()"
									:sheet-height="sheetHeight" :ke-hoach-sheet-height="keHoachSheetHeight"
									:columns="keHoachSheetColumns" :nested-headers="keHoachSheetNestedHeaders"
									:data-ao-a="keHoachSheetRows" :sheet-style="keHoachSheetStyle"
									:get-ke-hoach-export-months="getKeHoachExportMonths"
									:get-ke-hoach-month-row-count="getKeHoachMonthRowCount" />
							</v-window-item>

							<!-- Tab 4 -->
							<v-window-item value="ren-luyen" eager>
								<so-gvcn-c1-tab-nhan-xet-thang-lms v-if="isCap1" :selected-lop-i-d="selectedLopID" />
								<so-gvcn-tab-ren-luyen v-else ref="tabRenLuyenRef" v-model:rows="renLuyenRows"
									:selected-lop-i-d="selectedLopID" :selected-class="selectedClass"
									:school-year-text="getCurrentSchoolYearText()" :columns="renLuyenColumns"
									:nested-headers="renLuyenNestedHeaders" :sheet-height="sheetHeight"
									:ren-luyen-sheet-height="renLuyenSheetHeight" :sheet-key="sheetKey" />
							</v-window-item>

							<!-- Tab 5 (C1 only) -->
							<v-window-item v-if="isCap1" value="so-ket-tong-ket" eager>
								<so-gvcn-c1-tab-so-ket-tong-ket :selected-lop-i-d="selectedLopID" />
							</v-window-item>

							<!-- Tab 6 -->
							<v-window-item value="so-lien-lac">
								<so-gvcn-c1-tab-hop-ph-bhyt v-if="isCap1" :selected-lop-i-d="selectedLopID" />
								<so-gvcn-tab-so-lien-lac v-else ref="tabSoLienLacRef" v-model:rows="soLienLacRows"
									:selected-lop-i-d="selectedLopID" :columns="soLienLacColumns"
									:nested-headers="soLienLacNestedHeaders" :sheet-height="sheetHeight"
									:so-lien-lac-sheet-height="soLienLacSheetHeight" :sheet-key="sheetKey" />
							</v-window-item>

							<!-- Tab Hướng nghiệp (C2, C3 only) -->
							<v-window-item v-if="!isCap1" value="huong-nghiep">
								<so-gvcn-tab-huong-nghiep ref="tabHuongNghiepRef" :rows="huongNghiepRows"
									:selected-lop-i-d="selectedLopID" :columns="huongNghiepColumns"
									:nested-headers="huongNghiepNestedHeaders" :sheet-height="sheetHeight"
									:huong-nghiep-sheet-height="huongNghiepSheetHeight" :sheet-key="sheetKey"
									@update-rows="updateHuongNghiepRows" />
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
		data() {
		return {
			vueData,
			tab: 'du-lieu-hs',
			filter: this.getDefaultFilter(),
			loading: { list: false, detail: false, students: false, save: false, submit: false, month: false, tongKet: false, family: false, export: false },
			classList: [],
			allTeachers: [],
			allStudentRows: [],
			selectedLopID: '__ALL__',
			classSelectionInitialized: false,
			studentSheetRows: [],
			sheetInstance: null,
			renLuyenRows: [],
			renLuyenSavedRows: [],
			renLuyenSheetInstance: null,
			soLienLacRows: [],
			soLienLacSavedRows: [],
			soLienLacSheetInstance: null,
			keHoachSheetRows: [],
			keHoachSheetInstance: null,
			huongNghiepRows: [],
			huongNghiepSheetInstance: null,
			sheetKey: 0,
			sheetHeight: 			'calc(100vh )',
			keHoachSheetHeight: 	'calc(100vh )',
			renLuyenSheetHeight: 	'calc(100vh )',
			soLienLacSheetHeight: 	'calc(100vh )',
			huongNghiepSheetHeight: 'calc(100vh )',
			keHoachSheetColumns: [
				{ title: 'Tháng', width: 70, readOnly: true },
				{ title: 'Chủ đề', width: 220 },
				{ title: 'Mục tiêu', width: 220 },
				{ title: 'Tuần 1', width: 210 },
				{ title: 'Tuần 2', width: 210 },
				{ title: 'Tuần 3', width: 210 },
				{ title: 'Tuần 4', width: 210 },
				{ title: 'Tuần 5', width: 210 },
				{ title: 'Ưu điểm - Hạn chế + giải pháp khắc phục', width: 300 }
			],
			keHoachSheetStyle: {},
			huongNghiepColumns: [
				{ title: 'STT', name: 'STT', width: 55, readOnly: true },
				{ title: 'Mã học sinh', name: 'MaHocSinh', width: 110, readOnly: true },
				{ title: 'Số danh bộ', name: 'SoDanhBo', width: 110, readOnly: true },
				{ title: 'Họ và tên học sinh', name: 'HoTen', width: 245, readOnly: true },
				{
					title: 'Dự kiến chọn môn thi TN (1)', name: 'MonThiTN', width: 260,
					type: 'dropdown', autocomplete: true,
					source: ['Toán', 'Ngữ văn', 'Ngoại ngữ', 'Vật lí', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Tin học', 'Công nghệ']
				},
				{ title: 'KQ trắc nghiệm nghề nghiệp (Sở thích - Năng lực) - (2)', name: 'KQTracNghiem', width: 440 }
			],
			chiTieuCards: [
						{
							key: 'chi-tieu-giao-duc',
							title: 'I. XÂY DỰNG CHỈ TIÊU HAI MẶT GIÁO DỤC LỚP .... NĂM HỌC 2026-2027',
							md: 12,
							height: '110px',
							freezeColumns: 1,
							nestedHeaders: [
								[
									{ title: '', colspan: 2 },
									{ title: 'Chỉ tiêu', colspan: 4 },
									{ title: '', colspan: 1 }
								]
							],
							columns: [
								{ title: 'Các mặt giáo dục', name: 'MatGiaoDuc', width: 130, readOnly: true },
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'Tốt', name: 'Tot', width: 110, type: 'numeric' },
								{ title: 'Khá', name: 'Kha', width: 110, type: 'numeric' },
								{ title: 'Đạt', name: 'Dat', width: 110, type: 'numeric' },
								{ title: 'Chưa đạt', name: 'ChuaDat', width: 120, type: 'numeric' },
								{ title: 'Biện pháp', name: 'BienPhap', width: 300 }
							],
							rows: [
								['Kết quả rèn luyện', '', '', '', '', '', ''],
								['Kết quả học tập', '', '', '', '', '', '']
							]
						},
						{
							key: 'danh-hieu',
							title: 'DANH HIỆU',
							md: 12,
							height: '65px',
							columns: [
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'HSXS', name: 'HSXS', width: 180, align: 'center' },
								{ title: 'HSG', name: 'HSG', width: 180, align: 'center' },
								{ title: 'Ghi chú / biện pháp', name: 'GhiChu', width: 360 }
							],
							rows: [
								['', '', '', '']
							]
						},
						{
							key: 'hoat-dong-phong-trao',
							title: 'THAM GIA CÁC HOẠT ĐỘNG PHONG TRÀO KHÁC',
							md: 12,
							height: '280px',
							columns: [
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'Nội dung', name: 'NoiDung', width: 420 },
								{ title: 'Ghi chú', name: 'GhiChu', width: 300 }
							],
							rows: Array.from({ length: 10 }, function () { return ['', '', ''] })
						},
						{
							key: 'theo-doi-si-so',
							title: 'II. THEO DÕI SĨ SỐ',
							md: 12,
						height: '115px',
						columns: [
							{ title: ' ', name: 'Moc', width: 90, readOnly: true },
							{ title: 'Sĩ số', name: 'SiSo', width: 80, align: 'center' },
							{ title: 'Nam', name: 'Nam', width: 170, align: 'center' },
							{ title: 'Chuyển đi', name: 'ChuyenDi', width: 170, align: 'center' },
							{ title: 'Chuyển đến', name: 'ChuyenDen', width: 170, align: 'center' }
						],
						rows: [
							['Đầu năm', '', '', '', ''],
							['Cuối kì 1', '', '', '', ''],
							['Cuối kì 2', '', '', '', '']
						]
					},
						{
							key: 'giao-vien-bo-mon',
							title: 'III. DANH SÁCH GIÁO VIÊN BỘ MÔN',
							md: 12,
							height: '450px',
							columns: [
								{ title: 'Bộ môn', name: 'BoMon', width: 100 },
								{ title: 'Học kì', name: 'HocKy', width: 100, type: 'dropdown', source: ['Học kì 1', 'Học kì 2'] },
								{ title: 'Họ tên - Số điện thoại', name: 'GiaoVien', width: 330, type: 'dropdown', source: [], autocomplete: true },
								{ title: 'Những thay đổi', name: 'ThayDoi', width: 220 }
							],
							rows: Array.from({ length: 20 }, function () { return ['', '', '', ''] })
						},
						{
							key: 'ban-dai-dien-cmhs',
							title: 'IV. DANH SÁCH BAN ĐẠI DIỆN CHA MẸ HỌC SINH',
							md: 12,
							height: '200px',
							columns: [
								{ title: 'STT', name: 'STT', width: 60, align: 'center' },
								{ title: 'Mã học sinh', name: 'HocSinhID', width: 95, readOnly: true },
								{ title: 'Họ và tên học sinh', name: 'HocSinh', width: 230, type: 'dropdown', source: [], autocomplete: true },
								{ title: 'Họ và tên cha mẹ', name: 'ChaMe', width: 230 },
								{ title: 'Nghề nghiệp', name: 'NgheNghiep', width: 170 },
								{ title: 'Điện thoại', name: 'DienThoai', width: 190, align: 'center' },
								{
									title: 'Nhiệm vụ', name: 'NhiemVu', width: 140,
									type: 'dropdown', source: ['Trưởng ban', 'Phó ban', 'Thành viên']
								}
							],
							rows: Array.from({ length: 5 }, function (_, index) { return [index + 1, '', '', '', '', '', ''] })
						},
						{
							key: 'can-bo-lop',
							title: 'V. DANH SÁCH CÁN BỘ LỚP',
							md: 12,
							height: '320px',
							columns: [
								{ title: 'STT', name: 'STT', width: 70, align: 'center' },
								{ title: 'Mã học sinh', name: 'HocSinhID', width: 95, readOnly: true },
								{ title: 'Họ và tên học sinh', name: 'HocSinh', width: 230, type: 'dropdown', source: [], autocomplete: true },
								{
									title: 'Chức vụ', name: 'ChucVu', width: 180,
									type: 'dropdown', source: ['Lớp trưởng', 'Lớp phó học tập', 'Lớp phó văn thể mỹ', 'Bí thư', 'Phó bí thư', 'Tổ trưởng', 'Tổ phó', 'Thủ quỹ']
								},
								{ title: 'Ghi chú', name: 'GhiChu', width: 180 }
							],
							rows: Array.from({ length: 10 }, function (_, index) { return [index + 1, '', '', '', ''] })
						}
			],
			monthList: [],
			chiTieuSavedRows: [],
			siSoSavedRows: [],
			giaoVienBoMonSavedRows: [],
			banDaiDienCMHSSavedRows: [],
			canBoLopSavedRows: [],
			huongNghiepSavedRows: [],
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
			capOptions: [
				{ text: 'Tiểu học', value: 1 },
				{ text: 'Trung học', value: '2,3' }
			],
			studentSheetColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'Mã học sinh', width: 110, readOnly: true },
				{ title: 'Số danh bộ', width: 110, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 220, readOnly: true, align: 'left' },
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
				{ title: 'Nhận xét GVCN', width: 600, align: 'left', readOnly: true },
				{ title: 'Cha', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp cha', width: 160, readOnly: true },
				{ title: 'SDT cha', width: 120, readOnly: true },
				{ title: 'Mẹ', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp mẹ', width: 160, readOnly: true },
				{ title: 'SDT mẹ', width: 120, readOnly: true },
				{ title: 'Người đỡ đầu', width: 160, readOnly: true },
				{ title: 'SDT người đỡ đầu', width: 140, readOnly: true },
				{ title: 'Ăn sáng', width: 80, readOnly: true },
				{ title: 'Xe', width: 80, readOnly: true },
				{ title: 'Địa chỉ', width: 380, align: 'left', readOnly: true },
				{ title: 'Ghi chú', width: 220, readOnly: true }
			],
			renLuyenColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'SỐ DANH BỘ', width: 110, readOnly: true },
				{ title: 'HỌ TÊN HỌC SINH', width: 220, readOnly: true },
				{ title: 'HS cần hỗ trợ đặc biệt\n(ghi rõ vấn đề nếu có)', width: 240 },
				{ title: 'BAN CÁN SỰ (ghi rõ nhiệm vụ)', width: 200 },
				{ title: 'THÁNG 8', width: 180 },
				{ title: 'THÁNG 9', width: 180 },
				{ title: 'THÁNG 10', width: 180 },
				{ title: 'THÁNG 11', width: 180 },
				{ title: 'THÁNG 12', width: 180 },
				{ title: 'NHẬN XÉT HKI', width: 220 },
				{ title: 'KQRL HKI', width: 100 },
				{ title: 'KQHT HKI', width: 100 },
				{ title: 'THÁNG 01 VÀ 02', width: 180 },
				{ title: 'THÁNG 3', width: 180 },
				{ title: 'THÁNG 4', width: 180 },
				{ title: 'THÁNG 5', width: 180 },
				{ title: 'NHẬN XÉT HKII', width: 220 },
				{ title: 'KQRL HKII', width: 100 },
				{ title: 'KQHT HKII', width: 100 },
				{ title: 'DANH HIỆU', width: 150 },
				{ title: 'THÀNH TÍCH KHÁC', width: 200 }
			],
			soLienLacColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'SỐ DANH BỘ', width: 110, readOnly: true },
				{ title: 'HỌ TÊN HỌC SINH', width: 220, readOnly: true },
				{ title: 'THÁNG 8', width: 230 },
				{ title: 'THÁNG 9', width: 230 },
				{ title: 'THÁNG 10', width: 230 },
				{ title: 'THÁNG 11', width: 230 },
				{ title: 'THÁNG 12', width: 230 },
				{ title: 'NHẬN XÉT HKI', width: 230 },
				{ title: 'THÁNG 01 VÀ 02', width: 230 },
				{ title: 'THÁNG 3', width: 230 },
				{ title: 'THÁNG 4', width: 230 },
				{ title: 'THÁNG 5', width: 230 },
				{ title: 'NHẬN XÉT HKII', width: 230 }
			],
			monthHeaders: [
				{ title: 'Tháng', key: 'Thang', width: 80 },
				{ title: 'Chủ đề', key: 'ChuDe' },
				{ title: 'Đánh giá', key: 'DanhGia' }
			],
		}
	},
	computed: {
			isCap1() {
				return Number(this.filter.CapID || vueData.CapID || 0) === 1
			},
			currentNienKhoa() {
				return vueData.NienKhoa || new Date().getFullYear()
			},
			classOptions() {
				return this.isTeacherOrLead
					? this.classList
					: [
						{ LopID: '__ALL__', TenLop: 'Tất cả lớp' },
						...this.classList
					]
			},
			userSystemRight() {
				return Number(vueData?.user?.SystemRight || vueData?.SystemRight || vueData?.sys_SystemRight || 0)
			},
			isTeacherOrLead() {
				return [1, 5].includes(this.userSystemRight)
			},
			isTeacher() {
				return this.isTeacherOrLead
			},
			isBghOrAdmin() {
				return [3, 9].includes(this.userSystemRight)
			},
			canSave() {
				// Tạm mở nút Lưu cho demo/test.
				return true
			},
			chiTieuGiaoDucTitle() {
				const tenLop = this.selectedClass?.TenLop || ''
				return 'I. XÂY DỰNG CHỈ TIÊU HAI MẶT GIÁO DỤC LỚP ' + tenLop + ' NĂM HỌC ' + this.getCurrentSchoolYearText()
			},
			showSaveButton() {
				return this.selectedLopID !== '__ALL__' && ['chi-tieu', 'ke-hoach', 'ren-luyen', 'nhan-xet-lms', 'so-lien-lac', 'huong-nghiep'].includes(this.tab)
			},
			saveButtonText() {
				switch (this.tab) {
					case 'chi-tieu': return 'Lưu chỉ tiêu'
					case 'ke-hoach': return 'Lưu kế hoạch tháng'
					case 'ren-luyen': return 'Lưu rèn luyện'
					case 'nhan-xet-lms': return 'Lưu nhận xét LMS'
					case 'so-lien-lac': return 'Lưu sổ liên lạc'
					case 'huong-nghiep': return 'Lưu hướng nghiệp'
					default: return 'Lưu'
				}
			},
			saveButtonDisabled() {
				if (this.tab === 'ke-hoach') return !this.form.SoGVCNID
				return !this.form.SoGVCNID || this.loading.save
			},
			saveButtonLoading() {
				if (this.tab === 'ke-hoach') return this.loading.month
				return this.loading.save
			},
			studentNestedHeaders() {
			var nienKhoaDiem = Number(this.currentNienKhoa || 0) - 1
			var namHocDiem = nienKhoaDiem + '-' + this.currentNienKhoa
			return [
				[
					{ title: '', colspan: 6 },
					{ title: 'ĐTB môn cả năm ' + namHocDiem, colspan: 12 },
					{ title: 'KQ ' + namHocDiem, colspan: 2 },
					{ title: 'NHẬN XÉT CỦA GVCN ' + namHocDiem, colspan: 1 },
					{ title: 'THÔNG TIN GIA ĐÌNH', colspan: 8 },
					{ title: 'ĐĂNG KÍ', colspan: 2 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 }
				]
			]
		},
		keHoachSheetNestedHeaders() {
			return [
				[
					{ title: '', colspan: 1 },
					{ title: 'Mục tiêu giáo dục tháng', colspan: 2 },
					{ title: '', colspan: 6 }
				]
			]
		},
		huongNghiepNestedHeaders() {
			return [
				[
					{ title: '', colspan: 4 },
					{ title: 'ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)', colspan: 2 }
				]
			]
		},
		renLuyenNestedHeaders() {
			return [
				[
					{ title: '', colspan: 4 },
					{ title: 'THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP ' + (this.selectedClass?.TenLop || '.......') + ' NĂM HỌC ' + this.getCurrentSchoolYearText(), colspan: 19 }
				]
			]
		},
		soLienLacNestedHeaders() {
			return [
				[
					{ title: '', colspan: 4 },
					{ title: 'NHẬN XÉT SỔ LIÊN LẠC HẰNG THÁNG', colspan: 11 }
				]
			]
		}
	},
	mounted() {
		this.getList()
		this.getTeachersList()
		window.addEventListener('resize', this.onResize)
		this.onResize()
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.onResize)
	},
	watch: {
		'filter.CapID'() {
			this.selectedLopID = '__ALL__'
			this.classSelectionInitialized = false
			this.getList()
		},
		currentNienKhoa() {
			this.filter.NienKhoa = this.currentNienKhoa
			this.selectedLopID = '__ALL__'
			this.classSelectionInitialized = false
			this.getList()
		},
		tab(newTab) {
			this.ensureSpecificClassForClassTabs()
			if (newTab === 'chi-tieu') {
				setTimeout(() => this.$refs.tabChiTieuRef?.initAllSheets(), 50)
			} else if (newTab === 'ke-hoach') {
				// Dùng setTimeout để chờ Vuetify tab transition hoàn thành trước khi jspreadsheet init
				setTimeout(() => this.initKeHoachSheet(), 50)
			} else if (newTab === 'ren-luyen') {
				setTimeout(() => this.$refs.tabRenLuyenRef?.scheduleInit(), 50)
			}
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
			this.sheetHeight = Math.max(320, vh - 190) + 'px'
			this.keHoachSheetHeight = Math.max(280, vh - 290) + 'px'
			this.renLuyenSheetHeight = Math.max(280, vh - 260) + 'px'
			this.soLienLacSheetHeight = Math.max(280, vh - 260) + 'px'
			this.huongNghiepSheetHeight = Math.max(280, vh - 260) + 'px'
		},
		async onRefreshCurrentTab() {
			this.loading.list = true
			try {
				if (this.selectedLopID === '__ALL__') {
					await this.getList()
					return
				}
				// Nếu ở tab dữ liệu HS thì làm mới danh sách HS và điểm tổng kết
				if (this.tab === 'du-lieu-hs') {
					await this.getList()
				} else {
					// Với các tab chi-tieu, ke-hoach, ren-luyen, so-lien-lac, huong-nghiep: chỉ fetch lại detail của Sổ hiện tại
					await this.getDetail()
					if (this.tab === 'chi-tieu') {
						this.$refs.tabChiTieuRef?.initAllSheets()
					} else if (this.tab === 'ren-luyen') {
						this.$refs.tabRenLuyenRef?.scheduleInit()
					}
				}
				this.notify('Đã làm mới dữ liệu tab hiện tại')
			} finally {
				this.loading.list = false
			}
		},
		statusText(status) {
			return ({ NEW: 'Chưa tạo', DRAFT: 'Đã lưu', SUBMITTED: 'Đã lưu' })[status] || status || 'Chưa tạo'
		},
		statusColor(status) {
			return ({ NEW: 'grey', DRAFT: 'warning', SUBMITTED: 'success' })[status] || 'grey'
		},
		notify(message) {
			if (window.Vue && Vue.$toast) return Vue.$toast.success(message, { position: 'top' })
			if (window.showMessage) return showMessage({ title: message })
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
					// Giáo viên và tổ trưởng chỉ thấy lớp đang chủ nhiệm trong niên khóa hiện tại.
					if (this.isTeacherOrLead) {
						const teacherClassIds = await this.getTeacherHomeroomClassIds()
						const teacherRows = (this.allStudentRows || []).filter(row => teacherClassIds.has(String(row.LopID)))
						// SoGVCNDanhSachHocSinhLop đã giới hạn dữ liệu theo quyền người dùng.
						// Một số response không có mã GVCN/UserID để đối chiếu; trong trường
						// hợp đó không được ghi đè danh sách API bằng một mảng rỗng.
						if (teacherRows.length) this.allStudentRows = teacherRows
					}
					this.classList = this.buildClassList(this.allStudentRows)
					if (!this.classSelectionInitialized) {
						this.selectedLopID = this.classList[0]?.LopID || '__ALL__'
						this.classSelectionInitialized = true
					}
					await this.mergeTongKetDiem(this.classList)
					await this.mergeThongTinGiaDinh()
					if (!this.classOptions.some(x => String(x.LopID) === String(this.selectedLopID))) {
						this.selectedLopID = this.classList[0]?.LopID || '__ALL__'
					}
					await this.onClassChange(this.selectedLopID)
					await this.ensureSpecificClassForClassTabs()
				} finally {
					this.loading.list = false
				}
			},
			async getTeacherHomeroomClassIds() {
				const userID = String(vueData?.user?.UserID || vueData?.sys_UserID || '').trim()
				const fallbackLopID = vueData?.LopID ? String(vueData.LopID) : ''
				const khoiIds = [...new Set((this.allStudentRows || []).map(row => Number(row.KhoiID)).filter(Boolean))]
				const classRows = (await Promise.all(khoiIds.map(khoiID => ajaxCALLPromise('lms/Lop_Get_ByKhoiID', {
					NienKhoa: this.filter.NienKhoa,
					KhoiID: khoiID
				}).catch(() => [])))).flat()
				const matchedIds = classRows.concat(this.allStudentRows || [])
					.filter(row => row && row.IsNhom !== true && this.isHomeroomClassOfCurrentUser(row, userID))
					.map(row => String(row.LopID))
				if (!matchedIds.length && fallbackLopID) matchedIds.push(fallbackLopID)
				return new Set(matchedIds)
			},
			isHomeroomClassOfCurrentUser(row, userID) {
				if (!row || !userID) return false
				const candidateKeys = [
					'GVCN',
					'GVCNID',
					'GVCN_ID',
					'GVCNUserID',
					'UserID_GVCN',
					'GiaoVienChuNhiemID',
					'GiaoVienChuNhiem',
					'GiaoVienID',
					'MaGiaoVien',
					'NhanVienID',
					'TeacherID',
					'UserID'
				]
				return candidateKeys.some(key => this.valueMatchesUserID(row[key], userID))
			},
			valueMatchesUserID(value, userID) {
				if (value === undefined || value === null || !userID) return false
				return String(value)
					.split(/[;,|]/)
					.map(item => item.trim())
					.some(item => item === userID)
			},
			async ensureSpecificClassForClassTabs() {
				if (this.selectedLopID !== '__ALL__') return
				if (this.tab === 'du-lieu-hs' && !this.isTeacherOrLead) return
				const firstClass = this.classList[0]
				if (firstClass) await this.onClassChange(firstClass.LopID)
			},
		getRenLuyenMonthNote() {
			return 'Ghi tóm tắt vi phạm - tái phạm - số ngày nghỉ - thời gian/xử lí/có mời PH/có cam kết lần...\nGhi nhận tiến bộ về mặt nào đó, thành tích, đóng góp'
		},
		getSoLienLacGuideline() {
			return 'Hướng dẫn: Căn cứ sheet HỒ SƠ THEO DÕI QTRL, GVCN soạn nhận xét để cập nhật MLS cho PHHS. Nhận xét học sinh cần phù hợp với các minh chứng trong sheet HỒ SƠ THEO DÕI QTRL. Cấu trúc nhận xét từng tháng như sau:\n- Tinh thần, thái độ học tập và mức độ tiến bộ của học sinh (Chú trọng ghi nhận sự tiến bộ)\n- Việc tuân thủ nội quy, nền nếp, chuyên cần trong tháng:\n- Đề xuất PHHS phối hợp giáo dục:'
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
			let cap1Targets = this.buildTongKetTargets(rows).filter(item => item.KhoiID >= 1 && item.KhoiID <= 5)
			if (!cap1Targets.length && this.selectedLopID && this.selectedLopID !== '__ALL__') {
				cap1Targets = [{ LopID: this.selectedLopID, KhoiID: 1 }]
			}
			if (!cap1Targets.length) {
				const uniqueLopIds = [...new Set((rows || []).map(r => r.LopID).filter(Boolean))]
				cap1Targets = uniqueLopIds.map(id => ({ LopID: id, KhoiID: 1 }))
			}
			if (!cap1Targets.length) return []
			const chunks = await Promise.all(cap1Targets.map(target => ajaxCALLPromise('psmark1/LMS_GetBangTongHopKetQua', {
				LopID: target.LopID,
				KyDanhGia: 4
			}).catch(() => [])))
			return chunks.flat()
		},
		applyTongKet(row, tongKet) {
			let xepLoaiKQGD = tongKet.HocLuc || row.KQHT || ''
			if (tongKet.HoanThanhXuatSac === 'x') xepLoaiKQGD = 'Hoàn thành xuất sắc'
			else if (tongKet.HoanThanhTot === 'x') xepLoaiKQGD = 'Hoàn thành tốt'
			else if (tongKet.HoanThanh === 'x') xepLoaiKQGD = 'Hoàn thành'
			else if (tongKet.ChuaHoanThanh === 'x') xepLoaiKQGD = 'Chưa hoàn thành'
			else if (tongKet.DanhGia) xepLoaiKQGD = tongKet.DanhGia

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
				KQHT: xepLoaiKQGD,
				KhenThuong: tongKet.KhenThuong || row.KhenThuong || '',
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
				AnSang: info.AnSang ?? row.AnSang ?? '',
				Xe: info.Xe ?? row.Xe ?? '',
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
			const item = this.classList.find(x => String(x.LopID) === String(lopID))
			if (item) await this.openSo(item)
		},
		resetSo() {
			this.selectedClass = null
			this.detail = {}
			this.monthList = []
			this.chiTieuSavedRows = []
			this.siSoSavedRows = []
			this.giaoVienBoMonSavedRows = []
			this.banDaiDienCMHSSavedRows = []
			this.canBoLopSavedRows = []
			this.huongNghiepSavedRows = []
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			this.initKeHoachSheet()
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
			this.applySiSoRows()
			this.applyChiTieuRows()
			this.applyBanDaiDienCMHSRows()
			this.applyCanBoLopRows()
			this.huongNghiepRows = this.buildHuongNghiepRows()
		},
		async openSo(item) {
			this.selectedClass = item
			this.filter.LopID = item.LopID
			this.loading.detail = true
			try {
				const created = await ajaxCALLPromise('lms/SoGVCNEnsure', { NienKhoa: item.NienKhoa, LopID: item.LopID })
				this.form.SoGVCNID = created.SoGVCNID
				await Promise.all([this.getStudents(), this.getGiaoVienBoMon()])
				await this.getDetail()
			} finally {
				this.loading.detail = false
			}
		},
		async getDetail() {
			if (!this.form.SoGVCNID) return
			const data = await ajaxCALLPromise(`lms/SoGVCNGet/${this.form.SoGVCNID}`)
			this.detail = Array.isArray(data) ? (data[0]?.[0] || {}) : data
			this.monthList = Array.isArray(data?.[1]) ? data[1] : []
			this.chiTieuSavedRows = Array.isArray(data?.[2]) ? data[2] : []
			this.renLuyenSavedRows = Array.isArray(data?.[3]) ? data[3] : []
			this.soLienLacSavedRows = Array.isArray(data?.[4]) ? data[4] : []
			this.siSoSavedRows = Array.isArray(data?.[5]) ? data[5] : []
			this.giaoVienBoMonSavedRows = Array.isArray(data?.[6]) ? data[6] : []
			this.banDaiDienCMHSSavedRows = Array.isArray(data?.[7]) ? data[7] : []
			this.canBoLopSavedRows = Array.isArray(data?.[8]) ? data[8] : []
			this.huongNghiepSavedRows = Array.isArray(data?.[9]) ? data[9] : []
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			this.initKeHoachSheet()
			Object.keys(this.form).forEach(key => {
				if (key !== 'SoGVCNID') this.form[key] = this.detail[key] || ''
			})
			this.applySiSoRows()
			this.applyChiTieuRows()
			this.applyGiaoVienBoMonRows()
			this.applyBanDaiDienCMHSRows()
			this.applyCanBoLopRows()
			this.huongNghiepRows = this.buildHuongNghiepRows()

			const students = this.getSelectedClassStudents()
			if (students.length > 0) {
				this.renLuyenRows = this.toRenLuyenRows(students)
				this.soLienLacRows = this.toSoLienLacRows(students)
				this.setStudentSheets(students)
			}
			this.sheetKey++
		},
		async getStudents() {
			this.loading.students = true
			try {
				const rows = this.allStudentRows.filter(x => String(x.LopID) === String(this.filter.LopID))
				this.setStudentSheets(rows)
			} finally {
				this.loading.students = false
			}
		},
		setStudentSheets(rows) {
			this.studentSheetRows = this.isCap1 ? this.toCap1SheetRows(rows) : this.toSheetRows(rows)
			this.applyStudentDropdownOptions()
			this.sheetKey++
		},
		toCap1SheetRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.HoTen || x.HoTenHocSinh || '',
				x.MaHocSinh || x.HocSinhID || '',
				x.NgaySinh || '',
				(x.GioiTinh === 'Nữ' || x.Phai === 'x' || x.IsNu) ? 'x' : '',
				x.TenDanToc || x.DanToc || 'Kinh',
				x.KQHT || x.DanhGia || '',
				x.KhenThuong || '',
				this.buildNhanXetGVCN(x),
				x.SoThich || x.DacDiem || '',
				x.Cha || x.HoTenCha || '',
				x.NgheNghiepCha || '',
				x.SDTCha || x.DienThoaiCha || '',
				x.Me || x.HoTenMe || '',
				x.NgheNghiepMe || '',
				x.SDTMe || x.DienThoaiMe || '',
				x.NguoiDoDau || '',
				x.SDTNguoiDoDau || x.DienThoaiDoDau || '',
				x.DiaChi || '',
				x.GhiChu || ''
			])
		},
		toSheetRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
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
				this.buildNhanXetGVCN(x),
				x.Cha || '',
				x.NgheNghiepCha || '',
				x.SDTCha || '',
				x.Me || '',
				x.NgheNghiepMe || '',
				x.SDTMe || '',
				x.NguoiDoDau || '',
				x.SDTNguoiDoDau || '',
				this.renderCheckedValue(x.AnSang),
				this.renderCheckedValue(x.Xe),
				x.DiaChi || '',
				x.GhiChu || ''
			])
		},
		toRenLuyenRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 0, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 99, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 8, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 9, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 10, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 11, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 12, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 91, 'NoiDung'), // NHẬN XÉT HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 81, 'NoiDung'), // KQRL HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 82, 'NoiDung'), // KQHT HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 1, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 3, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 4, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 5, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 92, 'NoiDung'), // NHẬN XÉT HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 93, 'NoiDung'), // KQRL HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 94, 'NoiDung'), // KQHT HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 95, 'NoiDung'), // DANH HIỆU
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 96, 'NoiDung')  // THÀNH TÍCH KHÁC
			])
		},
		toSoLienLacRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 8, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 9, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 10, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 11, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 12, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 91, 'NhanXet'), // NHẬN XÉT HKI (Thang 91)
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 1, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 3, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 4, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 5, 'NhanXet'),
				this.getSavedMonthlyValue(this.soLienLacSavedRows, x.HSLopID, 92, 'NhanXet')  // NHẬN XÉT HKII (Thang 92)
			])
		},
		getSavedMonthlyValue(rows, hsLopID, thang, key) {
			const item = (rows || []).find(row => Number(row.HSLopID) === Number(hsLopID) && Number(row.Thang) === Number(thang))
			return item ? (item[key] || '') : ''
		},
		getMonthlySheetMonths() {
			return [
				{ thang: 8, index: 6 },
				{ thang: 9, index: 7 },
				{ thang: 10, index: 8 },
				{ thang: 11, index: 9 },
				{ thang: 12, index: 10 },
				{ thang: 1, index: 14 },
				{ thang: 3, index: 15 },
				{ thang: 4, index: 16 },
				{ thang: 5, index: 17 }
			]
		},
		getSoLienLacMonths() {
			return [
				{ thang: 8, index: 4 },
				{ thang: 9, index: 5 },
				{ thang: 10, index: 6 },
				{ thang: 11, index: 7 },
				{ thang: 12, index: 8 },
				{ thang: 1, index: 10 },
				{ thang: 3, index: 11 },
				{ thang: 4, index: 12 },
				{ thang: 5, index: 13 }
			]
		},
		updateChiTieuCardRows(card, rows) {
			const columns = (card.columns || []).map(x => x.name)
			card.rows = (rows || []).map(row => {
				if (Array.isArray(row)) return row
				return columns.map(key => row && key ? (row[key] ?? '') : '')
			})
			if (card.key === 'ban-dai-dien-cmhs') this.enrichBanDaiDienCMHSRows()
			if (card.key === 'can-bo-lop') this.enrichCanBoLopRows()
			if (['chi-tieu-giao-duc', 'danh-hieu', 'hoat-dong-phong-trao'].includes(card.key)) this.form.ChiTieu = this.serializeChiTieuRows()
			if (card.key === 'theo-doi-si-so') this.form.SiSo = JSON.stringify({ version: 1, rows: this.serializeSiSoRows() })
			if (card.key === 'giao-vien-bo-mon') this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: this.serializeGiaoVienBoMonRows() })
			if (card.key === 'ban-dai-dien-cmhs') this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: this.serializeBanDaiDienCMHSRows() })
			if (card.key === 'can-bo-lop') this.form.CanBoLop = JSON.stringify({ version: 1, rows: this.serializeCanBoLopRows() })
		},
		handleChiTieuCardChange(card, event) {
			console.log('[Tab2 handleChiTieuCardChange]', card.key, event)
			if (!card || !event) return
			const colIndex = Number(event.x)
			console.log('[Tab2 colIndex]', colIndex, 'event.value:', event.value)
			if (colIndex !== 2) return

			const student = this.findSelectedStudent(event.value)
			console.log('[Tab2 found student]', student)
			if (!student) return
			if (card.key === 'ban-dai-dien-cmhs') this.fillBanDaiDienFamilyInfo(event, student)
			if (card.key === 'can-bo-lop') this.fillCanBoLopStudentID(event, student)
		},
		setSheetValue(event, x, y, value) {
			console.log('[Tab2 setSheetValue]', { x, y, value })
			try {
				if (!event) return
				const ws = event.worksheet || event.instance
				if (ws) {
					if (typeof ws.setValueFromCoords === 'function') {
						ws.setValueFromCoords(x, y, value, true)
					} else if (typeof ws.setValue === 'function') {
						ws.setValue(jspreadsheet.getColumnNameFromId([x, y]), value)
					}
				}
			} catch (error) {
				console.error('[Tab2 setSheetValue Error]', error)
			}
		},
		getStudentCode(student) {
			if (!student) return ''
			return student.MaHocSinh || student.HocSinhID || ''
		},
		fillCanBoLopStudentID(event, selectedStudent) {
			const student = selectedStudent || this.findSelectedStudent(event.value)
			if (!student) return
			const rowIndex = Number(event.y)
			const studentCode = this.getStudentCode(student)
			console.log('[Tab2 fillCanBoLopStudentID]', rowIndex, studentCode)
			this.setSheetValue(event, 1, rowIndex, studentCode)
			const card = this.getChiTieuCard('can-bo-lop')
			if (card && card.rows && card.rows[rowIndex]) {
				card.rows[rowIndex][1] = studentCode
				card.rows[rowIndex][2] = student.HoTen || card.rows[rowIndex][2]
			}
			this.form.CanBoLop = JSON.stringify({ version: 1, rows: this.serializeCanBoLopRows() })
		},
		getChiTieuCard(key) {
			return (this.chiTieuCards || []).find(card => card.key === key) || {}
		},
		applyStudentDropdownOptions() {
			const source = this.getSelectedClassStudents().map(student => student.HoTen).filter(Boolean)
			;['ban-dai-dien-cmhs', 'can-bo-lop'].forEach(key => {
				const card = this.getChiTieuCard(key)
				const column = (card.columns || []).find(col => col.name === 'HocSinh')
				if (column) column.source = source
			})
		},
		applyTeacherDropdownOptions() {
			const source = (this.allTeachers || []).map(t => t.text).filter(Boolean)
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			const column = (card.columns || []).find(col => col.name === 'GiaoVien')
			if (column) column.source = source
		},
		async getTeachersList() {
			try {
				const res = await ajaxCALLPromise('lms/GiaoVien_Get')
				if (Array.isArray(res)) {
					this.allTeachers = res.map(t => {
						const name = t.HoTenGV || ((t.HoGV || '') + ' ' + (t.TenGV || '')).trim()
						const phone = t.DienThoai || t.SoDienThoai || t.SDT || ''
						return {
							id: t.GiaoVienID,
							name: name,
							phone: phone,
							text: phone ? `${name} - ${phone}` : name
						}
					})
					this.applyTeacherDropdownOptions()
				}
			} catch (error) {
				console.error('getTeachersList error', error)
			}
		},
		getSelectedClassStudents() {
			if (this.selectedLopID === '__ALL__') return []
			return (this.allStudentRows || []).filter(x => String(x.LopID) === String(this.selectedLopID))
		},
		findSelectedStudent(value) {
			const text = this.cleanSheetValue(value)
			if (!text) return null
			const students = this.getSelectedClassStudents()
			console.log('[Tab2 findSelectedStudent]', text, 'Students count:', students.length)

			// Tìm theo Họ và tên, HocSinhID hoặc MaHocSinh
			const found = students.find(student =>
				this.cleanSheetValue(student.HoTen) === text
				|| `${student.HocSinhID || ''}` === text
				|| `${student.MaHocSinh || ''}` === text
			)
			if (found) return found

			return null
		},
		fillBanDaiDienFamilyInfo(event, selectedStudent) {
			const student = selectedStudent || this.findSelectedStudent(event.value)
			if (!student) return
			const rowIndex = Number(event.y)
			const family = this.getStudentFamilyCells(student)
			const studentCode = this.getStudentCode(student)
			console.log('[Tab2 fillBanDaiDienFamilyInfo]', rowIndex, studentCode, family)
			const updates = [
				{ x: 1, value: studentCode },
				{ x: 3, value: family.ChaMe },
				{ x: 4, value: family.NgheNghiep },
				{ x: 5, value: family.DienThoai }
			]
			updates.forEach(item => {
				this.setSheetValue(event, item.x, rowIndex, item.value)
			})
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (card && card.rows && card.rows[rowIndex]) {
				card.rows[rowIndex][1] = studentCode
				card.rows[rowIndex][2] = student.HoTen || card.rows[rowIndex][2]
				card.rows[rowIndex][3] = family.ChaMe
				card.rows[rowIndex][4] = family.NgheNghiep
				card.rows[rowIndex][5] = family.DienThoai
			}
			this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: this.serializeBanDaiDienCMHSRows() })
		},
		getStudentFamilyCells(student) {
			const parents = [
				student.Cha ? 'Cha: ' + student.Cha : '',
				student.Me ? 'Mẹ: ' + student.Me : ''
			].filter(Boolean).join('\n')
			const jobs = [
				student.NgheNghiepCha ? 'Cha: ' + student.NgheNghiepCha : '',
				student.NgheNghiepMe ? 'Mẹ: ' + student.NgheNghiepMe : ''
			].filter(Boolean).join('\n')
			const phones = [
				student.SDTCha ? 'Cha: ' + student.SDTCha : '',
				student.SDTMe ? 'Mẹ: ' + student.SDTMe : ''
			].filter(Boolean).join('\n')
			return { ChaMe: parents, NgheNghiep: jobs, DienThoai: phones }
		},
		enrichBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (!card.rows) return
			card.rows = card.rows.map(row => {
				const student = this.findSelectedStudent(row[2])
				if (!student) return row
				const family = this.getStudentFamilyCells(student)
				const code = this.getStudentCode(student)
				return [
					row[0],
					code || row[1],
					row[2],
					row[3] || family.ChaMe,
					row[4] || family.NgheNghiep,
					row[5] || family.DienThoai,
					row[6]
				]
			})
		},
		enrichCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			if (!card.rows) return
			card.rows = card.rows.map(row => {
				const student = this.findSelectedStudent(row[2])
				if (!student) return row
				const code = this.getStudentCode(student)
				return [
					row[0],
					code || row[1],
					row[2],
					row[3],
					row[4]
				]
			})
		},
		applySiSoRows() {
			const card = this.getChiTieuCard('theo-doi-si-so')
			if (!card.rows) return
			const savedRows = this.siSoSavedRows && this.siSoSavedRows.length
				? this.siSoSavedRows
				: this.parseSiSoSavedRows(this.form.SiSo)
			const defaultRows = [
				['Đầu năm', '', '', '', ''],
				['Cuối kì 1', '', '', '', ''],
				['Cuối kì 2', '', '', '', '']
			]
			card.rows = defaultRows.map(row => {
				const saved = savedRows.find(x => this.cleanSheetValue(x.Moc) === row[0]) || {}
				return [
					row[0],
					saved.SiSo || '',
					saved.Nam || '',
					saved.ChuyenDi || '',
					saved.ChuyenDen || ''
				]
			})
		},
		parseSiSoSavedRows(value) {
			if (!value) return []
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) return parsed
				if (Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		serializeChiTieuRows() {
			const rows = this.serializeChiTieuStructuredRows()
			return JSON.stringify({
				giaoDuc: rows.filter(row => row.LoaiChiTieu === 'GIAO_DUC'),
				danhHieu: rows.filter(row => row.LoaiChiTieu === 'DANH_HIEU'),
				phongTrao: rows.filter(row => row.LoaiChiTieu === 'PHONG_TRAO')
			})
		},
		serializeChiTieuStructuredRows() {
			const giaoDucCard = this.getChiTieuCard('chi-tieu-giao-duc')
			const danhHieuCard = this.getChiTieuCard('danh-hieu')
			const phongTraoCard = this.getChiTieuCard('hoat-dong-phong-trao')
			
			const giaoDucRows = (giaoDucCard.rows || []).map((row, index) => ({
				LoaiChiTieu: 'GIAO_DUC',
				MatGiaoDuc: this.cleanSheetCell(row, 0, 'MatGiaoDuc'),
				YeuCau: this.cleanSheetCell(row, 1, 'YeuCau'),
				Tot: this.cleanSheetNumber(this.cleanSheetCell(row, 2, 'Tot')),
				Kha: this.cleanSheetNumber(this.cleanSheetCell(row, 3, 'Kha')),
				Dat: this.cleanSheetNumber(this.cleanSheetCell(row, 4, 'Dat')),
				ChuaDat: this.cleanSheetNumber(this.cleanSheetCell(row, 5, 'ChuaDat')),
				BienPhap: this.cleanSheetCell(row, 6, 'BienPhap'),
				RowIndex: index + 1
			})).filter(row => row.MatGiaoDuc || row.YeuCau || row.Tot !== 0 || row.Kha !== 0 || row.Dat !== 0 || row.ChuaDat !== 0 || row.BienPhap)

			const danhHieuSourceRows = (danhHieuCard.rows && danhHieuCard.rows.length)
				? danhHieuCard.rows
				: [['', '', '', '']]
			const danhHieuRows = danhHieuSourceRows.map((row, index) => ({
				LoaiChiTieu: 'DANH_HIEU',
				YeuCau: this.cleanSheetCell(row, 0, 'YeuCau'),
				HSXS: this.cleanSheetNumber(this.cleanSheetCell(row, 1, 'HSXS')),
				HSG: this.cleanSheetNumber(this.cleanSheetCell(row, 2, 'HSG')),
				GhiChu: this.cleanSheetCell(row, 3, 'GhiChu'),
				RowIndex: index + 1
			}))

			const phongTraoRows = (phongTraoCard.rows || []).map((row, index) => {
				const yeuCau = this.cleanSheetCell(row, 0, 'YeuCau')
				const noiDung = this.cleanSheetCell(row, 1, 'NoiDung')
				const ghiChu = this.cleanSheetCell(row, 2, 'GhiChu')
				return {
					LoaiChiTieu: 'PHONG_TRAO',
					YeuCau: yeuCau,
					NoiDung: yeuCau || noiDung || ghiChu ? noiDung : ' ',
					GhiChu: ghiChu,
					RowIndex: index + 1
				}
			})

			return giaoDucRows.concat(danhHieuRows, phongTraoRows)
		},
		applyChiTieuRows() {
			const giaoDucCard = this.getChiTieuCard('chi-tieu-giao-duc')
			const danhHieuCard = this.getChiTieuCard('danh-hieu')
			const phongTraoCard = this.getChiTieuCard('hoat-dong-phong-trao')

			let parsed = {}
			if (this.chiTieuSavedRows && this.chiTieuSavedRows.length) {
				parsed = {
					giaoDuc: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'GIAO_DUC'),
					danhHieu: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'DANH_HIEU'),
					phongTrao: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'PHONG_TRAO')
				}
			} else if (this.form.ChiTieu) {
				try {
					parsed = JSON.parse(this.form.ChiTieu)
				} catch (e) {
					parsed = { text: this.form.ChiTieu }
				}
			}

			const defaultGiaoDuc = [
				['Kết quả rèn luyện', '', 0, 0, 0, 0, ''],
				['Kết quả học tập', '', 0, 0, 0, 0, '']
			]
			if (Array.isArray(parsed.giaoDuc)) {
				giaoDucCard.rows = defaultGiaoDuc.map(row => {
					const saved = parsed.giaoDuc.find(x => this.cleanSheetValue(x.MatGiaoDuc) === row[0]) || {}
					return [
						row[0],
						saved.YeuCau || '',
						this.cleanSheetNumber(saved.Tot),
						this.cleanSheetNumber(saved.Kha),
						this.cleanSheetNumber(saved.Dat),
						this.cleanSheetNumber(saved.ChuaDat),
						saved.BienPhap || ''
					]
				})
			} else {
				giaoDucCard.rows = defaultGiaoDuc
			}

			if (Array.isArray(parsed.danhHieu) && parsed.danhHieu.length) {
				danhHieuCard.rows = parsed.danhHieu.map(row => [
					row.YeuCau || '',
					row.HSXS || '',
					row.HSG || '',
					row.GhiChu || ''
				])
			} else {
				danhHieuCard.rows = [['', '', '', '']]
			}

			if (Array.isArray(parsed.phongTrao) && parsed.phongTrao.length) {
				let rows = parsed.phongTrao.map(row => [
					row.YeuCau || '',
					row.NoiDung || '',
					row.GhiChu || ''
				])
				while (rows.length < 10) {
					rows.push(['', '', ''])
				}
				phongTraoCard.rows = rows
			} else {
				phongTraoCard.rows = Array.from({ length: 10 }, () => ['', '', ''])
			}
		},
		parseChiTieuSavedRows(value) {
			if (!value) return []
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) return parsed
				if (Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		serializeSiSoRows() {
			const card = this.getChiTieuCard('theo-doi-si-so')
			return (card.rows || []).map(row => ({
				Moc: this.cleanSheetCell(row, 0, 'Moc'),
				SiSo: this.cleanSheetCell(row, 1, 'SiSo'),
				Nam: this.cleanSheetCell(row, 2, 'Nam'),
				ChuyenDi: this.cleanSheetCell(row, 3, 'ChuyenDi'),
				ChuyenDen: this.cleanSheetCell(row, 4, 'ChuyenDen')
			})).filter(row => row.Moc || row.SiSo || row.Nam || row.ChuyenDi || row.ChuyenDen)
		},
		cleanSheetCell(row, index, key) {
			if (Array.isArray(row)) return this.cleanSheetValue(row[index])
			if (!row || typeof row !== 'object') return ''
			return this.cleanSheetValue(row[key] ?? row[index])
		},
		applyGiaoVienBoMonRows() {
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			if (!card.rows) return
			const savedRows = this.giaoVienBoMonSavedRows && this.giaoVienBoMonSavedRows.length
				? this.giaoVienBoMonSavedRows
				: this.parseGiaoVienBoMonSavedRows(this.form.GiaoVienBoMon)
			let rows = savedRows.length
				? savedRows.map(row => [
					row.BoMon || '',
					row.HocKy || '',
					row.GiaoVien || '',
					row.ThayDoi || ''
				])
				: []
			while (rows.length < 20) {
				rows.push(['', '', '', ''])
			}
			card.rows = rows
			this.applyTeacherDropdownOptions()
		},
		async getGiaoVienBoMon() {
			if (!this.selectedClass?.LopID) return
			const savedRows = this.giaoVienBoMonSavedRows && this.giaoVienBoMonSavedRows.length
				? this.giaoVienBoMonSavedRows
				: this.parseGiaoVienBoMonSavedRows(this.form.GiaoVienBoMon)
			const apiRows = await this.fetchGiaoVienBoMonRows()
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			if (!card.rows) return
			if (!apiRows.length) {
				this.applyGiaoVienBoMonRows()
				return
			}
			let rows = apiRows.map(row => {
				const saved = savedRows.find(item =>
					this.cleanSheetValue(item.BoMon) === row.BoMon
					&& this.cleanSheetValue(item.HocKy) === row.HocKy
					&& this.cleanSheetValue(item.GiaoVien) === row.GiaoVien
				) || {}
				return [row.BoMon, row.HocKy, row.GiaoVien, saved.ThayDoi || '']
			})
			while (rows.length < 20) {
				rows.push(['', '', '', ''])
			}
			card.rows = rows
			this.applyTeacherDropdownOptions()
			this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: this.serializeGiaoVienBoMonRows() })
		},
		async fetchGiaoVienBoMonRows() {
			const baseParams = {
				LopID: this.selectedClass.LopID,
				NienKhoa: Number(this.currentNienKhoa || this.filter.NienKhoa || new Date().getFullYear()),
				ToGiangDayID: 0,
				GiaoVienID: '',
				VaiTro: 2
			}
			const chunks = await Promise.all([1, 2].map(hocKy => ajaxCALLPromise('lms/GiaoVienLop_Get_ByLopID', {
				...baseParams,
				HocKi: hocKy
			}).then(rows => (rows || []).map(row => ({ ...row, HocKy: hocKy }))).catch(() => [])))
			const map = new Map()
			chunks.flat().forEach(row => {
				if (Number(row.VaiTro || 0) === 1) return
				const item = {
					BoMon: row.MonHocName || '',
					HocKy: row.HocKy || row.HocKi || '',
					GiaoVien: row.HoTenGV || '',
					ThayDoi: ''
				}
				const key = [item.BoMon, item.HocKy, item.GiaoVien].join('|')
				if (item.BoMon || item.GiaoVien) map.set(key, item)
			})
			return [...map.values()].sort((a, b) => {
				if (`${a.HocKy}` !== `${b.HocKy}`) return `${a.HocKy}`.localeCompare(`${b.HocKy}`)
				return `${a.BoMon}`.localeCompare(`${b.BoMon}`)
			})
		},
		parseGiaoVienBoMonSavedRows(value) {
			if (!value) return []
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) return parsed
				if (Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return String(value).split(/\r?\n/).filter(Boolean).map(line => ({
					BoMon: '',
					HocKy: '',
					GiaoVien: line.trim(),
					ThayDoi: ''
				}))
			}
			return []
		},
		serializeGiaoVienBoMonRows() {
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			return (card.rows || []).map((row, index) => {
				const giaoVien = this.cleanSheetCell(row, 2, 'GiaoVien')
				const teacher = (this.allTeachers || []).find(item => item.text === giaoVien || item.name === giaoVien) || {}
				const hocKyValue = this.cleanSheetCell(row, 1, 'HocKy')
				return {
					BoMon: this.cleanSheetCell(row, 0, 'BoMon'),
					HocKy: String(hocKyValue).includes('2') ? 2 : (hocKyValue ? 1 : null),
					GiaoVienID: teacher.id || '',
					GiaoVien: giaoVien,
					ThayDoi: this.cleanSheetCell(row, 3, 'ThayDoi'),
					RowIndex: index + 1
				}
			}).filter(row => row.BoMon || row.HocKy || row.GiaoVien || row.ThayDoi)
		},
		applyBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (!card.rows) return
			const savedRows = this.banDaiDienCMHSSavedRows && this.banDaiDienCMHSSavedRows.length
				? this.banDaiDienCMHSSavedRows
				: this.parseSheetSavedRows(this.form.BanDaiDienCMHS)
			const len = Math.max(5, savedRows.length)
			card.rows = Array.from({ length: len }, (_, index) => {
				const saved = savedRows[index] || {}
				const student = this.findSelectedStudent(saved.HocSinh) || {}
				const studentCode = saved.HocSinhID || saved.MaHocSinh || this.getStudentCode(student) || ''
				return [
					saved.STT || index + 1,
					studentCode,
					saved.HocSinh || '',
					saved.ChaMe || '',
					saved.NgheNghiep || '',
					saved.DienThoai || '',
					saved.NhiemVu || ''
				]
			})
		},
		serializeBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			return (card.rows || []).map((row, index) => {
				const student = this.findSelectedStudent(this.cleanSheetCell(row, 2, 'HocSinh')) || {}
				return {
				STT: this.cleanSheetCell(row, 0, 'STT') || index + 1,
				HSLopID: student.HSLopID || '',
				HocSinhID: student.HocSinhID || '',
				MaHocSinh: this.cleanSheetCell(row, 1, 'HocSinhID') || student.MaHocSinh || student.HocSinhID || '',
				HocSinh: this.cleanSheetCell(row, 2, 'HocSinh'),
				ChaMe: this.cleanSheetCell(row, 3, 'ChaMe'),
				NgheNghiep: this.cleanSheetCell(row, 4, 'NgheNghiep'),
				DienThoai: this.cleanSheetCell(row, 5, 'DienThoai'),
				NhiemVu: this.cleanSheetCell(row, 6, 'NhiemVu'),
				RowIndex: index + 1
				}
			}).filter(row => row.HocSinh || row.ChaMe || row.NgheNghiep || row.DienThoai || row.NhiemVu)
		},
		applyCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			if (!card.rows) return
			const savedRows = this.canBoLopSavedRows && this.canBoLopSavedRows.length
				? this.canBoLopSavedRows
				: this.parseSheetSavedRows(this.form.CanBoLop)
			const len = Math.max(10, savedRows.length)
			card.rows = Array.from({ length: len }, (_, index) => {
				const saved = savedRows[index] || {}
				const student = this.findSelectedStudent(saved.HocSinh) || {}
				const studentCode = saved.HocSinhID || saved.MaHocSinh || this.getStudentCode(student) || ''
				return [
					saved.STT || index + 1,
					studentCode,
					saved.HocSinh || '',
					saved.ChucVu || '',
					saved.GhiChu || ''
				]
			})
		},
		serializeCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			return (card.rows || []).map((row, index) => {
				const student = this.findSelectedStudent(this.cleanSheetCell(row, 2, 'HocSinh')) || {}
				return {
				STT: this.cleanSheetCell(row, 0, 'STT') || index + 1,
				HSLopID: student.HSLopID || '',
				HocSinhID: student.HocSinhID || '',
				MaHocSinh: this.cleanSheetCell(row, 1, 'HocSinhID') || student.MaHocSinh || '',
				HocSinh: this.cleanSheetCell(row, 2, 'HocSinh'),
				ChucVu: this.cleanSheetCell(row, 3, 'ChucVu'),
				GhiChu: this.cleanSheetCell(row, 4, 'GhiChu'),
				RowIndex: index + 1
				}
			}).filter(row => row.HocSinh || row.ChucVu || row.GhiChu)
		},
		parseSheetSavedRows(value) {
			if (!value) return []
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) return parsed
				if (Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		async onExportExcel() {
			this.loading.export = true
			try {
				if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
					this.exportXlsx([
						{
							name: 'Dữ liệu HS lớp',
							aoa: this.buildStudentSheetExportAoA(),
							merges: this.buildStudentSheetExportMerges()
						},
						{
							name: 'XD chỉ tiêu_giải pháp',
							aoa: this.buildChiTieuExportAoA(),
							merges: this.buildChiTieuExportMerges()
						},
						{
							name: 'KH GD tháng_tuần',
							aoa: this.buildKeHoachThangTuanExportAoA(true),
							merges: this.buildKeHoachThangTuanExportMerges(true),
							cols: this.buildKeHoachThangTuanExportCols()
						},
						{
							name: 'Hồ sơ theo dõi QTRL của HS',
							aoa: this.buildRenLuyenExportAoA(),
							merges: this.buildRenLuyenExportMerges(),
							cols: this.buildRenLuyenExportCols()
						},
						{
							name: 'Sổ liên lạc điện tử',
							aoa: this.buildSoLienLacExportAoA(),
							merges: this.buildSoLienLacExportMerges(),
							cols: this.buildSoLienLacExportCols()
						},
						{
							name: 'Hướng nghiệp',
							aoa: this.buildHuongNghiepExportAoA(),
							merges: this.buildHuongNghiepExportMerges(),
							cols: this.buildHuongNghiepExportCols()
						}
					], 'SoGVCN_' + (this.selectedClass?.TenLop || this.selectedLopID) + '.xlsx')
					return
				}
				this.exportXlsx([
					{
						name: 'Dữ liệu HS lớp',
						aoa: this.buildStudentSheetExportAoA(),
						merges: this.buildStudentSheetExportMerges()
					}
				], 'SoGVCN_' + this.currentNienKhoa + '.xlsx')
			} finally {
				this.loading.export = false
			}
		},
		exportXlsx(sheets, fileName) {
			if (!window.XLSX) {
				this.notify('Chưa tải được thư viện xuất Excel')
				return
			}
			const workbook = XLSX.utils.book_new()
			;(sheets || []).forEach(sheet => {
				const worksheet = sheet.aoa
					? XLSX.utils.aoa_to_sheet(sheet.aoa)
					: XLSX.utils.json_to_sheet(sheet.rows || [])
				if (sheet.merges) worksheet['!merges'] = sheet.merges
				if (sheet.cols) worksheet['!cols'] = sheet.cols
				XLSX.utils.book_append_sheet(workbook, worksheet, this.safeSheetName(sheet.name))
			})
			XLSX.writeFile(workbook, this.normalizeFileName(fileName))
		},
		getKeHoachMonthRowCount() {
			return this.getKeHoachTaskLabels().length + 1
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
				const chuDeLines = (item.ChuDe || '').split(/\r?\n/)
				const mucTieuLines = (item.MucTieu || '').split(/\r?\n/)

				rows.push([
					month.label,
					chuDeLines[0] || '',
					mucTieuLines[0] || '',
					this.getKeHoachWeekValue(item.KeHoachTuan, '', 1, 0),
					this.getKeHoachWeekValue(item.KeHoachTuan, '', 2, 0),
					this.getKeHoachWeekValue(item.KeHoachTuan, '', 3, 0),
					this.getKeHoachWeekValue(item.KeHoachTuan, '', 4, 0),
					this.getKeHoachWeekValue(item.KeHoachTuan, '', 5, 0),
					item.DanhGia || ''
				])
				this.getKeHoachTaskLabels().forEach((label, idx) => {
					const rIdx = idx + 1
					rows.push([
						'',
						chuDeLines[rIdx] || '',
						mucTieuLines[rIdx] !== undefined ? mucTieuLines[rIdx] : label,
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 1, rIdx),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 2, rIdx),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 3, rIdx),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 4, rIdx),
						this.getKeHoachWeekValue(item.KeHoachTuan, label, 5, rIdx),
						''
					])
				})
			})

			return rows
		},
		buildKeHoachThangTuanExportMerges(includeGuidelines = false) {
			const merges = []
			const offset = includeGuidelines ? 8 : 0
			if (includeGuidelines) {
				merges.push(
					{ s: { r: 0, c: 2 }, e: { r: 0, c: 7 } },
					{ s: { r: 1, c: 2 }, e: { r: 1, c: 7 } },
					{ s: { r: 2, c: 2 }, e: { r: 2, c: 7 } },
					{ s: { r: 3, c: 2 }, e: { r: 3, c: 7 } },
					{ s: { r: 4, c: 2 }, e: { r: 4, c: 7 } },
					{ s: { r: 5, c: 2 }, e: { r: 5, c: 7 } },
					{ s: { r: 6, c: 2 }, e: { r: 6, c: 7 } },
					{ s: { r: 7, c: 2 }, e: { r: 7, c: 7 } }
				)
			}
			const rowCount = this.getKeHoachMonthRowCount()
			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + offset + (index * rowCount)
				merges.push({ s: { r: start, c: 0 }, e: { r: start + rowCount - 1, c: 0 } })
				merges.push({ s: { r: start, c: 8 }, e: { r: start + rowCount - 1, c: 8 } })
			})
			return merges
		},

		buildKeHoachThangTuanExportCols() {
			return [
				{ wch: 8 },
				{ wch: 28 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 34 }
			]
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
				for (let r = start; r < start + rowCount; r++) {
					cols.forEach(col => {
						style[col + r] = border + wrap
					})
					style['B' + r] = border + black + wrap
					style['C' + r] = border + black + wrap
				}
				style['A' + start] = border + center
				style['I' + start] = border + wrap
			})
			return style
		},
		initKeHoachSheet() {
			// Dùng setTimeout thay vì $nextTick để đảm bảo container đã có kích thước thực
			// (tương tự cách uc-jexcel gọi jspreadsheet trong mounted)
			const doInit = () => {
				const container = this.$refs.keHoachSheetRef
				if (!container) return
				if (this.keHoachSheetInstance) {
					try {
						const sheet = Array.isArray(this.keHoachSheetInstance) ? this.keHoachSheetInstance[0] : this.keHoachSheetInstance
						if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					} catch (e) {}
					this.keHoachSheetInstance = null
				}
				container.innerHTML = ''

				const data = this.buildKeHoachThangTuanExportAoA(false, true)
				const style = this.buildKeHoachSheetStyle(false)
				if (typeof jspreadsheet === 'function') {
					this.keHoachSheetInstance = jspreadsheet(container, {
						worksheets: [{
							data: data,
							columns: this.keHoachSheetColumns,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.keHoachSheetHeight,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							style: style,
							showHeader: true
						}],
						contextMenu: () => false,
						onload: () => this.onKeHoachSheetLoad()
					})
				}
			}
			setTimeout(doInit, 0)
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
				// Merge is cosmetic; keep the sheet usable if the runtime lacks this API.
			} finally {
				window.alert = originalAlert
			}
		},
		buildChiTieuExportAoA() {
			return [
				['XÂY DỰNG CHỈ TIÊU - GIẢI PHÁP GIÁO DỤC LỚP ' + (this.selectedClass?.TenLop || '') + ' NĂM HỌC ' + this.getCurrentSchoolYearText()],
				[''],
				[this.form.ChiTieu || '']
			]
		},
		buildChiTieuExportMerges() {
			return [
				{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }
			]
		},
		buildHuongNghiepExportAoA() {
			return [
				['', 'ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)', '', 'Hướng dẫn:'],
				['', '', '', '(1): Cập nhật môn HS dự kiến sẽ chọn thi TN cùng 2 môn bắt buộc'],
				['', '', '', '(2): Cập nhật dữ liệu từ phòng tham vấn (nếu có) hoặc qua tìm hiểu của GVCN'],
				this.huongNghiepColumns.map(x => x.title),
				...(this.huongNghiepRows || [])
			]
		},
		buildHuongNghiepExportMerges() {
			return [
				{ s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
				{ s: { r: 0, c: 3 }, e: { r: 0, c: 3 } },
				{ s: { r: 1, c: 3 }, e: { r: 1, c: 3 } },
				{ s: { r: 2, c: 3 }, e: { r: 2, c: 3 } }
			]
		},
		buildHuongNghiepExportCols() {
			return [
				{ wch: 6 },
				{ wch: 28 },
				{ wch: 34 },
				{ wch: 58 }
			]
		},
		buildRenLuyenExportAoA() {
			return [
				['', '', 'THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP ' + (this.selectedClass?.TenLop || '.......') + ' NĂM HỌC ' + this.getCurrentSchoolYearText()],
				['', '', this.getRenLuyenMonthNote()],
				this.renLuyenColumns.map(x => x.title),
				...(this.renLuyenRows || [])
			]
		},
		buildRenLuyenExportMerges() {
			return [
				{ s: { r: 0, c: 2 }, e: { r: 0, c: 20 } },
				{ s: { r: 1, c: 2 }, e: { r: 1, c: 20 } }
			]
		},
		buildRenLuyenExportCols() {
			return this.renLuyenColumns.map(col => ({ wch: Math.max(8, Math.round((col.width || 100) / 8)) }))
		},
		buildSoLienLacExportAoA() {
			return [
				['', '', 'NHẬN XÉT SỔ LIÊN LẠC HẰNG THÁNG'],
				['', '', this.getSoLienLacGuideline()],
				this.soLienLacColumns.map(x => x.title),
				...(this.soLienLacRows || [])
			]
		},
		buildSoLienLacExportMerges() {
			return [
				{ s: { r: 0, c: 2 }, e: { r: 0, c: 12 } },
				{ s: { r: 1, c: 2 }, e: { r: 1, c: 12 } }
			]
		},
		buildSoLienLacExportCols() {
			return this.soLienLacColumns.map(col => ({ wch: Math.max(8, Math.round((col.width || 100) / 8)) }))
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
			return ['', '', '', '', '']
		},
		getDefaultKeHoachChuDe(thang) {
			return Number(thang) === 8 ? 'Ổn định lớp, học tập nội quy' : ''
		},
		getKeHoachWeekValue(text, label, week, rowIdx = 0) {
			if (!text) return ''
			const lines = String(text).split(/\r?\n/)
			if (lines[rowIdx] !== undefined && lines[rowIdx].includes('\t')) {
				const cols = lines[rowIdx].split('\t')
				return cols[week - 1] || ''
			}
			const prefix = 'Tuần ' + week + ':'
			const line = lines.find(item => item.trim().startsWith(prefix))
			return line ? line.trim().slice(prefix.length).trim() : ''
		},
		findMonthPlan(thang) {
			return (this.monthList || []).find(x => Number(x.Thang) === Number(thang)) || {}
		},
		updateKeHoachSheetRows(rows) {
			this.keHoachSheetRows = rows || []
		},
		buildHuongNghiepRows() {
			const savedRows = this.huongNghiepSavedRows && this.huongNghiepSavedRows.length
				? this.huongNghiepSavedRows
				: this.parseHuongNghiepSavedRows(this.form.HuongNghiep)
			const studentRows = this.selectedLopID === '__ALL__'
				? []
				: (this.allStudentRows || []).filter(x => String(x.LopID) === String(this.selectedLopID))
			const rows = studentRows.map((student, index) => {
				const saved = savedRows.find(row => `${row.HSLopID || ''}` === `${student.HSLopID || ''}`)
					|| savedRows.find(row => `${row.HocSinhID || ''}` === `${student.HocSinhID || ''}`)
					|| savedRows.find(row => this.cleanSheetValue(row.HoTen) === this.cleanSheetValue(student.HoTen))
					|| {}
				return [
					index + 1,
					student.MaHocSinh || student.HocSinhID || saved.MaHocSinh || '',
					student.SoDanhBo || saved.SoDanhBo || '',
					student.HoTen || saved.HoTen || '',
					saved.MonThiTN || '',
					saved.KQTracNghiem || ''
				]
			})
			if (rows.length) return rows
			return Array.from({ length: 30 }, function (_, index) {
				const saved = savedRows[index] || {}
				return [
					index + 1,
					saved.MaHocSinh || '',
					saved.SoDanhBo || '',
					saved.HoTen || '',
					saved.MonThiTN || '',
					saved.KQTracNghiem || ''
				]
			})
		},
		updateHuongNghiepRows(rows) {
			this.huongNghiepRows = rows || []
			this.form.HuongNghiep = JSON.stringify({ version: 1, rows: this.serializeHuongNghiepRows() })
		},
		parseHuongNghiepSavedRows(value) {
			if (!value) return []
			try {
				const parsed = JSON.parse(value)
				if (Array.isArray(parsed)) return parsed
				if (Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				const lines = String(value).split(/\r?\n/).filter(Boolean)
				return lines.map(line => {
					const parts = line.split(':')
					return {
						HoTen: parts.length > 1 ? parts.shift().trim() : '',
						MonThiTN: '',
						KQTracNghiem: parts.join(':').trim()
					}
				})
			}
			return []
		},
		serializeHuongNghiepRows() {
			const sheet = Array.isArray(this.huongNghiepSheetInstance) ? this.huongNghiepSheetInstance[0] : this.huongNghiepSheetInstance
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.huongNghiepRows || [])
			const sourceStudents = this.selectedLopID === '__ALL__'
				? []
				: (this.allStudentRows || []).filter(x => String(x.LopID) === String(this.selectedLopID))
			return sourceRows.map((row, index) => {
				const student = sourceStudents[index] || {}
				return {
					STT: this.cleanSheetValue(this.getHuongNghiepCell(row, 0, 'STT')) || index + 1,
					HSLopID: student.HSLopID || '',
					HocSinhID: student.HocSinhID || '',
					MaHocSinh: this.cleanSheetValue(this.getHuongNghiepCell(row, 1, 'MaHocSinh')) || student.MaHocSinh || student.HocSinhID || '',
					SoDanhBo: this.cleanSheetValue(this.getHuongNghiepCell(row, 2, 'SoDanhBo')) || student.SoDanhBo || '',
					HoTen: this.cleanSheetValue(this.getHuongNghiepCell(row, 3, 'HoTen')),
					MonThiTN: this.cleanSheetValue(this.getHuongNghiepCell(row, 4, 'MonThiTN')),
					KQTracNghiem: this.cleanSheetValue(this.getHuongNghiepCell(row, 5, 'KQTracNghiem')),
					RowIndex: index + 1
				}
			}).filter(row => row.HoTen || row.MonThiTN || row.KQTracNghiem)
		},
		getHuongNghiepCell(row, index, key) {
			if (Array.isArray(row)) return row[index]
			if (!row || typeof row !== 'object') return ''
			return row[key] ?? row[index] ?? ''
		},
		parseKeHoachSheetRows() {
			const tabRefInstance = this.$refs.tabKeHoachRef?.getInstance ? this.$refs.tabKeHoachRef.getInstance() : null
			const inst = tabRefInstance || this.keHoachSheetInstance
			const sheet = Array.isArray(inst) ? inst[0] : inst
			const source = sheet && typeof sheet.getData === 'function'
				? sheet.getData()
				: (this.keHoachSheetRows && this.keHoachSheetRows.length
					? this.keHoachSheetRows
					: this.buildKeHoachThangTuanExportAoA(false, true))
			const rowCount = this.getKeHoachMonthRowCount()
			return this.getKeHoachExportMonths().map((month, index) => {
				const start = index * rowCount
				const row = source[start] || []
				const weekRows = source.slice(start, start + rowCount)
				
				// Gom dữ liệu kế hoạch các tuần 1..5 theo từng dòng (row)
				const keHoachTuan = weekRows.map(wRow => {
					return [wRow[3], wRow[4], wRow[5], wRow[6], wRow[7]].map(v => v || '').join('\t')
				}).join('\n')

				const chuDeList = weekRows.map(wRow => this.cleanSheetValue(wRow[1]))
				const mucTieuList = weekRows.map(wRow => this.cleanSheetValue(wRow[2]))

				// Bỏ các ô rỗng ở cuối để khi copy/paste hoặc lưu không sinh ra các ô xuống dòng thừa
				while (chuDeList.length > 0 && !chuDeList[chuDeList.length - 1]) chuDeList.pop()
				while (mucTieuList.length > 0 && !mucTieuList[mucTieuList.length - 1]) mucTieuList.pop()

				const danhGiaVal = weekRows.map(wRow => this.cleanSheetValue(wRow[8])).find(v => v) || ''

				return {
					SoGVCNID: this.form.SoGVCNID,
					Thang: month.value,
					ChuDe: chuDeList.join('\n'),
					MucTieu: mucTieuList.join('\n'),
					NhiemVu: chuDeList.find(x => x) || '',
					KeHoachTuan: keHoachTuan,
					DanhGia: danhGiaVal
				}
			})
		},
		cleanSheetValue(value) {
			return value == null ? '' : String(value).trim()
		},
		buildNhanXetGVCN(student) {
			const nhanXetChuanBiNienKhoa = this.htmlToPlainText(student?.NhanXetGVCN)
			const nhanXetVeHocSinh = this.htmlToPlainText(student?.NhanXetGVCN_VeHocSinh_HTML)
			const parts = []
			if (nhanXetChuanBiNienKhoa) parts.push('Nhận xét chuẩn bị niên khóa: ' + nhanXetChuanBiNienKhoa)
			if (nhanXetVeHocSinh) parts.push('Nhận xét về học sinh: ' + nhanXetVeHocSinh)
			return parts.join('\n\n')
		},
		htmlToPlainText(value) {
			if (value == null || value === '') return ''
			const container = document.createElement('div')
			container.innerHTML = String(value)
			return (container.innerText || container.textContent || '')
				.replace(/\u00a0/g, ' ')
				.replace(/[\u200B-\u200D\uFEFF]/g, '')
				.replace(/\n{3,}/g, '\n\n')
				.trim()
		},
		renderCheckedValue(value) {
			return value === true || value === 'true' || value === 1 || value === '1' || value === 'X' ? 'X' : ''
		},
		cleanSheetNumber(value) {
			if (value == null || value === '') return 0
			const num = Number(value)
			return isNaN(num) ? 0 : num
		},
		buildStudentSheetExportAoA() {
			const namHocDiem = (Number(this.currentNienKhoa || 0) - 1) + '-' + this.currentNienKhoa
			const headerRow = Array(this.studentSheetColumns.length).fill('')
			headerRow[6] = 'ĐTB môn cả năm ' + namHocDiem
			headerRow[18] = 'KQ ' + namHocDiem
			headerRow[20] = 'NHẬN XÉT CỦA GVCN ' + namHocDiem
			headerRow[21] = 'THÔNG TIN GIA ĐÌNH'
			return [
				headerRow,
				this.studentSheetColumns.map(x => x.title),
				...(this.studentSheetRows || [])
			]
		},
		buildStudentSheetExportMerges() {
			return [
				{ s: { r: 0, c: 6 }, e: { r: 0, c: 17 } },
				{ s: { r: 0, c: 18 }, e: { r: 0, c: 19 } },
				{ s: { r: 0, c: 21 }, e: { r: 0, c: 30 } }
			]
		},
		safeSheetName(name) {
			return this.replaceInvalidExcelChars(String(name || 'Sheet1'), ' ').substring(0, 31)
		},
		normalizeFileName(fileName) {
			return this.replaceInvalidExcelChars(String(fileName || 'SoGVCN.xlsx'), '_').split(' ').join('_')
		},
		replaceInvalidExcelChars(value, replacement) {
			const invalidChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '[', ']']
			let text = value
			invalidChars.forEach(ch => {
				text = text.split(ch).join(replacement)
			})
			return text
		},
		onSaveButtonClick() {
			if (this.tab === 'ke-hoach') {
				this.saveKeHoachSheet()
			} else {
				this.onSaveDraft()
			}
		},
		async onSaveDraft() {
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur()
			}
			[this.sheetInstance, this.renLuyenSheetInstance, this.soLienLacSheetInstance, this.huongNghiepSheetInstance].forEach(inst => {
				const sheet = Array.isArray(inst) ? inst[0] : inst
				if (sheet && typeof sheet.closeEditor === 'function') {
					try { sheet.closeEditor(true) } catch (e) {}
				}
			})
			this.loading.save = true
			try {
				if (this.tab === 'chi-tieu') {
					const chiTieuRows = this.serializeChiTieuStructuredRows()
					this.form.ChiTieu = this.serializeChiTieuRows()
					const siSoRows = this.serializeSiSoRows()
					const giaoVienBoMonRows = this.serializeGiaoVienBoMonRows()
					const banDaiDienCMHSRows = this.serializeBanDaiDienCMHSRows()
					const canBoLopRows = this.serializeCanBoLopRows()
					this.form.SiSo = JSON.stringify({ version: 1, rows: siSoRows })
					this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: giaoVienBoMonRows })
					this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: banDaiDienCMHSRows })
					this.form.CanBoLop = JSON.stringify({ version: 1, rows: canBoLopRows })
					await ajaxCALLPromise('lms/SoGVCNChiTieuSave', {
						SoGVCNID: this.form.SoGVCNID,
						JsonRows: JSON.stringify(chiTieuRows)
					})
					await ajaxCALLPromise('lms/SoGVCNPhuLucTab2Save', {
						SoGVCNID: this.form.SoGVCNID,
						JsonSiSo: JSON.stringify(siSoRows),
						JsonGiaoVienBoMon: JSON.stringify(giaoVienBoMonRows),
						JsonBanDaiDienCMHS: JSON.stringify(banDaiDienCMHSRows),
						JsonCanBoLop: JSON.stringify(canBoLopRows)
					})
					this.chiTieuSavedRows = chiTieuRows
					this.siSoSavedRows = siSoRows
					this.giaoVienBoMonSavedRows = giaoVienBoMonRows
					this.banDaiDienCMHSSavedRows = banDaiDienCMHSRows
					this.canBoLopSavedRows = canBoLopRows
				} else if (this.tab === 'huong-nghiep') {
					const huongNghiepRows = this.serializeHuongNghiepRows()
					this.form.HuongNghiep = JSON.stringify({ version: 1, rows: huongNghiepRows })
					await ajaxCALLPromise('lms/SoGVCNHuongNghiepSave', {
						SoGVCNID: this.form.SoGVCNID,
						JsonHuongNghiep: JSON.stringify(huongNghiepRows)
					})
					this.huongNghiepSavedRows = huongNghiepRows
				} else if (this.tab === 'ren-luyen') {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						await ajaxCALLPromise('lms/SoGVCNTheoDoiRenLuyenSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(this.serializeRenLuyenMonthlyRows())
						})
					}
				} else if (this.tab === 'so-lien-lac') {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						await ajaxCALLPromise('lms/SoGVCNNhanXetSoLienLacSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(this.serializeSoLienLacMonthlyRows())
						})
					}
				}
				if (this.detail) this.detail.TrangThai = this.detail.TrangThai === 'NEW' ? 'DRAFT' : this.detail.TrangThai
				if (this.selectedClass) this.selectedClass.TrangThai = this.selectedClass.TrangThai === 'NEW' ? 'DRAFT' : this.selectedClass.TrangThai
				const tabNames = {
					'chi-tieu': 'chỉ tiêu',
					'huong-nghiep': 'hướng nghiệp',
					'du-lieu-hs': 'dữ liệu HS lớp',
					'ren-luyen': 'hồ sơ theo dõi rèn luyện',
					'so-lien-lac': 'sổ liên lạc'
				}
				const tabLabel = tabNames[this.tab] || ''
				this.notify(tabLabel ? `Đã lưu ${tabLabel}` : 'Đã lưu')
			} finally {
				this.loading.save = false
			}
		},

		serializeRenLuyenMonthlyRows() {
			const sheet = Array.isArray(this.renLuyenSheetInstance) ? this.renLuyenSheetInstance[0] : this.renLuyenSheetInstance
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.renLuyenRows || [])
			const students = this.getSelectedClassStudents()
			const months = this.getMonthlySheetMonths()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				// Cột 4: HS cần hỗ trợ đặc biệt (Thang = 0)
				rows.push({ HSLopID: student.HSLopID, Thang: 0, NoiDung: this.cleanSheetValue(row[4]) })
				// Cột 5: Ban cán sự (Thang = 99)
				rows.push({ HSLopID: student.HSLopID, Thang: 99, NoiDung: this.cleanSheetValue(row[5]) })
				// Các tháng 8, 9, 10, 11, 12, 1, 3, 4, 5
				months.forEach(month => {
					rows.push({ HSLopID: student.HSLopID, Thang: month.thang, NoiDung: this.cleanSheetValue(row[month.index]) })
				})
				// Cột 11: NHẬN XÉT HKI (Thang = 91)
				rows.push({ HSLopID: student.HSLopID, Thang: 91, NoiDung: this.cleanSheetValue(row[11]) })
				// Cột 12: KQRL HKI (Thang = 81)
				rows.push({ HSLopID: student.HSLopID, Thang: 81, NoiDung: this.cleanSheetValue(row[12]) })
				// Cột 13: KQHT HKI (Thang = 82)
				rows.push({ HSLopID: student.HSLopID, Thang: 82, NoiDung: this.cleanSheetValue(row[13]) })
				// Cột 18: NHẬN XÉT HKII (Thang = 92)
				rows.push({ HSLopID: student.HSLopID, Thang: 92, NoiDung: this.cleanSheetValue(row[18]) })
				// Cột 19: KQRL HKII (Thang = 93)
				rows.push({ HSLopID: student.HSLopID, Thang: 93, NoiDung: this.cleanSheetValue(row[19]) })
				// Cột 20: KQHT HKII (Thang = 94)
				rows.push({ HSLopID: student.HSLopID, Thang: 94, NoiDung: this.cleanSheetValue(row[20]) })
				// Cột 21: DANH HIỆU (Thang = 95)
				rows.push({ HSLopID: student.HSLopID, Thang: 95, NoiDung: this.cleanSheetValue(row[21]) })
				// Cột 22: THÀNH TÍCH KHÁC (Thang = 96)
				rows.push({ HSLopID: student.HSLopID, Thang: 96, NoiDung: this.cleanSheetValue(row[22]) })
			})
			return rows
		},
		serializeSoLienLacMonthlyRows() {
			const sheet = Array.isArray(this.soLienLacSheetInstance) ? this.soLienLacSheetInstance[0] : this.soLienLacSheetInstance
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.soLienLacRows || [])
			const students = this.getSelectedClassStudents()
			const months = this.getSoLienLacMonths()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				// Lưu nhận xét các tháng 8..12, 1, 3..5
				months.forEach(month => {
					rows.push({
						HSLopID: student.HSLopID,
						Thang: month.thang,
						NhanXet: this.cleanSheetValue(row[month.index])
					})
				})
				// Cột 9: NHẬN XÉT HKI (Thang = 91)
				rows.push({ HSLopID: student.HSLopID, Thang: 91, NhanXet: this.cleanSheetValue(row[9]) })
				// Cột 14: NHẬN XÉT HKII (Thang = 92)
				rows.push({ HSLopID: student.HSLopID, Thang: 92, NhanXet: this.cleanSheetValue(row[14]) })
			})
			return rows
		},

		async saveKeHoachSheet() {
			if (!this.form.SoGVCNID) return
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur()
			}
			const tabRefInstance = this.$refs.tabKeHoachRef?.getInstance ? this.$refs.tabKeHoachRef.getInstance() : null
			const inst = tabRefInstance || this.keHoachSheetInstance
			const sheet = Array.isArray(inst) ? inst[0] : inst
			if (sheet && typeof sheet.closeEditor === 'function') {
				try { sheet.closeEditor(true) } catch (e) {}
			}
			// Đợi DOM flush sau closeEditor trước khi đọc getData()
			await this.$nextTick()
			this.loading.month = true
			try {
				const rows = this.parseKeHoachSheetRows()
				await Promise.all(rows.map(row => ajaxCALLPromise('lms/SoGVCNKeHoachThangSave', row)))
				this.initKeHoachSheet()
				this.notify('Đã lưu kế hoạch tháng')
			} finally {
				this.loading.month = false
			}
		}
	}
	}
</script>