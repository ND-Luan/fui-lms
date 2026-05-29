<template>
	<!-- INLINE mode (không dùng activator) -->
	<uc-achievement-card-desktop v-if="!isMobileCmp && inline" :HocSinh="HocSinh" />

	<!-- DIALOG mode desktop -->
	<template v-else-if="!isMobileCmp && !inline">
		<slot name="activator" :activatorProps="{ onClick: () => $emit('update:isOpen', true) }" />
		<uc-achievement-card-desktop v-model:isOpen="isOpen" :HocSinh="HocSinh"
			@update:isOpen="$emit('update:isOpen', $event)" />
	</template>

	<!-- Mobile: bottom sheet với activator -->
	<uc-achievement-card-mobile v-else :HocSinh="HocSinh">
		<template v-for="(_, name) in $slots" v-slot:[name]="slotProps">
			<slot :name="name" v-bind="slotProps ?? {}" />
		</template>
	</uc-achievement-card-mobile>
</template>

<script>
	export default {
		name: 'uc-achievement-card',
		props: {
			HocSinh: { type: Object },
			isOpen: { type: Boolean, default: false },
			inline: { type: Boolean, default: true },
			isMobile: { type: Boolean, default: null }, // ← nhận từ cha
		},
		emits: ['update:isOpen'],
		computed: { 
			isMobileCmp() {
				return this.isMobile ?? this.$vuetify.display.mobile
			}
		}
	}
</script>