<template>
	<v-card border v-for="item in vueData.items" class="mt-2">
		<v-card-title>
			Khối {{item.KhoiItem.value}}
		</v-card-title>
		<v-data-table :items="item.items" :headers="item.headers" :items-per-page="-1" hide-default-footer>
			<template v-slot:[getStringSlot(LopNhomID)]="{item}" v-for="LopNhomID in item.uniqueDSLop">
				<v-select v-model="item['TemplateBangDiem_'+LopNhomID]" :items="vueData.DSTemplate"
					item-title="TemplateBangDiemName" item-value="TemplateBangDiemID"></v-select>
			</template>
		</v-data-table>
	</v-card>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			getStringSlot(LopNhomID) {
				let string = `item.TemplateBangDiem_${LopNhomID}`
				return string
			}
		},
	}
</script>