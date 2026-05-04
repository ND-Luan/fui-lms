<template>
	<uc-dialog v-model="vueData.isShowModalEditMauBangDiem" max-width="600" title="Cập nhật mẫu bảng điểm"
		@onSubmit="onHandleEdit" doneText="Cập nhật">
		<v-form ref="form">
			<v-row>
				<v-col cols="12">
					<v-text-field v-model="recordMauBangDiem.TemplateBangDiemName" label="Tên mẫu bảng điểm"
						variant="outlined" density="compact"></v-text-field>
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
	        },
	        recordMauBangDiem: {
	            type: Object
	        }
	    },
	    data() {
	        return {
	            vueData
	        }
	    },
	    mounted() { },
	    computed: {},
	    watch: {},
	    methods: {
	        async onHandleEdit() {
	            const form = this.$refs.form
	            const { valid } = await form.validate()
	            if (valid) {
	                let params = { ...this.recordMauBangDiem }
	                const { IsSuccess } = await TemplateBangDiem_Service.Upd(params)
	                if (IsSuccess) {
	                    Vue.$toast.success('Cập nhật mẫu bảng điểm thành công!', { position: 'top' })
	                    vueData.isShowModalEditMauBangDiem = false
	                    CALL('TemplateBangDiem_Get')
	                }
	            }
	        }
	    },
	}
</script>