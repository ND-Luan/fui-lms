<template>
	<div>
		<GlobalLoading />
		<GlobalApiErrorDialog />
		<GlobalStaleDataBanner />
		<GlobalUiSnackbar ref="snackbarRef" />
		<GlobalIframeWindow ref="iframeWin" />
		<v-responsive>
			<v-app theme="light">
				<div ref="headerRef">
					<slot name="header" />
				</div>
				<v-main >
					<v-container>
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
	inject: ['iframeRef', 'snackbarRef'],
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
	},
	beforeUnmount() {
		this.observer?.disconnect()
	},
}
</script>
