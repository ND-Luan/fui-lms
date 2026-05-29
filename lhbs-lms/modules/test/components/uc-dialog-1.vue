<template>
	<v-dialog v-model="modelValue">
		<v-card></v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: ["modelValue", "isOpen"],
		emits: ["update:isOpen"],
		data() {
			return {}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>