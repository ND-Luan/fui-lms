<template>
	<v-dialog v-model="modelValue" max-width="600px">
		<v-card>
			<v-card-title class="d-flex align-center">Cập nhật
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

						<v-col cols="12">
							<v-text-field v-model="fromValue.TenKyNang" :rules="rules" label="Tên kĩ năng"
								variant="filled" :clearable="false" />
						</v-col>
						<v-col cols="12">
							<v-textarea v-model="fromValue.MoTaKyNang" :rules="rules" label="Mô tả" variant="filled"
								:clearable="false" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="close" variant="text">Đóng</v-btn>
				<v-btn @click="onSubmit" color="primary" variant="flat">Cập nhật</v-btn>
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
		skillDetailEdit: {
			type: Object,
			required: true
		},
		submit: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			fromValue: this.skillDetailEdit,
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
	watch: {
		skillDetailEdit(newValue, _) {
			this.fromValue = newValue;
		},
	},
	methods: {
		close() {
			this.$emit('update:modelValue', false)
		},
		async onSubmit() {
			const valid = (await this.$refs.form.validate()).valid;
			if (valid) {
				this.fromValue.TenKyNang = this.fromValue.TenKyNang.trim();
				this.fromValue.MoTaKyNang = this.fromValue.MoTaKyNang.trim();
				await this.submit(this.fromValue);
				this.close();
			}
		}
	},
}
</script>