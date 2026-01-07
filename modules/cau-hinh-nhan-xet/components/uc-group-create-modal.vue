<template>
	<v-dialog v-model="modelValue" max-width="600px">
		<v-card>
			<v-card-title class="d-flex align-center">Thêm mới
				<v-spacer></v-spacer>
				<v-btn @click="close" icon="mdi-close" variant="text" density="compact" size="medium"></v-btn>
			</v-card-title>
			<v-card-text>
				<v-form ref="form" fast-fail>
					<v-row>
						<!-- <v-col cols="12" class="d-flex">
							<v-text-field v-model="CommentGroupName_EN" label="Nhóm Tiếng Anh" :rules="rules_EN"
								maxlength="100" hide-details="auto" color="primary" denstiy="compact"
								:clearable="false">
							</v-text-field>
						</v-col> -->
						<v-col cols="12">
							<v-text-field v-model="CommentGroupName_VI" label="Nhóm nhận xét" :rules="rules_VI"
								maxlength="100" hide-details="auto" color="primary" :clearable="false">
							</v-text-field>
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
			CommentGroupName_EN: '',
			CommentGroupName_VI: '',
			rules_EN: [
				v => !!(v?.trim()) || 'Không được bỏ trống'
			],
			rules_VI: [
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
			this.CommentGroupName_EN = '';
			this.CommentGroupName_VI = '';
		},
		async onSubmit() {
			const valid = (await this.$refs.form.validate()).valid;
			if (valid) {
				await this.submit(this.CommentGroupName_EN.trim(), this.CommentGroupName_VI.trim());
				this.close();
			}
		}
	},
}
</script>