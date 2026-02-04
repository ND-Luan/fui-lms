<template>
	<v-snackbar v-model="visible" color="warning" timeout="3000" location="top right">
		{{ message }}
	</v-snackbar>
</template>

<script>
	export default {
		name: 'GlobalUiErrorSnackbar',
	
		computed: {
			visible: {
				get() {
					return window.errorState.ui.visible;
				},
				set(val) {
					if (!val) window.errorState.ui.hide();
				}
			},
			message() {
				return window.errorState.ui.message;
			}
		}
	}
</script>