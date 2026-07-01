<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title></v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Khối" :items="DSKhoi" item-title="title"
								item-value="value" return-object />
						</v-col>

						<v-col cols="12" sm="4">
							<v-select v-model="MonHocItem" label="Môn học" :items="DSMonHocTheoKhoi" item-title="title"
								item-value="value" :disabled="!KhoiItem" return-object />
						</v-col>

						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" @click="onRefresh">
								<v-icon start>mdi-reload</v-icon>
								Làm mới
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<GlobalDataTable :headers="headers" :items="DataResourcePublic" item-value="RowKey" items-per-page="-1"
			hide-default-footer hover>
			<template #item.ResourceType="{ item }">
				<v-chip size="small" variant="tonal" :color="item.ResourceType === 'ASSIGNMENT' ? 'blue' : 'green'">
					{{ getResourceTypeText(item) }}
				</v-chip>
			</template>

			<template #item.Preview="{ item }">
				<v-btn v-if="item.ResourceType === 'ASSIGNMENT'" color="primary" variant="outlined" size="small"
					@click="previewContent(item)">
					<v-icon start>mdi-open-in-new</v-icon>
					Xem trước
				</v-btn>
			</template>

			<template #item.IsGetResource="{ item }">
				<v-chip size="small" variant="tonal" :color="item.IsGetResource === 1 ? 'success' : 'grey'">
					{{ item.IsGetResource === 1 ? 'Đã lấy nội dung' : 'Chưa lấy' }}
				</v-chip>
			</template>

			<template #item.actions="{ item }">
				<div class="d-flex align-center ga-1 justify-center">
					<v-btn color="orange" variant="outlined" size="small" :disabled="item.IsGetResource === 1"
						@click="openGetResourceDialog(item)">
						<v-icon start>mdi-download-outline</v-icon>
						Lấy nội dung
					</v-btn>
				</div>
			</template>

			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
					<p class="text-body-2">Chọn khối và môn học để xem kho nội dung công khai</p>
				</div>
			</template>
		</GlobalDataTable>

		<uc-confirm-get-resource v-model="isShowModalSelectWeek" :resource="resourceSelected"
			@finish-save="getResourcePublic" />
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			return {
				vueData,
				DSKhoi: [],
				DSMonHoc: [],
				KhoiItem: null,
				MonHocItem: null,
				DataResourcePublic: [],
				resourceSelected: null,
				isShowModalSelectWeek: false,
				headers: [
					{ title: 'Tiêu đề', key: 'Title', minWidth: 260 },
					{ title: 'Loại nội dung', key: 'ResourceType', width: 150, align: 'center' },
					{ title: 'Người tạo', key: 'NguoiTao', minWidth: 160 },
					{ title: 'Xem trước', key: 'Preview', width: 150, align: 'center', sortable: false },
					{ title: 'Trạng thái', key: 'IsGetResource', width: 160, align: 'center' },
					{ title: 'Thao tác', key: 'actions', width: 150, align: 'center', sortable: false },
				],
			}
		},
		computed: {
			TitleCap() { return renderText(parseInt(vueData.CapID)) },
			TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
			DSMonHocTheoKhoi() {
				if (!this.KhoiItem) return []
				return this.DSMonHoc.filter(monHoc => Number(monHoc.KhoiID) === Number(this.KhoiItem.value))
			},
		},
		watch: {
			KhoiItem(v) {
				this.MonHocItem = null
				this.DataResourcePublic = []
				if (!v) return
				if (this.DSMonHocTheoKhoi.length === 1) this.MonHocItem = this.DSMonHocTheoKhoi[0]
			},
			MonHocItem(v) {
				this.DataResourcePublic = []
				if (v) this.getResourcePublic()
			},
		},
		mounted() {
			this.getKhoiMonHoc()
		},
		methods: {
			async getKhoiMonHoc() {
				const res = await fetchPromise('lms/EL_Teacher_GetKhoi_MonHoc_ByGiaoVienID', {
					NienKhoa: vueData.NienKhoa,
					HocKi: vueData.NienKhoaItem?.HocKi,
				}, { forceRefresh: true })
	
				const dsKhoi = Array.isArray(res?.[0]) ? res[0] : []
				const dsMonHoc = Array.isArray(res?.[1]) ? res[1] : []
	
				this.DSKhoi = dsKhoi.map(khoi => ({
					title: `Khối ${khoi.KhoiID}`,
					value: khoi.KhoiID,
					...khoi,
				}))
				this.DSMonHoc = dsMonHoc.map(monHoc => ({
					title: monHoc.TenMonHoc_HienThi || monHoc.TenMonHoc,
					value: monHoc.MonHocID,
					...monHoc,
				}))
	
				this.applyInitialFilters()
			},
			applyInitialFilters() {
				if (!vueData.KhoiID) return
				this.KhoiItem = this.DSKhoi.find(khoi => Number(khoi.value) === Number(vueData.KhoiID)) || null
				if (!this.KhoiItem || !vueData.MonHocID) return
				this.MonHocItem = this.DSMonHocTheoKhoi.find(monHoc => Number(monHoc.value) === Number(vueData.MonHocID)) || null
			},
			async getResourcePublic() {
				if (!this.KhoiItem || !this.MonHocItem) return
				const res = await fetchPromise('lms/EL_Teacher_GetResourcePublic', {
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.KhoiItem.value,
					MonHocID: this.MonHocItem.value,
				}, { forceRefresh: true })
	
				this.DataResourcePublic = (res ?? []).map((item, index) => ({
					...item,
					RowKey: `${item.ResourceType || 'RESOURCE'}_${item.ResourceID || index}`,
				}))
			},
			getResourceTypeText(item) {
				return item.ResourceType === 'ASSIGNMENT' ? 'Bài tập' : 'Bài học'
			},
			previewContent(item) {
				if (!item.ResourceID) return
				this.iframeRef.value.openWindow({
					title: 'Xem trước bài tập',
					url: `/lms-tc-asm-preview?AssignmentID=${item.ResourceID}`,
				})
			},
			openGetResourceDialog(item) {
				if (!item.ResourceID) {
					this.snackbarRef.value.showSnackbar({ message: 'Không tìm thấy nội dung cần lấy', color: 'warning' })
					return
				}
				this.resourceSelected = item
				this.isShowModalSelectWeek = true
			},
			async onRefresh() {
				if (!this.KhoiItem || !this.MonHocItem) {
					this.snackbarRef.value.showSnackbar({ message: 'Vui lòng chọn khối và môn học', color: 'warning' })
					return
				}
				await this.getResourcePublic()
			},
		},
	}
</script>