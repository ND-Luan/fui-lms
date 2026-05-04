<template>
	<v-dialog v-model="visible" max-width="420">
		<v-card>
			<v-card-title class="text-error">
				HTTP {{status}}
			</v-card-title>

			<v-card-text>
				{{ message }}
			</v-card-text>

			<v-card-actions>
				<v-spacer />
				<v-btn color="primary" @click="close">
					Đóng
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'GlobalApiErrorDialog',
		computed: {
			visible: {
				get() {
					const val = window.errorState.api.visible;
					return val;
				},
				set(val) {
					console.log('🟡 visible setter:', val); // ← THÊM LOG
				}
			},
			message() {
				const msg = window.errorState.api.message;
				return msg;
			},
			status() {
				const status = window.errorState.api.status;
				return status;
			}
		},
	
		methods: {
			close() {
				window.errorState.api.hide();
			}
		}
	}
</script>