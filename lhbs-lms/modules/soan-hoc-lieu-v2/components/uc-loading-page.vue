<template>
	<v-dialog v-model="modelValue" max-width="600" persistent>
		<v-list class="py-2" color="primary" elevation="12" rounded="lg">
			<v-list-item :title="text">
				<template v-slot:prepend>
					<div class="pe-4">
						<v-icon color="primary" size="x-large"></v-icon>
					</div>
				</template>
				<template v-slot:append>
					<v-progress-circular color="primary" indeterminate="disable-shrink" size="16" width="2">
					</v-progress-circular>
				</template>
			</v-list-item>
		</v-list>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Boolean,
				default: false
			},
			text: {
				type: String,
				default: "Đang tải dữ liệu..."
			}
		},
		data() {
			return {}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>