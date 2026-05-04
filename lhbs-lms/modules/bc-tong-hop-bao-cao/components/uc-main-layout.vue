<template>
	<div>
		<v-row>
			<v-col cols="4">
				<v-select v-model="CapID" label="Chọn cấp" :items="DSCap" item-title="title" item-value="value" />
			</v-col>
			<v-col cols="8">
				<v-btn text="Tìm kiếm" color="primary" variant="elevated" @click="onLoadBaoCaoByCapID(CapID)" />
			</v-col>
			<v-divider />
			<v-col cols="4" class="pa-0">
				<uc-table-bao-cao v-model:BaoCaoSelected="BaoCaoSelected" :CapID :headerBaoCaos :itemBaoCaos
					@onAddFinnish="onLoadBaoCaoByCapID(CapID)" @onEditFinnish="onLoadBaoCaoByCapID(CapID)"
					@onDeleteFinnish="onLoadBaoCaoByCapID(CapID)" :IsActionPermission />
			</v-col>
			<v-divider vertical />
			<v-col cols="8" class="pa-0">
				<uc-table-bao-cao-chi-tiet :BaoCaoSelected="BaoCaoSelected" :CapID :headerBaoCaoChiTiets
					:itemBaoCaoChiTiets @onAddFinnish="onLoadBaoCaoChiTiet(BaoCaoSelected?.BaoCaoID ?? 0)"
					@onEditFinnish="onLoadBaoCaoChiTiet(BaoCaoSelected?.BaoCaoID ?? 0)"
					@onDeleteFinnish="onLoadBaoCaoChiTiet(BaoCaoSelected?.BaoCaoID ?? 0)" :IsActionPermission />
			</v-col>
		</v-row>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				Users: ['NA0000022'],
				DSCap: [
					{ title: "Tiểu học", value: 1 },
					{ title: "Trung học cơ sở", value: 2 },
					{ title: "Trung học phổ thông", value: 3 },
					{ title: "Khác", value: 0 },
				],
				DSMonHoc: [],
				MonHocID: null,
				headerBaoCaos: [
					{
						title: "ID",
						value: "BaoCaoID",
						align: "center",
					},
					{
						title: "Tên báo cáo",
						value: "TenBaoCao"
					},
					{
						title: "Môn học",
						value: "TenMonHoc_HienThi"
					},
					{
						title: "Thao tác",
						key: "actions",
						align: "center",
						sortable: false,
						value: "actions"
					}
				],
				itemBaoCaos: [],
				headerBaoCaoChiTiets: [
					{
						title: "ID",
						value: "BaoCao_ChiTietID",
						align: "center",
					},
					// {
					// 	title: "Tên báo cáo",
					// 	value: "TenBaoCao_ChiTiet"
					// },
					{
						title: "Học kì",
						value: "HocKi"
					},
					{
						title: "JSON",
						value: "JSON_BaoCao"
					},
					{
						title: "Link",
						value: "Url_BaoCao"
					},
					{
						title: "Ngày/Người chốt",
						value: "NgayNguoiChot"
					},
					{
						title: "Thao tác",
						key: "actions",
						align: "center",
						sortable: false,
						value: "actions"
					}
				],
				itemBaoCaoChiTiets: [],
				BaoCaoSelected: null,
				CapID: 1
			}
		},
		mounted() {
			this.onLoadBaoCaoByCapID(this.CapID)
		},
		watch: {
			CapID: function (CapID) {
				this.BaoCaoSelected = null
				this.itemBaoCaoChiTiets = []
				this.onLoadBaoCaoByCapID(CapID)
			},
			BaoCaoSelected: function (baoCao) {
				if (!baoCao) return
				this.onLoadBaoCaoChiTiet(baoCao.BaoCaoID)
			}
		},
		computed: {
			IsActionPermission: function () {
				return this.Users.includes(vueData.user.UserID)
			}
		},
		methods: {
			async onLoadBaoCaoByCapID(CapID) {
				this.itemBaoCaos = await ajaxCALLPromise("lms/BaoCao_TongHop_Get", { CapID })
			},
			async onLoadBaoCaoChiTiet(BaoCaoID) {
				this.itemBaoCaoChiTiets = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_ByBaoCaoID", { BaoCaoID })
			}
		},
	}
</script>