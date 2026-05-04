<template>
	<uc-dialog v-model="modelValue.IsShowDialogEdit" width="500" title="Cập nhật chữ ký" @onSubmit="udpChuKy_Udp()"
		doneText="Cập nhật">
		<v-form ref="FormEdit">
			<v-row>
				<v-col cols="12">
					<v-autocomplete v-model="FormEdit.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien"
						:item-title="renderTextGiangVien" item-value="GiaoVienID" outlined dense hide-details="auto"
						:rules="[v => !!v || 'Bạn chưa chọn giáo viên']" disabled/>
				</v-col>
				<v-col cols="12">
					<f-file-upload label="Upload" :url="apiFile" color="primary"
						@input="(value) => uploadFile(value, FormEdit)" style="width:fit-content"></f-file-upload>
					<v-img v-if="FormEdit.HinhAnhChuKy" class="mt-2"
						:src="urlReturnFile + '/FileData/' + FormEdit.HinhAnhChuKy"
						style="height:300px; align-self:center; position: relative" contain>
					</v-img>
				</v-col>
			</v-row>
		</v-form>
	</uc-dialog>
</template>

<script>
	export default {
		props: ["modelValue", "EditData", "dsgiaovien", "onSubmitDialog"],
		data() {
			return {
				apiFile: "https://file.lhbs.vn/lms/upload/FileData",
				urlReturnFile: "https://file.lhbs.vn/lms",
	
				FormEdit: {
					GiaoVienID: null,
					HinhAnhChuKy: null
				},
			}
		},
		mounted() { },
		computed: {
			DSGiaoVien: function () {
				return this.dsgiaovien
			}
		},
		watch: {
			"modelValue.IsShowDialogEdit": function (val) {
				if (val) {
					this.FormEdit = this.EditData
				}
			}
		},
		methods: {
			uploadFile(file, item) {
				const _file = file.Files[0]
				item.HinhAnhChuKy = _file.FILE_ID
				item.IsExistFile = true
			},
			renderTextGiangVien(obj) {
				console.log('obj',obj)
				return `[${obj.GiaoVienID}] - ${obj.HoGV} ${obj.TenGV}`
			},
			onClose() {
				this.modelValue.IsShowDialogEdit = false
			},
			async udpChuKy_Udp() {
				const form = this.$refs.FormEdit
				if (this.FormEdit.GiaoVienID && this.FormEdit.HinhAnhChuKy) {
					// if (form.validate()) {
					// }
					const param = {
						ChuKyId: this.FormEdit.ChuKyID,
						GiaoVienID: this.FormEdit.GiaoVienID?.trim(),
						HinhAnhChuKy: this.FormEdit.HinhAnhChuKy,
					}
	
					console.log("param", param)
					const isUdp = await ChuKy_Service.ChuKy_Udp(param)
					if (isUdp) {
						Toast.success({ text: 'Cập nhật chữ ký thành công' })
						this.onClose()
						this.$emit('onSubmitDialog', true)
					} else {
						Toast.error({ text: 'Cập nhật chữ ký thất bại' })
					}
				} else {
					Toast.error({ text: 'Chưa chọn giáo viên hoặc chưa upload file' })
				}
			}
		},
	}
</script>