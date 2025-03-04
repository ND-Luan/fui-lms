<template>
	<uc-dialog v-model="vueData.isShowModalAddMauBangDiem" title="Thêm mẫu bảng điểm" @onSubmit="onHandleAdd"
		doneText="Lưu">
		<v-form ref="form">
			<v-row>
				<v-col cols="12">
					<v-text-field v-model="formData.TemplateBangDiemName" label="Tên mẫu bảng điểm"
						:rules="[v => !!v || 'Bạn chưa nhập tên mẫu bảng điểm']" />
				</v-col>
			</v-row>
		</v-form>
	</uc-dialog>
</template>

<script>
	export default {
	    props: {
	        onFinish: {
	            type: Function
	        }
	    },
	    data() {
	        return {
	            formData: {
	                TemplateBangDiemName: ''
	            },
	            isShow: this.modelValue,
	            vueData
	        }
	    },
	    methods: {
	        async onHandleAdd() {
	            const form = this.$refs.form
	            const { valid } = await form.validate()
	            if (valid) {
	                let params = { ...this.formData }
	                const { IsSuccess } = await TemplateBangDiem_Service.Ins(params)
	                if (IsSuccess) {
	                    Vue.$toast.success('Thêm mẫu bảng điểm thành công!', { position: 'top' })
	                    vueData.isShowModalAddMauBangDiem = false
	                    CALL('TemplateBangDiem_Get')
	                }
	            }
	        }
	    },
	}
</script>