<template>
	<div class="wrapper-jexcel">
		<div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>
	</div>
</template>
<script>
	export default {
		emits: ['onChange', 'update:modelValue', 'update:dataSource', 'update:minDimensions', 'rowData', 'addressCell'],
		props: {
			modelValue: {},
	
			rootDataSource: {
				type: Array,
				default: []
			},
			dataSource: {
				type: Array,
				default: []
			},
			columns: {
				type: Array,
				default: []
			},
			nestedHeaders: {
				type: Array,
				default: []
			},
			pagination: {
				type: Number,
			},
			search: {
				type: Boolean
			},
			tableWidth: {
				type: String,
				default: "100%"
			},
			tableHeight: {
				type: String,
				default: "100%"
			},
			minDimensions: {
				type: Array,
				default: [0, 0]
			},
			freezeColumns: {
				type: Number,
				default: 3
			},
			exportExcel: {
				type: Boolean,
				default: false
			},
			updateTable: {
				type: Function,
			},
			styleExcel: {
				type: String
			},
			styleSheet: {
				type: Object,
			},
			comments: {
				type: Object
			},
			tableHeader: {
				type: Boolean,
				default: true, // mặc định vẫn hiện A,B,C nếu không truyền
			},
			tableRowNumber: {
				type: Boolean,
				default: true, // mặc định vẫn hiện 1,2,3 nếu không truyền
			},
			filters: {
				type: Boolean,
				default: false, // mặc định vẫn hiện 1,2,3 nếu không truyền
			},
		},
		data() {
			return {
				jExcelObj: null,
				isProgrammaticChange: false
			}
		},
		watch: {
			exportExcel: function (val) {
				if (val) {
					this.ExportExcel()
				}
			},
			isSubmit: function (val) {
				if (val) {
					this.onSubmit()
				}
			},
			styleSheet: function (val) {
				if (this.jExcelObj) {
					this.jExcelObj.setStyle(val); // Giả sử có một phương thức để cập nhật style
				}
			},
	
		},
		mounted: function () {
			const jExcelObj = jspreadsheet(this.$refs["spreadsheet"], this.jExcelOptions);
			Object.assign(this, { jExcelObj }); // tucks all methods under jExcelObj object in component instance
			this.$emit('update:modelValue', jExcelObj)
	
			// Đợi JSpreadsheet render xong, sau đó gắn sự kiện cuộn
			// this.$nextTick(() => {
			// 	const container = this.$refs.spreadsheet.querySelector('.jexcel_container');
			// 	if (container) {
			// 		container.addEventListener("scroll", this.handleScroll);
			// 	}
			// });
		},
		computed: {
			jExcelOptions() {
				//Nếu sử dụng pagination thì off đi lazyLoading
				let isLazyLoading = true
				if (this.pagination) isLazyLoading = false
				const worksheets = [
					{
						data: this.dataSource,
						columns: this.columns,
						rowResize: true,
						columnDrag: true,
						nestedHeaders: this.nestedHeaders,
						minDimensions: this.minDimensions,
						tableWidth: this.tableWidth,
						tableOverflow: true,
						tableHeight: this.tableHeight,
						lazyLoading: isLazyLoading,
						freezeColumns: this.freezeColumns,
						columnSorting: true,
						contextMenu: false,
						stripHTML: false,
						wordWrap: true,
						allowComments: true,
						comments: this.comments,
						style: this.styleSheet,
						filters: this.filters,
						search: this.search,
						pagination: this.pagination,
						paginationOptions: [10, 25, 50, 100],
					}
				]
				return {
					worksheets: worksheets,
					contextMenu: function () { return false; },
					onchange: this.changed,
					onload: this.onload,
					onselection: this.onselection,
	
				};
			}
		},
		methods: {
			handleScroll(event) {
				const container = event.target;
				const scrollLeft = container.scrollLeft;
				// Lấy tất cả các cell trong các cột cố định
				const freezeColumns = this.freezeColumns; // Số cột cần cố định
	
				//Kiểm tra nếu có tồn tại nestedHeader
				const columnNestHeader = container.querySelectorAll(`td[data-column="0,1,2"]`);
				if (columnNestHeader.length > 0) {
					columnNestHeader[0].classList.add("jss_freezed");
				}
	
				//Header bình thường để freezed
				for (let i = 0; i < freezeColumns; i++) {
					const columnCells = container.querySelectorAll(`td[data-x="${i}" ]`);
					columnCells.forEach(cell => {
						if (scrollLeft > 0) {
							cell.classList.add("jss_freezed");
						} else {
							cell.classList.remove("jss_freezed");
						}
					});
				}
			},
			changed(instance, cell, x, y, value) {
				if (this.isProgrammaticChange) return;
				// Lấy dữ liệu từ bảng
				const rawData = instance.getData();
				const columns = this.columns.map(col => col.name);
	
				// Chuyển dữ liệu thành mảng object
				const dataObjects = rawData.map(row => {
					const obj = {};
					columns.forEach((colName, index) => {
						obj[colName] = row[index] ?? '';
					});
					return obj;
				});
	
				console.log('dataObjects =>', cell, x, y, value)
	
				const rowObject = dataObjects[y];
				const columnName = columns[x];
				const cellValue = rowObject[columnName];
				const rowData = instance.getRowData(y);
	
				// Lọc dữ liệu phù hợp
				const CD_HocSinhExist = this.rootDataSource.filter(
					item => item.HocSinhID === rowObject?.HocSinhID && item.MaCotDiem === columnName
				);
	
				CD_HocSinhExist.forEach(item => {
					if (item.HeSo >= 2) {
						const inputValue = parseFloat(value);
						if (!isNaN(inputValue)) {
							const newValue = item.HeSo * inputValue;
							if (String(newValue) !== String(cellValue)) {
								// ✅ Cập nhật trực tiếp không gây loop
								instance.options.data[y][x] = newValue;
								instance.records[y][x].innerHTML = newValue;
	
								// Cập nhật lại dữ liệu emit ra ngoài
								dataObjects[y][columnName] = newValue;
								this.isProgrammaticChange = true;
								instance.setValueFromCoords(x, y, newValue)
								this.isProgrammaticChange = false
							}
						}
					}
				});
	
				// Emit dữ liệu
				this.$emit('update:dataSource', dataObjects);
				this.$emit('onChange', { instance, cell, x, y, value, dataObjects });
				this.$emit('rowData', rowData);
				this.$emit('addressCell', [x, y]);
			},
			onselection(instance, x1, y1, x2, y2, origin) {
				//v5
				// console.log(this.jExcelObj[0].getValueFromCoords(x1, y1))
				// let cellName = jspreadsheet.helpers
				// console.log(cellName)
			},
			onload() {
				// this.$nextTick(() => {
				//     this.jExcelObj.setHeight(0, 45)
				// })
			}
		}
	}
</script>