<template>
	<div>
		<v-card>
			<v-card-title class="d-flex flex-column">
				THỐNG KÊ TỈ LỆ ĐIỂM TRUNG BÌNH CÁC MÔN
				<div v-if="BaoCaoItem && BaoCaoItem?.IsChotBaoCao">
					<p class="text-caption">
						<span class="text-red">Thời điểm chốt:</span> [{{BaoCaoItem.NguoiChot}}]
						{{BaoCaoItem.HoTenNguoiChot}} • {{ BaoCaoItem.NgayChot }}
					</p>
				</div>
			</v-card-title>
			<v-row class="pa-2" dense>
				<v-col cols="3">
					<v-select v-model="CapID" label="Chọn cấp" :items="DSCap" item-title="title" item-value="value" />
				</v-col>
				<v-col cols="3">
					<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col>
					<v-btn color="primary" variant="elevated" @click="onSearch" class="mr-2">
						<v-icon left>mdi-magnify</v-icon>
						Tìm kiếm
					</v-btn>
					<v-btn color="success" variant="elevated" @click="onExportExcel" class="mr-2">
						<v-icon left>mdi-microsoft-excel</v-icon>
						Xuất Excel
					</v-btn>
					<v-btn color="warning" variant="tonal" @click="onChotBaoCao" :disabled="BaoCaoItem && BaoCaoItem?.IsChotBaoCao">
						<v-icon left>mdi-lock</v-icon>
						Chốt báo cáo
					</v-btn>
				</v-col>
			</v-row>
		</v-card>
		<v-divider />

		<!-- Tabs cho môn học -->
		<v-card v-if="DSMonHoc.length > 0" class="d-flex flex-row">
			<v-tabs v-model="currentTab" color="primary" direction="vertical">
				<v-tab v-for="mh in DSMonHoc" :key="mh.value" :value="mh.value">
					{{ mh.title }}
				</v-tab>
			</v-tabs>
			<v-divider vertical />

			<v-tabs-window v-model="currentTab">
				<v-tabs-window-item v-for="mh in DSMonHoc" :key="mh.value" :value="mh.value">
					<v-card>
						<v-card-text class="pa-0">
							<uc-grade-report-table :mon-hoc-name="mh.value"
								:grouped-data="getGroupedDataBySubject(mh.value)" :tong-cong="tongCongTheoMon[mh.value]"
								:ds-chi-tieu="DSChiTieu" :is-dat-chua-dat="isDanhGiaDatChuaDat(mh.value)" />
						</v-card-text>
					</v-card>
				</v-tabs-window-item>
			</v-tabs-window>
		</v-card>

		<!-- Thông báo khi chưa có dữ liệu -->
		<v-card v-else class="mt-4">
			<v-card-text class="text-center py-8">
				<v-icon size="64" color="grey">mdi-table-off</v-icon>
				<p class="text-h6 mt-4">Chưa có dữ liệu</p>
				<p class="text-grey">Vui lòng chọn các tiêu chí và nhấn Tìm kiếm</p>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				BaoCaoItem: null,
				DataBaoCao: [],
				DataChotBaoCao: [],
				DSCap: [
					{ title: "Trung học cơ sở", value: 2 },
					{ title: "Trung học phổ thông", value: 3 },
				],
				CapID: 2,
				DSHocKi: [
					{ title: "Học kì 1", value: "HK1" },
					{ title: "Học kì 2", value: "HK2" },
				],
				HocKi: "HK1",
				DSMonHoc: [],
				DSChiTieu: [],
				currentTab: null
			}
		},
		mounted() {
			this.onLoadChiTieu()
			this.onSearch()
		},
		computed: {
			tongCongTheoMon() {
				const map = {};
				this.DSMonHoc.forEach(mh => {
					map[mh.value] = this.getTongCongBySubject(mh.value);
				});
				return map;
			}
		},
		methods: {
			async onSearch() {
				try {
					let BaoCaoID = 0
					if (this.CapID === 2) BaoCaoID = 16
					else if (this.CapID === 3) BaoCaoID = 17
	
					let data
	
					const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
						BaoCaoID,
						HocKi: this.HocKi,
						CapID: this.CapID,
						NienKhoa: vueData.NienKhoa
					})
					this.BaoCaoItem = dataLMS[1][0]
					if (this.BaoCaoItem.IsChotBaoCao) {
						data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
					} else {
						data = await ajaxCALLPromise("lms/BaoCao_ThongKe_TiLe_Diem_TrungBinh", {
							Semester: this.HocKi,
							CapID: this.CapID,
							NienKhoa: vueData.NienKhoa
						});
						this.DataChotBaoCao = data
					}
	
					if (data && data.length > 0) {
						this.DataBaoCao = data;
						const uniqueSubjects = [...new Set(data.map(item => item.TenMonHoc_HienThi))];
						this.DSMonHoc = uniqueSubjects.sort().map(subject => ({
							title: subject,
							value: subject
						}));
	
						if (this.DSMonHoc.length > 0) {
							this.currentTab = this.DSMonHoc[0].value;
						}
					} else {
						this.DataBaoCao = [];
						this.DSMonHoc = [];
					}
				} catch (error) {
					console.error("Lỗi khi tải dữ liệu:", error);
					this.DataBaoCao = [];
					this.DSMonHoc = [];
				}
			},
	
			async onLoadChiTieu() {
				try {
					this.DSChiTieu = await ajaxCALLPromise("lms/ChiTieu_C2_C3_Get", {
						NienKhoa: vueData.NienKhoa
					});
				} catch (error) {
					console.error("Lỗi khi tải chỉ tiêu:", error);
					this.DSChiTieu = [];
				}
			},
	
			getGroupedDataBySubject(subjectName) {
				const filteredData = this.DataBaoCao.filter(item => item.TenMonHoc_HienThi === subjectName);
				const groups = {};
	
				filteredData.forEach(item => {
					const khoi = item.TenLop.substring(0, 2);
					if (!groups[khoi]) {
						groups[khoi] = {
							name: `Khối ${parseInt(khoi)}`,
							classes: [],
							totals: this.initTotals()
						};
					}
				});
	
				const sortedKhoi = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));
	
				filteredData.forEach(item => {
					const khoi = item.TenLop.substring(0, 2);
					if (groups[khoi]) {
						groups[khoi].classes.push(item);
						this.addToTotals(groups[khoi].totals, item);
					}
				});
	
				return sortedKhoi.map(khoi => groups[khoi]).filter(g => g.classes.length > 0);
			},
	
			getTongCongBySubject(subjectName) {
				const rows = this.DataBaoCao.filter(x => x.TenMonHoc_HienThi === subjectName);
				const totals = this.initTotals();
				rows.forEach(row => this.addToTotals(totals, row));
				return { name: 'Tổng cộng', totals };
			},
	
			initTotals() {
				return {
					tongSiSo: 0,
					diem_0_5: 0,
					diem_5_6_5: 0,
					diem_6_5_8: 0,
					diem_8_10: 0,
					diem_5_10: 0,
					diem_CD: 0,
					diem_D: 0
				};
			},
	
			addToTotals(totals, item) {
				totals.tongSiSo += item.TongSoHocSinh;
				totals.diem_0_5 += item.Diem_0_5;
				totals.diem_5_6_5 += item.Diem_5_6_5;
				totals.diem_6_5_8 += item.Diem_6_5_8;
				totals.diem_8_10 += item.Diem_8_10;
				totals.diem_5_10 += item.Diem_5_10;
				totals.diem_CD += item.Diem_CD || 0;
				totals.diem_D += item.Diem_D || 0;
			},
	
			isDanhGiaDatChuaDat(monHocName) {
				// Lấy row đầu tiên của môn này để kiểm tra
				const sampleRow = this.DataBaoCao.find(x => x.TenMonHoc_HienThi === monHocName);
	
				if (!sampleRow) return false;
	
				// Nếu Diem_CD và Diem_D KHÔNG phải null → môn Đ/CĐ
				// Nếu Diem_CD và Diem_D là null → môn điểm số
				const result = sampleRow.Diem_CD !== null || sampleRow.Diem_D !== null;
	
				console.log('isDanhGiaDatChuaDat for', monHocName, ':', result);
				console.log('Sample row:', {
					TenLop: sampleRow.TenLop,
					Diem_CD: sampleRow.Diem_CD,
					Diem_D: sampleRow.Diem_D,
					Diem_0_5: sampleRow.Diem_0_5,
					Diem_8_10: sampleRow.Diem_8_10
				});
	
				return result;
			},
	
			// Thêm vào methods của component chính
			async onExportExcel() {
				try {
					// Import thư viện XLSX
					const XLSX = window.XLSX || await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
	
					const workbook = XLSX.utils.book_new();
	
					// Duyệt qua từng môn học
					this.DSMonHoc.forEach(monHoc => {
						const sheetData = this.createSheetData(monHoc.value);
						const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
	
						// Merge cells cho header
						this.applyMerges(worksheet, monHoc.value);
	
						// Thêm sheet vào workbook
						let sheetName = monHoc.title.substring(0, 31); // Excel giới hạn 31 ký tự
						XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
					});
	
					// Xuất file
					const fileName = `ThongKe_TiLeDiem_${this.CapID === 2 ? 'THCS' : 'THPT'}_${this.HocKi}_${vueData.NienKhoa}.xlsx`;
					XLSX.writeFile(workbook, fileName);
	
				} catch (error) {
					console.error('Lỗi khi xuất Excel:', error);
					alert('Có lỗi xảy ra khi xuất Excel');
				}
			},
	
			createSheetData(monHocName) {
				const isDatChuaDat = this.isDanhGiaDatChuaDat(monHocName);
				const groupedData = this.getGroupedDataBySubject(monHocName);
				const tongCong = this.tongCongTheoMon[monHocName];
	
				const data = [];
	
				// Row 1: Header chính
				const headerRow1 = ['Lớp', 'Sĩ số'];
				if (isDatChuaDat) {
					headerRow1.push('Chưa đạt', '', '', '', 'Đạt', '', '', '');
				} else {
					headerRow1.push(
						'Chưa đạt', '', '', '',
						'Đạt', '', '', '',
						'Khá', '', '', '',
						'Tốt', '', '', '',
						'Đạt trở lên', '', '', ''
					);
				}
				data.push(headerRow1);
	
				// Row 2: Khoảng điểm
				const headerRow2 = ['', ''];
				if (isDatChuaDat) {
					headerRow2.push('Chưa đạt', '', '', '', 'Đạt', '', '', '');
				} else {
					headerRow2.push(
						'0 ≤ Điểm < 5', '', '', '',
						'5 ≤ Điểm < 6.5', '', '', '',
						'6.5 ≤ Điểm < 8', '', '', '',
						'8 ≤ Điểm ≤ 10', '', '', '',
						'5 ≤ Điểm ≤ 10', '', '', ''
					);
				}
				data.push(headerRow2);
	
				// Row 3: SL, TL, TL chỉ tiêu, Tăng giảm
				const headerRow3 = ['', ''];
				const numCategories = isDatChuaDat ? 2 : 5;
				for (let i = 0; i < numCategories; i++) {
					headerRow3.push('SL', 'TL', 'TL chỉ tiêu', 'Tăng (+) giảm (-) so với chỉ tiêu');
				}
				data.push(headerRow3);
	
				// Dữ liệu từng khối
				groupedData.forEach(khoi => {
					// Từng lớp
					khoi.classes.forEach(row => {
						const rowData = [row.TenLop, row.TongSoHocSinh];
	
						if (isDatChuaDat) {
							this.addCategoryData(rowData, row, 'Diem_CD', 'ChiTieu_ChuaDat', monHocName);
							this.addCategoryData(rowData, row, 'Diem_D', 'ChiTieu_Dat', monHocName);
						} else {
							this.addCategoryData(rowData, row, 'Diem_0_5', 'ChiTieu_ChuaDat', monHocName);
							this.addCategoryData(rowData, row, 'Diem_5_6_5', 'ChiTieu_Dat', monHocName);
							this.addCategoryData(rowData, row, 'Diem_6_5_8', 'ChiTieu_Kha', monHocName);
							this.addCategoryData(rowData, row, 'Diem_8_10', 'ChiTieu_Tot', monHocName);
							this.addCategoryData(rowData, row, 'Diem_5_10', 'ChiTieu_DatTroLen', monHocName);
						}
	
						data.push(rowData);
					});
	
					// Tổng khối
					const khoiRow = [khoi.name, khoi.totals.tongSiSo];
					if (isDatChuaDat) {
						this.addTotalData(khoiRow, khoi.totals, 'diem_CD', isDatChuaDat);
						this.addTotalData(khoiRow, khoi.totals, 'diem_D', isDatChuaDat);
					} else {
						this.addTotalData(khoiRow, khoi.totals, 'diem_0_5', isDatChuaDat);
						this.addTotalData(khoiRow, khoi.totals, 'diem_5_6_5', isDatChuaDat);
						this.addTotalData(khoiRow, khoi.totals, 'diem_6_5_8', isDatChuaDat);
						this.addTotalData(khoiRow, khoi.totals, 'diem_8_10', isDatChuaDat);
						this.addTotalData(khoiRow, khoi.totals, 'diem_5_10', isDatChuaDat);
					}
					data.push(khoiRow);
				});
	
				// Tổng cộng
				const tongCongRow = ['TỔNG CỘNG', tongCong.totals.tongSiSo];
				if (isDatChuaDat) {
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_CD', 'ChiTieu_ChuaDat', monHocName, isDatChuaDat);
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_D', 'ChiTieu_Dat', monHocName, isDatChuaDat);
				} else {
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_0_5', 'ChiTieu_ChuaDat', monHocName, isDatChuaDat);
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_5_6_5', 'ChiTieu_Dat', monHocName, isDatChuaDat);
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_6_5_8', 'ChiTieu_Kha', monHocName, isDatChuaDat);
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_8_10', 'ChiTieu_Tot', monHocName, isDatChuaDat);
					this.addTongCongData(tongCongRow, tongCong.totals, 'diem_5_10', 'ChiTieu_DatTroLen', monHocName, isDatChuaDat);
				}
				data.push(tongCongRow);
	
				return data;
			},
	
			addCategoryData(rowData, row, field, chiTieuField, monHocName) {
				const value = row[field] || 0;
				const percent = row.TongSoHocSinh ? ((value / row.TongSoHocSinh) * 100).toFixed(2) + '%' : '0.00%';
	
				const khoiID = parseInt(row.TenLop.substring(0, 2));
				const chiTieu = this.DSChiTieu.find(ct =>
					ct.KhoiID === khoiID && ct.TenMonHoc_HienThi === monHocName
				);
	
				const chiTieuPercent = chiTieu ? (chiTieu[chiTieuField] || 0).toFixed(0) + '%' : '';
	
				let difference = '';
				if (chiTieu && row.TongSoHocSinh > 0) {
					const thucTe = (value / row.TongSoHocSinh) * 100;
					const chiTieuValue = chiTieu[chiTieuField] || 0;
					const diff = (thucTe - chiTieuValue).toFixed(2);
					difference = parseFloat(diff);
				}
	
				rowData.push(value, percent, chiTieuPercent, difference);
			},
	
			addTotalData(rowData, totals, field, isDatChuaDat) {
				const value = totals[field] || 0;
				const percent = totals.tongSiSo ? ((value / totals.tongSiSo) * 100).toFixed(2) + '%' : '0.00%';
				rowData.push(value, percent, '-', '-');
			},
	
			addTongCongData(rowData, totals, field, chiTieuField, monHocName, isDatChuaDat) {
				const value = totals[field] || 0;
				const percent = totals.tongSiSo ? ((value / totals.tongSiSo) * 100).toFixed(2) + '%' : '0.00%';
	
				if (isDatChuaDat) {
					const chiTieu = this.DSChiTieu.find(ct =>
						ct.TenMonHoc_HienThi === monHocName && !ct.KhoiID
					);
	
					const chiTieuPercent = chiTieu ? (chiTieu[chiTieuField] || 0).toFixed(0) + '%' : '';
	
					let difference = '';
					if (chiTieu && totals.tongSiSo > 0) {
						const thucTe = (value / totals.tongSiSo) * 100;
						const chiTieuValue = chiTieu[chiTieuField] || 0;
						const diff = (thucTe - chiTieuValue).toFixed(2);
						difference = parseFloat(diff);
					}
	
					rowData.push(value, percent, chiTieuPercent, difference);
				} else {
					rowData.push(value, percent, '-', '-');
				}
			},
	
			applyMerges(worksheet, monHocName) {
				const isDatChuaDat = this.isDanhGiaDatChuaDat(monHocName);
	
				if (!worksheet['!merges']) worksheet['!merges'] = [];
	
				// Merge Lớp (A1:A3)
				worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 2, c: 0 } });
	
				// Merge Sĩ số (B1:B3)
				worksheet['!merges'].push({ s: { r: 0, c: 1 }, e: { r: 2, c: 1 } });
	
				// Merge categories
				if (isDatChuaDat) {
					// Chưa đạt (C1:F1)
					worksheet['!merges'].push({ s: { r: 0, c: 2 }, e: { r: 0, c: 5 } });
					worksheet['!merges'].push({ s: { r: 1, c: 2 }, e: { r: 1, c: 5 } });
	
					// Đạt (G1:J1)
					worksheet['!merges'].push({ s: { r: 0, c: 6 }, e: { r: 0, c: 9 } });
					worksheet['!merges'].push({ s: { r: 1, c: 6 }, e: { r: 1, c: 9 } });
				} else {
					// Chưa đạt (C1:F1)
					worksheet['!merges'].push({ s: { r: 0, c: 2 }, e: { r: 0, c: 5 } });
					worksheet['!merges'].push({ s: { r: 1, c: 2 }, e: { r: 1, c: 5 } });
	
					// Đạt (G1:J1)
					worksheet['!merges'].push({ s: { r: 0, c: 6 }, e: { r: 0, c: 9 } });
					worksheet['!merges'].push({ s: { r: 1, c: 6 }, e: { r: 1, c: 9 } });
	
					// Khá (K1:N1)
					worksheet['!merges'].push({ s: { r: 0, c: 10 }, e: { r: 0, c: 13 } });
					worksheet['!merges'].push({ s: { r: 1, c: 10 }, e: { r: 1, c: 13 } });
	
					// Tốt (O1:R1)
					worksheet['!merges'].push({ s: { r: 0, c: 14 }, e: { r: 0, c: 17 } });
					worksheet['!merges'].push({ s: { r: 1, c: 14 }, e: { r: 1, c: 17 } });
	
					// Đạt trở lên (S1:V1)
					worksheet['!merges'].push({ s: { r: 0, c: 18 }, e: { r: 0, c: 21 } });
					worksheet['!merges'].push({ s: { r: 1, c: 18 }, e: { r: 1, c: 21 } });
				}
	
				// Set column widths
				const colWidths = [
					{ wch: 15 }, // Lớp
					{ wch: 10 }, // Sĩ số
				];
	
				const numCategories = isDatChuaDat ? 2 : 5;
				for (let i = 0; i < numCategories; i++) {
					colWidths.push(
						{ wch: 8 },  // SL
						{ wch: 10 }, // TL
						{ wch: 12 }, // TL chỉ tiêu
						{ wch: 15 }  // Tăng giảm
					);
				}
	
				worksheet['!cols'] = colWidths;
			},
			onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataChotBaoCao
						}).then(() => {
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
							$this.onSearch()
						})
					}
				})
			}
		},
	}
</script>