<template>
	<v-dialog max-width="800">
		<template v-slot:activator="{ props: activatorProps }">
		<v-btn v-bind="activatorProps" color="primary" variant="outlined" prepend-icon="mdi-plus">
			Tạo
		</v-btn>
		</template>
		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex">
					<span class="text-primary">Tạo dữ liệu cuộc thi</span>
					<v-spacer />
					<v-icon size="small" @click="isActive.value = false">mdi-close</v-icon>
				</v-card-title>
				<v-card-text>
					<v-form ref="form">
						<v-row>
							<v-col cols="12" md="6">
								<v-autocomplete v-model="formData.HocSinhID" label="Học sinh" :items="DSHocSinh"
									:item-title="renderTitle" item-value="HocSinhID" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.ThoiGianThi" label="Thời gian thi" />
							</v-col>
							<v-col cols="12" md="6">
								<v-select v-model="formData.HocKi" label="Học kì" :items="DSHocKi" item-title="title"
									item-value="value" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.TenCuocThi" label="Tên cuộc thi" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.LinhVucDuAn" label="Lĩnh vực dự án" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.GVHuongDan" label="GV hướng dẫn" />
							</v-col>
							<v-col cols="12">
								<v-textarea v-model="formData.MoTaNganGonNoiDung_MucTieu"
									label="Mô tả ngắn gọn nội dung/mục tiêu" rows="3" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.To_BoPhan" label="Tổ/bộ phận" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.GV_ToHoTro" label="GV/tổ hỗ trợ" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.ToChucCongNhan" label="Tổ chức công nhận" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.CapDoGiaiThuong" label="Cấp độ giải thưởng" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.GiaiThuongDatDuoc" label="Giải thưởng đạt được" />
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="formData.MinhChung_SoHieuQD_LinkChungNhan"
									label="Minh chứng (Số hiệu QĐ/link chứng nhận)" />
							</v-col>
							<v-col cols="12">
								<v-textarea v-model="formData.GhiChuBoSung" label="Ghi chú bổ sung" rows="2" />
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="grey" @click="isActive.value = false">Đóng</v-btn>
					<v-btn color="primary" @click="saveData(isActive)" variant="elevated">Tạo</v-btn>
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
				formData: {
					HocSinhID: null,
					ThoiGianThi: '',
					HocKi: null,
					TenCuocThi: '',
					LinhVucDuAn: '',
					MoTaNganGonNoiDung_MucTieu: '',
					GVHuongDan: '',
					To_BoPhan: '',
					GV_ToHoTro: '',
					ToChucCongNhan: '',
					CapDoGiaiThuong: '',
					GiaiThuongDatDuoc: '',
					MinhChung_SoHieuQD_LinkChungNhan: '',
					GhiChuBoSung: ''
				},
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
				const form = await this.$refs.form
				if (form.validate()) {
					ajaxCALLPromise('lms/TongHopDuLieuCuocThi_Ins', { ...this.formData, NienKhoa: vueData.NienKhoa, LopID: this.LopItem.LopID })
						.then(() => {
							Vue.$toast.success("Tạo thành công", { position: "top" })
							this.$emit('onLoadFinish')
							form.reset()
							isActive.value = false
						})
				}
			},
			renderTitle(item) {
				return `[${item.HocSinhID}] ${item.HoTen} - ${item.TenLop}`
			}
		},
	}
</script>