<template>
	<div>
		<v-card>
			<v-card-title class="text-primary">
				{{ getTitlePageByURL(urlPage) }}
			</v-card-title>
			<v-card-text>
				<v-row dense>
					<v-col cols="2">
						<v-select v-model="KhoiID" label="Khối" :items="DSKhoi"></v-select>
					</v-col>
					<v-col cols="2">
						<v-select v-model="HocKyValue" label="Học kì" :items="DSKiHoc"></v-select>
					</v-col>
					<v-col class="d-flex ga-2">
						<v-btn variant='outlined' color="primary" @click="GET_BaoCao_Cambridge_C2">
							Xem thống kê
						</v-btn>
						<v-btn :disabled="DataSheet?.length === 0" variant="outlined" color="success"
							@click="exportToExcel" prepend-icon="mdi-file-excel">
							Xuất Excel
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-row>
			<v-col cols="12" sm="12" md="6" lg="6">
				<v-card>
					<v-card-title class="d-flex" style="text-wrap: auto;">
						<span class="text-primary">Tỉ lệ từng kĩ năng</span>
						<v-spacer></v-spacer>
					</v-card-title>
					<v-card-text class="pa-0">
						<uc-chart-apex v-if="!isLoading" v-model="chart" :options="optionChartThongKeTheo_Khoi"
							:key="keyCompChart1" />
						<uc-card-empty v-else />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" sm="12" md="6" lg="6">
				<v-card>
					<v-card-title class="d-flex" style="text-wrap: auto;">
						<span class="text-primary">Tỉ lệ từng kĩ năng theo Khối/Lớp</span>
						<v-spacer></v-spacer>
					</v-card-title>
					<v-card-text class="pa-0 custom-legend-style">
						<uc-chart-apex v-if="!isLoading" v-model="chart" :options="optionChartThongKeTheo_KhoiAll"
							:key="keyCompChart2" />
						<uc-card-empty v-else />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12">
				<v-card>
					<v-card-text>
						<uc-jexcel v-if="DataSheet?.length > 0" v-model="instance" :freezeColumns="freezeColumns"
							v-model:dataSource="DataSheet" :columns="columnHeader" :nestedHeaders="nestedHeaders"
							:key="keyComp">
						</uc-jexcel>
						<uc-card-empty v-else />
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>
<script>
	export default {
		props: [],
		data() {
			let urlPage = window.location.pathname + window.location.search
			return {
				vueData,
				chart: null,
				KhoiID: 0,
				keyCompChart1: 0,
				keyCompChart2: 0,
				DSKhoi: [
					{
						title: "Tất cả các khối",
						value: 0,
					},
					{
						title: "Khối 6",
						value: 6
					},
					{
						title: "Khối 7",
						value: 7
					},
					{
						title: "Khối 8",
						value: 8
					}, {
						title: "Khối 9",
						value: 9
					}
				],
				legendConfig: [
	
	
					{
						category: 'vuot-dat',
						label: 'Vượt đạt',
						color: '#0d5c2f'
					},
					{
						category: 'dat',
						label: 'Đạt',
						color: '#90ee90'
					}, {
						category: 'chua-dat',
						label: 'Chưa đạt',
						color: '#ffd700'
					},
				],
				optionChart: {
					series: [],
					chart: {
						type: 'bar',
						height: 450,
						stacked: true,
						toolbar: {
							show: true
						}
					},
					stroke: {
						width: 1,
						colors: ['#fff']
					},
					dataLabels: {
						enabled: true,
						formatter: function (val) {
							if (val < 3) return '';
							return val.toFixed(2) + '%';
						},
						style: {
							fontSize: '11px',
							colors: ['#333'],
							fontWeight: 600
						}
					},
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: '70%'
						}
					},
					xaxis: {
						categories: ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'],
						labels: {
							style: {
								fontSize: '13px',
								fontWeight: 500
							}
						}
					},
					fill: {
						opacity: 1
					},
					colors: [
						'#ffd700', '#90ee90', '#0d5c2f',
						'#ffd700', '#90ee90', '#0d5c2f',
					],
					yaxis: {
						labels: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						},
						max: 100
					},
					legend: {
						show: false
					},
					grid: {
						borderColor: '#e7e7e7',
						padding: {
							bottom: 10
						}
					},
					tooltip: {
						shared: false,
						y: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						}
					}
				},
				vueData,
				freezeColumns: 2,
				DataSheet: [],
				instance: null,
				urlPage: urlPage,
				columnHeader: [
					{
						"type": "text",
						"title": "Tên lớp",
						"name": "TenLop",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Phân loại",
						"name": "PhanLoai",
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true,
						align: 'start',
						"width": "300"
					},
					{
						"type": "text",
						"title": "Sỉ Số",
						"name": "SiSo",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Số lượng",
						"name": "SL_Nghe",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Tỷ lệ %",
						"name": "TL_Nghe",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Số lượng",
						"name": "SL_Doc",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Tỷ lệ %",
						"name": "TL_Doc",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Số lượng",
						"name": "SL_Viet",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Tỷ lệ %",
						"name": "TL_Viet",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Số lượng",
						"name": "SL_Noi",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Tỷ lệ %",
						"name": "TL_Noi",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Số lượng",
						"name": "SL_DanhGiaChung",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
					{
						"type": "text",
						"title": "Tỷ lệ %",
						"name": "TL_DanhGiaChung",
						"width": 80,
						"backGroundColor": null,
						"wrap": true,
						"readOnly": true
					},
				],
				nestedHeaders: [
					[
						{
							"title": "",
							"colspan": 3,
							"id": ""
						},
						{
							"title": "Nghe",
							"colspan": 2,
							"id": ""
						},
						{
							"title": "Đọc",
							"colspan": 2,
							"id": ""
						},
						{
							"title": "Viết",
							"colspan": 2,
							"id": ""
						},
						{
							"title": "Nói",
							"colspan": 2,
							"id": ""
						},
						{
							"title": "Trung bình",
							"colspan": 2,
							"id": ""
						}
					]
				],
				keyComp: 0,
				List_LopID: null,
				HocKyValue: null,
				DSKiHoc: [
					{
						title: 'Giữa HK1',
						value: 'GK_HK1'
					},
					{
						title: 'Cuối HK1',
						value: 'CK_HK1'
					},
					{
						title: 'Giữa HK2',
						value: 'GK_HK2'
					},
					{
						title: 'Cuối HK2',
						value: 'CK_HK2'
					}
				],
				DSLop: [],
				optionChartThongKeTheo_Khoi: {
					series: [],
					chart: {
						type: 'bar',
						height: 450,
						stacked: true,
						toolbar: {
							show: true
						}
					},
					stroke: {
						width: 1,
						colors: ['#fff']
					},
					dataLabels: {
						enabled: true,
						formatter: function (val) {
							if (val < 3) return '';
							return val.toFixed(2) + '%';
						},
						style: {
							fontSize: '11px',
							colors: ['#333'],
							fontWeight: 600
						}
					},
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: '70%'
						}
					},
					xaxis: {
						categories: ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'],
						labels: {
							style: {
								fontSize: '13px',
								fontWeight: 500
							}
						}
					},
					fill: {
						opacity: 1
					},
					colors: ['#ef4444', '#6db2ffd6', '#22c55e'],
					yaxis: {
						labels: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						},
						max: 100
					},
					legend: {
						show: true
					},
					grid: {
						borderColor: '#e7e7e7',
						padding: {
							bottom: 10
						}
					},
					tooltip: {
						shared: false,
						y: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						}
					}
				},
				isLoading: false,
				optionChartThongKeTheo_KhoiAll: {
					series: [],
					chart: {
						type: 'bar',
						height: 450,
						stacked: true,
						toolbar: {
							show: true
						}
					},
					stroke: {
						width: 1,
						colors: ['#fff']
					},
					dataLabels: {
						enabled: false,
						formatter: function (val) {
							if (val < 3) return '';
							return val.toFixed(2) + '%';
						},
						style: {
							fontSize: '11px',
							colors: ['#333'],
							fontWeight: 600
						}
					},
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: '80%'
						}
					},
					xaxis: {
						categories: ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'],
						labels: {
							style: {
								fontSize: '13px',
								fontWeight: 500
							}
						}
					},
					fill: {
						opacity: 1
					},
					colors: ['#ef4444', '#6db2ffd6', '#22c55e'],
					yaxis: {
						labels: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						},
						max: 100
					},
					legend: {
						show: true,
						customLegendItems: ['Chưa đạt', 'Đạt', 'Vượt yêu cầu'], // Chỉ hiện 3 items thay vì 27
						markers: {
							fillColors: ['#ef4444', '#6db2ffd6', '#22c55e'] // Màu tương ứng
						},
						position: 'bottom', // top, bottom, left, right
						horizontalAlign: 'center', // left, center, right
						floating: false,
					},
					grid: {
						borderColor: '#e7e7e7',
						padding: {
							bottom: 10
						}
					},
					tooltip: {
						shared: false,
						y: {
							formatter: function (val) {
								return val.toFixed(2) + '%';
							}
						}
					}
				},
			}
		},
		mounted() {
			this.getKhoi()
			this.HocKyValue = 'GK_HK1'
			// this.GET_BaoCao_Cambridge_C2()
		},
		watch: {
			KhoiID: function (val) {
				if (val !== null) {
					this.DataSheet = []
					// Clear charts
					this.optionChartThongKeTheo_Khoi.series = []
					this.optionChartThongKeTheo_KhoiAll.series = []
					this.keyCompChart1++
					this.keyCompChart2++
				}
			},
			List_LopID: function (val) {
				if (val) {
					this.HocKyValue = null
				}
			},
			HocKyValue: function (val) {
				if (val && (this.KhoiID !== null)) {
					this.DataSheet = []
	
					// Clear charts trước khi load mới
					this.optionChartThongKeTheo_Khoi.series = []
					this.optionChartThongKeTheo_KhoiAll.series = []
					this.keyCompChart1++
					this.keyCompChart2++
					this.GET_BaoCao_Cambridge_C2()
				}
			}
		},
		methods: {
			async getKhoi() {
				// this.DSKhoi = await ajaxCALLPromise("lms/KhoiHocByCapHoc_Get", { CapID: 2 })
			},
			async GET_BaoCao_Cambridge_C2() {
				this.isLoading = true;
				this.Data_BC_Cambridge = await ajaxCALLPromise('lms/BaoCao_Cambridge_C2', {
					KhoiID: this.KhoiID,
					NienKhoa: vueData.NienKhoa,
					HocKi: this.HocKyValue
				});
	
				console.log('this.Data_BC_Cambridge', this.Data_BC_Cambridge);
	
				await this.createSeriesForGrades(this.Data_BC_Cambridge);
				await this.createSeriesForAllGrades(this.Data_BC_Cambridge);
	
				// Sửa filter cho table
				if (this.KhoiID === 0) {
					await this.createDataForTable(this.Data_BC_Cambridge);
				} else {
					await this.createDataForTable(
						this.Data_BC_Cambridge.filter(item => item.KhoiID === this.KhoiID)
					);
				}
	
				this.isLoading = false;
			},
	
			async createSeriesForGrades(data) {
				let gradeData;
	
				if (this.KhoiID === 0) {
					// Tính tổng hợp từ tất cả các khối
					gradeData = this.calculateTotalForAllGrades(data);
				} else {
					// Lấy dữ liệu của khối cụ thể
					gradeData = data.find(item => item.TenLop === 'Khối ' + this.KhoiID);
				}
	
				if (!gradeData) {
					console.warn('Không tìm thấy dữ liệu cho khối:', this.KhoiID);
					return;
				}
	
				const categories = ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'];
	
				const series = [
					{
						name: 'Chưa đạt',
						data: [
							gradeData?.TL_Nghe_CD ?? 0,
							gradeData?.TL_Doc_CD ?? 0,
							gradeData?.TL_Viet_CD ?? 0,
							gradeData?.TL_Noi_CD ?? 0,
							gradeData?.TL_DanhGiaChung_CD ?? 0
						]
					},
					{
						name: 'Đạt',
						data: [
							gradeData?.TL_Nghe_D ?? 0,
							gradeData?.TL_Doc_D ?? 0,
							gradeData?.TL_Viet_D ?? 0,
							gradeData?.TL_Noi_D ?? 0,
							gradeData?.TL_DanhGiaChung_D ?? 0
						]
					},
					{
						name: 'Vượt yêu cầu',
						data: [
							gradeData?.TL_Nghe_VYC ?? 0,
							gradeData?.TL_Doc_VYC ?? 0,
							gradeData?.TL_Viet_VYC ?? 0,
							gradeData?.TL_Noi_VYC ?? 0,
							gradeData?.TL_DanhGiaChung_VYC ?? 0
						]
					}
				];
	
				this.optionChartThongKeTheo_Khoi.series = series;
				this.optionChartThongKeTheo_Khoi.xaxis.categories = categories;
				this.keyCompChart1++;
			},
	
			calculateTotalForAllGrades(data) {
				// Lọc chỉ lấy các dòng tổng của từng khối (Khối 6, Khối 7, ...)
				const gradeSummaries = data.filter(item =>
					item.TenLop && item.TenLop.startsWith('Khối ') &&
					item.KhoiID !== 0
				);
	
				if (gradeSummaries.length === 0) return null;
	
				// Tính tổng số lượng
				const totals = {
					TongSoHocSinh: 0,
					SL_Nghe_CD: 0, SL_Nghe_D: 0, SL_Nghe_VYC: 0,
					SL_Doc_CD: 0, SL_Doc_D: 0, SL_Doc_VYC: 0,
					SL_Viet_CD: 0, SL_Viet_D: 0, SL_Viet_VYC: 0,
					SL_Noi_CD: 0, SL_Noi_D: 0, SL_Noi_VYC: 0,
					SL_DanhGiaChung_CD: 0, SL_DanhGiaChung_D: 0, SL_DanhGiaChung_VYC: 0
				};
	
				gradeSummaries.forEach(grade => {
					totals.TongSoHocSinh += grade.TongSoHocSinh || 0;
					totals.SL_Nghe_CD += grade.SL_Nghe_CD || 0;
					totals.SL_Nghe_D += grade.SL_Nghe_D || 0;
					totals.SL_Nghe_VYC += grade.SL_Nghe_VYC || 0;
					totals.SL_Doc_CD += grade.SL_Doc_CD || 0;
					totals.SL_Doc_D += grade.SL_Doc_D || 0;
					totals.SL_Doc_VYC += grade.SL_Doc_VYC || 0;
					totals.SL_Viet_CD += grade.SL_Viet_CD || 0;
					totals.SL_Viet_D += grade.SL_Viet_D || 0;
					totals.SL_Viet_VYC += grade.SL_Viet_VYC || 0;
					totals.SL_Noi_CD += grade.SL_Noi_CD || 0;
					totals.SL_Noi_D += grade.SL_Noi_D || 0;
					totals.SL_Noi_VYC += grade.SL_Noi_VYC || 0;
					totals.SL_DanhGiaChung_CD += grade.SL_DanhGiaChung_CD || 0;
					totals.SL_DanhGiaChung_D += grade.SL_DanhGiaChung_D || 0;
					totals.SL_DanhGiaChung_VYC += grade.SL_DanhGiaChung_VYC || 0;
				});
	
				// Tính tỷ lệ %
				return {
					TenLop: 'Tất cả các khối',
					TongSoHocSinh: totals.TongSoHocSinh,
					TL_Nghe_CD: (totals.SL_Nghe_CD / totals.TongSoHocSinh * 100) || 0,
					TL_Nghe_D: (totals.SL_Nghe_D / totals.TongSoHocSinh * 100) || 0,
					TL_Nghe_VYC: (totals.SL_Nghe_VYC / totals.TongSoHocSinh * 100) || 0,
					TL_Doc_CD: (totals.SL_Doc_CD / totals.TongSoHocSinh * 100) || 0,
					TL_Doc_D: (totals.SL_Doc_D / totals.TongSoHocSinh * 100) || 0,
					TL_Doc_VYC: (totals.SL_Doc_VYC / totals.TongSoHocSinh * 100) || 0,
					TL_Viet_CD: (totals.SL_Viet_CD / totals.TongSoHocSinh * 100) || 0,
					TL_Viet_D: (totals.SL_Viet_D / totals.TongSoHocSinh * 100) || 0,
					TL_Viet_VYC: (totals.SL_Viet_VYC / totals.TongSoHocSinh * 100) || 0,
					TL_Noi_CD: (totals.SL_Noi_CD / totals.TongSoHocSinh * 100) || 0,
					TL_Noi_D: (totals.SL_Noi_D / totals.TongSoHocSinh * 100) || 0,
					TL_Noi_VYC: (totals.SL_Noi_VYC / totals.TongSoHocSinh * 100) || 0,
					TL_DanhGiaChung_CD: (totals.SL_DanhGiaChung_CD / totals.TongSoHocSinh * 100) || 0,
					TL_DanhGiaChung_D: (totals.SL_DanhGiaChung_D / totals.TongSoHocSinh * 100) || 0,
					TL_DanhGiaChung_VYC: (totals.SL_DanhGiaChung_VYC / totals.TongSoHocSinh * 100) || 0
				};
			},
	
			async createSeriesForAllGrades(data) {
				let gradeData;
	
				if (this.KhoiID === 0) {
					// Lấy tất cả các khối
					gradeData = data.filter(item =>
						item.TenLop && item.TenLop.startsWith('Khối ') &&
						item.KhoiID !== 0
					);
				} else {
					// Lấy các lớp của khối cụ thể
					gradeData = data.filter(item => item.KhoiID === this.KhoiID);
				}
	
				if (gradeData.length === 0) {
					console.warn('Không có dữ liệu cho chart');
					return;
				}
	
				const categories = ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'];
				const series = [];
	
				gradeData.forEach(item => {
					series.push({
						name: `${item.TenLop} - Chưa đạt`,
						group: item.TenLop,
						data: [
							item.TL_Nghe_CD || 0,
							item.TL_Doc_CD || 0,
							item.TL_Viet_CD || 0,
							item.TL_Noi_CD || 0,
							item.TL_DanhGiaChung_CD || 0
						]
					});
					series.push({
						name: `${item.TenLop} - Đạt`,
						group: item.TenLop,
						data: [
							item.TL_Nghe_D || 0,
							item.TL_Doc_D || 0,
							item.TL_Viet_D || 0,
							item.TL_Noi_D || 0,
							item.TL_DanhGiaChung_D || 0
						]
					});
					series.push({
						name: `${item.TenLop} - Vượt yêu cầu`,
						group: item.TenLop,
						data: [
							item.TL_Nghe_VYC || 0,
							item.TL_Doc_VYC || 0,
							item.TL_Viet_VYC || 0,
							item.TL_Noi_VYC || 0,
							item.TL_DanhGiaChung_VYC || 0
						]
					});
				});
	
				this.optionChartThongKeTheo_KhoiAll.series = series;
				this.optionChartThongKeTheo_KhoiAll.xaxis.categories = categories;
				this.keyCompChart2++;
			},
	
			async createDataForTable(data) {
				let filteredData;
	
				if (this.KhoiID === 0) {
					// Hiển thị tất cả các khối và lớp
					filteredData = data;
				} else {
					// Hiển thị khối cụ thể
					filteredData = data.filter(item => item.KhoiID === this.KhoiID);
				}
	
				let dataTable = [];
	
				filteredData.forEach(lop => {
					dataTable.push({
						TenLop: lop.TenLop,
						PhanLoai: 'Not Meeting Requirements/Chưa đạt',
						SiSo: lop.TongSoHocSinh,
						SL_Nghe: lop.SL_Nghe_CD,
						TL_Nghe: lop.TL_Nghe_CD,
						SL_Doc: lop.SL_Doc_CD,
						TL_Doc: lop.TL_Doc_CD,
						SL_Noi: lop.SL_Noi_CD,
						TL_Noi: lop.TL_Noi_CD,
						SL_Viet: lop.SL_Viet_CD,
						TL_Viet: lop.TL_Viet_CD,
						SL_DanhGiaChung: lop.SL_DanhGiaChung_CD,
						TL_DanhGiaChung: lop.TL_DanhGiaChung_CD,
					});
					dataTable.push({
						TenLop: lop.TenLop,
						PhanLoai: 'Meeting Requirements/Đạt yêu cầu',
						SiSo: lop.TongSoHocSinh,
						SL_Nghe: lop.SL_Nghe_D,
						TL_Nghe: lop.TL_Nghe_D,
						SL_Doc: lop.SL_Doc_D,
						TL_Doc: lop.TL_Doc_D,
						SL_Noi: lop.SL_Noi_D,
						TL_Noi: lop.TL_Noi_D,
						SL_Viet: lop.SL_Viet_D,
						TL_Viet: lop.TL_Viet_D,
						SL_DanhGiaChung: lop.SL_DanhGiaChung_D,
						TL_DanhGiaChung: lop.TL_DanhGiaChung_D,
					});
					dataTable.push({
						TenLop: lop.TenLop,
						PhanLoai: 'Exceeding Requirements/Vượt yêu cầu',
						SiSo: lop.TongSoHocSinh,
						SL_Nghe: lop.SL_Nghe_VYC,
						TL_Nghe: lop.TL_Nghe_VYC,
						SL_Doc: lop.SL_Doc_VYC,
						TL_Doc: lop.TL_Doc_VYC,
						SL_Noi: lop.SL_Noi_VYC,
						TL_Noi: lop.TL_Noi_VYC,
						SL_Viet: lop.SL_Viet_VYC,
						TL_Viet: lop.TL_Viet_VYC,
						SL_DanhGiaChung: lop.SL_DanhGiaChung_VYC,
						TL_DanhGiaChung: lop.TL_DanhGiaChung_VYC,
					});
				});
	
				this.DataSheet = dataTable;
			},
	
			async exportToExcel() {
				try {
					// Import thư viện XLSX
					const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
	
					// Tạo workbook mới
					const wb = XLSX.utils.book_new();
	
					// Tạo tiêu đề cho file
					const titleRow = [`Bảng thống kê tỉ lệ  - ${this.KhoiID === 0 ? 'Tất cả các khối' : 'Khối ' +
						this.KhoiID} - ${this.getHocKyText(this.HocKyValue)} - Niên khóa ${vueData.NienKhoa}`];
	
					// Tạo header với 2 rows
					// Row 1: Tên lớp, Phân loại, Sĩ Số và các nhóm kỹ năng
					const headerRow1 = [
						'Tên lớp',
						'Phân loại',
						'Sĩ Số',
						'Nghe', '',
						'Đọc', '',
						'Viết', '',
						'Nói', '',
						'Trung bình', ''
					];
	
					// Row 2: Chi tiết columns cho các kỹ năng
					const headerRow2 = [
						'', '', '', // 3 cột trống cho Tên lớp, Phân loại, Sĩ Số (đã merge từ trên xuống)
						'Số lượng', 'Tỷ lệ %',
						'Số lượng', 'Tỷ lệ %',
						'Số lượng', 'Tỷ lệ %',
						'Số lượng', 'Tỷ lệ %',
						'Số lượng', 'Tỷ lệ %'
					];
	
					// Tạo data rows - Điền đầy đủ TenLop và SiSo cho tất cả 3 rows
					const dataRows = [];
					let currentClass = '';
					let currentSiSo = '';
	
					this.DataSheet.forEach((row, index) => {
						if (row.TenLop !== currentClass) {
							currentClass = row.TenLop;
							currentSiSo = row.SiSo;
						}
	
						dataRows.push([
							currentClass,
							row.PhanLoai,
							currentSiSo,
							row.SL_Nghe,
							row.TL_Nghe,
							row.SL_Doc,
							row.TL_Doc,
							row.SL_Viet,
							row.TL_Viet,
							row.SL_Noi,
							row.TL_Noi,
							row.SL_DanhGiaChung,
							row.TL_DanhGiaChung
						]);
					});
	
					// Kết hợp tất cả rows
					const wsData = [
						titleRow,
						[],
						headerRow1,
						headerRow2,
						...dataRows
					];
	
					// Tạo worksheet
					const ws = XLSX.utils.aoa_to_sheet(wsData);
	
					// Định nghĩa merge cells
					const merges = [
						// Merge title row
						{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
	
						// Merge 3 cột đầu từ row 2 xuống row 3 (header merge dọc)
						{ s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, // Tên lớp
						{ s: { r: 2, c: 1 }, e: { r: 3, c: 1 } }, // Phân loại
						{ s: { r: 2, c: 2 }, e: { r: 3, c: 2 } }, // Sĩ số
	
						// Merge ngang cho các kỹ năng ở row 2 (header merge ngang)
						{ s: { r: 2, c: 3 }, e: { r: 2, c: 4 } }, // Nghe
						{ s: { r: 2, c: 5 }, e: { r: 2, c: 6 } }, // Đọc
						{ s: { r: 2, c: 7 }, e: { r: 2, c: 8 } }, // Viết
						{ s: { r: 2, c: 9 }, e: { r: 2, c: 10 } }, // Nói
						{ s: { r: 2, c: 11 }, e: { r: 2, c: 12 } } // Trung bình
					];
	
					// Merge TenLop và SiSo cho mỗi lớp (3 rows)
					let processedClasses = {};
	
					this.DataSheet.forEach((row, index) => {
						const dataRowIndex = 4 + index;
	
						if (!processedClasses[row.TenLop]) {
							processedClasses[row.TenLop] = dataRowIndex;
	
							merges.push(
								{ s: { r: dataRowIndex, c: 0 }, e: { r: dataRowIndex + 2, c: 0 } }, // TenLop
								{ s: { r: dataRowIndex, c: 2 }, e: { r: dataRowIndex + 2, c: 2 } } // SiSo
							);
						}
					});
	
					ws['!merges'] = merges;
	
					// Định dạng column widths
					ws['!cols'] = [
						{ wch: 15 }, // Tên lớp
						{ wch: 38 }, // Phân loại
						{ wch: 10 }, // Sĩ số
						{ wch: 12 }, // SL Nghe
						{ wch: 12 }, // TL Nghe
						{ wch: 12 }, // SL Đọc
						{ wch: 12 }, // TL Đọc
						{ wch: 12 }, // SL Viết
						{ wch: 12 }, // TL Viết
						{ wch: 12 }, // SL Nói
						{ wch: 12 }, // TL Nói
						{ wch: 12 }, // SL TB
						{ wch: 12 } // TL TB
					];
	
					// Thêm worksheet vào workbook
					XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
	
					// Tạo tên file
					const fileName = `BaoCao_Cambridge_${this.KhoiID === 0 ? 'TatCa' : 'Khoi' +
						this.KhoiID}_${this.HocKyValue}_${vueData.NienKhoa}.xlsx`;
	
					// Xuất file
					XLSX.writeFile(wb, fileName);
	
					// Hiển thị thông báo thành công
					if (typeof notify !== 'undefined') {
						notify('Xuất Excel thành công!', 'success');
					}
				} catch (error) {
					console.error('Lỗi khi xuất Excel:', error);
					if (typeof notify !== 'undefined') {
						notify('Có lỗi xảy ra khi xuất Excel', 'error');
					}
				}
			},
			getHocKyText(value) {
				const hocKy = this.DSKiHoc.find(item => item.value === value);
				return hocKy ? hocKy.title : value;
			},
			getTitlePageByURL,
			ajaxCALLPromise
		}
	}
</script>