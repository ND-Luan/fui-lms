<template>
	<div>
		<v-row class="ma-0" dense>
			<v-col cols="3">
				<v-select v-model="CapID" label="Chọn cấp" :items="DSCap" item-value="value" item-title="title" />
			</v-col>
			<v-col cols="3">
				<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop" item-value="LopID"
					return-object />
			</v-col>
			<v-col class="d-flex ga-2">
				<v-btn text="Tìm kiếm" color="primary" @click="onSearch" />
				<v-spacer />
				<uc-btn-dialog-add @onLoadFinish="onSearch" :LopItem :CapID />
				<uc-btn-dialog-add-multiple @onLoadFinish="onSearch" :LopItem :CapID />
				<v-btn variant="tonal" text="Xuất excel" color="primary" @click="onExportExcel" />
			</v-col>
		</v-row>
		<v-card>
			<v-divider />
			<v-data-table :items="items" :headers="headers" :loading="loading" style="height: calc(-45px + 100dvh)">
				<template #item.actions="{item}">
					<div style="min-width: 70px;">
						<v-btn @click="deleteItem(item)" icon="mdi-trash-can-outline" size="small" color="red-darken-1"
							density="comfortable" variant="plain"></v-btn>

						<v-btn @click="editItem(item)" icon="mdi-square-edit-outline" size="small"
							color="green-darken-2" density="comfortable" variant="plain"></v-btn>
					</div>
				</template>
			</v-data-table>
		</v-card>
		<uc-dialog-edit v-model="isDialogEdit" :CapID :LopItem @onLoadFinish="onSearch" :item="THItem" />
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			let dscap = [
				{ title: "Cấp 1", value: 1 },
				{ title: "Cấp 2", value: 2 },
				{ title: "Cấp 3", value: 3 },
			]
			dscap = dscap.filter(x => x.value == vueData.capid)
			return {
				headers: [ 
					{
						title: "TỔNG HỢP DỮ LIỆU CUỘC THI", align: "center", children: [
							{ title: 'STT', value: 'STT', fixed: true, minWidth: 80, width: 80 },
							{ title: 'Mã học sinh', value: 'HocSinhID', fixed: true, minWidth: 120, width: 120 },
							{ title: 'Học sinh', value: 'HoTen', fixed: true, minWidth: 150, width: 150 },
							{ title: 'Thời gian thi', value: 'ThoiGianThi', minWidth: 100, width: 100 },
							{ title: 'Học kì', value: 'HocKi', minWidth: 80, width: 80 },
							{ title: 'Tên cuộc thi', value: 'TenCuocThi', minWidth: 80, width: 80 },
							{ title: 'Lĩnh vực dự án', value: 'LinhVucDuAn', minWidth: 80, width: 80 },
							{ title: 'Mô tả ngắn gọn nội dung/mục tiêu', value: 'MoTaNganGonNoiDung_MucTieu', minWidth: 200, width: 200 },
							{ title: 'GV hướng dẫn', value: 'GVHuongDan', minWidth: 100, width: 100 },
							{ title: 'Tổ/bộ phận', value: 'To_BoPhan', minWidth: 80, width: 80 },
							{ title: 'GV/tổ hỗ trợ', value: 'GV_ToHoTro', minWidth: 80, width: 80 },
							{ title: 'Tổ chức công nhận', value: 'ToChucCongNhan', minWidth: 100, width: 100 },
							{ title: 'Cấp độ giải thưởng', value: 'CapDoGiaiThuong', minWidth: 100, width: 100 },
							{ title: 'Giải thưởng đạt được', value: 'GiaiThuongDatDuoc', minWidth: 100, width: 100 },
							{ title: 'Minh chứng', value: 'MinhChung_SoHieuQD_LinkChungNhan', minWidth: 100, width: 100 },
							{ title: 'Ghi chú bổ sung', value: 'GhiChuBoSung', minWidth: 200, width: 200 },
							{ title: "Thao tác", value: "actions", fixed: true, minWidth: 80, width: 80 }
						]
					}
				],
				items: [],
				loading: false,
				LopItem: null,
				DSLop: [],
				DSCap: dscap,
				CapID: null,
				isDialogEdit: false,
				THItem: null
			}
		},
		mounted() {
			this.CapID = this.DSCap[0]?.value ?? null
		},
		watch: {
			CapID: function () {
				this.onLoadLop()
			},
			LopItem: function () {
				this.onSearch()
			}
		},
		methods: {
			async onSearch() {
				this.loading = true
				const items = await ajaxCALLPromise('lms/TongHopDuLieuCuocThi_Get', {
					NienKhoa: vueData.NienKhoa,
					LopID: this.LopItem?.LopID ?? 0
				}).finally(() => this.loading = false)
				this.items = items.map((x, idx) => ({ ...x, STT: idx + 1 }))
			},
			async onLoadLop() {
				this.DSLop = await ajaxCALLPromise("lms/Lop_Get_By_CapID", { NienKhoa: vueData.NienKhoa, CapID: this.CapID })
			},
			editItem(item) {
				this.THItem = Object.assign({}, item)
				this.isDialogEdit = true
			},
			deleteItem(item) {
				const $this = this
				confirm({
					title: "Xác nhận xóa",
					action: function () {
						ajaxCALLPromise("lms/TongHopDuLieuCuocThi_Del", {
							TongHopDuLieuCuocThiID: item.TongHopDuLieuCuocThiID
						}).then(() => {
							Vue.$toast.success("Xóa thành công", { position: "top" })
							$this.onSearch()
						})
					}
				})
			},
			async onExportExcel() {
				if (!this.items || this.items.length === 0) {
					Vue.$toast.warning("Không có dữ liệu để xuất", { position: "top" })
					return
				}
	
				try {
					// Tạo workbook và worksheet
					const wb = XLSX.utils.book_new()
	
					// Chuẩn bị dữ liệu
					const wsData = []
	
					// Lấy thông tin từ headers
					const mainHeaderInfo = this.headers[0]
					const subHeaders = mainHeaderInfo.children.filter(x => x.value !== 'actions')
	
					// Header chính (dòng 1) - gộp tất cả các cột
					wsData.push([mainHeaderInfo.title])
	
					// Sub-headers (dòng 2)
					const subHeaderTitles = subHeaders.map(h => h.title)
					wsData.push(subHeaderTitles)
	
					// Thêm dữ liệu
					this.items.forEach(item => {
						const row = subHeaders.map(header => item[header.value] || '')
						wsData.push(row)
					})
	
					// Tạo worksheet từ dữ liệu
					const ws = XLSX.utils.aoa_to_sheet(wsData)
	
					// Số cột (không tính cột actions)
					const colCount = subHeaders.length
	
					// Thiết lập merge cells cho header chính (dòng 1)
					ws['!merges'] = [
						{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }
					]
	
					// Thiết lập độ rộng cột dựa trên minWidth trong headers
					ws['!cols'] = subHeaders.map(h => ({
						wch: Math.max((h.minWidth || 100) / 8, 10) // Chuyển đổi px sang character width
					}))
	
					// Style cho header chính
					const headerStyle = {
						font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
						fill: { fgColor: { rgb: "4472C4" } },
						alignment: { horizontal: "center", vertical: "center" }
					}
	
					// Style cho sub-headers
					const subHeaderStyle = {
						font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
						fill: { fgColor: { rgb: "5B9BD5" } },
						alignment: { horizontal: "center", vertical: "center", wrapText: true }
					}
	
					// Áp dụng style cho header chính (A1)
					if (!ws['A1'].s) ws['A1'].s = {}
					ws['A1'].s = headerStyle
	
					// Áp dụng style cho sub-headers (dòng 2)
					const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
					for (let i = 0; i < colCount; i++) {
						const cell = colLetters[i] + '2'
						if (!ws[cell]) ws[cell] = { v: '' }
						if (!ws[cell].s) ws[cell].s = {}
						ws[cell].s = subHeaderStyle
					}
	
					// Thêm worksheet vào workbook
					XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu cuộc thi')
	
					// Xuất file
					const tenLop = this.LopItem?.TenLop || 'TatCa'
					const fileName = `TongHopDuLieuCuocThi_${tenLop}_${vueData.NienKhoa}.xlsx`
					XLSX.writeFile(wb, fileName)
	
					Vue.$toast.success("Xuất Excel thành công", { position: "top" })
	
				} catch (error) {
					console.error('Lỗi xuất Excel:', error)
					Vue.$toast.error("Có lỗi khi xuất Excel", { position: "top" })
				}
			}
		}
	}
</script>