<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title class="text-primary d-flex align-center flex-wrap ga-2">
					<span>Tổng kết học kì</span>
					<v-chip variant="text" color="primary" class="font-weight-medium">
						Tổng số học sinh: {{ vueData.DSHocSinh.length }}
					</v-chip>
				</v-card-title>
				<v-card-text>
					<!-- Hàng 1: Filters -->
					<v-row>
						<v-col cols="12" sm="4">
							<v-select v-model="vueData.Semester" label="Chọn học kì" :items="vueData.DSSemester"
								hide-details item-title="title" item-value="value" return-object />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="vueData.KhoiItem" label="Chọn khối"
								:items="[{ TenKhoiHoc: 'Tất cả các khối', KhoiID: '__all__', isAll: true }, ...vueData.DSKhoi]"
								item-title="TenKhoiHoc" item-value="KhoiID" return-object hide-details />
						</v-col>
						<v-col cols="12" sm="4" v-if="!vueData.KhoiItem?.isAll">
							<v-select v-model="vueData.LopItem" label="Chọn lớp"
								:items="[{ TenLop: 'Xem tất cả các lớp', LopID: 'ALL' }, ...vueData.DSLop.filter(item => !item.LopID.includes('N'))]"
								item-title="TenLop" item-value="LopID" return-object hide-details />
						</v-col>
					</v-row>
					<!-- Hàng 2: Actions -->
					<v-row class="mt-1">
						<v-col cols="12" class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" prepend-icon="mdi-refresh" color="primary"
								:disabled="!vueData.KhoiItem || (!vueData.KhoiItem?.isAll && !vueData.LopItem)"
								@click="vueData.KhoiItem?.isAll ? vueData.getDSTatCaKhoi() : vueData.TongKet_GetDTBMonHocByKhoiLop()">
								Làm mới
							</v-btn>
							<v-spacer />
							<v-btn variant="outlined" prepend-icon="mdi-table-arrow-down" color="teal"
								:disabled="vueData.DSHocSinh.length === 0" @click="vueData.openImportKQRL()">
								Import KQRL
							</v-btn>
							<v-btn variant="outlined" prepend-icon="mdi-content-save" color="success"
								@click="vueData.onSave()" :disabled="vueData.DSHocSinh.length === 0">
								Lưu
							</v-btn>
							<v-btn variant="outlined" prepend-icon="mdi-microsoft-excel" color="green"
								:disabled="vueData.DSHocSinh.length === 0" @click="vueData.exportExcel()">
								Export Excel
							</v-btn>
							<v-btn variant="outlined" prepend-icon="mdi-certificate-outline" color="orange"
								:disabled="vueData.DSHocSinh.length === 0" :loading="vueData.isLoadingExportGiayKhen"
								@click="vueData.exportGiayKhen()">
								Export Giấy khen
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-card>
			<v-card-text class="pa-0">
				<uc-xem-tong-ket-hk />
			</v-card-text>
		</v-card>

		<v-dialog v-model="vueData.loadingDialog.show" persistent width="400">
			<v-card>
				<v-card-title class="text-subtitle-1">{{ vueData.loadingDialog.title }}</v-card-title>
				<v-card-text>
					<template v-if="vueData.loadingDialog.total > 0">
						<div class="mb-1 text-body-2">
							Khối: <strong>{{ vueData.loadingDialog.currentName }}</strong>
							({{ vueData.loadingDialog.current }}/{{ vueData.loadingDialog.total }})
						</div>
						<v-progress-linear
							:model-value="vueData.loadingDialog.total ? (vueData.loadingDialog.current / vueData.loadingDialog.total) * 100 : 0"
							color="primary" rounded height="8" class="mb-3" />
					</template>
					<div class="mb-1 text-body-2">
						Lớp: <strong>{{ vueData.loadingDialog.currentLopName }}</strong>
						<span v-if="vueData.loadingDialog.totalLop > 0">
							({{ vueData.loadingDialog.currentLop }}/{{ vueData.loadingDialog.totalLop }})
						</span>
					</div>
					<v-progress-linear
						:model-value="vueData.loadingDialog.totalLop ? (vueData.loadingDialog.currentLop / vueData.loadingDialog.totalLop) * 100 : 0"
						color="teal" rounded height="8" />
				</v-card-text>
			</v-card>
		</v-dialog>

		<v-dialog v-model="vueData.IsShowDialogImportKQRL" :width="700" persistent>
			<v-card title="Import KQRL từ Excel">
				<v-card-text>
					<p class="text-caption text-medium-emphasis mb-2">
						Copy 2 cột <strong>HocSinhID</strong> và <strong>KQRL</strong> từ Excel rồi paste (Ctrl+V) vào
						bảng bên dưới.
						Sau đó nhấn <strong>Áp dụng</strong> để cập nhật danh sách.
					</p>
					<uc-jexcel v-model="vueData.importKQRL_Instance" v-model:dataSource="vueData.ImportKQRL_Data"
						:columns="vueData.importKQRL_Columns" :key="vueData.importKQRL_Key"
						style="max-height: 400px; overflow: auto;" />
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn variant="outlined" @click="vueData.IsShowDialogImportKQRL = false">Đóng</v-btn>
					<v-btn variant="flat" color="teal" @click="vueData.applyImportKQRL()">Áp dụng</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="vueData.IsShowDialogConfirm" :width="600">
			<v-card title="Xác nhận trước khi lưu">
				<v-card-text>
					<v-list>
						<v-list-item v-for="hocSinh in vueData.renderDSHocSinhChange()"
							:title="hocSinh.HoTen + ' - ' + hocSinh.KQRenLuyen" />
					</v-list>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn variant="outlined" @click="vueData.IsShowDialogConfirm = false">Đóng</v-btn>
					<v-btn variant="flat" color="primary" @click="vueData.onSave()">Xác nhận</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef'],
		data() {
			return {
				vueData
			}
		},
		mounted() {
			vueData.snackbarRef = this.snackbarRef
		},
		watch: {
			'vueData.KhoiItem'(v) {
				if (v?.isAll) vueData.getDSTatCaKhoi?.()
			}
		}
	}
</script>