<template>
	<uc-jexcel class="height-excel" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
		:comments="vueData.comments" :key="vueData.keyComp" :styleSheet="vueData.styleSheet">
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
		watch:{
			'vueData.DSHocSinh': function(val){
				if(val){
			console.log('vueData.DSHocSinh',vueData.DSHocSinh)
				}
			}
		},
		mounted(){
		}
	}
</script>