<template>
	<v-snackbar v-model="visible" :timeout="-1" color="warning" location="top" elevation="6">
		<div class="d-flex align-center">
			<v-icon class="mr-2">mdi-alert-circle-outline</v-icon>
			<div>
				<div class="font-weight-medium">Đang hiển thị dữ liệu cũ</div>
				<div class="text-caption">
					Không thể kết nối server. Dữ liệu có thể chưa cập nhật.
				</div>
			</div>
		</div>

		<template v-slot:actions>
			<v-btn variant="text" size="small" @click="retry" :loading="retrying">
				Thử lại
			</v-btn>
			<v-btn icon="mdi-close" size="small" @click="dismiss" />
		</template>
	</v-snackbar>
</template>

<script>
	export default {
		name: 'GlobalStaleDataBanner',
	
		data() {
			return {
				retrying: false
			}
		},
	
		computed: {
			visible: {
				get() {
					return window.staleDataState?.visible || false;
				},
				set(val) {
					if (!val && window.staleDataState) {
						window.staleDataState.hide();
					}
				}
			}
		},
	
		methods: {
			async retry() {
				if (!window.staleDataState?.retryCallback) return;
	
				this.retrying = true;
				try {
					await window.staleDataState.retryCallback();
					window.staleDataState.hide();
				} catch (err) {
					console.error('Retry failed:', err);
				} finally {
					this.retrying = false;
				}
			},
	
			dismiss() {
				window.staleDataState.hide();
			}
		}
	}
</script>