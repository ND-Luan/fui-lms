<template>
	<div class="wrapper-jexcel">
		<div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>
	</div>
</template>

<script>
	export default {
		inject: ['snackbarRef'],
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
			disableLazyLoading: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				jExcelObj: null,
				isProgrammaticChange: false,
				lastInvalidWarnAt: 0
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

				// Áp dụng comments sau khi bảng đã render đầy đủ (tránh lỗi lazyLoading records[y] undefined)
				if (this.comments && typeof this.comments === 'object') {
					const ws = jExcelObj[0];
					Object.entries(this.comments).forEach(([addr, text]) => {
						try { ws.setComments(addr, text); } catch (e) { /* bỏ qua nếu cell chưa render */ }
					});
				}

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
				if (this.disableLazyLoading) isLazyLoading = false
	
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
					onbeforechange: this.beforeChange,
					onchange: this.changed,
					onload: this.onLoad ? this.onLoad : this.onload,
					onselection: this.onselection,
				};
			}
		},
		methods: {
			parseNumericInput(value) {
				if (value == null) return { ok: true, value: '' };
				if (typeof value === 'number') {
					return Number.isFinite(value)
						? { ok: true, value: String(value) }
						: { ok: false, value: '' };
				}

				let s = String(value).trim();
				if (!s) return { ok: true, value: '' };

				if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
					s = s.slice(1, -1).trim();
				}

				let out = '';
				let dotCount = 0;

				for (let i = 0; i < s.length; i++) {
					const ch = s[i];

					if (ch >= '0' && ch <= '9') {
						out += ch;
						continue;
					}

					if (ch === ',' || ch === '.') {
						dotCount += 1;
						if (dotCount > 1) return { ok: false, value: '' };
						out += '.';
						continue;
					}

					if (ch === ' ' || ch === '\u00A0') {
						continue;
					}

					return { ok: false, value: '' };
				}

				if (!out || out === '.') return { ok: false, value: '' };
				const n = Number(out);
				if (!Number.isFinite(n)) return { ok: false, value: '' };

				return { ok: true, value: out };
			},

			beforeChange(instance, cell, x, y, value) {
				const sheet = Array.isArray(instance) ? instance[0] : instance;
				const column = sheet?.options?.columns?.[x];
				if (!column || column.type !== 'numeric') return value;
				if (column.readOnly) return value;

				if (typeof value === 'string' && value.trim().startsWith('=')) {
					return value;
				}

				const parsed = this.parseNumericInput(value);
				if (!parsed.ok) {
					const raw = value == null ? '' : String(value);
					console.warn('[uc-jexcel.beforeChange] Invalid numeric input', {
						x,
						y,
						columnName: column?.name,
						columnTitle: column?.title,
						columnReadOnly: column?.readOnly,
						value,
						type: typeof value,
						raw,
						charCodes: raw.split('').map(ch => ch.charCodeAt(0))
					});

					const now = Date.now();
					if (now - this.lastInvalidWarnAt > 1000) {
						this.lastInvalidWarnAt = now;
						const colTitle = column?.title ? `Cột ${column.title}` : `Cột ${x + 1}`;
						this.snackbarRef?.value?.showSnackbar({
							message: `${colTitle} chỉ cho phép nhập số.`,
							type: 'warning'
						});
					}
					return '';
				}
				return parsed.value;
			},
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
				const columns = this.columns.map(col => col.name);
				const columnName = columns[x];
				const hocSinhIDIndex = columns.indexOf('HocSinhID');
				const hocSinhID = hocSinhIDIndex > -1
					? instance.getValueFromCoords(hocSinhIDIndex, y)
					: null;
	
				const CD_HocSinhExist = this.rootDataSource.filter(
					item => item.HocSinhID === hocSinhID && item.MaCotDiem === columnName
				);
	
				CD_HocSinhExist.forEach(item => {
					if (item.HeSo >= 2) {
						const inputValue = parseFloat(value);
						if (!isNaN(inputValue)) {
							const newValue = item.HeSo * inputValue;
							const currentValue = instance.getValueFromCoords(x, y);
							if (String(newValue) !== String(currentValue)) {
								this.isProgrammaticChange = true;
								try {
									instance.setValueFromCoords(x, y, newValue);
								} finally {
									this.isProgrammaticChange = false;
								}
							}
						}
					}
				});

				const rawData = instance.getData();
				const dataObjects = rawData.map(row => {
					const obj = {};
					columns.forEach((colName, index) => {
						obj[colName] = row[index] ?? '';
					});
					return obj;
				});

				const rowData = instance.getRowData(y);
				const finalValue = instance.getValueFromCoords(x, y);
	
				this.$emit('update:dataSource', dataObjects);
				this.$emit('onChange', { instance, cell, x, y, value: finalValue, dataObjects });
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