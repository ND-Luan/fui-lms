<template>
	<uc-jexcel   v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
		:key="vueData.keyComp" :filters="true" :exportExcel="true" :styleSheet="vueData.styleSheet">
	</uc-jexcel>
</template>

<script>
	export default {
		data(){
            return{
                vueData
            }
        },
        mounted(){
        },
        methods:{
            download(){
                vueData.instance.helpers.download()
            }
        }
	}
</script>