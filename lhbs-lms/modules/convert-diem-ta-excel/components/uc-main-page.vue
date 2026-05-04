<template>
	<div class="wrapper-jexcel">
		<v-row>
			<v-col cols="2">
				<v-text-field label="Mã nhóm cột điểm" v-model="MaNhomCotDiem"></v-text-field>
				<v-btn @click="updateColumns">Update columns</v-btn>
			</v-col>
			<v-col cols="12">
				<div ref="spreadsheet" class="w-100 mt-2"></div>
			</v-col>
		</v-row>
		<div class="mt-3">
			<v-btn @click="getSheetData" color="primary">Lấy Dữ Liệu</v-btn>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				spreadsheetInstance: null,
				MaNhomCotDiem: 'x',
				baseColumns: [
					{ title: "STT", value: "STT", type: "text" },
					{ title: "Student ID", value: "HocSinhID", type: "text" },
					{ title: "Class", value: "Class", type: "text" },
					{ title: "Group", value: "Group", type: "text" },
					{ title: "Surname", value: "Surname", type: "text" },
					{ title: "Name", value: "Name", type: "text" },
					{ title: "English name", value: "EnglishName", type: "text" },
					{ title: "GVVN", value: "GVVN", type: "text" }
				],
				dynamicColumns: [],
				columns: [],
				initialData: []
			}
		},
		methods: {
			// Chuyển đổi số từ dạng "0,1" sang "0.1"
			convertNumberFormat(value) {
				if (typeof value === 'string' && value.includes(',')) {
					return value.replace(',', '.');
				}
				return value;
			},
	
			// Chuyển đổi toàn bộ dữ liệu số
			convertDataNumberFormat(data) {
				return data.map(item => {
					const convertedItem = { ...item };
	
					const numberColumns = [
						`${this.MaNhomCotDiem}_EC`,
						`${this.MaNhomCotDiem}_MJ`,
						`${this.MaNhomCotDiem}_HT`,
						`${this.MaNhomCotDiem}_1V1`,
						`${this.MaNhomCotDiem}_DEAR`,
						`${this.MaNhomCotDiem}_PWW`,
						`${this.MaNhomCotDiem}_TST`,
						`${this.MaNhomCotDiem}_BNS_VNM`,
						`${this.MaNhomCotDiem}_BNS_EXP`,
						`${this.MaNhomCotDiem}_Total`
					];
	
					numberColumns.forEach(col => {
						if (convertedItem[col]) {
							convertedItem[col] = this.convertNumberFormat(convertedItem[col]);
						}
					});
	
					return convertedItem;
				});
			},
	
			// Cập nhật cột động khi thay đổi MaNhomCotDiem
			updateColumns() {
				if (!this.MaNhomCotDiem) {
					this.columns = this.baseColumns;
					return;
				}
	
				const columnsCotDiem = [
					{
						title: `${this.MaNhomCotDiem}_EC`, value: `${this.MaNhomCotDiem}_EC`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_MJ`, value: `${this.MaNhomCotDiem}_MJ`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_HT`, value: `${this.MaNhomCotDiem}_HT`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_1V1`, value: `${this.MaNhomCotDiem}_1V1`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_DEAR`, value: `${this.MaNhomCotDiem}_DEAR`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_PWW`, value: `${this.MaNhomCotDiem}_PWW`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_TST`, value: `${this.MaNhomCotDiem}_TST`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_BNS_VNM`, value: `${this.MaNhomCotDiem}_BNS_VNM`, type: "number", width: 100, decimal:
							'.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_BNS_EXP`, value: `${this.MaNhomCotDiem}_BNS_EXP`, type: "number", width: 100, decimal:
							'.',
						mask: '0.00',
					},
					{
						title: `${this.MaNhomCotDiem}_Total`, value: `${this.MaNhomCotDiem}_Total`, type: "number", width: 100, decimal: '.',
						mask: '0.00',
					}
				];
	
				this.dynamicColumns = columnsCotDiem;
				this.columns = [...this.baseColumns, ...this.dynamicColumns];
	
				// Nếu spreadsheet đã được khởi tạo, cập nhật lại cột
				if (this.spreadsheetInstance) {
					this.reinitializeSpreadsheet();
				}
			},
	
			// Khởi tạo lại spreadsheet khi thay đổi cột
			reinitializeSpreadsheet() {
				// Hủy instance cũ nếu tồn tại
				if (this.spreadsheetInstance) {
					jspreadsheet.destroy(this.$refs.spreadsheet);
				}
	
				// Khởi tạo lại
				this.$nextTick(() => {
					// Chuyển đổi định dạng số trước khi đẩy vào sheet
					const convertedData = this.convertDataNumberFormat(this.initialData);
	
					this.spreadsheetInstance = jspreadsheet(this.$refs.spreadsheet, {
						worksheets: [{
							data: this.convertObjectToSheetData(convertedData),
							columns: this.columns,
							rowResize: true,
							columnDrag: true,
							minDimensions: [this.columns.length, 10],
						}]
					});
				});
			},
	
			// Chuyển đổi từ array object sang mảng 2 chiều để hiển thị trên sheet
			convertObjectToSheetData(objectArray) {
				const columns = this.columns;
	
				return objectArray.map(obj =>
					columns.map(col => obj[col.value] || '')
				);
			},
	
			// Lấy dữ liệu sheet và chuyển về dạng array object
			getSheetData() {
				if (this.spreadsheetInstance) {
					const sheetData = this.spreadsheetInstance[0].getData();
					const columns = this.spreadsheetInstance[0].getConfig().columns;
	
					const objectArray = sheetData.map((row) => {
						const rowObject = {};
	
						columns.forEach((col, colIndex) => {
							// Chuyển ngược lại từ dấu chấm sang dấu phẩy
							let cellValue = row[colIndex];
							if (col.value.startsWith(`${this.MaNhomCotDiem}_`) && typeof cellValue === 'string') {
								cellValue = cellValue.replace('.', ',');
							}
							rowObject[col.value] = cellValue;
						});
	
						return rowObject;
					});
	
					const result = []
					for (var item of objectArray) {
						for (var key in item) {
							if (key.includes(this.MaNhomCotDiem)) {
								result.push({
									HocSinhID: item.HocSinhID,
									TenLop: item.Class,
									TenNhom: item.Group,
									MaNhomCotDiem: this.MaNhomCotDiem,
									MaCotDiem: key,
									KetQuaDanhGia: item[key].includes(',') ? item[key].replace(',', '.') : item[key]
								})
							}
						}
					}
	
					console.log('result', result)
				}
			},
	
			// Phương thức để đẩy dữ liệu từ array object vào sheet
			setSheetData(objectArray) {
				if (this.spreadsheetInstance) {
					// Chuyển đổi sang mảng 2 chiều
					const sheetData = this.convertObjectToSheetData(objectArray);
	
					// Đẩy dữ liệu vào sheet
					this.spreadsheetInstance[0].setData(sheetData);
				}
			}
		},
		mounted() {
			// Đặt cột mặc định ban đầu
			this.columns = this.baseColumns;
			this.MaNhomCotDiem = 'x'; // Đặt giá trị mặc định
	
			this.$nextTick(() => {
				this.spreadsheetInstance = jspreadsheet(this.$refs.spreadsheet, {
					worksheets: [{
						data: this.convertObjectToSheetData(this.initialData),
						columns: this.columns,
						rowResize: true,
						columnDrag: true,
						minDimensions: [this.columns.length, 10],
					}]
				});
			});
		}
	}
</script>