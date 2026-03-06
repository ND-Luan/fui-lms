<template>
	<div>
		<v-card rounded="lg">

			<!-- Header -->
			<v-card-title>
				<v-icon start>mdi-seal-variant</v-icon>
				Cập nhật số / ngày quyết định khen thưởng
			</v-card-title>
			<v-divider />
			<v-card-text class="pa-4">

				<!-- Select cấp -->
				<v-select v-model="List_CapID" :items="DSCap" item-title="title" item-value="value" label="Chọn cấp học"
					multiple chips closable-chips variant="outlined" color="primary"
					prepend-inner-icon="mdi-layers-outline" hide-details class="mb-6" style="max-width: 460px" />

				<!-- Empty state -->
				<div v-if="selectedCaps.length === 0" class="d-flex flex-column align-center justify-center py-10">
					<v-icon size="52" color="grey-lighten-2">mdi-inbox-outline</v-icon>
					<span class="text-grey-lighten-1 mt-2 text-body-2">Chưa chọn cấp học nào</span>
				</div>

				<!-- Cards từng cấp -->
				<div v-else class="d-flex flex-column" style="gap: 16px">
					<v-card v-for="element in selectedCaps" :key="element.value" variant="outlined" color="primary"
						rounded="lg">
						<v-card-title class="pb-0">
							<v-chip color="primary" size="small" class="font-weight-medium" variant="text" label>
								<v-icon start size="14">mdi-school-outline</v-icon>
								{{ element.title }}
							</v-chip>
						</v-card-title>

						<v-card-text class="pt-3">
							<v-row dense>
								<v-col cols="12" md="4">
									<v-text-field v-model="element.SoQuyetDinhKT" label="Số quyết định KT"
										variant="outlined" color="primary" density="compact"
										prepend-inner-icon="mdi-file-document-outline" placeholder="VD: 123/QĐ-BGD"
										hide-details />
								</v-col>
								<v-col cols="12" md="4">
									<v-text-field v-model="element.NgayKhenThuong_VI" label="Ngày KT (Tiếng Việt)"
										variant="outlined" color="primary" density="compact"
										prepend-inner-icon="mdi-calendar-outline"
										placeholder="VD: ngày 15 tháng 5 năm 2025" hide-details :clearable="false" />
								</v-col>
								<v-col cols="12" md="4">
									<v-text-field v-model="element.NgayKhenThuong_EN" label="Ngày KT (English)"
										variant="outlined" color="primary" density="compact"
										prepend-inner-icon="mdi-calendar-month-outline" placeholder="VD: May 15, 2025"
										hide-details :clearable="false" />
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>
				</div>

			</v-card-text>

			<v-divider />

			<v-card-actions class="px-6 py-3">
				<v-spacer />
				<v-btn variant="text" @click="vueData.isShowDialogEdit = false">Hủy</v-btn>
				<v-btn variant="outlined" color="primary" :disabled="selectedCaps.length === 0"
					prepend-icon="mdi-content-save-outline" @click="onSave()">
					Cập nhật
				</v-btn>
			</v-card-actions>

		</v-card>
	</div>
</template>

<script>
	export default {
		components: {
			vuedraggable: window.vuedraggable
		},
		data() {
			return {
				vueData,
				drag: false,
				List_KhoiID: [],
				DSKhoi: [
					{ KhoiID: 1, TenKhoiHoc: "Khối 1", CapID: 1 },
					{ KhoiID: 2, TenKhoiHoc: "Khối 2", CapID: 1 },
					{ KhoiID: 3, TenKhoiHoc: "Khối 3", CapID: 1 },
					{ KhoiID: 4, TenKhoiHoc: "Khối 4", CapID: 1 },
					{ KhoiID: 5, TenKhoiHoc: "Khối 5", CapID: 1 },
					{ KhoiID: 6, TenKhoiHoc: "Khối 6", CapID: 2 },
					{ KhoiID: 7, TenKhoiHoc: "Khối 7", CapID: 2 },
					{ KhoiID: 8, TenKhoiHoc: "Khối 8", CapID: 2 },
					{ KhoiID: 9, TenKhoiHoc: "Khối 9", CapID: 2 },
					{ KhoiID: 10, TenKhoiHoc: "Khối 10", CapID: 3 },
					{ KhoiID: 11, TenKhoiHoc: "Khối 11", CapID: 3 },
					{ KhoiID: 12, TenKhoiHoc: "Khối 12", CapID: 3 }
				],
				List_CapID: [],
				DSCap: [
					{ title: "Tiểu học", value: 1, SoQuyetDinhKT: "", NgayKhenThuong_VI: "", NgayKhenThuong_EN: "" },
					{ title: "Trung học cơ sở", value: 2, SoQuyetDinhKT: "", NgayKhenThuong_VI: "", NgayKhenThuong_EN: "" },
					{ title: "Trung học phổ thông", value: 3, SoQuyetDinhKT: "", NgayKhenThuong_VI: "", NgayKhenThuong_EN: "" },
				],
				DSKhoi_Sort: [],
				formModel: {
					SoQuyetDinhKT: "",
					NgayKhenThuong_VI: "",
					NgayKhenThuong_EN: ""
				}
			}
		},
		mounted() {
			this.onLoadSoQD()
		},
		computed: {
			selectedCaps() {
				return this.DSCap.filter(x => this.List_CapID.includes(x.value))
			}
		},
		watch: {
			"vueData.NienKhoa": function (nk) {
				this.onLoadSoQD()
			},
			List_KhoiID: {
				handler(List_KhoiID) {
					this.DSKhoi_Sort = this.DSKhoi.filter(x => List_KhoiID.includes(x.KhoiID))
				},
				deep: true
			}
		},
		methods: {
			onLoadSoQD() {
				ajaxCALL('lms/KhenThuong_SoQD_Get', { NienKhoa: vueData.NienKhoa }, res => {
					for (var item of this.DSCap) {
						const objCap = res.data.find(x => x.CapID === item.value)
						item.SoQuyetDinhKT = objCap?.SoQuyetDinhKT ?? ""
						item.NgayKhenThuong_VI = objCap?.NgayKhenThuong_VI ?? ""
						item.NgayKhenThuong_EN = objCap?.NgayKhenThuong_EN ?? ""
					}
				})
			},
			onSave() {
				let JsonData = this.DSKhoi
					.filter(x => this.List_CapID.includes(x.CapID))
					.map(item => {
						const objKhoi = this.DSCap.find(x => x.value === item.CapID)
						return {
							...item,
							NienKhoa: vueData.NienKhoa,
							SoQuyetDinhKT: objKhoi.SoQuyetDinhKT || null,
							NgayKhenThuong_VI: objKhoi.NgayKhenThuong_VI || null,
							NgayKhenThuong_EN: objKhoi.NgayKhenThuong_EN || null,
						}
					})
	
				ajaxCALL('lms/KhenThuong_Upd', { JsonData }, res => {
					Vue.$toast.success('Lưu số/ngày quyết định thành công', { position: "top" })
					this.onLoadSoQD()
					vueData.isShowDialogEdit = false
				})
			}
		}
	}
</script>