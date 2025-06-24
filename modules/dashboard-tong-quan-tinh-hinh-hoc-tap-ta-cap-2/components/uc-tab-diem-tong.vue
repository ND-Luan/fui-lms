<template>
	<v-card>
		<v-card-text>
			<v-row dense>
				<v-col cols="12" md="3">
					<v-select v-model="form.LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
						item-value="LopID" :loading="isLoadingLop"></v-select>
				</v-col>
				<v-col cols="12" md="3">
					<v-select v-model="HocKiValue" :items="DSHocKi" item-title="name" item-value="value"
						label="Chọn học kì"></v-select>
				</v-col>
				<v-col>
					<v-btn color="primary" :disabled='!HocKiValue || !form.LopID' variant="tonal" @click="onLoadChart({
						NienKhoa: vueData.NienKhoa,
						KhoiID: khoiid,
						LopID: form.LopID,
						MonHocID: monhocid
					})">Xem biểu đồ</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
		<v-card-text>
			<uc-chart-apex :options="Chart_TongDiem" />
		</v-card-text>
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
			HocKiValue: 1,
			DSHocKi: [
				{
					name: "Học kì 1",
					value: 1
				},
				{
					name: "Học kì 2",
					value: 2
				}
			],
			form: {
				KhoiID: this.khoiid,
				LopID: null,
				MonHocItem: {
					MonHocID: this.monhocid
				},
			},
			DSLop: [],
			isLoadingLop: false,
			Chart_TongDiem: {
				chart: {
					type: "line",
					height: 350
				},
				series: []
			}
		}
	},
	mounted() {
		if (!this.khoiid) return
		this.onLoadDSLop(this.khoiid)
	},
	computed: {},
	watch: {
		khoiid: function (khoiID) {
			if (khoiID) {
				this.Chart_TongDiem = {
					chart: {
						type: "line",
						height: 350
					},
					series: []
				}
				this.onLoadDSLop(khoiID)
					.then(() => {
						const isValid = this.DSLop.some(item => item.LopID === this.form.LopID);
						if (!isValid) {
							this.form.LopID = null; // Hoặc gán giá trị mặc định
						}
					});
			}
		},
		HocKiValue: function (val) {
			if (val) {
				this.onLoadChart({
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.khoiid,
					LopID: this.form.LopID,
					MonHocID: this.monhocid
				})
			}
		},
		'form.LopID': function (val) {
			if (val && this.HocKiValue) {
				this.onLoadChart({
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.khoiid,
					LopID: this.form.LopID,
					MonHocID: this.monhocid
				})
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
						this.DSLop = res.data
						resolve()
					}
				)
			})
		},
		onLoadChart({ NienKhoa, KhoiID, LopID, MonHocID }) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashBoardThayDoiTongDiem_Get',
					{
						NienKhoa,
						KhoiID,
						LopID,
						MonHocID,
						HocKy: this.HocKiValue
					},
					res => {
						const TongDiem = res.data
						const series = [
							{
								name: "Điểm giữa kì " + this.HocKiValue,
								data: TongDiem.map(x => x.DiemGK1)
							},
							{
								name: "Điểm cuối kì " + this.HocKiValue,
								data: TongDiem.map(x => x.DiemCK1)
							}
						]
						const categories = [...new Set(TongDiem.map(x => x.HoTen))]
						this.Chart_TongDiem = {
							...this.Chart_TongDiem,
							series: series,
							xaxis: {
								categories: categories
							},
							dataLabels: {
								enabled: false
							},
							grid: {
								row: {
									colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
									opacity: 0.5
								},
							},
							stroke: {
								show: true,
								width: 2,
								// colors: ['transparent']
							},
						}
						resolve()
					}
				)
			})
		},
	},
}
</script>