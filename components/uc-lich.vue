<template>
	<uc-lich-mobile v-if="isMobile" :HocSinh="HocSinh" :inline="inline">
		<template v-if="$slots.activator" #activator="{ activatorProps }">
			<slot name="activator" :activator-props="activatorProps" />
		</template>
	</uc-lich-mobile>
	<uc-lich-desktop v-else :HocSinh="HocSinh" :inline="inline">
		<template v-if="$slots.activator" #activator="{ activatorProps }">
			<slot name="activator" :activator-props="activatorProps" />
		</template>
	</uc-lich-desktop>
</template>

<script>
export default {
	props: {
		HocSinh: Object,
		inline: {
			type: Boolean,
			default: false
		},
		isMobile: {
			type: Boolean,
			default: false
		}
	},
	
}
</script>
