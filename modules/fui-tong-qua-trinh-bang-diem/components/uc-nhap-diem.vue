<template>
	<uc-jexcel class="height-excel" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freezeColumns="vueData.freezeColumns" v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
		:comments="vueData.comments" :nestedHeaders="nestedHeaders" :styleSheet="vueData.styleSheet"
		:key="vueData.keyComp">
	</uc-jexcel>
	<uc-empty v-else />
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
			}
		},
		computed: {
			nestedHeaders: function () {
				return [[{ title: '', colspan: 3 }, ...vueData.DSNhomDiem]]
			},
		}
	}
</script>