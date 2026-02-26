<template>
	<!-- Desktop: hiển thị inline trực tiếp -->
	<uc-achievement-card-desktop v-if="!isMobile" :HocSinh="HocSinh" />

	<!-- Mobile: có nút bấm, mở bottom sheet -->
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
			HocSinh: { type: Object }
		},
		data() {
			return { windowWidth: window.innerWidth };
		},
		computed: {
			isMobile() { return this.windowWidth < 768; }
		},
		mounted() {
			window.addEventListener('resize', this.onResize);
		},
		beforeUnmount() {
			window.removeEventListener('resize', this.onResize);
		},
		methods: {
			onResize() { this.windowWidth = window.innerWidth; }
		}
	}
</script>