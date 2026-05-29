<template>
<v-card-title>
				
				<!-- :style="{width : WIDTH_TEXT_FIELD_SEARCH + 'px'}" -->
				<v-text-field v-model="Search" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" single-line dense
					hide-details></v-text-field>
			</v-card-title>
</template>

<script>
	export default {
		props: [],
		data() {
			return {}
		},
		mounted() {},
		computed: {},
		watch: {},
		methods: {},
	}
</script>