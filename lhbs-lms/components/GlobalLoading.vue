<template>
	<v-overlay :model-value="loading" persistent class="align-center justify-center">
		<v-card elevation="2" class="mx-auto pa-6 text-center w-100">
			<v-progress-circular indeterminate size="48" width="4" color="primary" />
			<div class="mt-4">{{ text }}</div>
		</v-card>
	</v-overlay>
</template>

<script>
	export default {
		name: 'GlobalLoading',
		computed: {
			loading() {
				return window.loadingState?.loading ;
			},
			text() {
				return window.loadingState?.text ?? '';
			}
		}
	}
</script>