<template>
	<div class="pa-3" style="background-color: #bdb7b712; height: calc(100vh - 8px);">
		<v-row>
			<v-col cols="9">
				<v-card class="border rounded bg-white">

					<v-card-title class="border-b">Cấu hình thông báo</v-card-title>
					<v-card-text class="mt-4" style="position: relative;">
						<v-form v-model="valid" ref="formRef">
							<v-row>
								<v-col cols="12">
									<v-select label="Loại thông báo" v-model="formData.ThongBao_TypeID"
										:rules="[rules.required]" :items="DSTemplateType" item-value="ThongBao_TypeID"
										item-title="TypeTitle"></v-select>
								</v-col>
								<v-col cols="12">
									<v-textarea variant="outlined" v-model="formData.TemplateContent"
										label="Nội dung thông báo" :rules="[rules.required]" :hide-details="true">
									</v-textarea>
								</v-col>
								<v-col cols="12">
									<v-checkbox v-model:checked="formData.IsSendME"
										label="Gửi thông báo qua app ME"></v-checkbox>
								</v-col>
							</v-row>
						</v-form>
						<div class="w-100 pt-2 d-flex justify-end ga-2 border-t mt-2">
							<v-btn color="primary" variant="outlined" @click="handleClearData">Làm mới</v-btn>
							<v-btn color="success" variant="outlined" @click="handleSave">
								{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
							</v-btn>
						</div>
					</v-card-text>
					<v-data-table :headers="headers" :items="DSThongBao" :hide-default-footer="true"
						:items-per-page="-1">
						<template #item.actions="{ item }">
							<div class="d-flex ga-2 justify-center">
								<v-btn size="small" color="red" variant="text" icon
									@click="handleDelete(item)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
								<v-btn size="small" color="success" variant="text" icon
									@click="handleEditThongBao(item)"><v-icon>mdi-square-edit-outline</v-icon></v-btn>
							</div>
						</template>
					</v-data-table>
				</v-card>
			</v-col>
			<v-col cols="3">
				<v-card class="border rounded bg-white">
					<v-card-title class="border-b">Biến</v-card-title>
					<v-card-text class="pt-4 pa-0" style="background-color: #bdb7b712;">
						<v-list lines="two" class="d-flex flex-column ga-2 mx-2 pt-0"
							style="background-color: #f0f8ff00;height: calc(100vh - 160px);">
							<v-list-item class="rounded bg-white" v-for="(n, index) in DSBien" :key="index"
								:title="n.Param" :subtitle="n.Header" @click="copyText(n.Param)">
								<template #prepend>
									<v-icon>mdi-content-copy</v-icon>
								</template>
							</v-list-item>
						</v-list>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				valid: false,
				formData: {
					Title: '',
					TemplateContent: '',
					IsSendME: false
				},
				DSBien: [],
				DSThongBao: [],
				headers: [{
					title: "Tiêu đề",
					value: "Title"
				},
				{
					title: "Nội dung",
					value: "TemplateContent"
				},
				{
					title: 'Thao tác',
					key: "actions",
					align: 'center'
				}],
				isEdit: false,
				rules: {
					required: v => !!v || "Không được để trống",
				},
				DSTemplateType: []
			}
		},
		async mounted() {
			this.onRefresh()
		},
		computed: {},
		watch: {},
		methods: {
			async onRefresh() {
				this.GetDataThongBao()
				this.handleData_DinhNghia()
				this.DSTemplateType = await this.GET_ThongBao_Template_Type_Get()
			},
			async GetDataThongBao() {
				this.DSThongBao = await this.GET_ThongBao_Template_Get()
			},
			async handleData_DinhNghia() {
				let rawData = await this.GET_ThongBao_Template_DinhNghia_Get()
				console.log('rawData', rawData)
				this.DSBien = rawData
			},
			async handleInsertThongBao() {
				let { valid } = await this.validateForm()
				if (!valid) return
				let params = {
					Title: this.formData.Title,
					TemplateContent: this.formData.TemplateContent,
					List_ParamContentID: [],
					ThongBao_TypeID: this.formData.ThongBao_TypeID
				}
				let GetParamContent = this.formData.TemplateContent.split(' ').filter(text => text.includes('@'))
				this.DSBien.forEach(element => {
					if (GetParamContent.some(p => p.includes(element.Param))) {
						params.List_ParamContentID.push(element.ParamContentID)
					}
				});
				let response = await this.INS_ThongBao_Template_Ins(params)
				if (response) {
					Vue.$toast.success('Thêm thông báo thành công!', { position: 'top' })
					this.GetDataThongBao()
					this.$refs.formRef.reset()
				}
			},
			async handleUpdateThongBao() {
				await this.validateForm()
				let params = {
					ThongBao_TemplateID: this.formData.ThongBao_TemplateID,
					Title: this.formData.Title,
					TemplateContent: this.formData.TemplateContent,
					List_ParamContentID: [],
					ThongBao_TypeID: this.formData.ThongBao_TypeID
				}
				let GetParamContent = this.formData.TemplateContent.split(' ').filter(text => text.includes('@'))
				this.DSBien.forEach(element => {
					if (GetParamContent.some(p => p.includes(element.Param))) {
						params.List_ParamContentID.push(element.ParamContentID)
					}
				});
				let response = await this.UPD_ThongBao_Template_Upd_ByThongBao_TemplateID(params)
				if (response) {
					Vue.$toast.success('Cập nhật thông báo thành công!', { position: 'top' })
					this.GetDataThongBao()
					this.$refs.formRef.reset()
				}
			},
			async handleEditThongBao(item) {
				this.isEdit = true
				this.formData = Object.assign({}, item)
			},
			async handleSave() {
				if (!this.isEdit) {
					await this.handleInsertThongBao()
				} else {
					await this.handleUpdateThongBao()
					this.isEdit = false
				}
			},
			async handleDelete(item) {
				const $this = this
				confirm({
					title: "Xác nhận xóa thông báo",
					action: async () => {
						let params = {
							ThongBao_TemplateID: item.ThongBao_TemplateID
						}
						let response = await $this.DEL_ThongBao_Template_Del(params)
						if (response) {
							Vue.$toast.success('Xóa thông báo thành công!', { position: 'top' })
							$this.GetDataThongBao()
						}
					}
				})
	
			},
			handleClearData() {
				this.$refs.formRef.reset()
				this.onRefresh()
				this.isEdit = false
			},
			copyText(text) {
				navigator.clipboard.writeText(text)
					.then(() => {
						Vue.$toast.success('Đã copy ' + text, { position: 'top' })
					})
					.catch(err => {
						console.error("Copy thất bại", err);
					});
			},
			async validateForm() {
				const valid = await this.$refs.formRef.validate();
				return valid;
			},
			GET_ThongBao_Template_DinhNghia_Get,
			INS_ThongBao_Template_Ins,
			GET_ThongBao_Template_Get,
			UPD_ThongBao_Template_Upd_ByThongBao_TemplateID,
			DEL_ThongBao_Template_Del,
			GET_ThongBao_Template_Type_Get
		},
	}
</script>