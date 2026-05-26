<template>
	<Global>
		<uc-main-page-cap1 v-if="parseInt(vueData.CapID) === 1" />
		<uc-main-page v-else />
	</Global>
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