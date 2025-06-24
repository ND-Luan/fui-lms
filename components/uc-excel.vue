<template>
	<div class="wrapper-jexcel">
		<div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>
	</div>
</template>

<script>
	export default {
		props: {
			dataSource: {
				type: Array,
				default: [],
			},
			columns: {
				type: Array,
				default: []
			},
			nestedHeaders: Array,
			minDimensions: Array,
			tableWidth: String,
			tableHeight: String,
			freezeColumns: Number,
			comments: Object,
			styleSheet: Object,
			filters: Boolean,
			search: Boolean,
			pagination: Number,
			styleExcel: Object,
		},
		data() {
			return {
				spreadsheetInstance: null
			}
		},
		mounted() {
			this.initSpreadsheet();
		},
		watch: {
			dataSource: {
				handler(ds) {
					console.log('ds', ds)
					this.reinitSpreadsheet();
				},
				deep: true
			}
		},
		methods: {
			reinitSpreadsheet() {
				// Xoá bảng cũ nếu đã tồn tại
				if (this.spreadsheetInstance[0]) {
					this.spreadsheetInstance[0].deleteWorksheet(0);
					this.spreadsheetInstance = null;
				}
				this.initSpreadsheet();
			},
			initSpreadsheet() {
				const isLazyLoading = !this.pagination;
	
				const hasData = Array.isArray(this.dataSource) && this.dataSource.length > 0;
				const minDimensions = hasData
					? this.minDimensions
					: [0, 0];
	
				const worksheets = [
					{
						data: this.dataSource || [],
						columns: this.columns,
						rowResize: true,
						columnDrag: true,
						nestedHeaders: this.nestedHeaders,
						minDimensions: minDimensions,
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
				];
	
				this.spreadsheetInstance = jspreadsheet(this.$refs.spreadsheet, {
					tabs: false,
					toolbar: false,
					worksheets,
					contextMenu: () => false,
					onchange: this.changed,
					onload: this.onload,
					onselection: this.onselection,
				});
			},
			changed(instance, cell, x, y, value) {
				// Lấy dữ liệu từ bảng
				const rawData = this.spreadsheetInstance[0].getData();
	
				// Lấy tiêu đề cột (nếu có)
				const columns = this.columns.map(col => col.name);
	
				// Chuyển đổi sang mảng đối tượng
				const dataObjects = rawData.map(row => {
					const obj = {};
					columns.forEach((colName, index) => {
						obj[colName] = row[index] ?? '' //|| '';
					});
					return obj;
				});
				const rowData = instance.getRowData(y);
				this.$emit('update:dataSource', dataObjects);
				this.$emit('onChange', { instance, cell, x, y, value, dataObjects });
				this.$emit('rowData', rowData);
				this.$emit('addressCell', [x, y])
			},
			onload(instance) {
				console.log("Spreadsheet loaded");
			},
			onselection(instance, x1, y1, x2, y2) {
				console.log("Selection:", { x1, y1, x2, y2 });
			}
		}
	}
</script>