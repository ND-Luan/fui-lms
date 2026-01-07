<template>
	<div class="container-page d-flex flex-column ga-2 pa-3">
		<uc-layout-to-truong v-if="!loading" class="flex-1-1" :DataDashboard :CapIDParent="CapID"
			@ChangeCapID="handleChangeCapID" :DSThangHoc />
		<div v-else class="d-flex flex-column ga-2 justify-center align-center" style="height:100dvh">
			<v-progress-circular :width="3" :size="80" color="primary" indeterminate></v-progress-circular>
			<p>Đang tải dữ liệu...</p>
		</div>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			loading: true,
			CapID: 2,
			DataDashboard: {
				ChiTietBT: {},
				ChiTietBH: {},
				ThongKeBaiTap: [],
				ThongKeBaiHoc: [],
				GiaoVienSummary_BT: [],
				GiaoVienSummary_BH: []
			},
			DSThangHoc: []

		}
	},
	async mounted() {
		this.onLoad()
	},
	methods: {
		async onLoad() {
			this.loading = true
			await this.GET_BaoCaoLMS_Dashboard_By_CapID()
			await this.GET_BaoCaoLMS_Dashboard_BaiHoc_By_CapID()
			await this.GET_TuanHocTap_Get()
			console.log('DataDashboard', this.DataDashboard)
			this.loading = false
		},
		clearData() {
			this.DataDashboard = {
				ChiTietBT: {},
				ChiTietBH: {},
				ThongKeBaiTap: [],
				ThongKeBaiHoc: [],
				GiaoVienSummary_BT_BH: []
			}
		},
		async GET_BaoCaoLMS_Dashboard_By_CapID() {
			const response = await ajaxCALLPromise('/lms/BaoCaoLMS_Dashboard_By_CapID',
				{ CapID: this.CapID, NienKhoa: vueData.NienKhoa }
			)
			this.DataDashboard.ChiTietBT = response[0][0]
			this.DataDashboard.ThongKeBaiTap = response[1]
			this.DataDashboard.GiaoVienSummary_BT = response[2]
		},
		async GET_BaoCaoLMS_Dashboard_BaiHoc_By_CapID() {
			const response = await ajaxCALLPromise('/lms/BaoCaoLMS_Dashboard_BaiHoc_By_CapID',
				{ CapID: this.CapID, NienKhoa: vueData.NienKhoa }
			)
			this.DataDashboard.ChiTietBH = response[0][0]
			this.DataDashboard.ThongKeBaiHoc = response[1]
			this.DataDashboard.GiaoVienSummary_BH = response[2]
		},
		handleChangeCapID(CapID) {
			if (!CapID) return
			this.clearData()
			this.CapID = CapID
			this.onLoad()
		},
		async GET_TuanHocTap_Get() {
			const response = await ajaxCALLPromise('/lms/TuanHocTap_Get_Thang_Nam',
				{ NienKhoa: vueData.NienKhoa }
			)
			this.DSThangHoc = response
		}

	},
}
</script>