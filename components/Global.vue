<template>
	<div>
		<GlobalLoading />
		<GlobalApiErrorDialog />
		<GlobalStaleDataBanner />
		<GlobalFirebaseMessaging />
		<GlobalUiSnackbar ref="snackbarRef" />
		<GlobalIframeWindow ref="iframeWin" />
		<GlobalConfirmDialog ref="confirmRef" />
		<uc-ticket-fab />
		<v-responsive>
			<v-app theme="light">
				<div ref="headerRef">
					<slot name="header" />
				</div>
				<v-main>
					<v-container fluid class="pa-0">
						<slot />
					</v-container>
				</v-main>
			</v-app>
		</v-responsive>
	</div>
</template>

<script>
export default {
	name: "Global",
	inject: ['iframeRef', 'snackbarRef', 'confirmRef'],
	data() {
		return {
			headerHeight: 0,
		}
	},
	mounted() {
		this.observer = new ResizeObserver(entries => {
			this.headerHeight = entries[0].contentRect.height
		})
		this.observer.observe(this.$refs.headerRef)

		this.iframeRef.value = this.$refs.iframeWin
		this.snackbarRef.value = this.$refs.snackbarRef
		this.confirmRef.value = this.$refs.confirmRef
	},
	beforeUnmount() {
		this.observer?.disconnect()
	},
}
</script>
