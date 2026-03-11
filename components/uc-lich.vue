<template>
	<component :is="isMobile ? 'uc-lich-mobile' : 'uc-lich-desktop'" :HocSinh="HocSinh" :inline="inline">
		<template v-if="$slots.activator" #activator="{ activatorProps }">
			<slot name="activator" :activator-props="activatorProps" />
		</template>
	</component>
</template>

<script>
	export default {
		props: {
			HocSinh: Object,
			inline: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isMobile: window.innerWidth < 960  // ← tính ngay, không để false
			}
		},
		mounted() {
			this.checkMobile()
			window.addEventListener('resize', this.checkMobile)
		},
		beforeUnmount() {
			window.removeEventListener('resize', this.checkMobile)
		},
		methods: {
			checkMobile() {
				this.isMobile = window.innerWidth < 960
			}
		}
	}
</script>