<template>
	<iframe :src="src" class="uc-iframe" style="
		display: block;
	width: 100%;
	height: 100dvh;
	border: none;
	"></iframe>
</template>

<script>
	export default {
		props: {
			HocSinh: Object
		},
		computed: {
			src() {
				return `/kham-pha?capid=${this.HocSinh.CapID}`
			}
		}
	}
</script> 