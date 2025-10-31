<template>
	<v-dialog v-model="vueData.isShowDialogSuaDiem" width="1200">
		<v-card title="Sửa điểm">
			<v-data-table class="tTable" :headers="headers" :items="items" :loading="isLoadingTable" hide-default-footer
				items-per-page="-1">
				<!-- Lần 1 -->
				<template #item.PhucKhao_Lan1="{ item }">
					<div v-if="item.PhucKhao_Status_Lan1">
						<p v-if="item.PhucKhao_Lan1 !== null">
							Điểm sửa:
							<span class="text-subtitle-1 text-red font-weight-medium">
								{{ item.PhucKhao_Lan1 }}
							</span>
						</p>

						<v-textarea v-if="item.PhucKhao_Status_Lan1 === 'dang_nhap'" v-model="item.LyDoPhucKhao_Lan1"
							:rows="2" auto-grow hide-details="auto" placeholder="Nhập lý do phúc khảo lần 1" />

						<div v-else-if="item.PhucKhao_Status_Lan1 === 'da_nhap'" class="d-flex ga-2 flex-wrap">
							<b>Lý do:</b>
							<div v-html="item.LyDoPhucKhao_Lan1"></div>
						</div>
					</div>
				</template>

				<!-- Lần 2 -->
				<template #item.PhucKhao_Lan2="{ item }">
					<div v-if="item.PhucKhao_Status_Lan2">
						<p v-if="item.PhucKhao_Lan2 !== null">
							Điểm sửa:
							<span class="text-subtitle-1 text-red font-weight-medium">
								{{ item.PhucKhao_Lan2 }}
							</span>
						</p>

						<v-textarea v-if="item.PhucKhao_Status_Lan2 === 'dang_nhap'" v-model="item.LyDoPhucKhao_Lan2"
							:rows="2" auto-grow hide-details="auto" placeholder="Nhập lý do phúc khảo lần 2" />

						<div v-else-if="item.PhucKhao_Status_Lan2 === 'da_nhap'" class="d-flex ga-2 flex-wrap">
							<b>Lý do:</b>
							<div v-html="item.LyDoPhucKhao_Lan2"></div>
						</div>
					</div>
				</template>

				<!-- Lần 3 -->
				<template #item.PhucKhao_Lan3="{ item }">
					<div v-if="item.PhucKhao_Status_Lan3">
						<p v-if="item.PhucKhao_Lan3 !== null">
							Điểm sửa:
							<span class="text-subtitle-1 text-red font-weight-medium">
								{{ item.PhucKhao_Lan3 }}
							</span>
						</p>

						<v-textarea v-if="item.PhucKhao_Status_Lan3 === 'dang_nhap'" v-model="item.LyDoPhucKhao_Lan3"
							:rows="2" auto-grow hide-details="auto" placeholder="Nhập lý do phúc khảo lần 3" />

						<div v-else-if="item.PhucKhao_Status_Lan3 === 'da_nhap'" class="d-flex ga-2 flex-wrap">
							<b>Lý do:</b>
							<div v-html="item.LyDoPhucKhao_Lan3"></div>
						</div>
					</div>
				</template>

				<!-- Lần 4 -->
				<template #item.PhucKhao_Lan4="{ item }">
					<div v-if="item.PhucKhao_Status_Lan4">
						<p v-if="item.PhucKhao_Lan4 !== null">
							Điểm sửa:
							<span class="text-subtitle-1 text-red font-weight-medium">
								{{ item.PhucKhao_Lan4 }}
							</span>
						</p>

						<v-textarea v-if="item.PhucKhao_Status_Lan4 === 'dang_nhap'" v-model="item.LyDoPhucKhao_Lan4"
							:rows="2" auto-grow hide-details="auto" placeholder="Nhập lý do phúc khảo lần 4" />

						<div v-else-if="item.PhucKhao_Status_Lan4 === 'da_nhap'" class="d-flex ga-2 flex-wrap">
							<b>Lý do:</b>
							<div v-html="item.LyDoPhucKhao_Lan4"></div>
						</div>
					</div>
				</template>

				<!-- Lần 5 -->
				<template #item.PhucKhao_Lan5="{ item }">
					<div v-if="item.PhucKhao_Status_Lan5">
						<p v-if="item.PhucKhao_Lan5 !== null">
							Điểm sửa:
							<span class="text-subtitle-1 text-red font-weight-medium">
								{{ item.PhucKhao_Lan5 }}
							</span>
						</p>

						<v-textarea v-if="item.PhucKhao_Status_Lan5 === 'dang_nhap'" v-model="item.LyDoPhucKhao_Lan5"
							:rows="2" auto-grow hide-details="auto" placeholder="Nhập lý do phúc khảo lần 5" />

						<div v-else-if="item.PhucKhao_Status_Lan5 === 'da_nhap'" class="d-flex ga-2 flex-wrap">
							<b>Lý do:</b>
							<div v-html="item.LyDoPhucKhao_Lan5"></div>
						</div>
					</div>
				</template>
			</v-data-table>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text="Đóng" @click="vueData.isShowDialogSuaDiem = false" />
				<v-btn text="Sửa điểm" @click="onSubmit" variant="elevated" color="primary" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				headers: [
					{ title: "Mã học sinh", value: "HocSinhID", align: "center" },
					{ title: "Cột điểm", value: "TenCotDiem_VI" },
					{ title: "Kết quả ban đầu", value: "KetQuaBanDau", align: "end" },
					{ title: "Phúc khảo (Lần 1)", value: "PhucKhao_Lan1" },
					{ title: "Phúc khảo (Lần 2)", value: "PhucKhao_Lan2" },
					{ title: "Phúc khảo (Lần 3)", value: "PhucKhao_Lan3" },
					{ title: "Phúc khảo (Lần 4)", value: "PhucKhao_Lan4" },
					{ title: "Phúc khảo (Lần 5)", value: "PhucKhao_Lan5" },
				],
				items: [],
				isLoadingTable: false,
				SoLuong_ToiDaPhucKhao: 5
			}
		},
		mounted() { },
		computed: {},
		watch: {
			"vueData.isShowDialogSuaDiem": async function (isShow) {
				if (isShow) {
					this.isLoadingTable = true
					const ListHocSinhID = vueData.dataBeforeInsertToDB.map(x => x.HocSinhID)
					const DataPhucKhao = await ajaxCALLPromise("lms/PhucKhaoDiem_Get", {
						MonHocLopID: vueData.MonHocItem.MonHocLopID,
						List_HocSinhID: ListHocSinhID.join(',')
					}).finally(() => this.isLoadingTable = false)
					console.log("DataPhucKhao", DataPhucKhao)
	
					let items = vueData.dataBeforeInsertToDB.map(x => {
						const cotDiem = vueData.DSCotDiem_ByMaNhomCotDiem.find(n => n.CotDiemID === x.CotDiemID)
						const ketQua = vueData.DSCotDiem.find(n => n.HocSinhID === x.HocSinhID && n.CotDiemID === x.CotDiemID)
	
						const phucKhao = DataPhucKhao.find(n =>
							n.MonHocLopID === vueData.MonHocItem.MonHocLopID
							&& n.HocSinhID === x.HocSinhID
							&& n.CotDiemID === x.CotDiemID
						)
						console.log("phucKhao", phucKhao)
	
						if (phucKhao) {
							// Xác định lần phúc khảo hiện có cao nhất
							let lanCuoi = 0
							for (let i = 1; i <= this.SoLuong_ToiDaPhucKhao; i++) {
								const diem = phucKhao[`PhucKhao_Lan${i}`]
								if (diem !== null && diem !== undefined && diem !== "") {
									lanCuoi = i
									x[`PhucKhao_Lan${i}`] = diem
									x[`LyDoPhucKhao_Lan${i}`] = phucKhao[`LyDoPhucKhao_Lan${i}`]
									x[`PhucKhao_Status_Lan${i}`] = 'da_nhap'   // 🔹 đánh dấu đã có dữ liệu
								}
							}
	
							// Nếu đã có ít nhất 1 lần phúc khảo
							if (lanCuoi > 0) {
								const lanKeTiep = lanCuoi + 1
								if (lanKeTiep <= this.SoLuong_ToiDaPhucKhao) {
									x[`PhucKhao_Lan${lanKeTiep}`] = x.KetQuaDanhGia_VI
									x[`LyDoPhucKhao_Lan${lanKeTiep}`] = ""
									x[`PhucKhao_Status_Lan${lanKeTiep}`] = 'dang_nhap'  // 🔹 lần đang nhập mới
								}
							} else {
								// Nếu chưa có lần nào
								x.PhucKhao_Lan1 = null
								x.LyDoPhucKhao_Lan1 = ""
								x.PhucKhao_Status_Lan1 = 'dang_nhap'
							}
						} else {
							// Nếu chưa có phúc khảo nào
							x.PhucKhao_Lan1 = x.KetQuaDanhGia_VI
							x.LyDoPhucKhao_Lan1 = ""
							x.PhucKhao_Status_Lan1 = 'dang_nhap'
						}
	
	
						x.TenCotDiem_VI = cotDiem?.TenCotDiem_VI ?? ''
						x.KetQuaBanDau = phucKhao ? phucKhao.KetQuaBanDau : (ketQua?.KetQuaDanhGia_VI ?? '')
						return x
					})
					console.log("items", items)
					this.items = items
				}
			}
		},
		methods: {
			onSubmit() {
				const $this = this
				confirm({
					title: "Xác nhận sửa điểm",
					action: () => {
						$this.fn_submit()
					}
				})
			},
			fn_submit() {
				// Kiểm tra các lần phúc khảo có textarea chưa nhập lý do
				const invalidRows = this.items.filter(x => {
					for (let i = 1; i <= 5; i++) {
						const diem = x[`PhucKhao_Lan${i}`]
						const lyDo = x[`LyDoPhucKhao_Lan${i}`]?.trim() ?? ""
	
						// Nếu có điểm phúc khảo (tức là đang nhập) mà lý do bị trống → lỗi
						if (diem !== null && diem !== undefined && diem !== "" && lyDo === "") {
							return true
						}
					}
					return false
				})
	
				// Nếu có dòng lỗi → show toast và dừng submit
				if (invalidRows.length > 0) {
					Vue.$toast.error("Vui lòng nhập lý do phúc khảo trước khi gửi!", { position: "top" })
					return
				}
	
				// Nếu hợp lệ → chuẩn hoá dữ liệu
				const newItems = this.items.map(x => {
					x.MonHocLopID = vueData.MonHocItem.MonHocLopID
					for (let i = 1; i <= 5; i++) {
						const key = `LyDoPhucKhao_Lan${i}`
						x[key] = x[key] ? x[key].trim() : null
					}
					return x
				})
	
				// Gửi API
				ajaxCALLPromise("lms/PhucKhaoDiem_Ins_Upd_Multiple", {
					Json_PhucKhao: newItems
				}).then(() => {
					Vue.$toast.success("Phúc khảo thành công", { position: "top" })
					this.onSubmitDiem().then(() => {
						Vue.$toast.success("Cập nhật lại điểm thành công", { position: "top" })
						vueData.onRefresh()
						vueData.isShowDialogSuaDiem = false
					})
				})
			},
			async onSubmitDiem() {
				return await ajaxCALLPromise("lms/KQHT_MonHocLop_Ins", {
					NienKhoa: vueData.NienKhoa,
					MonHocLopID: vueData.MonHocItem.MonHocLopID,
					LopID: vueData.LopID,
					MonHocID: vueData.MonHocItem.MonHocID,
					TemplateBangDiemID: vueData.MonHocItem.TemplateBangDiemID,
					KetQuaObjArr: vueData.dataBeforeInsertToDB
				})
			},
			stringTemplate_PK_Lan(i) {
				return `item.PhucKhao_Lan${i}`
			},
			stringTemplate_Lydo_PK_Lan(i) {
				return `item.LyDoPhucKhao_Lan${i}`
			}
		},
	}
</script>