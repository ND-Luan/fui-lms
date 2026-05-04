<template>
	<div class="position-relative overflow-y-auto" style="height: 100dvh">
		<div class="position-sticky bg-white pa-4" style="top: 0; z-index: 1">
			<slot name="filter" />
		</div>
		<div class="pa-4">
			<slot />
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				vueData,
			}
		},
	}
</script>