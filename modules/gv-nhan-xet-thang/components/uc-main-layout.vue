<template>
	<Global>
		<v-card>
			<v-card-title>
				{{TitlePage}} • {{TitleCap}}
				<div v-if="ThangObj">
					<v-chip :color="ThangObj?.MauTinhTrang">{{ThangObj?.TenTinhTrang}}</v-chip>
				</div>
			</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="3">
						<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID" return-object />
					</v-col>
					<v-col cols="3">
						<v-select v-model="ThangObj" label="Chọn tháng" :items="DSThang" item-title="Thang_HienThi_VI"
							item-value="Lop_NhanXetThangID" return-object>
							<template v-slot:item="{ props, item }">
								<v-list-item v-bind="props" :title="item.raw.Thang_HienThi_VI">
									<template #append>
										<v-chip :color="item.raw.MauTinhTrang">{{item.raw.TenTinhTrang}}</v-chip>
									</template>
								</v-list-item>
							</template>
						</v-select>
					</v-col>
					<v-col class="d-flex ga-2">
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn color="primary" v-bind="props" variant="outlined">
									Thao tác
								</v-btn>
							</template>

							<v-list>
								<v-list-item title="Làm mới" @click="onRefresh" />
								<v-list-item v-if="ThangObj?.TinhTrang === 0 || ThangObj?.TinhTrang === 1"
									title="Lưu tạm tất cả" @click="onSave" />
								<v-list-item v-if="ThangObj?.TinhTrang === 1" title="Gửi tổ trưởng"
									@click="onSendToTruong" />
								<v-list-item v-if="ThangObj?.TinhTrang === 0 || ThangObj?.TinhTrang === 1"
									title="Import Excel" @click="onImport" />
							</v-list>
						</v-menu>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-data-table :headers :items items-per-page="-1" hide-default-footer style="max-height: calc(100dvh - 200px)">
			<template #item.HocSinh="{item}">
				<uc-info-student :item="item" />
			</template>
			<!-- Cấp 1 -->
			<template #item.NhanXetToan_HTML="{item}">
				<uc-quill-editor :key="'NhanXetToan_HTML' + item.HocSinhID" v-model="item.NhanXetToan_HTML"
					:spellcheck="false" style="height: 150px;"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
				<v-text-field class="mt-2" v-model="item.DiemToan" placeholder="Nhập điểm..."
					messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" solo reverse />
			</template>
			<template #item.NhanXetTiengViet_HTML="{item}">
				<uc-quill-editor :key="'NhanXetTiengViet_HTML' + item.HocSinhID" v-model="item.NhanXetTiengViet_HTML"
					:spellcheck="false" style="height: 150px;"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
				<v-text-field class="mt-2" v-model="item.DiemTiengViet" placeholder="Nhập điểm..."
					messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" solo reverse />
			</template>
			<template #item.NhanXetMonHocKhac_HTML="{item}">
				<uc-quill-editor :key="'NhanXetMonHocKhac_HTML' + item.HocSinhID" v-model="item.NhanXetMonHocKhac_HTML"
					:spellcheck="false" :readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.HoatDongGiaoDucKhac_HTML="{item}">
				<uc-quill-editor :key="'HoatDongGiaoDucKhac_HTML' + item.HocSinhID"
					v-model="item.HoatDongGiaoDucKhac_HTML" :spellcheck="false"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.PhamChatNangLuc_HTML="{item}">
				<uc-quill-editor :key="'PhamChatNangLuc_HTML' + item.HocSinhID" v-model="item.PhamChatNangLuc_HTML"
					:spellcheck="false" :readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<!-- Cấp 2 & 3 -->
			<!-- Dành cho Tháng 12 và Tháng 5 -->
			<template #item.UuDiem="{item}">
				<uc-quill-editor :key="'UuDiem' + item.HocSinhID" v-model="item.UuDiem" :spellcheck="false"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.NhuocDiem="{item}">
				<uc-quill-editor :key="'NhuocDiem' + item.HocSinhID" v-model="item.NhuocDiem" :spellcheck="false"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.DeXuat="{item}">
				<uc-quill-editor :key="'DeXuat' + item.HocSinhID" v-model="item.DeXuat" :spellcheck="false"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<!-- Các tháng còn lại -->
			<template #item.NoiDungKienThuc_HTML="{item}">
				<uc-quill-editor :key="'NoiDungKienThuc_HTML' + item.HocSinhID" v-model="item.NoiDungKienThuc_HTML"
					:spellcheck="false" :readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.NoiDungNangLuc_HTML="{item}">
				<uc-quill-editor :key="'NoiDungNangLuc_HTML' + item.HocSinhID" v-model="item.NoiDungNangLuc_HTML"
					:spellcheck="false" :readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>
			<template #item.NoiDungHoatDongKhac_HTML="{item}">
				<uc-quill-editor :key="'NoiDungHoatDongKhac_HTML' + item.HocSinhID"
					v-model="item.NoiDungHoatDongKhac_HTML" :spellcheck="false"
					:readOnly="ThangObj?.TinhTrang === 2 || ThangObj?.TinhTrang === 4" />
			</template>

			<!-- Action -->
			<template #item.actions="{item}">
				<v-btn @click="onSaveDraft(item)" text="Lưu tạm" color="primary" variant="outlined" />
			</template>
		</v-data-table>
	</Global>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				DSLop: [],
				DSThang: [],
				LopItem: null,
				ThangObj: null,
				headers: [],
				items: []
			}
		},
		mounted() {
			this.getLop()
		},
		computed: {
			TitleCap: function () { return renderText(parseInt(vueData.capid)) },
			TitlePage: function () { return getTitlePageByURL(window.location.pathname + window.location.search) }
		},
		watch: {
			LopItem: function (LopItem) {
				if (!LopItem) return
				this.ThangObj = null
				this.items = []
				this.getThang()
			},
			ThangObj: function (ThangObj) {
				if (!ThangObj) return
				this.items = []
				this.getNhanXetThang()
			}
		},
		methods: {
			async getLop() {
				this.DSLop = await fetchPromise("lms/Lop_Get_By_CapID", {
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
			},
			async getThang(forceRefresh = false) {
				this.DSThang = await fetchPromise("lms/NhanXetThang_Lop_Get_GV", {
					NienKhoa: vueData.NienKhoa,
					LopID: this.LopItem.LopID
				}, { forceRefresh })
	
				//Cập nhật ThangObj
				const existThang = this.DSThang.find(x => x.Lop_NhanXetThangID === this.ThangObj.Lop_NhanXetThangID)
				if (existThang) {
					this.ThangObj = { ...existThang }
				}
			},
			async getNhanXetThang(forceRefresh = false) {
				this.items = await fetchPromise("lms/NhanXetThang_Get", {
					Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
					LopID: this.LopItem.LopID
				}, { forceRefresh })
				this.headers = this.renderHeader()
			},
			onRefresh() {
				this.getNhanXetThang()
			},
			onImport() {
	
			},
			async onSave() {
				const JSON_NhanXetThang = []
				for (var item of this.items) {
					JSON_NhanXetThang.push({
						...item,
						LopID: this.LopItem.LopID,
						Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
						Is_Reject: false,
						DiemToan: item.DiemToan,
						DiemTiengViet: item.DiemTiengViet,
						PhoiHopCMHS: item.PhoiHopCMHS,
						NhanXetGVCN_VePhuHuynh_HTML: item.NhanXetGVCN_VePhuHuynh_HTML,
						NhanXetGVCN_VeHocSinh_HTML: item.NhanXetGVCN_VeHocSinh_HTML,
						PhanLoai_TuyenThang: item.PhanLoai_TuyenThang,
						Flyers: item.Flyers,
						DiemTA: item.DiemTA,
						DKHocTiep: item.DKHocTiep ?? false,
						DeXuat_NDCamKet: item.DeXuat_NDCamKet,
					})
				}
	
				const [isSave1, isSave2] = await fetchBatchPromise([
					{ url: "lms/NhanXetThang_Ins", params: { JSON_NhanXetThang } },
					{
						url: "lms/NhanXetThang_Upd_TinhTrang", params: {
							TinhTrang: 1,
							Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
							ReasonReject: ""
						}
					},
				])
				if (isSave1 && isSave2) {
					Vue.$toast.success("Cập nhật nhận xét tháng thành công", { position: "top" })
					this.getThang(true)
					this.getNhanXetThang(true)
				}
			},
			onSaveDraft(item) {
				item.DKHocTiep = item.DKHocTiep ?? false
				fetchPromise("lms/NhanXetThang_Ins_By_NhanXetThangID", {
					...item,
					LopID: this.LopItem.LopID,
					Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
				}).then(() => {
					Vue.$toast.success('Lưu tạm ' + item.HoTen + ' thành công học sinh ', { position: 'top' })
					this.getNhanXetThang(true)
				})
			},
			onSendToTruong() {
				fetchPromise("lms/NhanXetThang_Upd_TinhTrang", {
					TinhTrang: 2,
					Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
					ReasonReject: ""
				}).then(() => {
					Vue.$toast.success("Gửi tổ trưởng thành công", { position: "top" })
					this.getThang(true)
					this.getNhanXetThang(true)
				})
			},
			renderHeader() {
				let headers = []
				const headerLuuTam = {
					title: "",
					value: "btnLuuTam"
				}
				const headerHocSinh = {
					title: "Học sinh",
					value: "HocSinh",
					align: "center",
					minWidth: 180,
					width: 180,
					fixed: true
				}
				const headerAction = {
					title: "",
					value: "actions",
					align: "center",
					minWidth: 80,
					width: 80,
					lastFixed: true
				}
				headers = [...headers, headerHocSinh]
				if (vueData.CapID === 1) {
					headers = [
						...headers,
						{
							title: "Nhận xét môn toán",
							value: "NhanXetToan_HTML",
							align: "center",
							minWidth: 200,
							width: 200,
						},
						{
							title: "Nhận xét môn Tiếng Việt",
							value: "NhanXetTiengViet_HTML",
							align: "center",
							minWidth: 200,
							width: 200,
						},
						{
							title: "Nhận xét môn học khác",
							value: "NhanXetMonHocKhac_HTML",
							align: "center",
							minWidth: 200,
							width: 200,
						},
						{
							title: "Hoạt động giáo dục khác",
							value: "HoatDongGiaoDucKhac_HTML",
							align: "center",
							minWidth: 200,
							width: 200,
						},
						{
							title: "Phẩm chất - Năng lực",
							value: "PhamChatNangLuc_HTML",
							align: "center",
							minWidth: 200,
							width: 200,
						},
					]
				} else if (vueData.CapID === 2 || vueData.CapID === 3) {
					//Header sẽ đổi khi rơi vào tháng 12 và tháng 5
					const ListCuoiKi = [12, 5]
					if (ListCuoiKi.includes(this.ThangObj.Thang)) {
						headers = [
							...headers,
							{ title: "Ưu điểm", value: "UuDiem", align: "center" },
							{ title: "Nhược điểm", value: "NhuocDiem", align: "center" },
							{ title: "Đề xuất", value: "DeXuat", align: "center" },
						]
					} else {
						headers = [
							...headers,
							{ title: "Về học tập", value: "NoiDungKienThuc_HTML", align: "center" },
							{ title: "Về nền nếp", value: "NoiDungNangLuc_HTML", align: "center" },
							{ title: "Mong muốn phối hợp", value: "NoiDungHoatDongKhac_HTML", align: "center" },
						]
					}
				}
	
				if ([0, 1].includes(this.ThangObj.TinhTrang)) {
					headers.push(headerAction)
				}
				return headers
			}
		},
	}
</script>