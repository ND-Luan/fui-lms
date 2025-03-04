<template>
	<div class="wrapper-jexcel">
		<div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>
	</div>
</template>
<script>
	export default {
		emits: ['onChange', 'update:modelValue', 'update:dataSource', 'update:minDimensions'],
		props: {
			modelValue: {},
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
			}
		},
		data() {
			return {
	
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
				console.log('styleSheet', val)
			}
		},
		mounted: function () {
			const jExcelObj = jspreadsheet(this.$refs["spreadsheet"], this.jExcelOptions);
			Object.assign(this, { jExcelObj }); // tucks all methods under jExcelObj object in component instance
			this.$emit('update:modelValue', jExcelObj)
	
			// Đợi JSpreadsheet render xong, sau đó gắn sự kiện cuộn
			this.$nextTick(() => {
				const container = this.$refs.spreadsheet.querySelector('.jexcel_container');
				if (container) {
					container.addEventListener("scroll", this.handleScroll);
				}
			});
		},
		computed: {
			jExcelOptions() {
				return {
					worksheets: [
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
							lazyLoading: true,
							freezeColumns: this.freezeColumns,
							columnSorting: false,
							contextMenu: false,
							stripHTML: false,
							onchange: this.changed,
							onselection: this.onselection,
							onload: this.onload,
							wordWrap: true,
							allowComments: true,
							comments: this.comments,
							style: this.styleSheet,
							updateTable: (instance, cell, col, row, val, label, cellName) => {
							}, // this.updateTable(instance, cell, col, row, val, label, cellName),
						}
					],
					contextMenu: function () { return false; },
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
				this.$emit('onChange', { instance, cell, x, y, value })
				// console.log('{ instance, cell, x, y, value }', { instance, cell, x, y, value });
				this.$emit('update:dataSource', this.jExcelObj.getJson())
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