<template>
	<v-card>
		<v-card-title class="text-h5 border-md rounded border-primary">
			<span class="text-uppercase text-primary me-3">Cấu hình chỉ tiêu tiếng Anh 2</span> <v-progress-circular
				color="green" indeterminate v-if="!vueData.NienKhoa" /> <v-chip v-if="vueData.NienKhoa" color="success" variant="text"
				class="font-weight-medium">{{ vueData.NienKhoa }}</v-chip>
		</v-card-title>
		<div class="w-100 px-3 d-flex flex-column align-center justify-center border-s-xl border-primary elevation-1 mt-3 rounded-s-lg ga-2"
			style="min-height: 100px;">
			<div class="d-flex align-center ga-2 w-100">
				<i class="text-caption">Ghi chú: Phần trăm không được lớn hơn 100% hoặc nhỏ hơn -100% (Nếu không thỏa
					điều kiện => Phần trăm mặc định = 0) và số thập phân của phần trăm nằm sau dấu "."</i>
				<v-spacer></v-spacer>
				<v-btn variant="text"  @click="onExportExcel()" color="green" icon="mdi-microsoft-excel"></v-btn>

				<v-btn color="primary" @click="onSave()" prepend-icon="mdi-content-save" variant="outlined"
					:disabled="vueData.DSLop.length == 0 || vueData.columnHeader == 0" :loading="isLoadingSave">Lưu chỉ
					tiêu</v-btn>
			</div>
			<div class="d-flex align-center w-100">

			</div>

		</div>
		<v-card-text style="max-height: calc(100vh - 194px);">
			<v-empty-state icon="mdi-magnify" v-if="vueData.DSLop.length == 0 || vueData.columnHeader == 0"
				title="Không tìm thấy dữ liệu"></v-empty-state>
			<uc-jexcel v-else class="height-excel-tong-ket-hoc-ki hide-headers" v-if="vueData.DSLop.length > 0"
				:freeze-columns="1" :freeze-rows="1" v-model:dataSource="vueData.DSLop" v-model="instance"
				:columns="vueData.columnHeader" :nestedHeaders="vueData.nestedHeaders" :key="keyComp">
			</uc-jexcel>
		</v-card-text>
	</v-card>


</template>
<script>
export default {
	data() {
		return {
			vueData,
			instance: {},
			DSLopAPI: [],
			keyComp: 0,
			isLoadingSave: false,
			messageEmpty: ""
		}
	},
	async mounted() {

	},
	watch: {
		"vueData.NienKhoa": function (val) {
			if (val) {
				this.ChiTieuGet()
			}
		},
		"vueData.CapID": function (val) {
			if (val) {
				this.ChiTieuGet()
			}
		},
		'instance': function (newVal) {
			if (newVal && Object.keys(newVal).length > 0) {
				console.log('Instance ready:', newVal);
				this.$nextTick(() => {
					this.onload();
				});
			}
		}
	},
	methods: {
		ChiTieuGet() {
			this.isLoadingSave = true
			vueData.DSLop = []
			vueData.columnHeader = [
				{
					type: "text",
					title: "",
					name: "TenLop",
					width: 110
				}
			]
			vueData.nestedHeaders[0] = [
				{
					title: "Lớp"
				}
			]
			vueData.nestedHeaders[1] = [
				{}
			]
			ajaxCALL('/lms/ChiTieu_Get_TA2', {
				NienKhoa: vueData.NienKhoa
			}, res => {
				//Xử lí cột động
				// columnHeader
				vueData.nestedHeaders[0] = [...vueData.nestedHeaders[0], ...res.data[0].map(item => { return { title: item.TenMucDo, colspan: 4 } })]
				res.data[0].forEach(col => {
					let handleObjMucDo = this.handleMucDoHeaders(col)
					handleObjMucDo.forEach(item => vueData.columnHeader.push(item))
					vueData.nestedHeaders[1].push({ title: "Trình độ" })
					vueData.nestedHeaders[1].push({ title: "Chỉ tiêu (%)" })
					vueData.nestedHeaders[1].push({ title: "Thực tế (%)" })
					vueData.nestedHeaders[1].push({ title: "So với chỉ tiêu (%)" })
				})
				// Xử lí mapping dữ liệu
				if (res.data[1].length > 0) {
					this.DSLopAPI = res.data[1]
					let sortedLop = []
					let disctinctKhoi = [...new Set(res.data[1].map(item => item.KhoiID))];
					for (let i = 0; i < disctinctKhoi.length; i++) {
						let groupByKhoi = res.data[1].filter(item => item.KhoiID == disctinctKhoi[i]);
						if (groupByKhoi.length == 0) return
						console.log('groupByKhoi', groupByKhoi)
						sortedLop = [...sortedLop, ...this.sortByKhoi(groupByKhoi)]
					}

					let disctinctLop = [...new Set(sortedLop.map(item => item.LopID))];
					for (let i = 0; i < disctinctLop.length; i++) {
						let lop = sortedLop.filter(item => item.LopID == disctinctLop[i]);
						if (lop.length == 0) return
						let obj = {
							TenLop: lop[0].TenLop,
						}
						lop.forEach(item => {
							let handleObjMucDo = this.handleMucDo(item)
							obj = { ...obj, ...handleObjMucDo }
						});
						vueData.DSLop.push(obj)
					}
				}
				this.isLoadingSave = false
				console.log('this.DSLopAPI', this.DSLopAPI)
				console.log('vueData.DSLop', vueData.DSLop)
			})
		},
		handleMucDo(lop) {
			let obj = {}
			switch (lop.MucDo_ID) {
				case 14:
					obj[`HK1_TrinhDo`] = lop.TrinhDo ?? null
					obj[`HK1_ChiTieu`] = lop.ChiTieuDatRa ?? null
					obj[`HK1_ThucTe`] = lop.ChiTieuThucTe ?? null
					obj[`HK1_SoVoiThucTe`] = ['N100000', 'N110000', 'N120000'].includes(lop.LopID) ? null : (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
					break;
				case 15:
					obj[`HK2_TrinhDo`] = lop.TrinhDo ?? null
					obj[`HK2_ChiTieu`] = lop.ChiTieuDatRa ?? null
					obj[`HK2_ThucTe`] = lop.ChiTieuThucTe ?? null
					obj[`HK2_SoVoiThucTe`] = ['N100000', 'N110000', 'N120000'].includes(lop.LopID) ? null : (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
					break;
			}
			return obj
		},
		handleMucDoHeaders(column) {
			let objTD = {
				title: "Chỉ tiêu",
				type: "text"
			}
			let objCT = {
				title: "Chỉ tiêu",
				align: "end",
				type: "numeric"

			}
			let objTT = {
				title: "Thực",
				align: "end",
				type: "numeric",
				readOnly: true
			}
			let objSVTT = {
				title: "",
				align: "end",
				type: "numeric",
				readOnly: true,

			}
			let arr = []
			switch (column.MucDo_ID) {
				case 14:
					objTD['name'] = `HK1_TrinhDo`
					objCT['name'] = `HK1_ChiTieu`
					objTT[`name`] = `HK1_ThucTe`
					objSVTT['name'] = `HK1_SoVoiThucTe`
					arr.push(objTD)
					arr.push(objCT)
					arr.push(objTT)
					arr.push(objSVTT)
					break;
				case 15:
					objTD['name'] = `HK2_TrinhDo`
					objCT['name'] = `HK2_ChiTieu`
					objTT[`name`] = `HK2_ThucTe`
					objSVTT['name'] = `HK2_SoVoiThucTe`
					arr.push(objTD)
					arr.push(objCT)
					arr.push(objTT)
					arr.push(objSVTT)
					break;

			}
			return arr
		},
		async onSave() {
			this.isLoadingSave = true
			let data = vueData.DSLop
			let dataIns = []
			const regex = /^-?(100|[1-9]?\d)([.,]\d+)?$/;
			let dataHandle = this.handleData(data)
			console.log('dataHandle', dataHandle)
			this.DSLopAPI.forEach(item => {
				let objFromTable = dataHandle.find(obj => obj.TenLop.includes(item.TenLop))
				if (item.MucDo_ID == 14) {
					let obj = {
						ChiTieu_ID: item.ChiTieu_ID,
						TrinhDo: objFromTable?.HK1_TrinhDo,
						ChiTieuDatRa: parseFloat(regex.test(objFromTable?.HK1_ChiTieu) && (objFromTable?.HK1_ChiTieu <= 100 || objFromTable?.HK1_ChiTieu >= -100) ? objFromTable?.HK1_ChiTieu : 0),
						MucDo_ID: item.MucDo_ID,
						ChiTieuThucTe: item.ChiTieuThucTe,
						SoVoiThucTe: item.SoVoiThucTe,
						NhomID: item.LopID,
					}
					dataIns.push(obj)
					return
				} else if (item.MucDo_ID == 15) {
					let obj = {
						ChiTieu_ID: item.ChiTieu_ID,
						TrinhDo: objFromTable?.HK2_TrinhDo,
						ChiTieuDatRa: parseFloat(regex.test(objFromTable?.HK2_ChiTieu) && (objFromTable?.HK2_ChiTieu <= 100 || objFromTable?.HK2_ChiTieu >= -100) ? objFromTable?.HK2_ChiTieu : 0),
						MucDo_ID: item.MucDo_ID,
						ChiTieuThucTe: item.ChiTieuThucTe,
						SoVoiThucTe: item.SoVoiThucTe,
						NhomID: item.LopID,
					}
					dataIns.push(obj)
					return
				}
			})
			await ajaxCALL('/lms/ChiTieu_Update_TA2', {
				JsonChiTieu: JSON.stringify(dataIns)
			}, res => {
				this.ChiTieuGet()
				this.keyComp++
				Toast.success({ text: 'Lưu chỉ tiêu thành công!' })
			})
			this.isLoadingSave = false
		},
		//Hàm xử lí gộp nhóm lớp thành 1 hàng trong table jsreadsheet Ví dụ: 10AV1 và 10AV2 => 10AV1, 2 với chỉ tiêu lấp theo 10AV1
		sortByKhoi(arr) {
			let objGroup = arr.filter(item => item.LopID == 'N100000' || item.LopID == 'N110000' || item.LopID == 'N120000')
			if (objGroup.length > 0) {
				arr = arr.filter(item => item.LopID != 'N100000' && item.LopID != 'N110000' && item.LopID != 'N120000')
				let result = []
				for (let i = 0; i < arr.length; i += 4) {
					let objHK1 = { ...arr[i], TenLop: arr[i].TenLop + (arr[i + 2] ? `, ${arr[i + 2].TenLop.slice(-1)}` : '') }
					result.push(objHK1);
					let objHK2 = { ...arr[i + 1], TenLop: arr[i + 1].TenLop + (arr[i + 3] ? `, ${arr[i + 3].TenLop.slice(-1)}` : '') }
					result.push(objHK2);
				}
				arr = [...objGroup, ...result]
			}
			return arr
		},
		//Hàm tách nhóm lớp 10AV1, 2 => 10AV1 và 10AV2 có chung chỉ tiêu
		handleData(data) {
			let prefix = ''
			let bags = []
			for (let i = 0; i < data.length; i++) {
				let arrSplit = data[i].TenLop.split(', ')
				if (arrSplit.length > 1) {
					//Cắt chuỗi lấy chuỗi 4 chữ đầu. Ví dụ: 10AV1, 2 => prefix = '10AV'
					prefix = data[i].TenLop.substring(0, 4)
					// Vòng lặp xử lý nếu  có nhiều nhóm lớp thì tách ra độc lập. Ví dụ: 10AV1, 2 => 10AV1 và 10AV2 có chung chỉ tiêu
					for (let j = 0; j < arrSplit.length; j++) {
						let obj = {}
						if (j == 0) {
							obj = { ...data[i], TenLop: arrSplit[0] }
						} else {
							obj = { ...data[i], TenLop: prefix + arrSplit[j].replace(' ', '') }
						}
						bags.push(obj)
					}
				} else {
					let obj = { ...data[i], TenLop: arrSplit[0] }
					bags.push(obj)
				}
			}
			return bags
		},
		onload(instance) {
			// Duyệt qua tất cả các ô
			const data = this.instance[0].getData();
			for (let y = 0; y < data.length; y++) {
				for (let x = 0; x < data[y].length; x++) {
					if (x != 0 && x % 4 == 0 && ![0, 4, 8].includes(y)) {
						const value = parseFloat(data[y][x]);
						const cellName = jspreadsheet.helpers.getCellNameFromCoords(x, y);
						// Set từng property riêng
						this.instance[0].setStyle(cellName, 'font-weight', 'bold', true);
						if (value == 0) {
							this.instance[0].setStyle(cellName, 'background-color', 'rgb(153 153 153 / 51%)', true);
						} else if (value < 0 && value > -10) {
							this.instance[0].setStyle(cellName, 'background-color', 'yellow', true);
						} else if (value > 0) {
							this.instance[0].setStyle(cellName, 'background-color', '#00800082', true);
						} else {
							this.instance[0].setStyle(cellName, 'background-color', '#ff0000b8', true);
						}
					}

				}
			}
		},
		onExportExcel() {
			console.log('dataa', vueData.DSLop)
			let data = this.handleDataExportExcel(vueData.DSLop)
			const myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			const requestOptions = {
				method: "POST",
				headers: myHeaders,
				body: JSON.stringify({
					Details: data
				}),
				redirect: "follow"
			};
			fetch("https://lhbs.iotsoftvn.com/api/english-generator/ta-2", requestOptions)
				.then((response) => response.blob())
				.then(blob => {
					var url = window.URL.createObjectURL(blob);
					var a = document.createElement('a');
					a.href = url;
					a.download = `BaoCaoTA2ChiTieu.xlsx`
					document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
					a.click();
					a.remove(); //afterwards we remove the element again
				})
				.catch((error) => {
					console.log(error)
				});
		},
		handleDataExportExcel(data) {
			let DataExcel = []
			for (row of data) {
				let obj = {}
				obj['Khoi_Lop'] = row.TenLop
				obj['HK1'] = {
					TrinhDo: row.HK1_TrinhDo,
					ChiTieu_Percent: row.HK1_ChiTieu,
					ThucTe_Percent: row.HK1_ThucTe,
					ThucTe_Vs_ChiTieu: row.HK1_SoVoiThucTe
				}
				obj['HK2'] = {
					TrinhDo: row.HK2_TrinhDo,
					ChiTieu_Percent: row.HK2_ChiTieu,
					ThucTe_Percent: row.HK2_ThucTe,
					ThucTe_Vs_ChiTieu: row.HK2_SoVoiThucTe
				}
				DataExcel.push(obj)
			}
			return DataExcel
		}
	}
}
</script>