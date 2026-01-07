<template>
	<v-dialog v-model="modelValue" max-width="600px">
		<v-card>
			<v-card-title class="d-flex align-center">Thêm mới
				<v-spacer></v-spacer>
				<v-btn @click="close" icon="mdi-close" variant="text" density="compact" size="medium"></v-btn>
			</v-card-title>
			<v-card-text>
				<v-row>
					<v-col class="pb-2" cols="12">
						<uc-btn-guide />
					</v-col>
				</v-row>
				<v-form ref="form" fast-fail>
					<v-row>
						<!-- <v-col cols="12">
							<v-textarea v-model="CommentDetailName_EN" :rules="rules" label="Tiếng Anh" variant="filled"
								:clearable="false" />
						</v-col> -->
						<v-col cols="12">
							<v-textarea v-model="CommentDetailName_VI" :rules="rules" label="Mẫu nhận xét"
								variant="filled" :clearable="false" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="close" variant="text">Đóng</v-btn>
				<v-btn @click="onSubmit" color="primary" variant="flat">Lưu</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Boolean,
			required: true,
		},
		submit: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			CommentDetailName_EN: '',
			CommentDetailName_VI: '',
			rules: [
				v => !!(v?.trim()) || 'Không được bỏ trống'
			]
		}
	},
	mounted() {
	},
	computed: {},
	watch: {},
	methods: {
		close() {
			this.$emit('update:modelValue', false);
			this.CommentDetailName_EN = '';
			this.CommentDetailName_VI = '';
		},
		async onSubmit() {
			const valid = (await this.$refs.form.validate()).valid;
			if (valid) {
				await this.submit(this.CommentDetailName_EN.trim(), this.CommentDetailName_VI.trim());
				this.close();
			}
		}
	},
}
</script>