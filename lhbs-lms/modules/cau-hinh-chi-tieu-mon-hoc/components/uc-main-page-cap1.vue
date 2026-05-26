<template>
	<v-card>
		<v-card-title class="text-h5 border-md rounded border-primary">
			<span class="text-uppercase text-primary me-3">Cấu hình chỉ tiêu tiếng Anh - Cấp 1</span>
			<v-progress-circular color="green" indeterminate v-if="!vueData.NienKhoa" />
			<v-chip v-if="vueData.NienKhoa" variant="text" color="success" class="font-weight-medium">{{
				vueData.NienKhoa }}</v-chip>
		</v-card-title>

		<div class="w-100 px-3 d-flex flex-column align-center justify-center border-s-xl border-primary elevation-1 mt-3 rounded-s-lg ga-2"
			style="min-height: 100px;">
			<div class="d-flex align-center ga-2 w-100">
				<v-select v-model="vueData.CapID" label="Cấp" :items="CapIDArr" style="max-width: 150px"></v-select>
				<v-select v-model="HocKi" label="Học kì" :items="DSHocKi" style="max-width: 180px"></v-select>
				<v-spacer></v-spacer>
				<v-btn variant="text" @click="onExportExcel()" color="green" icon="mdi-microsoft-excel"></v-btn>
				<v-btn color="primary" @click="onSave()" variant="outlined" prepend-icon="mdi-content-save"
					:disabled="vueData.DSLop.length == 0 || vueData.columnHeader == 0" :loading="isLoadingSave">Lưu chỉ
					tiêu</v-btn>
			</div>
			<div class="d-flex align-center w-100">
				<i class="text-caption">Ghi chú: Phần trăm không được lớn hơn 100% hoặc nhỏ hơn -100% (Nếu không thỏa
					điều kiện =&gt; Phần trăm mặc định = 0) và số thập phân của phần trăm nằm sau dấu "."</i>
			</div>
		</div>
		<v-card-text style="max-height: calc(100vh - 194px);">
			<v-empty-state icon="mdi-magnify" v-if="vueData.DSLop.length == 0 || vueData.columnHeader == 0"
				title="Không tìm thấy dữ liệu"></v-empty-state>
			<uc-jexcel v-else class="height-excel-tong-ket-hoc-ki hide-headers" v-if="vueData.DSLop.length > 0"
				:freeze-columns="1" :freeze-rows="1" v-model:dataSource="vueData.DSLop" v-model="instance"
				:columns="vueData.columnHeader" :nestedHeaders="vueData.nestedHeaders" :key="keyComp"
				@onChange="onCellChange"></uc-jexcel>
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
			HocKi: vueData?.NienKhoaItem?.HocKi == 1 ? 'CK_HK1' : 'CK_HK2',
			DSHocKi: [
				{ title: 'Giữa HK1', value: 'GK_HK1' },
				{ title: 'Cuối HK1', value: 'CK_HK1' },
				{ title: 'Giữa HK2', value: 'GK_HK2' },
				{ title: 'Cuối HK2', value: 'CK_HK2' },
			],
			CapIDArr: [
				{ title: "Cấp 1", value: 1 },
				{ title: "Cấp 2", value: 2 },
				{ title: "Cấp 3", value: 3 },
			],
		}
	},
	watch: {
		"vueData.NienKhoa": function (val) {
			if (val && parseInt(vueData.CapID) === 1) {
				this.ChiTieuGet()
			}
		},
		"vueData.CapID": function (val) {
			if (parseInt(val) === 1 && vueData.NienKhoa) {
				this.ChiTieuGet()
			}
		},
		HocKi: function (val) {
			if (val && parseInt(vueData.CapID) === 1 && vueData.NienKhoa) {
				this.ChiTieuGet()
			}
		},
		instance: function (newVal) {
			if (newVal && Object.keys(newVal).length > 0) {
				this.$nextTick(() => {
					this.onload()
				})
			}
		},
	},
	mounted() {
		if (parseInt(vueData.CapID) === 1 && vueData.NienKhoa) {
			this.ChiTieuGet()
		}
	},
	methods: {
		toNumber(value) {
			const normalized = typeof value === 'string' ? value.replace(',', '.') : value
			const num = Number(normalized)
			return Number.isFinite(num) ? num : 0
		},
		recalculateSoVoiThucTeRows() {
			if (!Array.isArray(vueData.DSLop) || vueData.DSLop.length === 0) return
			vueData.DSLop.forEach(row => {
				const chtDelta = Number((this.toNumber(row.CHT_ThucTe) - this.toNumber(row.CHT_ChiTieu)).toFixed(2))
				const htDelta = Number((this.toNumber(row.HT_ThucTe) - this.toNumber(row.HT_ChiTieu)).toFixed(2))
				const tDelta = Number((this.toNumber(row.T_ThucTe) - this.toNumber(row.T_ChiTieu)).toFixed(2))

				if (this.toNumber(row.CHT_SoVoiThucTe) !== chtDelta) row.CHT_SoVoiThucTe = chtDelta
				if (this.toNumber(row.HT_SoVoiThucTe) !== htDelta) row.HT_SoVoiThucTe = htDelta
				if (this.toNumber(row.T_SoVoiThucTe) !== tDelta) row.T_SoVoiThucTe = tDelta
			})
		},
		recalculateSoVoiThucTeAtRow(rowIndex) {
			if (!Array.isArray(vueData.DSLop)) return
			const row = vueData.DSLop[rowIndex]
			if (!row) return

			row.CHT_SoVoiThucTe = Number((this.toNumber(row.CHT_ThucTe) - this.toNumber(row.CHT_ChiTieu)).toFixed(2))
			row.HT_SoVoiThucTe = Number((this.toNumber(row.HT_ThucTe) - this.toNumber(row.HT_ChiTieu)).toFixed(2))
			row.T_SoVoiThucTe = Number((this.toNumber(row.T_ThucTe) - this.toNumber(row.T_ChiTieu)).toFixed(2))
		},
		onCellChange(payload) {
			const colIndex = Number(payload?.x)
			const rowIndex = Number(payload?.y)
			if (!Number.isInteger(colIndex) || !Number.isInteger(rowIndex)) return

			const columnName = this.vueData?.columnHeader?.[colIndex]?.name
			const isTargetColumn = ['CHT_ChiTieu', 'HT_ChiTieu', 'T_ChiTieu'].includes(columnName)
			if (!isTargetColumn) return

			this.recalculateSoVoiThucTeAtRow(rowIndex)
		},
		async ChiTieuGet(forceRefresh = false) {
			this.isLoadingSave = true
			vueData.DSLop = []
			vueData.columnHeader = [
				{ type: 'text', title: '', name: 'TenLop' },
				{ type: 'numeric', title: 'Chỉ tiêu', name: 'CHT_ChiTieu', align: 'end' },
				{ type: 'numeric', title: 'Thực', name: 'CHT_ThucTe', align: 'end', readOnly: true },
				{ type: 'numeric', title: '', name: 'CHT_SoVoiThucTe', align: 'end', readOnly: true },
				{ type: 'numeric', title: 'Chỉ tiêu', name: 'HT_ChiTieu', align: 'end' },
				{ type: 'numeric', title: 'Thực', name: 'HT_ThucTe', align: 'end', readOnly: true },
				{ type: 'numeric', title: '', name: 'HT_SoVoiThucTe', align: 'end', readOnly: true },
				{ type: 'numeric', title: 'Chỉ tiêu', name: 'T_ChiTieu', align: 'end' },
				{ type: 'numeric', title: 'Thực', name: 'T_ThucTe', align: 'end', readOnly: true },
				{ type: 'numeric', title: '', name: 'T_SoVoiThucTe', align: 'end', readOnly: true },
			]
			vueData.nestedHeaders[0] = [
				{ title: 'Lớp' },
				{ title: 'Chưa hoàn thành', colspan: 3 },
				{ title: 'Hoàn thành', colspan: 3 },
				{ title: 'Tốt', colspan: 3 },
			]
			vueData.nestedHeaders[1] = [
				{},
				{ title: 'Chỉ tiêu (%)' },
				{ title: 'Thực tế (%)' },
				{ title: 'So với chỉ tiêu (%)' },
				{ title: 'Chỉ tiêu (%)' },
				{ title: 'Thực tế (%)' },
				{ title: 'So với chỉ tiêu (%)' },
				{ title: 'Chỉ tiêu (%)' },
				{ title: 'Thực tế (%)' },
				{ title: 'So với chỉ tiêu (%)' },
			]

			try {
				const apiRes = await fetchPromise('lms/BaoCao_ChiTieu_TA1', {
					NienKhoa: vueData.NienKhoa,
					HocKi: this.HocKi,
				}, { forceRefresh })
				const dataRows = Array.isArray(apiRes) ? apiRes : []
				if (!dataRows.length) return

				let sortedLop = []
				const disctinctKhoi = [...new Set(dataRows.map(item => item.KhoiID))]
				for (let i = 0; i < disctinctKhoi.length; i++) {
					const groupByKhoi = dataRows.filter(item => item.KhoiID == disctinctKhoi[i])
					if (!groupByKhoi.length) continue
					sortedLop = [...sortedLop, ...this.sortByKhoi(groupByKhoi)]
				}

				this.DSLopAPI = []
				vueData.DSLop = sortedLop.map(row => {
					const CHT_ChiTieu = this.toNumber(row.C1_ChuaHoanThanh)
					const HT_ChiTieu = this.toNumber(row.C1_HoanThanh)
					const T_ChiTieu = this.toNumber(row.C1_Tot)
					const CHT_ThucTe = this.toNumber(row.TL_ChuaHoanThanh)
					const HT_ThucTe = this.toNumber(row.TL_HoanThanh)
					const T_ThucTe = this.toNumber(row.TL_Tot)

					this.DSLopAPI.push({
						TenLop: row.TenLop,
						CapID: this.toNumber(row.CapID),
						KhoiID: this.toNumber(row.KhoiID),
						LopID: this.toNumber(row.LopID),
						ChiTieuID: this.toNumber(row.ChiTieuID),
						IsTongKhoi: String(row.TenLop || '').toUpperCase().includes('TỔNG KHỐI'),
					})
					return {
						TenLop: row.TenLop,
						CHT_ChiTieu,
						CHT_ThucTe,
						CHT_SoVoiThucTe: Number((CHT_ThucTe - CHT_ChiTieu).toFixed(2)),
						HT_ChiTieu,
						HT_ThucTe,
						HT_SoVoiThucTe: Number((HT_ThucTe - HT_ChiTieu).toFixed(2)),
						T_ChiTieu,
						T_ThucTe,
						T_SoVoiThucTe: Number((T_ThucTe - T_ChiTieu).toFixed(2)),
					}
				})

				// Force update UI if instance exists
				this.$nextTick(() => {
					if (this.instance && this.instance[0] && typeof this.instance[0].setData === 'function') {
						this.instance[0].setData(vueData.DSLop)
					}
				})
			} catch (error) {
				Toast.error({ text: 'Không lấy được dữ liệu chỉ tiêu Cấp 1' })
			} finally {
				this.isLoadingSave = false
			}
		},
		async onSave() {
			this.isLoadingSave = true
			const data = vueData.DSLop
			const regex = /^-?(100|[1-9]?\d)([.,]\d+)?$/
			const dataIns = this.DSLopAPI
				.map(meta => {
					const row = data.find(x => x.TenLop == meta.TenLop) || {}
					return {
						ChiTieuID: this.toNumber(meta.ChiTieuID),
						CapID: this.toNumber(meta.CapID || vueData.CapID),
						HocKi: this.HocKi,
						KhoiID: this.toNumber(meta.KhoiID),
						LopID: meta.IsTongKhoi ? `__all_k${this.toNumber(meta.KhoiID)}__` : String(this.toNumber(meta.LopID)),
						C1_ChuaHoanThanh: parseFloat(regex.test(row.CHT_ChiTieu) && (row.CHT_ChiTieu <= 100 || row.CHT_ChiTieu >= -100) ? row.CHT_ChiTieu : 0),
						C1_HoanThanh: parseFloat(regex.test(row.HT_ChiTieu) && (row.HT_ChiTieu <= 100 || row.HT_ChiTieu >= -100) ? row.HT_ChiTieu : 0),
						C1_Tot: parseFloat(regex.test(row.T_ChiTieu) && (row.T_ChiTieu <= 100 || row.T_ChiTieu >= -100) ? row.T_ChiTieu : 0),
					}
				})
				.filter(item => String(item.LopID || '').length > 0)

			try {
				await fetchPromise('lms/BaoCao_ChiTieu_TA1_Save', {
					JsonChiTieu: JSON.stringify(dataIns),
					HocKi: this.HocKi,
					SYS_USERID: String(vueData?.user?.UserID ?? ''),
				}, { cache: false })
				await this.ChiTieuGet(true)
				this.keyComp++
				Toast.success({ text: 'Lưu chỉ tiêu thành công!' })
			} catch (error) {
				Toast.error({ text: 'Không lưu được chỉ tiêu Cấp 1' })
			} finally {
				this.isLoadingSave = false
			}
		},
		sortByKhoi(arr) {
			const objGroup = arr.filter(item => item.LopID < 0)
			if (objGroup.length > 0) {
				arr = arr.filter(item => item.LopID >= 0)
				arr = [...objGroup, ...arr]
			}
			return arr
		},
		onload() {
			const data = this.instance[0].getData()
			for (let y = 0; y < data.length; y++) {
				for (let x = 0; x < data[y].length; x++) {
					if (x != 0 && [3, 6, 9].includes(x)) {
						const value = parseFloat(data[y][x])
						const cellName = jspreadsheet.helpers.getCellNameFromCoords(x, y)
						this.instance[0].setStyle(cellName, 'font-weight', 'bold', true)
						if (value == 0) {
							this.instance[0].setStyle(cellName, 'background-color', 'rgb(153 153 153 / 51%)', true)
						} else if (value < 0 && value > -10) {
							this.instance[0].setStyle(cellName, 'background-color', 'yellow', true)
						} else if (value > 0) {
							this.instance[0].setStyle(cellName, 'background-color', '#00800082', true)
						} else {
							this.instance[0].setStyle(cellName, 'background-color', '#ff0000b8', true)
						}
					}
				}
			}
		},
		onExportExcel() {
			const data = this.handleDataExportExcel(vueData.DSLop)
			const myHeaders = new Headers()
			myHeaders.append('Content-Type', 'application/json')
			const requestOptions = {
				method: 'POST',
				headers: myHeaders,
				body: JSON.stringify({ Details: data }),
				redirect: 'follow',
			}

			fetch('https://lhbs.iotsoftvn.com/api/english-generator/ta-1', requestOptions)
				.then(response => response.blob())
				.then(blob => {
					const url = window.URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = `BaoCaoTA1ChiTieu_Cap1_${this.HocKi}.xlsx`
					document.body.appendChild(a)
					a.click()
					a.remove()
				})
				.catch(error => {
					console.log(error)
				})
		},
		handleDataExportExcel(data) {
			const DataExcel = []
			for (const row of data) {
				const obj = {}
				obj.Khoi_Lop = row.TenLop
				obj.HoanThanh = {
					ChiTieu_Percent: row.HT_ChiTieu,
					ThucTe_Percent: row.HT_ThucTe,
					ThucTe_Vs_ChiTieu: row.HT_SoVoiThucTe,
				}
				obj.ChuaHoanThanh = {
					ChiTieu_Percent: row.CHT_ChiTieu,
					ThucTe_Percent: row.CHT_ThucTe,
					ThucTe_Vs_ChiTieu: row.CHT_SoVoiThucTe,
				}
				obj.Tot = {
					ChiTieu_Percent: row.T_ChiTieu,
					ThucTe_Percent: row.T_ThucTe,
					ThucTe_Vs_ChiTieu: row.T_SoVoiThucTe,
				}
				DataExcel.push(obj)
			}
			return DataExcel
		},
	},
	}
</script>