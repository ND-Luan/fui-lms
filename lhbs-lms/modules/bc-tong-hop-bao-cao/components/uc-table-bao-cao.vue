<template>
	<v-card>
		<v-card-title class="text-primary d-flex">
			Báo cáo
			<v-spacer />
			<v-btn v-if="IsActionPermission" size="small" icon="mdi-plus" @click="onOpenDialog" />
		</v-card-title>
	</v-card>
	<v-data-table :headers="headerBaoCaos" :items="itemBaoCaos" hide-default-footer :items-per-page="-1"
		:row-props="setRowProps" style="height: calc(100dvh - 117px);">
		<template #item.TenBaoCao="{item, value}">
			<div class="d-flex align-center ga-2">
				<p class="text-primary text-decoration-underline cursor-pointer" @click="onOpenDialogUpdate(item)">
					{{value}}
				</p>
				<v-btn v-if="IsActionPermission" @click="onDelete(item)" size="x-small" icon="mdi-close" variant="text"
					color="red" />
			</div>
		</template>
		<template #item.actions="{item}">
			<v-btn @click="$emit('update:BaoCaoSelected',item)" size="x-small" color="primary" icon="mdi-arrow-right"
				variant="tonal" />
		</template>
	</v-data-table>

	<v-dialog v-model="isShowDialogAdd" max-width="600">
		<v-card title="Thêm mới">
			<v-card-text>
				<v-form ref="formAdd">
					<v-row>
						<v-col>
							<v-select v-model="formAdd.MonHocID" :items="itemMonHocs" label="Môn học"
								item-title="TenMonHoc_HienThi" item-value="MonHocID" />
						</v-col>
						<v-col>
							<v-text-field v-model="formAdd.TenBaoCao" label="Tên báo cáo" item-title="TenMonHoc_HienThi"
								item-value="MonHocID" :rules="rules" />
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

	<v-dialog v-model="isShowDialogEdit" max-width="600">
		<v-card title="Sửa">
			<v-card-text>
				<v-form ref="formEdit">
					<v-row>
						<v-col>
							<v-select v-model="formEdit.MonHocID" :items="itemMonHocs" label="Môn học"
								item-title="TenMonHoc_HienThi" item-value="MonHocID" />
						</v-col>
						<v-col>
							<v-text-field v-model="formEdit.TenBaoCao" label="Tên báo cáo"
								item-title="TenMonHoc_HienThi" item-value="MonHocID" :rules="rules" />
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
			BaoCaoSelected: Object,
			CapID: Number,
			headerBaoCaos: Array,
			itemBaoCaos: Array,
			onAddFinnish: Function,
			onEditFinnish: Function,
			onDeleteFinnish: Function,
			IsActionPermission: Boolean
		},
		emits: [
			"update:BaoCaoSelected",
			"onAddFinnish",
			"onEditFinnish",
			"onDeleteFinnish"
		],
		data() {
			return {
				itemMonHocs: [],
				isShowDialogAdd: false,
				isShowDialogEdit: false,
				formAdd: {
					TenBaoCao: null,
					MonHocID: null
				},
				formEdit: {
					TenBaoCao: null,
					MonHocID: null
				},
				rules: [
					value => {
						if (value) return true
						return 'Bạn chưa nhập trường dữ liệu này.'
					}
				]
			}
		},
		methods: {
			onOpenDialog() {
				this.onLoadMonHoc()
				this.isShowDialogAdd = true
			},
			onOpenDialogUpdate(bc) {
				if (!this.IsActionPermission) return
				this.formEdit = Object.assign({}, bc)
				this.isShowDialogEdit = true
			},
			async onAdd() {
				const form = await this.$refs.formAdd
				if (form.validate()) {
					ajaxCALLPromise("lms/BaoCao_TongHop_Ins", {
						CapID: this.CapID,
						TenBaoCao: this.formAdd.TenBaoCao ?? '',
						MonHocID: this.formAdd.MonHocID ?? 0
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
					ajaxCALLPromise("lms/BaoCao_TongHop_Upd", {
						BaoCaoID: this.formEdit.BaoCaoID,
						CapID: this.CapID,
						TenBaoCao: this.formEdit.TenBaoCao ?? '',
						MonHocID: this.formEdit.MonHocID ?? 0
					}).then(() => {
						this.$emit("onEditFinnish")
						form.reset()
						this.isShowDialogEdit = false
					})
				}
			},
			async onDelete(bc) {
				confirm({
					title: "Xác nhận xóa " + bc.TenBaoCao,
					action: () => {
						ajaxCALLPromise("lms/BaoCao_TongHop_Del", { BaoCaoID: bc.BaoCaoID }).then(() => this.$emit("onDeleteFinnish"))
					}
				})
			},
			async onLoadMonHoc() {
				this.itemMonHocs = await ajaxCALLPromise("lms/MonHoc_Get_ByCapID", { CapID: this.CapID })
			},
			setRowProps(item) {
				const exist = item.item.BaoCaoID === this.BaoCaoSelected?.BaoCaoID
				if (exist) {
					return { class: 'bg-secondary' };
				}
				return {};
			}
		},
	}
</script>