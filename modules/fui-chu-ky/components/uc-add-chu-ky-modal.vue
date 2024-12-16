<template>
	<uc-dialog v-model="modelValue.IsShowDialogAdd" width="500" title="Thêm mới chữ ký" @onSubmit="insChuKy_Ins()"
		doneText="Lưu">
		<v-form ref="formAdd">
			<v-row>
				<v-col cols="12">
					<v-autocomplete v-model="FormAdd.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien"
						:item-title="renderTextGiangVien" item-value="GiaoVienID" outlined dense hide-details="auto"
						:rules="[v => !!v || 'Bạn chưa chọn giáo viên']" />
				</v-col>
				<v-col cols="12">
					<f-file-upload label="Upload" :url="apiFile" color="primary"
						@input="(value) => uploadFile(value, FormAdd)" style="width:fit-content"
						:filters="rules"></f-file-upload>
					<v-img v-if="FormAdd.HinhAnhChuKy" class="mt-2"
						:src="urlReturnFile + '/FileData/' + FormAdd.HinhAnhChuKy"
						style="height:300px; align-self:center; position: relative" contain>
					</v-img>
				</v-col>
			</v-row>
		</v-form>
	</uc-dialog>
</template>

<script>
	export default {
		props: ["modelValue", "dsgiaovien", 'onSubmitDialog'],
		data() {
			return {
				apiFile: "https://file.lhbs.vn/lms/upload/FileData",
				urlReturnFile: "https://file.lhbs.vn/lms",
	
				rules: {
					"required": true,
					"max_file_size": "50mb",
					"mime_types": [
						{
							"title": "Picture files",
							"extensions": "jpg,png,jpeg"
						}
					]
				},
	
				FormAdd: {
					GiaoVienID: null,
					HinhAnhChuKy: null,
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
	
		},
		methods: {
			uploadFile(file, item) {
				const _file = file.Files[0]
				item.HinhAnhChuKy = _file.FILE_ID
				item.IsExistFile = true
			},
			renderTextGiangVien(obj) {
				return `[${obj.GiaoVienID}] - ${obj.HoGV} ${obj.TenGV}`
			},
			async insChuKy_Ins() {
				const form = this.$refs.formAdd
				if (this.FormAdd.GiaoVienID && this.FormAdd.HinhAnhChuKy) {
					// if (form.validate()) {
					
					// }
					const param = {
						GiaoVienID: this.FormAdd.GiaoVienID?.trim(),
						HinhAnhChuKy: this.FormAdd.HinhAnhChuKy,
					}
	
					console.log("param", param)
					const isInsert = await ChuKy_Service.ChuKy_Ins(param)
					if (isInsert) {
						Toast.success({ text: 'Thêm chữ ký thành công' })
						this.onClose()
						this.$emit('onSubmitDialog', true)
					} else {
						Toast.error({ text: 'Thêm chữ ký thất bại' })
					}
				} else {
					Toast.error({ text: 'Chưa chọn giáo viên hoặc chưa upload file' })
				}
			},
			onClose() {
				this.modelValue.IsShowDialogAdd = false
				this.FormAdd.GiaoVienID = null
				this.FormAdd.HinhAnhChuKy = null
			},
		},
	}
</script>