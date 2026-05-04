<template>
	<uc-jexcel class="height-excel" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
		:comments="vueData.comments" :key="vueData.keyComp" :styleSheet="vueData.styleSheet"
		:nestedHeaders="vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'TatCa' ? vueData.nestedHeader : []"
		:rootDataSource="vueData.DSCotDiem" />
	<uc-empty v-else />
</template>

<script>
	export default {
		data() {
			return {
				vueData,
			}
		}
	}
</script>