<template>
	<uc-jexcel v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance" :freezeColumns="2"
		v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader" :updateTable="updateTable"
		:nestedHeaders="nestedHeaders" :styleSheet="vueData.styleSheet" :key="vueData.keyComp">
	</uc-jexcel>
	<div v-else>
		<uc-empty />
	</div>
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
	    computed: {
	        nestedHeaders: function () {
	            return [[{ title: '', colspan: 3 }, ...vueData.DSNhomDiem]]
	        },
	    },
	    watch: {},
	    methods: {
	        updateTable(instance, cell, col, row, val, label, cellName) {
	            console.log('cell.style', cell.style)
	            // cell.style.backgroundCol = vueData.columnHeader[col]?.backGroundColor
	            // vueData.columnHeader.forEach((x, index) => {
	            //     if (x.type == 'numeric') {
	            //         if (col === index) cell.style.textAlign = 'right'
	            //     } else if (x.type == 'text') {
	            //         if (col === index) cell.style.textAlign = 'left'
	            //     }
	            // })
	        },
	    },
	}
</script>