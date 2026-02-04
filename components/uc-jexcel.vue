<template>
	<div class="wrapper-jexcel">
		<div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>
	</div>
</template>

<style scoped>
	/* Style cho filter cells được freeze */
	::v-deep td.jss_column_filter.jss_freezed {
		position: sticky !important;
		z-index: 3 !important;
		background-color: #fff;
	}

	/* Tính toán left position cho từng cột freeze */
	::v-deep td.jss_column_filter.jss_freezed[data-x="0"] {
		left: 0px !important;
	}

	::v-deep td.jss_column_filter.jss_freezed[data-x="1"] {
		left: var(--column-0-width, 100px) !important;
	}

	::v-deep td.jss_column_filter.jss_freezed[data-x="2"] {
		left: calc(var(--column-0-width, 100px) + var(--column-1-width, 100px)) !important;
	}
</style>
<script>
	export default {
		emits: ['onChange', 'update:modelValue', 'update:dataSource', 'update:minDimensions', 'rowData', 'addressCell'],
		props: {
			modelValue: {},
			onLoad: {
				type: Function,
			},
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
				default: true,
			},
			tableRowNumber: {
				type: Boolean,
				default: true,
			},
			filters: {
				type: Boolean,
				default: false,
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
			}
		},
		mounted: function () {
			const jExcelObj = jspreadsheet(this.$refs["spreadsheet"], this.jExcelOptions);
			Object.assign(this, { jExcelObj });
			this.$emit('update:modelValue', jExcelObj)
	
			// Thêm class freeze cho filter cells sau khi table load xong
			this.$nextTick(() => {
				this.applyFreezeToFilterCells();
				this.calculateColumnWidths();
	
				const container = this.$refs.spreadsheet.querySelector('.jexcel_container');
				if (container) {
					container.addEventListener("scroll", this.handleScroll);
				}
			});
		},
		computed: {
			jExcelOptions() {
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
						allowInsertColumn: false, //Chặn user thêm column
						allowManualInsertColumn: false, //Chặn Insert column bằng Tab
						allowInsertRow: false, //Chặn user ko thêm dòng
						allowManualInsertRow: false, //Chặn user ko thêm dòng
						columnDrag: false, //Chặn ko cho kéo column
						comments: this.comments,
						style: this.styleSheet,
						filters: this.filters,
						search: this.search,
						pagination: this.pagination,
						paginationOptions: [10, 25, 50, 100],
					}
				]
				return {
					worksheets,
					contextMenu: function () { return false; },
					onchange: this.changed,
					onload: this.onLoad ? this.onLoad : this.onload,
					onselection: this.onselection,
				};
			}
		},
		methods: {
			// Hàm tính toán và set width cho các cột freeze
			calculateColumnWidths() {
				const container = this.$refs.spreadsheet;
				if (!container) return;
	
				let cumulativeLeft = 0;
	
				for (let i = 0; i < this.freezeColumns; i++) {
					// Lấy width của cột hiện tại
					const cell = container.querySelector(`td[data-x="${i}"]`);
					if (cell) {
						const width = cell.offsetWidth;
	
						// Set left position cho tất cả cells trong cột này (bao gồm cả filter)
						const allCellsInColumn = container.querySelectorAll(`td[data-x="${i}"].jss_freezed`);
						allCellsInColumn.forEach(cellItem => {
							cellItem.style.left = `${cumulativeLeft}px`;
						});
	
						cumulativeLeft += width;
					}
				}
			},
	
			// Hàm mới: Thêm class freeze cho filter cells
			applyFreezeToFilterCells() {
				const container = this.$refs.spreadsheet;
				if (!container) return;
	
				// Tìm tất cả các filter cells trong freezeColumns
				for (let i = 0; i < this.freezeColumns; i++) {
					const filterCells = container.querySelectorAll(`td.jss_column_filter[data-x="${i}"]`);
					filterCells.forEach(cell => {
						cell.classList.add("jss_freezed");
						cell.style.position = 'sticky';
						cell.style.zIndex = '3';
						cell.style.backgroundColor = '#fff';
					});
				}
			},
	
			handleScroll(event) {
				const container = event.target;
				const scrollLeft = container.scrollLeft;
				const freezeColumns = this.freezeColumns;
	
				// Kiểm tra nếu có tồn tại nestedHeader
				const columnNestHeader = container.querySelectorAll(`td[data-column="0,1,2"]`);
				if (columnNestHeader.length > 0) {
					columnNestHeader[0].classList.add("jss_freezed");
				}
	
				// Tính toán left position cho từng cột
				let cumulativeLeft = 0;
	
				// Header bình thường và filter cells để freezed
				for (let i = 0; i < freezeColumns; i++) {
					// Lấy width của cột để tính left
					const firstCell = container.querySelector(`td[data-x="${i}"]`);
					const columnWidth = firstCell ? firstCell.offsetWidth : 0;
	
					// Xử lý các cell thông thường
					const columnCells = container.querySelectorAll(`td[data-x="${i}"]`);
					columnCells.forEach(cell => {
						if (scrollLeft > 0) {
							cell.classList.add("jss_freezed");
							cell.style.left = `${cumulativeLeft}px`;
						} else {
							// Giữ class freezed cho filter cells ngay cả khi scrollLeft = 0
							if (!cell.classList.contains('jss_column_filter')) {
								cell.classList.remove("jss_freezed");
								cell.style.left = '';
							}
						}
					});
	
					cumulativeLeft += columnWidth;
				}
			},
	
			changed(instance, cell, x, y, value) {
				if (this.isProgrammaticChange) return;
	
				const rawData = instance.getData();
				const columns = this.columns.map(col => col.name);
	
				const dataObjects = rawData.map(row => {
					const obj = {};
					columns.forEach((colName, index) => {
						obj[colName] = row[index] ?? '';
					});
					return obj;
				});
	
				const rowObject = dataObjects[y];
				const columnName = columns[x];
				const cellValue = rowObject[columnName];
				const rowData = instance.getRowData(y);
	
				const CD_HocSinhExist = this.rootDataSource.filter(
					item => item.HocSinhID === rowObject?.HocSinhID && item.MaCotDiem === columnName
				);
	
				CD_HocSinhExist.forEach(item => {
					if (item.HeSo >= 2) {
						const inputValue = parseFloat(value);
						if (!isNaN(inputValue)) {
							const newValue = item.HeSo * inputValue;
							if (String(newValue) !== String(cellValue)) {
								instance.options.data[y][x] = newValue;
								instance.records[y][x].innerHTML = newValue;
	
								dataObjects[y][columnName] = newValue;
								this.isProgrammaticChange = true;
								instance.setValueFromCoords(x, y, newValue)
								this.isProgrammaticChange = false
							}
						}
					}
				});
	
				this.$emit('update:dataSource', dataObjects);
				this.$emit('onChange', { instance, cell, x, y, value, dataObjects });
				this.$emit('rowData', rowData);
				this.$emit('addressCell', [x, y]);
			},
	
			onselection(instance, x1, y1, x2, y2, origin) {
				// console.log(instance, x1, y1, x2, y2, origin)
			},
	
			onload() {
				// this.$nextTick(() => {
				//     this.jExcelObj.setHeight(0, 45)
				// })
			}
		},
	
		beforeUnmount() {
			// Cleanup scroll listener
			const container = this.$refs.spreadsheet?.querySelector('.jexcel_container');
			if (container) {
				container.removeEventListener("scroll", this.handleScroll);
			}
		}
	}
</script>