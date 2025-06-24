<template>
    <uc-jexcel class="height-excel-tong-ket-hoc-ki" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" :freeze-rows="1" 
        v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
        :nested-headers="vueData.nestedHeaders" :key="vueData.keyComp" :filters="true" :exportExcel="true">
	</uc-jexcel>
</template>
<script>
    export default{
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
            },
        }
    }
</script>