<template>
	<v-dialog v-model="dialogOpen" max-width="1200">
		<template #activator="{ props: activatorProps }">
			<v-btn v-bind="{ ...activatorProps, ...$attrs }" />
		</template>

		<v-card>
			<v-card-title>
				Thêm học sinh
				<v-spacer />
				<v-icon @click="dialogOpen = false">mdi-close</v-icon>
			</v-card-title>
			<v-card-text>
				<v-col cols="12" sm="4" class="px-0">
					<v-select v-model="NhomDetail" label="Chọn nhóm" :items="DSNhom" item-title="TenNhom"
						item-value="NhomID" return-object />
				</v-col>

				<v-tabs v-model="activeTab" class="mb-2">
					<v-tab value="table">Chọn từ danh sách</v-tab>
					<v-tab value="paste">Dán từ Excel</v-tab>
				</v-tabs>

				<v-tabs-window v-model="activeTab">
					<v-tabs-window-item value="table">
						<v-text-field v-model="search" placeholder="Tìm kiếm học sinh..." variant="outlined"
							class="mb-2" />
						<v-data-table v-model="itemSelected" :headers :items :search :item-value="v => v"
							show-select style="max-height: 400px; overflow-y: auto;" />
					</v-tabs-window-item>

					<v-tabs-window-item value="paste" eager>
						<div class="text-caption text-medium-emphasis mb-2">
							Dán danh sách mã học sinh từ Excel vào cột <strong>Mã HS</strong>. Họ tên và lớp sẽ tự động điền.
						</div>
						<div ref="pasteSpreadsheet"></div>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text="Đóng" @click="dialogOpen = false" />
				<v-btn variant="outlined" color="primary" text="Thêm" @click="onSubmit" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		inject: ['snackbarRef'],
		props: {
			DSNhom: Array,
			NhomDetail_Child: Object,
			onSubmitFinish: Function
		},
		data() {
			return {
				vueData,
				dialogOpen: false,
				activeTab: 'table',
				search: null,
				NhomDetail: null,
				headers: [
					{ title: 'Mã học sinh', value: 'HocSinhID' },
					{ title: 'Họ tên', value: 'HoTen' },
					{ title: 'Tên Lớp', value: 'TenLop' },
					{ title: 'Tình Trạng', value: 'TenTinhTrang' }
				],
				items: [],
				itemSelected: [],
				pasteSheet: null,
			}
		},
		mounted() {
			this.getHocSinh()
		},
		computed: {},
		watch: {
			NhomDetail_Child(NhomDetail) {
				this.NhomDetail = NhomDetail
			},
			dialogOpen(v) {
				if (v) {
					this.$nextTick(() => this.initPasteSheet())
				} else {
					this.activeTab = 'table'
					if (this.$refs.pasteSpreadsheet) {
						this.$refs.pasteSpreadsheet.innerHTML = ''
					}
					this.pasteSheet = null
				}
			},
		},
		methods: {
			initPasteSheet() {
				if (!this.$refs.pasteSpreadsheet || this.pasteSheet) return
				const self = this
				this.pasteSheet = jspreadsheet(this.$refs.pasteSpreadsheet, {
					worksheets: [{
						data: Array.from({ length: 50 }, () => ['', '', '']),
						columns: [
							{ type: 'text', title: 'Mã HS', width: 120 },
							{ type: 'text', title: 'Họ tên', width: 260, readOnly: true },
							{ type: 'text', title: 'Lớp', width: 160, readOnly: true },
						],
						tableOverflow: true,
						tableHeight: '360px',
						tableWidth: '100%',
						allowInsertRow: true,
						allowManualInsertRow: true,
						allowInsertColumn: false,
						allowManualInsertColumn: false,
						columnSorting: false,
						contextMenu: false,
						wordWrap: false,
					}],
					onchange(worksheet, cell, x, y, value) {
						if (x !== 0) return
						const id = String(value ?? '').trim()
						if (!id) {
							worksheet.setValueFromCoords(1, y, '', true)
							worksheet.setValueFromCoords(2, y, '', true)
							return
						}
						const found = self.items.find(s => String(s.HocSinhID) === id)
						worksheet.setValueFromCoords(1, y, found ? found.HoTen : '⚠ Không tìm thấy', true)
						worksheet.setValueFromCoords(2, y, found ? found.TenLop : '', true)
					},
				})[0]
			},

			getPasteStudents() {
				if (!this.pasteSheet) return []
				const rows = this.pasteSheet.getData()
				const result = []
				for (const row of rows) {
					const id = String(row[0] ?? '').trim()
					if (!id) continue
					const found = this.items.find(s => String(s.HocSinhID) === id)
					if (found) result.push(found)
				}
				return result
			},

			async getHocSinh() {
				this.items = await fetchPromise("lms/HocSinh_Get", { NienKhoa: vueData.NienKhoa })
			},

			async insHSNhom(NhomID, students) {
				return await fetchPromise("lms/HocSinhNhom_Ins", {
					Json_HocSinhNhom: JSON.stringify(students),
					NhomID
				}, { cache: false })
			},

			async onSubmit() {
				if (!this.NhomDetail?.NhomID) return

				if (this.NhomDetail?.MonHocID === 102 && vueData.user.UserID !== 'NA0000022') {
					this.snackbarRef.value.showSnackbar({ message: 'Lớp tin học lấy danh sách nguồn từ lớp Anh Văn. Nếu muốn thêm/sửa hãy xác nhận lại với Giáo vụ', color: 'warning' })
					return
				}

				// Gộp học sinh từ 2 nguồn, loại trùng theo HocSinhID
				const pasteStudents = this.getPasteStudents()
				const merged = [...this.itemSelected]
				for (const s of pasteStudents) {
					if (!merged.some(x => x.HocSinhID === s.HocSinhID)) merged.push(s)
				}
				if (!merged.length) return

				if (this.NhomDetail.MonHocID === 76 && !this.NhomDetail.IsNhomLMS_GiaoBai) {
					const NhomDetail_AV = this.DSNhom.find(x => x.NhomID === this.NhomDetail.NhomID && x.MonHocID === 76)
					if (NhomDetail_AV) await this.insHSNhom(NhomDetail_AV.NhomID, merged)
					const ListNhomID_ChildFrom_AV = NhomDetail_AV.ListNhomID_Child.split(',')
					for (const NhomID of ListNhomID_ChildFrom_AV) {
						const nhom = this.DSNhom.find(x => x.NhomID === NhomID)
						if (nhom) await this.insHSNhom(nhom.NhomID, merged)
					}
				} else {
					await this.insHSNhom(this.NhomDetail.NhomID, merged)
				}

				this.snackbarRef.value.showSnackbar({ message: 'Đã thêm học sinh vào nhóm!', color: 'success' })
				this.itemSelected = []
				if (this.pasteSheet) {
					const empty = Array.from({ length: 50 }, () => ['', '', ''])
					this.pasteSheet.setData(empty)
				}
				this.dialogOpen = false
				await this.$emit('onSubmitFinish')
			}
		},
	}
</script>