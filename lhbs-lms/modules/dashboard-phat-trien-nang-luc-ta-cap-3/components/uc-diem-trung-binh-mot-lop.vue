<template>
	<v-card class="pa-4">
		<v-card :flat="false">
			<v-card-text>
				<v-row>
					<v-col cols="12" md="3">
						<v-select v-model="form.LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID"></v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-select v-model="form.HocKy" label="Chọn học kì" :items="DSHocKy" item-title="title"
							item-value="value"></v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-btn color="primary" variant="tonal" @click="onLoadChart({
							HocKy: form.HocKy,
							KhoiID: khoiid,
							LopID: form.LopID,
							MonHocID: monhocid
						})">
							Xem biểu đồ
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-row class="mt-4">
			<v-col cols="12">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm trung bình
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_DiemTrungBinh_Lop" />
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
export default {
	props: {
		capid: {
			type: Number,
			required: true
		},
		khoiid: {},
		monhocid: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			vueData,
			form: {
				KhoiID: null,
				LopID: null,
				HocKy: null,
			},
			DSHocKy: [
				{
					"title": "HK1",
					"value": "HK1"
				},
				{
					"title": "HK2",
					"value": "HK2"
				}
			],
			DSLop: [],
			DSHocSinh: [],
			Chart_DiemTrungBinh_Lop: {
				series: [],
				chart: {
					height: 400,
					type: 'bar',
				},
				plotOptions: {
					bar: {
						borderRadius: 10,
						dataLabels: {
							position: 'top', // top, center, bottom
						},
					}
				},
				dataLabels: {
					enabled: false,
				},
				xaxis: {
					categories: [],
					tooltip: {
						enabled: true,
					}
				},
				yaxis: {
					labels: {
						formatter: function (val) {
							return val.toFixed(2);
						}
					}

				},
				title: {
					floating: true,
					offsetY: 330,
					align: 'center',
					style: {
						color: '#444'
					}
				}
			}
		}
	},
	mounted() {
		this.onLoadDSLop(this.khoiid)
	},
	computed: {},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		'form.KhoiID': function (KhoiID) {
			if (KhoiID) {
				this.onLoadDSLop(KhoiID)
					.then(() => {
						const isValid = this.DSLop.some(item => item.LopID === this.form.LopID);
						if (!isValid) {
							this.form.LopID = null; // Hoặc gán giá trị mặc định
						}
					});
			}
		}
	},
	methods: {
		onLoadDSLop(KhoiID) {
			return new Promise(resolve => {
				ajaxCALL('lms/Lop_Get_ByKhoiID',
					{
						NienKhoa: vueData.NienKhoa,
						KhoiID: KhoiID
					},
					res => {
						this.DSLop = res.data.filter(x => x.TenLop.includes('AV'))
						resolve()
					}
				)
			})
		},
		onLoadChart({
			HocKy,
			KhoiID,
			LopID,
			MonHocID
		}) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiemTrungBinhTheoThemeVaLop_Get',
					{
						HocKy,
						KhoiID,
						LopID,
						MonHocID
					},
					res => {
						const DataChart_DiemTrungBinhTheme_Lop_API = res.data
						this.Chart_DiemTrungBinh_Lop = {
							...this.Chart_DiemTrungBinh_Lop,
							series: [{
								label: "Điểm",
								data: DataChart_DiemTrungBinhTheme_Lop_API.map(x => parseFloat(x.DiemTrungBinhLop)),
							}],
							xaxis: {
								categories: DataChart_DiemTrungBinhTheme_Lop_API.map(x => x.MaCotDiem)
							}
						}
					})
			})
		},
		calculateLinearRegression
	}
}
</script>