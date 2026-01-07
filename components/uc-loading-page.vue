<template>
	<v-dialog v-model="modelValue" max-width="300" persistent>
		<v-list class="py-2" color="primary" elevation="12" rounded="lg">
			<v-list-item :title="text">
				<template v-slot:prepend>
					<v-img src="/_cdn/lhbs-lms/logo_lhbs_2.jpg" width="45" height="45" class="mr-2" />
				</template>

				<template v-slot:append>
					<v-progress-circular color="primary" indeterminate="disable-shrink" size="18" width="2" />
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
				default: "Đang tải dữ liệu"
			}
		}
	}
</script>