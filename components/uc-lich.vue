<template>
	<component :is="isMobile ? 'uc-lich-mobile' : 'uc-lich-desktop'" :HocSinh="HocSinh" :inline="inline" :isMobile>
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
			},
			isMobile: Boolean
		},
	}
</script>