<template>
	<uc-jexcel class="height-excel-tong-ket-hoc-ki" v-if="vueData.DSHocSinhQLD?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" :freeze-rows="2" v-model:dataSource="vueData.DSHocSinhQLD"
		:columns="vueData.columnHeader" :key="vueData.keyComp" :filters="true" :exportExcel="true"
		:nestedHeaders="vueData.nestedHeaders"
		@onChange="handleChange" @rowData="GetRowData" :styleSheet="vueData.styleSheet">
	</uc-jexcel>
</template>
<script>
	export default {
	    data() {
	        return {
	            vueData
	        }
	    },
	    mounted() {
	    },
	    methods: {
	        handleChange(val) {
	            // Xử lý cập nhật dữ liệu nếu cần
				const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(val.x, val.y) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
				console.log(`cellAdresss`, cellAdresss);
				let styleCell = {}
				styleCell[cellAdresss] = `background-color : yellow`
				vueData.instance[0].setStyle(styleCell) 
	        },
			//Hứng dữ liệu từ bên trong component chung uc-jexcel để lấy row có cell thay đổi dữ liệu
			GetRowData(val){
				//val có cấu trúc [1, '21200024', 'Nguyễn Thanh An', '09A', '11/09/2010',...] (row học sinh)
				//Tạo biến DSHocSinhChange để push HocSinhID có thay đổi dữ liệu (val[1])
				vueData.DSHocSinhChange.push(val[1]) 
			},
	        download() {
	            vueData.instance.helpers.download()
	        },
	    }
	}
</script>