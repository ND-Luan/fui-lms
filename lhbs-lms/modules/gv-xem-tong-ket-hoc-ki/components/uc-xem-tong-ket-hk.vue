<template>
	<uc-jexcel class="height-excel-tong-ket-hoc-ki" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
		:freeze-columns="vueData.freezeColumns" :freeze-rows="2" :dataSource="tableData" :columns="vueData.columnHeader"
		:key="vueData.keyComp" :filters="true" :exportExcel="true" @onChange="handleChange" @rowData="GetRowData"
		:styleSheet="vueData.styleSheet">
	</uc-jexcel>
</template>

<script>
	export default {
		data() {
	        return {
	            vueData
	        }
	    },
		computed: {
			tableData() {
				const columns = (vueData.columnHeader || []).map(col => col?.name).filter(Boolean)
				if (!columns.length) return []
				return (vueData.DSHocSinh || []).map(item => {
					const row = {}
					columns.forEach(col => {
						row[col] = item?.[col] ?? ''
					})
					return row
				})
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
				// Sync giá trị thay đổi trực tiếp vào vueData.DSHocSinh
				const columnName = vueData.columnHeader[val.x]?.name
				if (columnName && val.y >= 0 && val.y < vueData.DSHocSinh.length) {
					vueData.DSHocSinh[val.y][columnName] = val.value
				}
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