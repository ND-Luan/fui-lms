<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{TitlePage}}</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col class="d-flex ga-2" cols="3">
							<v-btn text="Làm mới" prepend-icon="mdi-refresh" @click="onRefresh" variant="outlined"
								color="primary" />
							<uc-btn-dialog-add v-model:DSNhom="itemNhoms" prepend-icon="mdi-plus" text="Thêm học sinh"
								variant="outlined" color="teal" @onSubmitFinish="onRefresh(true)"
								:disabled="NhomDetail === null" :NhomDetail_Child="NhomDetail" />
							<v-btn :text="textChuyenNhom" prepend-icon="mdi-swap-horizontal" @click="onOpenDialogChange"
								variant="outlined" color="blue" :disabled="NhomDetail === null" />
							<v-btn text="Cập nhật số thứ tự" prepend-icon="mdi-sort-numeric-ascending" @click="onUpdateSTT"
								variant="outlined" color="green" :disabled="NhomDetail === null" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />
		<v-row>
			<v-col cols="4">
				<v-data-table :headers="headerNhoms" :items="itemNhoms" items-per-page="-1"
					style="max-height: calc(100dvh - 93px)" hide-default-footer>
					<template #item.NhomID="{item, value}">
						<div class="d-flex ga-2">
							<p>{{value}}</p>
							<v-chip :color="item.Color">{{item.TenMonHoc_HienThi}}</v-chip>
						</div>
					</template>
					<template #item.XemNhom="{item}">
						<v-btn icon="mdi-account-group-outline" @click="onSelectNhomDetail(item)" size="small"
							variant="text" />
					</template>
				</v-data-table>
			</v-col>
			<v-divider vertical />
			<v-col cols="8">
				<v-data-table v-model="DSHocSinhSeleceted" :headers="headerHocSinhs" :items="itemHocSinhs"
					:item-value="v => v" items-per-page="-1" style="max-height: calc(100dvh - 93px)" hide-default-footer
					show-select>
					<template #item.SoTT="{item}">
					<v-text-field v-model="item.SoTT" placeholder="Nhập số thứ tự..." @blur="onSoTTBlur(item)" />
					</template>
					<template #item.ChuyenNhom="{item}">
						<v-btn icon="mdi-transfer-right" @click="onChangeNhomHocSinh(item)" size="small" variant="text"
							color="green" />
					</template>
					<template #item.Xoa="{item}">
						<v-btn icon="mdi-delete" color="red" @click="onDeleteHocSinh(item)" size="small" variant="text" />
					</template>
				</v-data-table>
			</v-col>
		</v-row>
		<uc-dialog-change v-model="IsShowDialogChange" :HocSinhDetail :NhomDetail :DSNhom="itemNhoms"
			@onSubmitFinish="onRefresh(true)" />
	</Global>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				DSKhoi: [],
				KhoiItem: null,
				IsShowDialogChange: false,
				NhomDetail: null,
				headerNhoms: [
					{ title: "Mã nhóm", value: "NhomID" },
					{ title: "Tên nhóm", value: "TenNhom" },
					{ title: "Xem nhóm", value: "XemNhom", align: "center" },
				],
				itemNhoms: [],
				headerHocSinhs: [
					{ title: "Mã nhóm", value: "NhomID", align: "center" },
					{ title: "STT", value: "SoTT", align: "center", width: 150, minWidth: 150, },
					{ title: "Mã học sinh", value: "HocSinhID", align: "center" },
					{ title: "Họ tên", value: "HoTen" },
					{ title: "Chuyển nhóm", value: "ChuyenNhom", align: "center" },
					{ title: "Xóa", value: "Xoa", align: "center" },
				],
				itemHocSinhs: [],
				DSHocSinhSeleceted: [],
				HocSinhDetail: null,
				DSHocSinh_Calen: []
			}
		},
		mounted() {
			this.getKhoi()
		},
		computed: {
			TitlePage: function () { return getTitlePageByURL(window.location.pathname + window.location.search) },
			textChuyenNhom: function () {
				let str = 'Chuyển nhóm'
				if (this.DSHocSinhSeleceted.length > 0) str += ` ${this.DSHocSinhSeleceted.length}`
				return str
			}
		},
		watch: {
			"KhoiItem.KhoiID": function (KhoiItem) {
				this.getDanhSachNhom()
			},
			"NhomDetail": function (NhomDetail) {
				this.getDanhSachHocSinh_ByNhomID(NhomDetail?.NhomID, true)
			},
		},
		methods: {
			async getKhoi() {
				this.DSKhoi = await fetchPromise("lms/KhoiHocByCapHoc_Get", { CapID: 3 })
			},
			async getDanhSachNhom() {
				const data = await fetchPromise("lms/NhomAV_Get", { NienKhoa: vueData.NienKhoa })
				this.itemNhoms = data.filter(x => x.KhoiID === this.KhoiItem.KhoiID)
			},
			async getDanhSachHocSinh_ByNhomID(NhomID, forceRefresh = false) {
				this.itemHocSinhs = await fetchPromise("lms/HocSinhNhom_Get_ByNhomID", {
					NienKhoa: vueData.NienKhoa,
					NhomID
				}, { forceRefresh })
			},
			async onRefresh(forceRefresh = false) {
				if (!this.NhomDetail?.NhomID) return
				this.getDanhSachHocSinh_ByNhomID(this.NhomDetail.NhomID, forceRefresh)
			},
			async getDanhSachHocSinh_Calen() {
				const DSKhoi = await fetchPromise("quansinh/Basic_KhoiSelectByNamHocID", { DonViID: 1, NamHocID: vueData.NienKhoa })
				const currentKhoi = DSKhoi.find(x => x.TenKhoi === this.KhoiItem.TenKhoiHoc)
				if (!currentKhoi) {
					return Vue.$toast.error("Không tìm thấy khối Calen")
				}
	
				const DSLop = await fetchPromise("quansinh/Basic_LopHocSelectByKhoiNamHocID", {
					NamHocID: vueData.NienKhoa,
					KhoiID: currentKhoi.KhoiID
				})
				const currentLop = DSLop.find(x => x.TenLop === this.NhomDetail.TenNhom)
				if (!currentLop) {
					return Vue.$toast.error("Không tìm thấy lớp Calen")
				}
	
				return await fetchPromise("quansinh/Basic_HocSinhSelectByLopHocID", {
					LopHocID: currentLop.LopHocID
				})
			},
			async onUpdateSTT() {
				this.DSHocSinh_Calen = await this.getDanhSachHocSinh_Calen()
	
				const arr = []
				for (var itemHS_Calen of this.DSHocSinh_Calen) {
					const itemHS = this.itemHocSinhs.find(x => x.HocSinhID === itemHS_Calen.HocSinhID)
					arr.push({ ...itemHS, SoTT: itemHS_Calen?.STT || 0 })
				}
	
				for (var ndetail of this.NhomDetail.ListNhomID_Child.split(',')) {
					const dshs = await fetchPromise("lms/HocSinhNhom_Get_ByNhomID", {
						NienKhoa: vueData.NienKhoa,
						NhomID: ndetail
					})
					for (var itemHS_Calen of this.DSHocSinh_Calen) {
						const itemHS = dshs.find(x => x.HocSinhID === itemHS_Calen.HocSinhID)
						arr.push({ ...itemHS, SoTT: itemHS_Calen?.STT || 0 })
					}
				}
	
				for (var item of arr) {
					await fetchPromise("lms/SoTT_Udp_ByHSNhomID", {
						HSNhomID: item.HSNhomID,
						SoTT: item.SoTT
					})
				}
	
				Vue.$toast.success("Cập nhật số thứ tự thành công!", { position: "top" })
				await this.onRefresh(true)
			},
			onChangeNhomHocSinh(item) {
				this.HocSinhDetail = _.cloneDeep(item)
				this.IsShowDialogChange = true
			},
			onOpenDialogChange() { },
			onDeleteHocSinh(item) {
				const $this = this
				confirm({
					title: "Xác nhận xóa học sinh?",
					message: "Bạn có chắc muốn xóa học sinh đã chọn vào nhóm này?",
					action: function () {
						fetchPromise('lms/HocSinhNhom_Del_HSNhomID', {
							HSNhomID: item.HSNhomID,
						}).then(() => {
							Vue.$toast.success("Đã xóa học sinh!", { position: "top" });
							$this.onRefresh(true)
						})
					}
				})
			},
			onSelectNhomDetail(item) { this.NhomDetail = _.cloneDeep(item) },
			onSoTTBlur(item) {
				ajaxCALL('lms/SoTT_Udp_ByHSNhomID', { HSNhomID: item.HSNhomID, SoTT: item.SoTT }, () => {})
			},
		},
	}
</script>