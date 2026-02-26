<template>
	<v-dialog max-width="1200">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="{ ...activatorProps, ...$attrs }" />
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title>
					Thêm học sinh
					<v-spacer />
					<v-icon @click="isActive.value = false">mdi-close</v-icon>
				</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12" class="d-flex ">
							<v-select v-model="NhomDetail" label="Chọn nhóm" :items="DSNhom" item-title="TenNhom"
								item-value="NhomID" return-object style="max-width: 200px" />
							<v-spacer />
							<v-text-field v-model="search" placeholder="Tìm kiếm học sinh..." variant="outlined"
								style="max-width: 200px" />
						</v-col>
						<v-divider />
						<v-col cols="12">
							<v-data-table v-model="itemSelected" :headers :items :search :item-value="v => v"
								show-select />
						</v-col>
					</v-row>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Đóng" @click="isActive.value = false" />
					<v-btn variant="outlined" color="primary" text="Thêm" @click="onSubmit(isActive)" />
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			DSNhom: Array,
			NhomDetail_Child: Object,
			onSubmitFinish: Function
		},
		data() {
			return {
				vueData,
				search: null,
				NhomDetail: null,
				headers: [
					{
						"title": "Mã học sinh",
						"value": "HocSinhID"
					},
					{
						"title": "Họ tên",
						"value": "HoTen"
					},
					{
						"title": "Tên Lớp",
						"value": "TenLop"
					},
					{
						"title": "Tình Trạng",
						"value": "TenTinhTrang"
					}
				],
				items: [],
				itemSelected: []
			}
		},
		mounted() {
			this.getHocSinh()
		},
		computed: {},
		watch: {
			NhomDetail_Child: function (NhomDetail) {
				this.NhomDetail = NhomDetail
			}
		},
		methods: {
			async getHocSinh() {
				this.items = await fetchPromise("lms/HocSinh_Get", { NienKhoa: vueData.NienKhoa })
			},
	
			async insHSNhom(NhomID) {
				return await fetchPromise("lms/HocSinhNhom_Ins", {
					Json_HocSinhNhom: this.itemSelected,
					NhomID
				}).then(() => {
					Vue.$toast.success("Đã thêm học sinh vào nhóm!", { position: "top" });;
				})
			}, 
			async onSubmit(isActive) {
				if (!this.NhomDetail?.NhomID) return
				if (this.NhomDetail?.MonHocID === 102 && vueData.user.UserID !== 'NA0000022') {
					return Vue.$toast.warning("Lớp tin học lấy danh sách nguồn từ lớp Anh Văn. Nếu muốn thêm/sửa hãy xác nhận lại với Giáo vụ", { position: "top" })
				}
				if (this.NhomDetail.MonHocID === 76) {
					//Nếu là Môn Anh văn thì phải insert thêm cả lớp Tin học nữa
					const NhomDetail_AV = this.DSNhom.find(x => x.NhomID === this.NhomDetail.NhomID && x.MonHocID === 76)
					if (NhomDetail_AV) await this.insHSNhom(NhomDetail_AV?.NhomID) //Insert Lớp AV trước
					const ListNhomID_ChildFrom_AV = NhomDetail_AV.ListNhomID_Child.split(',')
					for (var NhomID of ListNhomID_ChildFrom_AV) {
						const NhomDetail = this.DSNhom.find(x => x.NhomID === NhomID)
						if (NhomDetail) await this.insHSNhom(NhomDetail?.NhomID) //Insert list nhóm khác, nhưng lấy từ nguồn anh văn
					}
				} else {
					//Trường hợp khác
					await this.insHSNhom(this.NhomDetail?.NhomID)
				}
	
				Vue.$toast.success("Đã thêm học sinh vào nhóm!", { position: "top" });;
				isActive.value = false
				await this.$emit("onSubmitFinish")
	
			}
		},
	}
</script>