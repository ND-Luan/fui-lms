<template>
	<uc-jexcel v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance" :freezeColumns="2"
		v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader" :updateTable="updateTable"
		:key="vueData.keyComp" styleExcel="height: calc(100vh - 268px)">
	</uc-jexcel>
</template>

<script>
	export default {
	    props: [],
	    data() {
	        return {
	            vueData,
	        }
	    },
	    mounted() { },
	    computed: {},
	    watch: {},
	    methods: {
	        updateTable(instance, cell, col, row, val, label, cellName) {
	            cell.style.backgroundColor = vueData.columnHeader[col]?.backGroundColor
	            vueData.columnHeader.forEach((x, index) => {
	                if (x.type == 'numeric') {
	                    if (col === index) cell.style.textAlign = 'right'
	
	                } else if (x.type == 'text') {
	                    if (col === index) cell.style.textAlign = 'left'
	
	                }
	            })
	        },
	    },
	}
</script>