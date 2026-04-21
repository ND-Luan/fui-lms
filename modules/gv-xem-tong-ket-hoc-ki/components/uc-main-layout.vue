<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title class="text-primary px-0 d-flex align-center flex-wrap gap-2">
					<span>Xem tổng kết số lượng khen thưởng</span>
					<v-chip variant="text" color="primary" class="font-weight-medium">
						Tổng số học sinh: {{ vueData.DSHocSinh.length }}
					</v-chip>
				</v-card-title>
				<v-card-text class="px-0">
					<!-- Hàng 1: Filters -->
					<v-row>
						<v-col cols="12" sm="4">
							<v-select v-model="vueData.Semester" label="Chọn học kì" :items="vueData.DSSemester"
								hide-details item-title="title" item-value="value" return-object />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="vueData.KhoiItem" label="Chọn khối" :items="vueData.DSKhoi"
								item-title="TenKhoiHoc" item-value="KhoiID" return-object hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="vueData.LopItem" label="Chọn lớp"
							:items="[{ TenLop: 'Xem tất cả các lớp', LopID: 'ALL' }, ...vueData.DSLop.filter(item => !item.LopID.includes('N'))]"
								item-title="TenLop" item-value="LopID" return-object hide-details />
						</v-col>
					</v-row>
					<!-- Hàng 2: Actions -->
					<v-row class="mt-1">
						<v-col cols="12" class="d-flex align-center gap-2 flex-wrap">
							<v-btn variant="outlined" prepend-icon="mdi-refresh" color="primary"
								:disabled="!vueData.LopItem" @click="vueData.TongKet_GetDTBMonHocByKhoiLop()">
								Làm mới
							</v-btn>
							<v-spacer />
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
	data() {
		return {
			vueData
		}
	}
}
</script>
