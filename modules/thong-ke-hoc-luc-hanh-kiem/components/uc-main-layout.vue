<template>
	<div>
		<v-card>
			<v-card-title class="d-flex flex-column">
				THỐNG KÊ HỌC TẬP & RÈN LUYỆN
				<div v-if="BaoCaoItem?.IsChotBaoCao" class="text-caption">
					<span class="text-red">Thời điểm chốt:</span>
					[{{BaoCaoItem?.NguoiChot}}] {{BaoCaoItem.HoTenNguoiChot}} • {{BaoCaoItem.NgayChot}}
				</div>
			</v-card-title>
			<v-card-text class="pa-2">
				<v-row dense>
					<v-col cols="3">
						<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
							item-value="value" />
					</v-col>
					<v-col class="d-flex ga-2">
						<v-btn @click="onSearch" text="Tìm kiếm" color="primary" :disabled="!HocKi" />
						<v-btn @click="onExportExcel" text="Xuất Excel" color="green"
							:disabled="!HocKi || vueData.DSHocSinh.length === 0" />
						<v-btn @click="onChotBaoCao" text="Chốt báo cáo" color="amber"
							:disabled="!HocKi || !BaoCaoItem || BaoCaoItem?.IsChotBaoCao" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-tabs v-model="tab">
			<v-tab text="Tất cả khối" :value="0"></v-tab>
			<v-tab text="2 mặt GD" :value="1"></v-tab>
			<v-tab text="Dân tộc" :value="2"></v-tab>
		</v-tabs>
		<v-card>
			<v-card-text class="pa-0">
				<uc-table />
			</v-card-text>
		</v-card>
		<uc-card-empty v-if="vueData.DSHocSinh.length === 0" />
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			const DSHocKi = [
				{
					"title": "Cuối kì 1",
					"value": 1,
					"textValue": "HK1",
				},
				{
					"title": "Cuối kì 2",
					"value": 2,
					"textValue": "HK2",
				},
				{
					"title": "Cả năm",
					"value": 0,
					"textValue": "CaNam",
				}
			]
			const HocKi = DSHocKi.find(x => x.textValue === vueData.hk)?.value || null
	
			return {
				vueData,
				tab: parseInt(vueData.tab ?? 0),
				BaoCaoItem: null,
				DataChotBaoCao: [],
				DSHocKi,
				HocKi
			}
		},
		mounted() {
			if (!this.HocKi) return
			this.onSearch()
		},
		watch: {
			HocKi: function (HocKi) {
				if (HocKi === null) return
				this.onSearch()
			},
			tab: function (tab) {
				if (tab === null) return
				this.onSearch()
			}
		},
		methods: {
			async onSearch() {
				vueData.DSHocSinh = []
				if (!this.HocKi) return
				let data
	
				if (this.tab === 0) data = await this.onLoadTatCaKhoi()
				else if (this.tab === 1) data = await this.onLoad_2_Mat_GD()
				else if (this.tab === 2) data = await this.onLoadDanToc()
	
				let headerDefault = Object.keys(data[0])
				let columnThongTinHocSinh = []
				for (var key of headerDefault) {
					let column = {
						type: 'text',
						title: key,
						name: key,
						width: 80,
						backGroundColor: null,
						wrap: true,
						align: "center",
						readOnly: true,
						style: 'font-size:8px'
					}
					columnThongTinHocSinh.push(column)
				}
				vueData.columnHeader = [...columnThongTinHocSinh]
				vueData.keyComp++
	
				for (var item of data) {
					vueData.DSHocSinh.push(item)
				}
			},
			async onLoadTatCaKhoi() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 20
				else if (vueData.CapID === 3) BaoCaoID = 23
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 2
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onLoad_2_Mat_GD() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 21
				else if (vueData.CapID === 3) BaoCaoID = 24
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung_TheoKhoi`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 1
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onLoadDanToc() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 22
				else if (vueData.CapID === 3) BaoCaoID = 25
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung_TheoKhoi`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 2
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onExportExcel() {
				if (vueData.DSHocSinh.length === 0) {
					Vue.$toast.warning("Không có dữ liệu để xuất", { position: "top" });
					return;
				}
	
				try {
					// Lấy tên học kỳ
					const hocKyInfo = this.DSHocKi.find(x => x.value === this.HocKi);
					const tenHocKy = hocKyInfo ? hocKyInfo.title : "";
	
					// Lấy tên tab
					let tenTab = "";
					if (this.tab === 0) tenTab = "Tat_Ca_Khoi";
					else if (this.tab === 1) tenTab = "2_Mat_GD";
					else if (this.tab === 2) tenTab = "Dan_Toc";
	
					// Tạo tên file
					const fileName = `Thong_Ke_Hoc_Tap_${tenTab}_${hocKyInfo.textValue}_${vueData.NienKhoa}.xlsx`;
	
					// Chuẩn bị dữ liệu
					const dataExport = vueData.DSHocSinh.map(item => {
						let row = {};
						vueData.columnHeader.forEach(col => {
							row[col.title] = item[col.name] || "";
						});
						return row;
					});
	
					// Tạo worksheet
					const ws = XLSX.utils.json_to_sheet(dataExport);
	
					// Tự động căn chỉnh độ rộng cột
					const colWidths = vueData.columnHeader.map(col => ({
						wch: Math.max(col.title.length + 2, 15)
					}));
					ws['!cols'] = colWidths;
	
					// Tạo workbook
					const wb = XLSX.utils.book_new();
					XLSX.utils.book_append_sheet(wb, ws, "Thống kê");
	
					// Xuất file
					XLSX.writeFile(wb, fileName);
	
					Vue.$toast.success("Xuất Excel thành công", { position: "top" });
	
				} catch (error) {
					console.error("Lỗi xuất Excel:", error);
					Vue.$toast.error("Xuất Excel thất bại", { position: "top" });
				}
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
							$this.onSearch()
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
						})
					}
				})
			}
		},
	}
</script>