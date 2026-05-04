<template>
	<v-card>
		<v-card-title class="text-h5 border-md rounded border-primary">
			<span class="text-uppercase text-primary me-3">Cấu hình chỉ tiêu tiếng Anh</span> <v-progress-circular
				color="green" indeterminate v-if="!vueData.NienKhoa" /> <v-chip v-if="vueData.NienKhoa" variant="text" color="success"
				class="font-weight-medium">{{ vueData.NienKhoa }}</v-chip>
		</v-card-title>
		<div class="w-100 px-3 d-flex flex-column align-center justify-center border-s-xl border-primary elevation-1 mt-3 rounded-s-lg ga-2"
			style="min-height: 100px;">
			<div class="d-flex align-center ga-2 w-100"><v-select v-model="vueData.CapID" label="Cấp" :items="CapIDArr"
					style="max-width: 150px"></v-select>
				<v-spacer></v-spacer>
				<v-btn variant="text"  @click="onExportExcel()" color="green" icon="mdi-microsoft-excel"></v-btn>
				<v-btn color="primary" @click="onSave()" variant = "outlined"  prepend-icon="mdi-content-save"
					:disabled="vueData.DSLop.length == 0 || vueData.columnHeader == 0" :loading="isLoadingSave">Lưu chỉ
					tiêu</v-btn>
			</div>
			<div class="d-flex align-center w-100">
				<i class="text-caption">Ghi chú: Phần trăm không được lớn hơn 100% hoặc nhỏ hơn -100% (Nếu không thỏa
					điều kiện => Phần trăm mặc định = 0) và số thập phân của phần trăm nằm sau dấu "."</i>
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
			messageEmpty: "",
			CapIDArr: [
				{
					title: "Cấp 1",
					value: 1
				},
				{
					title: "Cấp 2",
					value: 2
				},
				{
					title: "Cấp 3",
					value: 3
				}
			]
		}
	},
	async mounted() {

	},
	watch: {
		"vueData.NienKhoa": function (val) {
			if (val && vueData.CapID) {
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
					name: "TenLop"
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
			ajaxCALL('/lms/ChiTieu_Get', {
				CapID: vueData.CapID,
				NienKhoa: vueData.NienKhoa
			}, res => {
				//Xử lí cột động
				// columnHeader
				vueData.nestedHeaders[0] = [...vueData.nestedHeaders[0], ...res.data[0].map(item => { return { title: item.TenMucDo, colspan: 3 } })]
				res.data[0].forEach(col => {
					let handleObjMucDo = this.handleMucDoHeaders(col)
					handleObjMucDo.forEach(item => vueData.columnHeader.push(item))
					vueData.nestedHeaders[1].push({ title: "Chỉ tiêu (%)" })
					vueData.nestedHeaders[1].push({ title: "Thực tế (%)" })
					vueData.nestedHeaders[1].push({ title: "So với chỉ tiêu (%)" })
				})
				console.log('vueData.columnHeader', vueData.columnHeader)
				// Xử lí mapping dữ liệu
				if (res.data[1].length > 0) {
					if (vueData.CapID == 1 || vueData.CapID == 2) {
						let sortedLop = []
						let disctinctKhoi = [...new Set(res.data[1].map(item => item.KhoiID))];
						for (let i = 0; i < disctinctKhoi.length; i++) {
							let groupByKhoi = res.data[1].filter(item => item.KhoiID ==
								disctinctKhoi[i]);
							if (groupByKhoi.length == 0) return
							sortedLop = [...sortedLop, ...this.sortByKhoi(groupByKhoi)]
						}
						this.DSLopAPI = sortedLop
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
					} else {
						this.DSLopAPI = res.data[1]
						let sortedLop = []
						let disctinctKhoi = [...new Set(res.data[1].map(item => item.KhoiID))];
						for (let i = 0; i < disctinctKhoi.length; i++) {
							let groupByKhoi = res.data[1].filter(item => item.KhoiID ==
								disctinctKhoi[i]);
							if (groupByKhoi.length == 0) return
							sortedLop = [...sortedLop, ...this.sortByKhoiC3NoGroup(groupByKhoi)]
						}
						let disctinctLop = [...new Set(sortedLop.map(item => item.NhomID))];
						for (let i = 0; i < disctinctLop.length; i++) {
							let lop = sortedLop.filter(item => item.NhomID == disctinctLop[i]);
							if (lop.length == 0) return
							let obj = {
								TenLop: lop[0].TenNhom,
							}
							lop.forEach(item => {
								let handleObjMucDo = this.handleMucDo(item)
								obj = { ...obj, ...handleObjMucDo }
							});
							vueData.DSLop.push(obj)
						}
					}
				}
				this.isLoadingSave = false
				console.log('vueData.DSLop', vueData.DSLop)
			})
		},
		handleMucDo(lop) {
			let obj = {}
			if (vueData.CapID == 2) {
				switch (lop.MucDo_ID) {
					case 3:
						obj[`KD_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`KD_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`KD_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 4:
						obj[`D_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`D_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`D_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 5:
						obj[`K_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`K_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`K_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 6:
						obj[`T_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`T_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`T_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
				}
			} else if (vueData.CapID == 3) {
				switch (lop.MucDo_ID) {
					case 10:
						obj[`KD_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`KD_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`KD_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 11:
						obj[`D_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`D_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`D_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 12:
						obj[`K_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`K_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`K_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 13:
						obj[`T_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`T_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`T_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
				}
			} else {
				switch (lop.MucDo_ID) {
					case 7:
						obj[`HT_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`HT_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`HT_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 8:
						obj[`CHT_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`CHT_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`CHT_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
					case 9:
						obj[`T_ChiTieu`] = lop.ChiTieuDatRa ?? null
						obj[`T_ThucTe`] = lop.ChiTieuThucTe ?? null
						obj[`T_SoVoiThucTe`] = (lop.ChiTieuThucTe - lop.ChiTieuDatRa).toFixed('2', 0) ?? null
						break;
				}
			}

			return obj
		},
		handleMucDoHeaders(column) {
			let objCT = {
				title: "Chỉ tiêu",
				align: "end",
				type: "numeric"

			}
			let objTT = {
				title: "Thực",
				align: "end",
				type: "numeric",
				// mask: "0.00%",
				readOnly: true
			}
			let objSVTT = {
				title: "",
				align: "end",
				type: "numeric",
				// mask: "0.00%",
				readOnly: true,

			}
			let arr = []
			if (vueData.CapID == 2) {
				switch (column.MucDo_ID) {
					case 3:
						objCT['name'] = `KD_ChiTieu`
						objTT[`name`] = `KD_ThucTe`
						objSVTT['name'] = `KD_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 4:
						objCT['name'] = `D_ChiTieu`
						objTT[`name`] = `D_ThucTe`
						objSVTT['name'] = `D_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 5:
						objCT['name'] = `K_ChiTieu`
						objTT[`name`] = `K_ThucTe`
						objSVTT['name'] = `K_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 6:
						objCT['name'] = `T_ChiTieu`
						objTT[`name`] = `T_ThucTe`
						objSVTT['name'] = `T_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
				}
			} else if (vueData.CapID == 3) {
				switch (column.MucDo_ID) {
					case 10:
						objCT['name'] = `KD_ChiTieu`
						objTT[`name`] = `KD_ThucTe`
						objSVTT['name'] = `KD_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 11:
						objCT['name'] = `D_ChiTieu`
						objTT[`name`] = `D_ThucTe`
						objSVTT['name'] = `D_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 12:
						objCT['name'] = `K_ChiTieu`
						objTT[`name`] = `K_ThucTe`
						objSVTT['name'] = `K_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 13:
						objCT['name'] = `T_ChiTieu`
						objTT[`name`] = `T_ThucTe`
						objSVTT['name'] = `T_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
				}
			} else {
				switch (column.MucDo_ID) {
					case 7:
						objCT['name'] = `HT_ChiTieu`
						objTT[`name`] = `HT_ThucTe`
						objSVTT['name'] = `HT_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 8:
						objCT['name'] = `CHT_ChiTieu`
						objTT[`name`] = `CHT_ThucTe`
						objSVTT['name'] = `CHT_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
					case 9:
						objCT['name'] = `T_ChiTieu`
						objTT[`name`] = `T_ThucTe`
						objSVTT['name'] = `T_SoVoiThucTe`
						arr.push(objCT)
						arr.push(objTT)
						arr.push(objSVTT)
						break;
				}
			}
			return arr
		},
		async onSave() {
			this.isLoadingSave = true
			let data = vueData.DSLop
			let dataIns = []
			const regex = /^-?(100|[1-9]?\d)([.,]\d+)?$/;
			if (vueData.CapID != 3) {
				this.DSLopAPI.forEach(item => {
					let objFromTable = data.find(obj => obj.TenLop == item.TenLop)
					if (item.MucDo_ID == 3) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.KD_ChiTieu) && (objFromTable.KD_ChiTieu <= 100 ||
								objFromTable.KD_ChiTieu >= -100) ? objFromTable.KD_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 4) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.D_ChiTieu) && (objFromTable.D_ChiTieu <= 100 ||
								objFromTable.D_ChiTieu >= -100) ? objFromTable.D_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 5) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.K_ChiTieu) && (objFromTable.K_ChiTieu <= 100 ||
								objFromTable.K_ChiTieu >= -100) ? objFromTable.K_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 6) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.T_ChiTieu) && (objFromTable.T_ChiTieu <= 100 ||
								objFromTable.T_ChiTieu >= -100) ? objFromTable.T_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					}
					else if (item.MucDo_ID == 7) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.HT_ChiTieu) && (objFromTable.HT_ChiTieu <= 100 ||
								objFromTable.HT_ChiTieu >= -100) ? objFromTable.HT_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					}
					else if (item.MucDo_ID == 8) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.CHT_ChiTieu) && (objFromTable.CHT_ChiTieu <= 100 ||
								objFromTable.CHT_ChiTieu >= -100) ? objFromTable.CHT_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					}
					else if (item.MucDo_ID == 9) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.T_ChiTieu) && (objFromTable.T_ChiTieu <= 100 ||
								objFromTable.T_ChiTieu >= -100) ? objFromTable.T_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 10) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.KD_ChiTieu) && (objFromTable.KD_ChiTieu <=
								100 || objFromTable.KD_ChiTieu >= -100) ? objFromTable.KD_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 11) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.D_ChiTieu) && (objFromTable.D_ChiTieu
								<= 100 || objFromTable.D_ChiTieu >= -100) ? objFromTable.D_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 12) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.K_ChiTieu) &&
								(objFromTable.K_ChiTieu <= 100 || objFromTable.K_ChiTieu >= -100) ?
								objFromTable.K_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 13) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.T_ChiTieu) &&
								(objFromTable.T_ChiTieu <= 100 || objFromTable.T_ChiTieu >= -100) ?
								objFromTable.T_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							LopID: item.LopID
						}
						dataIns.push(obj)
						return
					}
				})
				await ajaxCALL('/lms/ChiTieu_Update', {
					JsonChiTieu: JSON.stringify(dataIns)
				}, res => {
					this.ChiTieuGet()
					this.keyComp++
					Toast.success({ text: 'Lưu chỉ tiêu thành công!' })
					this.isLoadingSave = false
				})
			} else {
				let dataHandle = this.handleData(data)
				this.DSLopAPI.forEach(item => {
					let objFromTable = dataHandle.find(obj => obj.TenLop.includes(item.TenNhom))
					if (item.MucDo_ID == 10) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.KD_ChiTieu) && (objFromTable.KD_ChiTieu <= 100 || objFromTable.KD_ChiTieu >= -100) ? objFromTable.KD_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							NhomID: item.NhomID,
						}
						dataIns.push(obj)
						return
					} else if (item.MucDo_ID == 11) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.D_ChiTieu) && (objFromTable.D_ChiTieu <= 100 || objFromTable.D_ChiTieu >= -100) ? objFromTable.D_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							NhomID: item.NhomID,
						}
						dataIns.push(obj)
						return
					}
					else if (item.MucDo_ID == 12) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.K_ChiTieu) && (objFromTable.K_ChiTieu <= 100 || objFromTable.K_ChiTieu >= -100) ? objFromTable.K_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							NhomID: item.NhomID,
						}
						dataIns.push(obj)
						return
					}
					else if (item.MucDo_ID == 13) {
						let obj = {
							ChiTieu_ID: item.ChiTieu_ID,
							ChiTieuDatRa: parseFloat(regex.test(objFromTable.T_ChiTieu) && (objFromTable.T_ChiTieu <= 100 || objFromTable.T_ChiTieu >= -100) ? objFromTable.T_ChiTieu : 0),
							MucDo_ID: item.MucDo_ID,
							ChiTieuThucTe: item.ChiTieuThucTe,
							SoVoiThucTe: item.SoVoiThucTe,
							NhomID: item.NhomID,
						}
						dataIns.push(obj)
						return
					}
				})
				console.log('dataIns', dataIns)
				await ajaxCALL('/lms/ChiTieu_Update_TA1_C3', {
					JsonChiTieu: JSON.stringify(dataIns)
				}, res => {
					this.ChiTieuGet()
					this.keyComp++
					Toast.success({ text: 'Lưu chỉ tiêu thành công!' })
					this.isLoadingSave = false
				})
			}
		},
		//Hàm xử lý group khối
		sortByKhoi(arr) {
			let objGroup = arr.filter(item => item.LopID < 0)
			if (objGroup.length > 0) {
				arr = arr.filter(item => item.LopID >= 0)
				arr = [...objGroup, ...arr]
			}
			return arr
		},
		//Hàm xử lý group khối và group nhóm AV cho C3
		sortByKhoiC3(arr) {
			let objGroup = arr.filter(item => item.NhomID == '-1025' || item.NhomID == '-1125' || item.NhomID == '-1225')
			if (objGroup.length > 0) {
				arr = arr.filter(item => item.NhomID != '-1025' && item.NhomID != '-1125' && item.NhomID != '-1225')
				let result = []
				for (let i = 0; i < arr.length; i += 8) {
					let objKhongDat = { ...arr[i + 2], TenNhom: arr[i + 2].TenNhom + (arr[i + 6] ? `, ${arr[i + 6].TenNhom.slice(-1)} ` : '') }
					result.push(objKhongDat);
					let objDat = { ...arr[i], TenNhom: arr[i].TenNhom + (arr[i + 4] ? `, ${arr[i + 4].TenNhom.slice(-1)} ` : '') }
					result.push(objDat);
					let objKha = {
						...arr[i + 1], TenNhom: arr[i + 1].TenNhom + (arr[i + 5] ? `, ${arr[i + 5].TenNhom.slice(-1)} ` : '')
					}
					result.push(objKha);
					let objTot = {
						...arr[i + 3], TenNhom: arr[i + 3].TenNhom + (arr[i + 7] ? `, ${arr[i + 7].TenNhom.slice(-1)} ` : '')
					}
					result.push(objTot);
				}
				arr = [...objGroup, ...result]
			} return arr
		},
		sortByKhoiC3NoGroup(arr) {
			let objGroup = arr.filter(item => item.NhomID == '-1025' || item.NhomID == '-1125' || item.NhomID == '-1225')
			if (objGroup.length > 0) {
				arr = arr.filter(item => item.NhomID != '-1025' && item.NhomID != '-1125' && item.NhomID != '-1225')
				let result = []
				for (let i = 0; i < arr.length; i++) {
					let objKhongDat = { ...arr[i], TenNhom: arr[i].TenNhom }
					result.push(objKhongDat);
					let objDat = { ...arr[i], TenNhom: arr[i].TenNhom }
					result.push(objDat);
					let objKha = {
						...arr[i], TenNhom: arr[i].TenNhom
					}
					result.push(objKha);
					let objTot = {
						...arr[i], TenNhom: arr[i].TenNhom
					}
					result.push(objTot);
				}
				arr = [...objGroup, ...result]
			} return arr
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
					if (x != 0 && [3, 6, 9, 12].includes(x)) {
						const value = parseFloat(data[y][x]);
						console.log('value', value)
						const cellName = jspreadsheet.helpers.getCellNameFromCoords(x, y);
						console.log('cellName', cellName)
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
			fetch("https://lhbs.iotsoftvn.com/api/english-generator/ta-1", requestOptions)
				.then((response) => response.blob())
				.then(blob => {
					var url = window.URL.createObjectURL(blob);
					var a = document.createElement('a');
					a.href = url;
					a.download = `BaoCaoTA1ChiTieu_Cap${vueData.CapID}.xlsx`
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
				obj['KhongDat'] = {
					ChiTieu_Percent: row.KD_ChiTieu,
					ThucTe_Percent: row.KD_ThucTe,
					ThucTe_Vs_ChiTieu: row.KD_SoVoiThucTe
				}
				obj['Dat'] = {
					ChiTieu_Percent: row.D_ChiTieu,
					ThucTe_Percent: row.D_ThucTe,
					ThucTe_Vs_ChiTieu: row.D_SoVoiThucTe
				}
				obj['Kha'] = {
					ChiTieu_Percent: row.K_ChiTieu,
					ThucTe_Percent: row.K_ThucTe,
					ThucTe_Vs_ChiTieu: row.K_SoVoiThucTe
				}
				obj['Tot'] = {
					ChiTieu_Percent: row.T_ChiTieu,
					ThucTe_Percent: row.T_ThucTe,
					ThucTe_Vs_ChiTieu: row.T_SoVoiThucTe
				}
				DataExcel.push(obj)
			}
			return DataExcel
		}
	}
}
</script>