<template>
	<v-dialog fullscreen>
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" color="primary" text="Import" variant="outlined"></v-btn>
		</template>
		<template v-slot:default="{ isActive }">
			<v-card title="Import dữ liệu">
				<v-card-text class="pa-0">
					<uc-jexcel v-model:dataSource="dataSource" :columns="columns" :minDimensions="[0, 100]"
						style="max-height: calc(100dvh - 148px); overflow: auto" />
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="grey" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" @click="saveData(isActive)" variant="elevated">Import</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			CapID: Number,
			LopItem: Object,
			onLoadFinish: Function
		},
		data() {
	
			return {
				dataSource: [],
				columns: [
					{ title: "HocSinhID", name: "HocSinhID" },
					{ title: "HoTen", name: "HoTen" },
					{ title: "TenLop", name: "TenLop" },
					{ title: "GioiTinh", name: "GioiTinh" },
					{ title: "NgaySinh", name: "NgaySinh" },
					{ title: "ThoiGianThi", name: "ThoiGianThi" },
					{ title: "HocKi", name: "HocKi" },
					{ title: "TenCuocThi", name: "TenCuocThi" },
					{ title: "LinhVucDuAn", name: "LinhVucDuAn" },
					{ title: "MoTaNganGonNoiDung_MucTieu", name: "MoTaNganGonNoiDung_MucTieu" },
					{ title: "GVHuongDan", name: "GVHuongDan" },
					{ title: "To_BoPhan", name: "To_BoPhan" },
					{ title: "GV_ToHoTro", name: "GV_ToHoTro" },
					{ title: "ToChucCongNhan", name: "ToChucCongNhan" },
					{ title: "CapDoGiaiThuong", name: "CapDoGiaiThuong" },
					{ title: "GiaiThuongDatDuoc", name: "GiaiThuongDatDuoc" },
					{ title: "MinhChung_SoHieuQD_LinkChungNhan", name: "MinhChung_SoHieuQD_LinkChungNhan" },
					{ title: "GhiChuBoSung", name: "GhiChuBoSung" }
				],
				DSHocSinh: [],
				DSHocKi: [],
				vueData
			}
		},
		watch: {
			LopItem: function (LopItem) {
				const hk_c1 = [
					{ title: "Giữa HK1", value: "GK_HK1" },
					{ title: "Cuối HK1", value: "CK_HK1" },
					{ title: "Giữa HK2", value: "GK_HK2" },
					{ title: "Cuối HK2", value: "CK_HK2" },
				]
				const hk_c2_c3 = [
					{ title: "HK1", value: "HK1" },
					{ title: "HK2", value: "HK2" },
				]
				if (this.CapID === 1) this.DSHocKi = hk_c1
				else this.DSHocKi = hk_c2_c3
				this.onLoadHS()
			}
		},
		methods: {
			async onLoadHS() {
				this.DSHocSinh = await ajaxCALLPromise("lms/HocSinhLop_Get_ByLopID", { NienKhoa: vueData.NienKhoa, LopID: this.LopItem.LopID })
			},
			async saveData(isActive) {
				const dataSource = this.dataSource.filter(x => !!x.HocSinhID)
				console.log("dataSource", dataSource)
	
				ajaxCALLPromise('lms/TongHopDuLieuCuocThi_Ins_Multiple', { JSON_HocSinh: dataSource, NienKhoa: vueData.NienKhoa })
					.then(() => {
						Vue.$toast.success("Import thành công", { position: "top" })
						this.$emit('onLoadFinish')
						isActive.value = false
					})
			},
			renderTitle(item) {
				return `[${item.HocSinhID}] ${item.HoTen} - ${item.TenLop}`
			}
		},
	}
</script>