<template>
	<v-card border v-for="item in vueData.items" :key="item.KhoiItem.value" class="mt-2">
		<v-card-title>
			Khối {{item.KhoiItem.value}}
		</v-card-title>
		<v-data-table :items="getVisibleItems(item)" :headers="getVisibleHeaders(item)" :items-per-page="-1" hide-default-footer>
			<template v-slot:[getStringSlot(LopNhomID)]="{item}" v-for="LopNhomID in getVisibleGroupIds(item)" :key="LopNhomID">
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
			isVisibleGroup(LopNhomID) {
				if (this.vueData.CapItem?.CapID !== 3 || this.vueData.ShowNhom !== true) return true
				return (this.vueData.DSNhom || []).some(nhom => nhom.IsNhomLMS_GiaoBai === false && String(nhom.NhomID) === String(LopNhomID))
			},
			getVisibleGroupIds(table) {
				return (table.uniqueDSLop || []).filter(LopNhomID => this.isVisibleGroup(LopNhomID))
			},
			getVisibleHeaders(table) {
				const visibleIds = new Set(this.getVisibleGroupIds(table).map(String))
				return (table.headers || []).filter(header => !String(header.value).startsWith('TemplateBangDiem_') || visibleIds.has(String(header.value).replace('TemplateBangDiem_', '')))
			},
			getVisibleItems(table) {
				return table.items || []
			},
			getStringSlot(LopNhomID) {
				let string = `item.TemplateBangDiem_${LopNhomID}`
				return string
			}
		},
	}
</script>
