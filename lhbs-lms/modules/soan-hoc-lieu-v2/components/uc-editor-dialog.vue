<template>
	<v-dialog max-width="900">
		<template v-slot:activator="{ props: activatorProps }">
			<div v-bind="activatorProps">
				<div v-if="isSoanText">
					<p v-if="_.isEmpty(text)" class="cursor-pointer">
						Bấm để <v-icon color="success" size="small">mdi-pencil</v-icon> soạn đáp án...
					</p>
					<p v-else v-html="text" class="cursor-pointer" />
				</div>
				<slot v-else />
			</div>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card title="Chỉnh sửa đáp án">
				<v-card-text>
					<f-editor v-model="textEditor" variant="outlined" rows="2" auto-grow>
					</f-editor>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Đóng" @click="isActive.value = false"></v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			text: {
				type: String,
				default: ""
			},
			isSoanText: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				textEditor: this.text
			}
		},
		mounted() { },
		computed: {},
		watch: {
			textEditor: function (val) {
				this.$emit('update:text', val)
			}
		},
		methods: {},
	}
</script>