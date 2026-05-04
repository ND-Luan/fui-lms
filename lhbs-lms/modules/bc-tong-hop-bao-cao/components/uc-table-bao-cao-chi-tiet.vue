<template>
	<v-card>
		<v-card-title class="text-primary d-flex">
			Báo cáo chi tiết
			<v-chip v-if="BaoCaoSelected" class="ml-2" size="small">{{BaoCaoSelected?.TenBaoCao}}</v-chip>
			<v-spacer />
			<v-btn v-if="IsActionPermission" size="small" icon="mdi-plus" @click="onOpenDialog" />
		</v-card-title>
	</v-card>
	<v-data-table :headers="headerBaoCaoChiTiets" :items="itemBaoCaoChiTiets" hide-default-footer :items-per-page="-1">
		<template #item.NgayNguoiChot="{item}">
			<p v-if="item.NguoiChot" class="text-caption text-italic">Người chốt: {{item.NguoiChot}}</p>
			<p v-if="item.NgayChot" class="text-caption text-italic">Thời gian chốt: {{item.NgayChot}}</p>
		</template>
		<template #item.HocKi="{item}">
			<v-chip size="small" class="text-primary">{{renderHocKi(item)}}</v-chip>
		</template>
		<template #item.JSON_BaoCao="{item}">
			<v-chip color="blue" size="small" @click="onCopy(item)"><v-icon start>mdi-content-copy</v-icon>JSON</v-chip>
		</template>
		<template #item.actions="{item}">
			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" color="primary" size="small" variant="text" icon="mdi-menu" />
				</template>
				<v-list>
					<v-list-item title="Xem" prepend-icon="mdi-eye-outline" @click="onRedirectPage(item)"></v-list-item>
					<v-list-item v-if="IsActionPermission" title="Cập nhật" prepend-icon="mdi-pencil-outline"
						@click="onOpenDialogUpdate(item)"></v-list-item>
					<v-list-item v-if="IsActionPermission" class="text-red" prepend-icon="mdi-trash-can-outline"
						title="Xóa" @click="onDelete(item)"></v-list-item>
				</v-list>
			</v-menu>
		</template>
	</v-data-table>

	<v-dialog v-model="isShowDialogAdd" max-width="500">
		<v-card title="Thêm mới chi tiết">
			<v-card-text>
				<v-form ref="formAdd">
					<v-row>
						<v-col cols="12">
							<v-text-field v-model="formAdd.TenBaoCao_ChiTiet" label="Tên báo cáo (Tùy chọn)" />
						</v-col>
						<v-col cols="12">
							<v-select v-model="formAdd.HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
								item-value="textValue" :rules="rules" />
						</v-col>
						<v-col cols="12">
							<v-textarea v-model="formAdd.Url_BaoCao" label="Link" :rules="rules" />
						</v-col>
						<v-col cols="12">
							<v-textarea v-model="formAdd.JSON_BaoCao" label="JSON" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text="Đóng" @click="isShowDialogAdd = false" />
				<v-btn text="Thêm mới" color="elevated" @click="onAdd" />
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog v-model="isShowDialogEdit" max-width="500">
		<v-card title="Sửa chi tiết">
			<v-card-text>
				<v-form ref="formEdit">
					<v-row>
						<v-col cols="12">
							<v-text-field v-model="formEdit.TenBaoCao_ChiTiet" label="Tên báo cáo (Tùy chọn)" />
						</v-col>
						<v-col cols="12">
							<v-select v-model="formEdit.HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
								item-value="textValue" :rules="rules" />
						</v-col>
						<v-col cols="12">
							<v-textarea v-model="formEdit.Url_BaoCao" label="Link" :rules="rules" />
						</v-col>
						<v-col cols="12">
							<v-textarea v-model="formEdit.JSON_BaoCao" label="JSON" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text="Đóng" @click="isShowDialogEdit = false" />
				<v-btn text="Cập nhật" color="elevated" @click="onEdit" />
			</v-card-actions>
		</v-card>
	</v-dialog>

</template>

<script>
	export default {
		props: {
			CapID: Number,
			BaoCaoSelected: Object,
			headerBaoCaoChiTiets: Array,
			itemBaoCaoChiTiets: Array,
			onAddFinnish: Function,
			onEditFinnish: Function,
			onDeleteFinnish: Function,
			IsActionPermission: Boolean
		},
		emits: [
			"onAddFinnish",
			"onEditFinnish",
			"onDeleteFinnish"
		],
		data() {
			return {
				vueData,
				itemMonHocs: [],
				isShowDialogAdd: false,
				isShowDialogEdit: false,
				formAdd: {
					HocKi: null,
					Url_BaoCao: null,
					JSON_BaoCao: null,
					TenBaoCao_ChiTiet: null
				},
				formEdit: {
					HocKi: null,
					Url_BaoCao: null,
					JSON_BaoCao: null,
					TenBaoCao_ChiTiet: null
				},
				rules: [
					value => {
						if (value) return true
						return 'Bạn chưa nhập trường dữ liệu này.'
					}
				],
				DSHocKi: []
			}
		},
		watch: {
			"BaoCaoSelected.BaoCaoID": function (bc) {
				this.onLoadHK()
			}
		},
		methods: {
			onOpenDialog() {
				this.isShowDialogAdd = true
			},
			onLoadHK() {
				let DSHocKi = []
				const hk_c1 = [
					{ title: "Giữa HK1", value: 1, textValue: "GK_HK1" },
					{ title: "Cuối HK1", value: 2, textValue: "CK_HK1" },
					{ title: "Giữa HK2", value: 3, textValue: "GK_HK2" },
					{ title: "Cuối HK2", value: 4, textValue: "CK_HK2" }
				]
				const hk_c2_c3 = [
					{ title: "Học kì 1", value: 1, textValue: "HK1" },
					{ title: "Học kì 2", value: 2, textValue: "HK2" },
				]
				const hk_ca_nam = [
					{ title: "Cả năm", value: 0, textValue: "CaNam" }
				]
				this.DSHocKi = [...hk_c1, ...hk_c2_c3, ...hk_ca_nam]
			},
			async onAdd() {
				const form = await this.$refs.formAdd
				if (form.validate()) {
					ajaxCALLPromise("lms/BaoCao_TongHop_Ins_ByBaoCaoID", {
						BaoCaoID: this.BaoCaoSelected.BaoCaoID,
						HocKi: this.formAdd.HocKi,
						Url_BaoCao: this.formAdd.Url_BaoCao,
						JSON_BaoCao: this.formAdd.JSON_BaoCao,
						TenBaoCao_ChiTiet: this.formAdd.TenBaoCao_ChiTiet,
						NienKhoa: vueData.NienKhoa
					}).then(() => {
						this.$emit("onAddFinnish")
						form.reset()
						this.isShowDialogAdd = false
					})
				}
			},
			async onEdit() {
				const form = await this.$refs.formEdit
				if (form.validate()) {
					ajaxCALLPromise("lms/BaoCao_TongHop_Upd_ByBaoCao_ChiTietID", {
						BaoCao_ChiTietID: this.formEdit.BaoCao_ChiTietID,
						HocKi: this.formEdit.HocKi,
						Url_BaoCao: this.formEdit.Url_BaoCao,
						JSON_BaoCao: this.formEdit.JSON_BaoCao,
						TenBaoCao_ChiTiet: this.formEdit.TenBaoCao_ChiTiet,
					}).then(() => {
						this.$emit("onEditFinnish")
						form.reset()
						this.isShowDialogEdit = false
					})
				}
			},
			renderHocKi(bc) {
				const hk = this.DSHocKi.find(x => x.textValue == bc.HocKi)
				return hk?.title ?? ''
			},
			onCopy(bc) {
				navigator.clipboard.writeText(bc.JSON_BaoCao)
				Vue.$toast.success("Sao chép JSON thành công", { position: "top" })
			},
			onRedirectPage(bc) {
				openWindow({
					title: "Báo cáo chi tiết",
					url: bc.Url_BaoCao
				})
			},
			onOpenDialogUpdate(bc) {
				this.formEdit = Object.assign({}, bc)
				// this.formEdit.HocKi = parseInt(this.formEdit.HocKi)
				this.isShowDialogEdit = true
			},
			onDelete(bc) {
				const $this = this
				confirm({
					title: "Xác nhận báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Del_ByBaoCao_ChiTietID", {
							BaoCao_ChiTietID: bc.BaoCao_ChiTietID
						}).then(() => {
							$this.$emit("onDeleteFinnish")
							Vue.$toast.success("Xóa báo cáo chi tiết thành công", { position: "top" })
						})
					}
				})
			}
		},
	}
</script>