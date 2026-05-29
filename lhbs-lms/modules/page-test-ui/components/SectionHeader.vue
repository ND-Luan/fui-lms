<template>
	<div class="section-header mb-3">
		<v-icon :icon="icon" color="primary" size="18" class="mr-2" />
		<span>{{ title }}</span>
	</div>
</template>

<script>
	export default {
		name: 'SectionHeader',
		props: { title: String, icon: String },
		data() {
			return {}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>