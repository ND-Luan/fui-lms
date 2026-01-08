<template>
	<v-card>
		<v-card-title>
			{{ pageTitle }} • {{ vueData.TitleCap }}
		</v-card-title>

		<v-card-text>
			<uc-filter v-model="filter" @onRefresh="onRefresh" />
		</v-card-text>
		<v-divider />
		<v-card-text class="d-flex mt-2">
			<div>
				<p>Tổng số học sinh: {{DSHocSinh.length}}</p>
				*Lưu ý:
			</div>
			<v-spacer />
			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn color="primary" v-bind="props" icon="" size="small" variant="outlined" />
				</template>
				<v-list>
					<v-list-item title="Xuất Excel" @click="onExportExcel" />
					<v-list-item title="Lưu tạm" @click="onLuuTam" />
					<v-list-item title="Khóa cột điểm" @click="onKhoaCotDiem" />
					<v-list-item title="Gửi BGH" @click="onGuiBGH" />
					<!-- <v-list-item title="" /> -->
				</v-list>
			</v-menu>
		</v-card-text>
		<v-card-text>
			<uc-jexcel v-if="hasStudents" :key="keyComp" v-model="vueData.instance" v-model:dataSource="DSHocSinh"
				class="height-excel" :freeze-columns="freezeColumns" :columns="headers" :comments="comments"
				:styleSheet="styleSheet" :nestedHeaders="shouldShowNestedHeaders ? nestedHeaders : []"
				:rootDataSource="DSHocSinh_API" />
			<uc-card-empty v-else />
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		name: 'GradeEntryComponent',
	
		props: [],
	
		data() {
			return {
				vueData,
				filter: {
					KhoiItem: null,
					LopItem: null,
					MonHocItem: null,
					MaNhomCotDiemItem: null
				},
				DSHocSinh_API: [],
				DSHocSinh: [],
				DataExcel: [],
				headers: [],
				nestedHeaders: [],
				freezeColumns: 3,
				comments: {},
				styleSheet: {},
				instance: null,
				keyComp: 0,
				// Constants - Định nghĩa các hằng số
				SUBJECT_IDS: {
					ENGLISH_5: 5,
					ENGLISH_46: 46,
					ENGLISH_76: 76,
					STEM_36: 36,
					GROUP_101: 101
				},
				ENGLISH_SUBJECTS: [5, 46, 76],
				GROUP_SUBJECTS: [101, 76],
				COLUMN_TYPES: {
					NUMBER: 'number',
					TEXT: 'text',
					ICO_STAR: 'ICO_Star',
					DROPDOWN_TEXT: 'Dropdown_text',
					DROPDOWN_THC: 'Dropdown_THC',
					DROPDOWN_TDC: 'Dropdown_TDC',
					DROPDOWN_CD_D: 'Dropdown_CD_D'
				},
				FORMULA_COLUMN: 'Công thức',
				CENTER_ALIGN_COLUMNS: [
					'MucDoDanhGia',
					'DiemGK_HK2',
					'DiemGK_HK1',
					'DiemCK_HK1',
					'Theme1_Result',
					'Theme2_Result',
					'Theme3_Result',
					'Theme4_Result',
					'Theme5_Result',
					'Theme6_Result',
					'Theme7_Result',
					'Theme8_Result'
				]
			};
		},
	
		computed: {
			pageTitle() {
				return this.vueData.TitlePage || 'Nhập điểm';
			},
	
			hasStudents() {
				return this.DSHocSinh?.length > 0;
			},
	
			currentSubjectId() {
				return this.filter.MonHocItem?.MonHocID;
			},
	
			isEnglishSubject() {
				return this.ENGLISH_SUBJECTS.includes(this.currentSubjectId);
			},
	
			isGroupSubject() {
				return this.GROUP_SUBJECTS.includes(this.currentSubjectId);
			},
	
			isDisabled() {
				return this.vueData.TinhTrang?.isDisabled ?? false;
			},
	
			shouldShowNestedHeaders() {
				return this.filter.MaNhomCotDiemItem?.MaNhomCotDiem === 'TatCa';
			}
		},
		watch: {
			filter: {
				handler(filter) {
					console.log("watch", filter)
					if (filter.KhoiItem === null ||
						filter.LopItem === null ||
						filter.MonHocItem === null ||
						filter.MaNhomCotDiemItem === null
					) {
						this.DSHocSinh_API = []
						this.DSHocSinh = []
						this.keyComp++
					}
				},
				deep: true
			}
		},
		methods: {
			/**
			 * Refresh dữ liệu và khởi tạo lại bảng điểm
			 */
			async onRefresh() {
				await this.fetchStudentData();
				this.processStudentList();
				this.initFreezeColumn();
				this.initHeader();
				this.initData();
				this.initComment_Style();
				this.keyComp++
			},
	
			/**
			 * Lấy dữ liệu học sinh và điểm từ API
			 */
			async fetchStudentData() {
				this.DSHocSinh_API = await ajaxCALLPromise(
					"lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom",
					{
						LopID: this.filter.LopItem.LopID,
						MonHocID: this.currentSubjectId,
						TemplateBangDiemID: this.filter.MonHocItem.TemplateBangDiemID,
						MaNhomCotDiem: this.filter.MaNhomCotDiemItem.MaNhomCotDiem,
					}
				);
			},
	
			/**
			 * Xử lý danh sách học sinh duy nhất từ dữ liệu API
			 */
			processStudentList() {
				const uniqueStudentIds = [...new Set(this.DSHocSinh_API.map(x => x.HocSinhID))];
	
				this.DSHocSinh = uniqueStudentIds.map(id => {
					const student = this.DSHocSinh_API.find(y => y.HocSinhID === id);
					return {
						Ho: student.Ho,
						HocSinhID: student.HocSinhID,
						NgaySinh: student.NgaySinh,
						Nu: student.Nu,
						SoDanhBo: student.SoDanhBo,
						Ten: student.Ten,
						TinhTrang: student.TinhTrang,
					};
				});
			},
	
			/**
			 * Khởi tạo số cột cố định (freeze columns) dựa trên môn học
			 */
			initFreezeColumn() {
				const subjectId = this.currentSubjectId;
	
				if (subjectId === this.SUBJECT_IDS.ENGLISH_5 || subjectId === this.SUBJECT_IDS.ENGLISH_46) {
					this.freezeColumns = this.isEnglishSubject ? 4 : 3;
				} else if (subjectId === this.SUBJECT_IDS.ENGLISH_76) {
					this.freezeColumns = this.isEnglishSubject ? 5 : 3;
				} else if (subjectId === this.SUBJECT_IDS.GROUP_101) {
					this.freezeColumns = 4;
				} else {
					this.freezeColumns = 3;
				}
	
				this.vueData.freezeColumns = this.freezeColumns;
			},
	
			/**
			 * Khởi tạo headers cho bảng jexcel
			 */
			initHeader() {
				const firstStudent = fn_ProrityTinhTrang(this.DSHocSinh);
				const gradeColumns = this.DSHocSinh_API.filter(
					item => item.HocSinhID === firstStudent.HocSinhID
				);
	
				window.DSCotDiem_ByMaNhomCotDiem = gradeColumns;
	
				this.nestedHeaders = this.buildNestedHeaders(gradeColumns);
				this.headers = [
					...this.buildStudentInfoColumns(),
					...this.buildGradeColumns(gradeColumns)
				];
			},
	
			/**
			 * Xây dựng nested headers cho các nhóm cột điểm
			 */
			buildNestedHeaders(gradeColumns) {
				const groupNames = [...new Set(this.DSHocSinh_API.map(x => x.MaNhomCotDiem))];
	
				const nestedHeader = [{
					title: 'Thông tin học sinh',
					colspan: this.freezeColumns + (this.isGroupSubject ? 1 : 0)
				}];
	
				groupNames.forEach(groupName => {
					const matchingColumn = gradeColumns.find(col => col.MaNhomCotDiem === groupName);
					const columnCount = gradeColumns.filter(col => col.MaNhomCotDiem === groupName).length;
	
					nestedHeader.push({
						title: matchingColumn.TenNhomCotDiem_VI,
						colspan: columnCount
					});
				});
	
				return [nestedHeader];
			},
	
			/**
			 * Xây dựng các cột thông tin học sinh
			 */
			buildStudentInfoColumns() {
				const baseColumns = [
					{
						type: 'text',
						title: 'Mã học sinh',
						name: 'HocSinhID',
						width: 100,
						backGroundColor: null,
						wrap: true,
						readOnly: true
					},
					{
						type: 'text',
						title: 'Số Danh Bộ',
						name: 'SoDanhBo',
						width: 100,
						backGroundColor: null,
						wrap: true,
						readOnly: true
					},
					{
						type: 'text',
						title: 'Họ tên học sinh',
						name: 'HoVaTenHocSinh',
						width: 200,
						backGroundColor: null,
						wrap: true,
						align: "left",
						readOnly: true
					}
				];
	
				if (this.isGroupSubject) {
					baseColumns.push({
						type: 'text',
						title: 'Lớp chủ nhiệm',
						name: 'TenLop',
						width: 70,
						backGroundColor: null,
						wrap: true,
						align: "left",
						readOnly: true
					});
				}
	
				if (this.isEnglishSubject) {
					baseColumns.push({
						type: 'text',
						title: 'English Name',
						name: 'EnglishName',
						width: 100,
						backGroundColor: null,
						wrap: true,
						align: "left",
						readOnly: true
					});
				}
	
				return baseColumns;
			},
	
			/**
			 * Xây dựng các cột điểm
			 */
			buildGradeColumns(gradeColumns) {
				return gradeColumns.map(column => {
					const columnConfig = {
						title: this.isEnglishSubject ? column.TenHienThi_EN : column.TenHienThi_VI,
						name: column.MaCotDiem,
						width: column.WidthCSS,
						typeValue: column.GiaTriCotDiem,
						backGroundColor: column.HexBackground,
						wrap: true,
						readOnly: this.isColumnReadOnly(column)
					};
	
					return this.buildColumnByType(column.GiaTriCotDiem, columnConfig, column);
				});
			},
	
			/**
			 * Kiểm tra cột có readonly không
			 */
			isColumnReadOnly(column) {
				return column.LoaiCotDiem === this.FORMULA_COLUMN || this.isDisabled;
			},
	
			/**
			 * Xây dựng cấu hình cột theo loại
			 */
			buildColumnByType(valueType, baseConfig, columnData) {
				const columnBuilders = {
					[this.COLUMN_TYPES.NUMBER]: () => ({
						...baseConfig,
						type: 'numeric',
						decimal: '.',
						autoWidth: true,
						align: 'center'
					}),
	
					[this.COLUMN_TYPES.TEXT]: () => ({
						...baseConfig,
						type: 'text',
						align: this.shouldCenterAlign(columnData.MaCotDiem) ? 'center' : 'left'
					}),
	
					[this.COLUMN_TYPES.ICO_STAR]: () => ({
						...baseConfig,
						type: 'html',
						align: 'center'
					}),
	
					[this.COLUMN_TYPES.DROPDOWN_TEXT]: () => ({
						...baseConfig,
						type: 'dropdown',
						align: 'center',
						source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }]
					}),
	
					[this.COLUMN_TYPES.DROPDOWN_THC]: () => ({
						...baseConfig,
						type: 'dropdown',
						align: 'center',
						source: ['T', 'H', 'C']
					}),
	
					[this.COLUMN_TYPES.DROPDOWN_TDC]: () => ({
						...baseConfig,
						type: 'dropdown',
						align: 'center',
						source: ['T', 'Đ', 'C']
					}),
	
					[this.COLUMN_TYPES.DROPDOWN_CD_D]: () => ({
						...baseConfig,
						type: 'dropdown',
						align: 'center',
						source: ['CĐ', 'Đ']
					})
				};
	
				const builder = columnBuilders[valueType];
				return builder ? builder() : baseConfig;
			},
	
			/**
			 * Kiểm tra cột có cần căn giữa không
			 */
			shouldCenterAlign(columnCode) {
				return this.CENTER_ALIGN_COLUMNS.some(col => columnCode.includes(col));
			},
	
			/**
			 * Khởi tạo dữ liệu cho bảng jexcel
			 */
			initData() {
				const dataJexcel = [];
				let rowIndex = 1;
	
				this.DSHocSinh.forEach(student => {
					const gradeColumns = this.DSHocSinh_API.filter(
						col => col.HocSinhID === student.HocSinhID
					);
	
					if (gradeColumns.length === 0) return;
	
					const rowData = this.buildRowData(gradeColumns, rowIndex);
					dataJexcel.push(rowData);
					rowIndex++;
				});
	
				this.DSHocSinh = dataJexcel;
			},
	
			/**
			 * Xây dựng dữ liệu cho một hàng
			 */
			buildRowData(gradeColumns, rowIndex) {
				const firstColumn = gradeColumns[0];
				const rowData = {
					HocSinhID: firstColumn.HocSinhID,
					HoVaTenHocSinh: `${firstColumn.Ho} ${firstColumn.Ten}`,
					SoDanhBo: firstColumn.SoDanhBo
				};
	
				if (this.isGroupSubject) {
					rowData.TenLop = firstColumn.TenLop;
				}
	
				if (this.isEnglishSubject) {
					rowData.EnglishName = firstColumn.EnglishName;
				}
	
				gradeColumns.forEach(column => {
					rowData[column.MaCotDiem] = this.processColumnValue(column, gradeColumns, rowIndex);
				});
	
				return rowData;
			},
	
			/**
			 * Xử lý giá trị của cột
			 */
			processColumnValue(column, allColumns, rowIndex) {
				if (column.LoaiCotDiem !== this.FORMULA_COLUMN) {
					return this.processNonFormulaValue(column);
				}
	
				return this.processFormulaValue(column, allColumns, rowIndex);
			},
	
			/**
			 * Xử lý giá trị cột không phải công thức
			 */
			processNonFormulaValue(column) {
				if (column.GiaTriCotDiem === this.COLUMN_TYPES.NUMBER) {
					const value = column.KetQuaDanhGia_VI;
					return (value === '' || value === null) ? null : parseFloat(value);
				}
	
				let value = column.KetQuaDanhGia_VI;
	
				// Set default value cho cột Mức độ đánh giá
				if (column.MaCotDiem.includes('MucDoDanhGia') && column.KQHTID === 0) {
					if (!value) value = 'T';
				}
	
				return value;
			},
	
			/**
			 * Xử lý giá trị cột có công thức
			 */
			processFormulaValue(column, allColumns, rowIndex) {
				if (!column.Formula) {
					return column.GiaTriCotDiem === this.COLUMN_TYPES.NUMBER
						? parseFloat(column.KetQuaDanhGia_VI ?? 0)
						: column.KetQuaDanhGia_VI;
				}
	
				// Các trường hợp đặc biệt hiển thị giá trị đã tính
				if (this.shouldDisplayCalculatedValue(column, allColumns)) {
					return column.KetQuaDanhGia_VI;
				}
	
				// Xây dựng chuỗi công thức
				if (column.GiaTriCotDiem === this.COLUMN_TYPES.ICO_STAR) {
					return parseFloat(column.KetQuaDanhGia_VI ?? 0);
				}
	
				return '=' + replaceFormula(
					this.headers.filter(h => h.typeValue),
					column.Formula,
					rowIndex,
					this.freezeColumns
				);
			},
	
			/**
			 * Kiểm tra có nên hiển thị giá trị đã tính không
			 */
			shouldDisplayCalculatedValue(column, allColumns) {
				const groupCode = this.vueData.MaNhomCotDiemItem?.MaNhomCotDiem;
	
				// Kiểm tra cột tổng kết
				if (['DiemTBCK_HK1', 'DiemTBCK_HK2'].includes(groupCode)) {
					if (!['DiemTBCK_HK1', 'DiemTBCK_HK2'].includes(column.MaCotDiem) &&
						!column.MaCotDiem.includes('DanhHieu')) {
						return true;
					}
				}
	
				// Kiểm tra kết quả chủ đề tiếng Anh
				if (this.isEnglishSubject && isGetResultTopic(column)) {
					return true;
				}
	
				// Kiểm tra môn STEM
				if (groupCode?.includes('DiemCK') && this.currentSubjectId === this.SUBJECT_IDS.STEM_36) {
					if (['TongDiem_CD1', 'TongDiem_CD2', 'TongDiem_CD3'].some(x => column.MaCotDiem.includes(x))) {
						return true;
					}
				}
	
				// Trường hợp chỉ có 1 cột
				if (allColumns.length === 1) {
					return true;
				}
	
				return false;
			},
	
			/**
			 * Khởi tạo comment và style cho các ô
			 */
			initComment_Style() {
				const firstStudent = this.DSHocSinh[0];
				if (!firstStudent) return;
	
				const gradeColumns = this.DSHocSinh_API.filter(
					col => col.HocSinhID === firstStudent.HocSinhID
				);
	
				this.styleSheet = {};
				this.comments = {};
	
				this.applyBackgroundStyles(gradeColumns);
				this.applyComments(gradeColumns);
			},
	
			/**
			 * Áp dụng style background cho các ô
			 */
			applyBackgroundStyles(gradeColumns) {
				this.DSHocSinh.forEach((row, rowIndex) => {
					gradeColumns.forEach((column, colIndex) => {
						const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
							colIndex + this.freezeColumns,
							rowIndex
						);
	
						// Áp dụng màu nền của cột
						if (column.HexBackground) {
							this.styleSheet[cellAddress] = `background-color: ${column.HexBackground}`;
						}
	
						// Highlight các ô trống
						const value = row[column.MaCotDiem];
						if (value === null || value === '') {
							this.styleSheet[cellAddress] = 'background-color: #ffff0052';
						}
					});
				});
			},
	
			/**
			 * Áp dụng comments cho các ô
			 */
			applyComments(gradeColumns) {
				this.DSHocSinh.forEach((row, rowIndex) => {
					gradeColumns.forEach((column, colIndex) => {
						const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
							colIndex + this.freezeColumns,
							rowIndex
						);
	
						const commentData = this.DSHocSinh_API.find(
							x => x.HocSinhID === row.HocSinhID &&
								x.MaCotDiem === column.MaCotDiem &&
								x.Is_Comment
						);
	
						if (commentData) {
							this.comments[cellAddress] = `Cột điểm do ${commentData.NhapDiemUser} đã nhập`;
						}
					});
				});
			},
	
			/**
			 * Khởi tạo dữ liệu cho Excel export
			 */
			initExcel() {
				this.DataExcel = [];
				let rowIndex = 2;
	
				this.DSHocSinh.forEach(student => {
					const gradeColumns = this.DSHocSinh_API.filter(
						col => col.HocSinhID === student.HocSinhID
					);
	
					if (gradeColumns.length === 0) return;
	
					const excelRow = this.buildRowData(gradeColumns, rowIndex);
					this.DataExcel.push(excelRow);
					rowIndex++;
				});
			},
			onExportExcel() {
	
			},
			onLuuTam() {
	
			},
			onKhoaCotDiem() {
	
			},
			onGuiBGH() {
	
			}
		}
	}
</script>