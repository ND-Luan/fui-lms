<template>
	<div>
		<v-tabs v-model="tab" color="primary" stacked>
			<v-tab :value="0">Môn học</v-tab>
			<v-tab :value="1">Năng lực & Phẩm chất</v-tab>
			<div class="d-flex align-center justify-end w-100">
				<v-row class="ma-0" dense style="max-width: 500px">
					<v-col>
						<v-select v-model="filters.KhoiID" label="Chọn khối" :items="DSKhoi" item-title="title"
							item-value="value" density="compact" hide-details />
					</v-col>
					<v-col>
						<v-select v-model="filters.MonHocID" label="Chọn môn học" :items="DSMonHoc" item-title="title"
							item-value="value" density="compact" hide-details />
					</v-col>
					<v-col cols="2">
						<v-btn text='Lưu' color="primary" @click="onSave" :loading="loading" block />
					</v-col>
				</v-row>
			</div>
		</v-tabs>

		<v-divider></v-divider>

		<v-tabs-window v-model="tab">
			<!-- Tab Môn học -->
			<v-tabs-window-item :value="0">
				<v-card flat>
					<div style="max-height: calc(100vh - 120px); overflow-y: auto;">
						<v-table fixed-header density="compact" class="chi-tieu-table">
							<thead>
								<tr>
									<th class="text-center" style="min-width: 80px;">Khối</th>
									<th class="text-left" style="min-width: 250px;">Tên môn học</th>
									<th class="text-right" style="min-width: 150px;">Hoàn thành tốt</th>
									<th class="text-right" style="min-width: 150px;">Hoàn thành</th>
									<th class="text-right" style="min-width: 150px;">Chưa hoàn thành</th>
								</tr>
							</thead>
							<tbody>
								<template v-if="filteredMonHocs.length === 0">
									<tr>
										<td colspan="5" class="text-center py-8 text-grey">
											Không có dữ liệu
										</td>
									</tr>
								</template>
								<template v-else v-for="(item, index) in filteredMonHocs"
									:key="'monhoc-'+item.ChiTieuID+'-'+item.KhoiID+'-'+item.MonHocID">
									<tr>
										<!-- Khối -->
										<td v-if="shouldShowKhoi(index, 'MonHoc')"
											:rowspan="getKhoiRowspan(item.KhoiID, 'MonHoc')"
											class="text-center font-weight-bold"
											style="vertical-align: middle; background-color: #f5f5f5;">
											Khối {{ item.KhoiID }}
										</td>

										<!-- Tên môn học -->
										<td class="text-left font-weight-medium">
											{{ item.TenMonHoc_HienThi }}
										</td>

										<!-- Hoàn thành tốt -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_HoanThanhTot" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_HoanThanhTot')" />
										</td>

										<!-- Hoàn thành -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_HoanThanh" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_HoanThanh')" />
										</td>

										<!-- Chưa hoàn thành -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_ChuaHoanThanh" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_ChuaHoanThanh')" />
										</td>
									</tr>
								</template>
							</tbody>
						</v-table>
					</div>
				</v-card>
			</v-tabs-window-item>

			<!-- Tab Năng lực & Phẩm chất -->
			<v-tabs-window-item :value="1">
				<v-card flat>
					<div style="max-height: calc(100vh - 120px); overflow-y: auto;">
						<v-table fixed-header density="compact" class="chi-tieu-table">
							<thead>
								<tr>
									<th class="text-center" style="min-width: 80px;">Khối</th>
									<th class="text-left" style="min-width: 250px;">Tên tiêu chí</th>
									<th class="text-right" style="min-width: 150px;">Tốt</th>
									<th class="text-right" style="min-width: 150px;">Đạt</th>
									<th class="text-right" style="min-width: 150px;">Cần cố gắng</th>
								</tr>
							</thead>
							<tbody>
								<template v-if="filteredNLPCs.length === 0">
									<tr>
										<td colspan="5" class="text-center py-8 text-grey">
											Không có dữ liệu
										</td>
									</tr>
								</template>
								<template v-else v-for="(item, index) in filteredNLPCs"
									:key="'nlpc-'+item.ChiTieuID+'-'+item.KhoiID+'-'+item.MonHocID">
									<tr>
										<!-- Khối -->
										<td v-if="shouldShowKhoi(index, 'NLPC')"
											:rowspan="getKhoiRowspan(item.KhoiID, 'NLPC')"
											class="text-center font-weight-bold"
											style="vertical-align: middle; background-color: #f5f5f5;">
											Khối {{ item.KhoiID }}
										</td>

										<!-- Tên tiêu chí -->
										<td class="text-left font-weight-medium">
											{{ item.TenMonHoc_HienThi }}
										</td>

										<!-- Tốt -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_Tot" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_Tot')" />
										</td>

										<!-- Đạt -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_Dat" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_Dat')" />
										</td>

										<!-- Cần cố gắng -->
										<td class="pa-1">
											<v-text-field v-model.number="item.ChiTieu_CanCoGang" placeholder="0"
												type="number" min="0" max="100" reverse :clearable="false"
												density="compact" hide-details variant="outlined"
												@input="validatePercentage(item, 'ChiTieu_CanCoGang')" />
										</td>
									</tr>
								</template>
							</tbody>
						</v-table>
					</div>
				</v-card>
			</v-tabs-window-item>
		</v-tabs-window>
	</div>
</template>

<script>
	export default {
		name: 'ChiTieuMonHoc',
	
		data() {
			return {
				tab: 0,
				loading: false,
	
				// Dữ liệu từ API
				allDataMonHocs: [],
				allDataNLPCs: [],
	
				// Bộ lọc
				filters: {
					MonHocID: "TatCa",
					KhoiID: "TatCa"
				},
	
				// Danh sách dropdown
				DSMonHoc: [],
				DSKhoi: []
			}
		},
	
		computed: {
			filteredMonHocs() {
				return this.filterData(this.allDataMonHocs)
			},
	
			filteredNLPCs() {
				return this.filterData(this.allDataNLPCs)
			}
		},
	
		async mounted() {
			await this.onLoad()
		},
	
		methods: {
			async onLoad() {
				try {
					this.loading = true
	
					// Gọi API để lấy dữ liệu
					const data = await ajaxCALLPromise("lms/ChiTieu_C1_Get", {
						NienKhoa: vueData?.NienKhoa || new Date().getFullYear()
					})
	
					// Phân loại dữ liệu
					this.allDataMonHocs = data.filter(x => x.Is_MonHoc === true)
					this.allDataNLPCs = data.filter(x => x.Is_MonHoc === false)
	
					// Tạo danh sách Khối
					this.generateDSKhoi(data)
	
					// Tạo danh sách Môn học
					this.generateDSMonHoc(data)
	
				} catch (error) {
					console.error('Lỗi khi tải dữ liệu:', error)
				} finally {
					this.loading = false
				}
			},
	
			generateDSKhoi(data) {
				const uniqueKhoi = [...new Set(data.map(x => x.KhoiID))].sort((a, b) => a - b)
				this.DSKhoi = [
					{ title: "Tất cả khối", value: "TatCa" },
					...uniqueKhoi.map(khoiID => ({
						title: `Khối ${khoiID}`,
						value: khoiID
					}))
				]
			},
	
			generateDSMonHoc(data) {
				const uniqueMonHoc = [...new Set(data.map(x => x.MonHocID))]
				const monHocList = uniqueMonHoc.map(monHocID => {
					const item = data.find(x => x.MonHocID === monHocID)
					return {
						id: monHocID,
						title: item?.TenMonHoc_HienThi || `Môn học ${monHocID}`,
						isMonHoc: item?.Is_MonHoc
					}
				})
	
				this.DSMonHoc = [
					{ title: "Tất cả môn học", value: "TatCa" },
					...monHocList
						.sort((a, b) => a.title.localeCompare(b.title, 'vi'))
						.map(x => ({
							title: x.title,
							value: x.id
						}))
				]
			},
	
			filterData(dataList) {
				let result = [...dataList]
	
				if (this.filters.KhoiID !== "TatCa") {
					result = result.filter(x => x.KhoiID === this.filters.KhoiID)
				}
	
				if (this.filters.MonHocID !== "TatCa") {
					result = result.filter(x => x.MonHocID === this.filters.MonHocID)
				}
	
				return result.sort((a, b) => {
					if (a.KhoiID !== b.KhoiID) return a.KhoiID - b.KhoiID
					return a.MonHocID - b.MonHocID
				})
			},
	
			shouldShowKhoi(index, type) {
				const items = type === 'MonHoc' ? this.filteredMonHocs : this.filteredNLPCs
				if (index === 0) return true
	
				const current = items[index]
				const prev = items[index - 1]
	
				return current.KhoiID !== prev.KhoiID
			},
	
			getKhoiRowspan(khoiID, type) {
				const items = type === 'MonHoc' ? this.filteredMonHocs : this.filteredNLPCs
				return items.filter(x => x.KhoiID === khoiID).length
			},
	
			validatePercentage(item, field) {
				if (item[field] !== null && item[field] !== undefined) {
					if (item[field] < 0) item[field] = 0
					if (item[field] > 100) item[field] = 100
				}
			},
	
			async onSave() {
				try {
					this.loading = true
	
					await ajaxCALLPromise("lms/ChiTieu_C1_Ins", {
						JsonMonHoc: this.allDataMonHocs,
						JsonMonHoc_NLPC: this.allDataNLPCs
					})
	
					// Reload lại dữ liệu sau khi lưu
					await this.onLoad()
	
					// Hiển thị thông báo thành công (nếu có hệ thống notification)
					if (this.$toast) {
						this.$toast.success('Lưu dữ liệu thành công!')
					}
	
				} catch (error) {
					console.error('Lỗi khi lưu dữ liệu:', error)
					if (this.$toast) {
						this.$toast.error('Có lỗi xảy ra khi lưu dữ liệu!')
					}
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style scoped>
	.chi-tieu-table :deep(thead) {
		background-color: #f5f5f5;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.chi-tieu-table :deep(thead th) {
		font-weight: 600;
		border-bottom: 2px solid #e0e0e0 !important;
	}

	.chi-tieu-table :deep(tbody tr:hover) {
		background-color: #f9f9f9;
	}

	.chi-tieu-table :deep(.v-text-field input) {
		text-align: right;
	}
</style>