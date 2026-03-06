<template>
	<div>
		<v-card flat>
			<v-card-title class="d-flex align-center justify-space-between">
				<span class="text-h6">Chỉ tiêu Trung học</span>
			</v-card-title>
			<v-divider />
			<v-card-text>
				<v-row dense>
					<v-col cols="12" md="3">
						<v-select v-model="filters.CapID" label="Chọn cấp" :items="DSCap" item-title="title"
							item-value="value" />
					</v-col>
					<v-col cols="12" md="3">
						<v-select v-model="filters.KhoiID" label="Chọn khối" :items="DSKhoi" item-title="title"
							item-value="value" />
					</v-col>
					<v-col cols="12" md="3">
						<v-select v-model="filters.MonHocID" label="Chọn môn học" :items="DSMonHoc" item-title="title"
							item-value="value" />
					</v-col>
					<v-col cols="12" md="3">
						<v-btn text="Lưu" variant="outlined" color="primary" @click="onSave" :loading="loading"
							prepend-icon="mdi-content-save" />
					</v-col>
				</v-row>
			</v-card-text>

			<v-divider />

			<div style="max-height: calc(100vh - 118px); overflow-y: auto;">
				<v-table fixed-header density="compact" class="chi-tieu-table">
					<thead>
						<tr>
							<th class="text-center" style="min-width: 80px;">Khối</th>
							<th class="text-left" style="min-width: 250px;">Tên môn học</th>
							<th class="text-right" style="min-width: 120px;">Tốt</th>
							<th class="text-right" style="min-width: 120px;">Khá</th>
							<th class="text-right" style="min-width: 120px;">Đạt</th>
							<th class="text-right" style="min-width: 120px;">Chưa đạt</th>
						</tr>
					</thead>
					<tbody>
						<template v-if="filteredData.length === 0">
							<tr>
								<td colspan="6" class="text-center py-8 text-grey">
									<v-icon size="48" color="grey-lighten-2">mdi-database-off-outline</v-icon>
									<div class="mt-2">Không có dữ liệu</div>
								</td>
							</tr>
						</template>
						<template v-else>
							<tr v-for="(item, index) in filteredData" :key="'row-'+item.KhoiID+'-'+item.MonHocID">
								<!-- Khối -->
								<td v-if="shouldShowKhoi(index)" :rowspan="getKhoiRowspan(item.KhoiID)"
									class="text-center font-weight-bold"
									style="vertical-align: middle; background-color: #f5f5f5;">
									Khối {{ item.KhoiID }}
								</td>

								<!-- Tên môn học -->
								<td class="text-left font-weight-medium">
									{{ item.TenMonHoc_HienThi }}
								</td>

								<!-- Tốt -->
								<td class="pa-1">
									<v-text-field v-model.number="item.ChiTieu_Tot" placeholder="0" type="number"
										min="0" max="100" reverse :clearable="false" density="compact" hide-details
										variant="outlined" @input="validatePercentage(item, 'ChiTieu_Tot')" />
								</td>

								<!-- Khá -->
								<td class="pa-1">
									<v-text-field v-model.number="item.ChiTieu_Kha" placeholder="0" type="number"
										min="0" max="100" reverse :clearable="false" density="compact" hide-details
										variant="outlined" @input="validatePercentage(item, 'ChiTieu_Kha')" />
								</td>

								<!-- Đạt -->
								<td class="pa-1">
									<v-text-field v-model.number="item.ChiTieu_Dat" placeholder="0" type="number"
										min="0" max="100" reverse :clearable="false" density="compact" hide-details
										variant="outlined" @input="validatePercentage(item, 'ChiTieu_Dat')" />
								</td>

								<!-- Chưa đạt -->
								<td class="pa-1">
									<v-text-field v-model.number="item.ChiTieu_ChuaDat" placeholder="0" type="number"
										min="0" max="100" reverse :clearable="false" density="compact" hide-details
										variant="outlined" @input="validatePercentage(item, 'ChiTieu_ChuaDat')" />
								</td>
							</tr>
						</template>
					</tbody>
				</v-table>
			</div>
		</v-card>
	</div>
</template>

<script>
	export default {
		name: 'ChiTieuMonHoc',
	
		data() {
			return {
				loading: false,
				allData: [],
				filters: {
					CapID: "TatCa",
					KhoiID: "TatCa",
					MonHocID: "TatCa"
				},
				DSCap: [],
				DSKhoi: [],
				DSMonHoc: []
			}
		},
	
		computed: {
			filteredData() {
				let result = [...this.allData]
	
				if (this.filters.CapID !== "TatCa") {
					result = result.filter(x => (x.CapID || this.getCapByKhoi(x.KhoiID)) === this.filters.CapID)
				}
	
				if (this.filters.KhoiID !== "TatCa") {
					result = result.filter(x => x.KhoiID === this.filters.KhoiID)
				}
	
				if (this.filters.MonHocID !== "TatCa") {
					result = result.filter(x => x.MonHocID === this.filters.MonHocID)
				}
	
				return result.sort((a, b) => {
					if (a.KhoiID !== b.KhoiID) return a.KhoiID - b.KhoiID
					return (a.TenMonHoc_HienThi || '').localeCompare(b.TenMonHoc_HienThi || '', 'vi')
				})
			}
		},
	
		watch: {
			'filters.CapID'() {
				this.filters.KhoiID = "TatCa"
				this.generateDSKhoi()
			}
		},
	
		async mounted() {
			await this.loadData()
		},
	
		methods: {
			async loadData() {
				try {
					this.loading = true
	
					const data = await ajaxCALLPromise("lms/ChiTieu_C2_C3_Get", {
						NienKhoa: vueData?.NienKhoa || new Date().getFullYear()
					})
	
					this.allData = data || []
					this.generateDSCap()
					this.generateDSKhoi()
					this.generateDSMonHoc()
	
				} catch (error) {
					console.error('Lỗi khi tải dữ liệu:', error)
					this.allData = []
				} finally {
					this.loading = false
				}
			},
	
			getCapByKhoi(khoiID) {
				// Ưu tiên lấy từ dữ liệu nếu có
				const item = this.allData.find(x => x.KhoiID === khoiID)
				if (item && item.CapID) return item.CapID
	
				// Fallback logic
				if (khoiID >= 1 && khoiID <= 5) return 1 // Tiểu học
				if (khoiID >= 6 && khoiID <= 9) return 2 // THCS
				if (khoiID >= 10 && khoiID <= 12) return 3 // THPT
				return null
			},
	
			generateDSCap() {
				const uniqueCap = [...new Set(this.allData.map(x => this.getCapByKhoi(x.KhoiID)))].filter(x => x !== null).sort()
	
				const capNames = {
					1: "Tiểu học",
					2: "THCS",
					3: "THPT"
				}
	
				this.DSCap = [
					{ title: "Tất cả cấp", value: "TatCa" },
					...uniqueCap.map(capID => ({
						title: capNames[capID] || `Cấp ${capID}`,
						value: capID
					}))
				]
			},
	
			generateDSKhoi() {
				let dataToFilter = this.allData
	
				if (this.filters.CapID !== "TatCa") {
					dataToFilter = dataToFilter.filter(x => this.getCapByKhoi(x.KhoiID) === this.filters.CapID)
				}
	
				const uniqueKhoi = [...new Set(dataToFilter.map(x => x.KhoiID))].sort((a, b) => a - b)
	
				this.DSKhoi = [
					{ title: "Tất cả khối", value: "TatCa" },
					...uniqueKhoi.map(khoiID => ({
						title: `Khối ${khoiID}`,
						value: khoiID
					}))
				]
			},
	
			generateDSMonHoc() {
				const uniqueMonHoc = [...new Set(this.allData.map(x => x.MonHocID))]
	
				const monHocList = uniqueMonHoc.map(monHocID => {
					const item = this.allData.find(x => x.MonHocID === monHocID)
					return {
						id: monHocID,
						title: '[Cấp ' + item.CapID + '] - ' + item?.TenMonHoc_HienThi
					}
				}).sort((a, b) => a.title.localeCompare(b.title, 'vi'))
	
				this.DSMonHoc = [
					{ title: "Tất cả môn học", value: "TatCa" },
					...monHocList.map(x => ({ title: x.title, value: x.id }))
				]
			},
	
			shouldShowKhoi(index) {
				if (index === 0) return true
				return this.filteredData[index].KhoiID !== this.filteredData[index - 1].KhoiID
			},
	
			getKhoiRowspan(khoiID) {
				return this.filteredData.filter(x => x.KhoiID === khoiID).length
			},
	
			validatePercentage(item, field) {
				const value = item[field]
				if (value !== null && value !== undefined) {
					if (value < 0) item[field] = 0
					if (value > 100) item[field] = 100
				}
			},
	
			onSave() {
				this.loading = true
				ajaxCALLPromise("lms/ChiTieu_C2_C3_Ins", {
					JsonMonHoc: this.allData
				}).then(() => {
					this.loadData()
					this.loading = false
					Vue.$toast.success('Lưu dữ liệu thành công!', { position: "top" })
				})
			}
		}
	}
</script>