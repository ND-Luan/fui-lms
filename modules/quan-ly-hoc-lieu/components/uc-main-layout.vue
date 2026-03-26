<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title class="d-flex align-center justify-space-between">
					<span>{{ TitlePage }}</span>
					<div class="d-flex ga-2">
						<v-btn color="primary" variant="outlined" prepend-icon="mdi-plus" @click="openNew">
							Thêm mới
						</v-btn>
					</div>
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="4">
							<v-select v-model="filterKhoiID" label="Lọc theo Khối"
								:items="DSKhoi" item-title="name" item-value="id"
								clearable hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="filterMonHocID" label="Lọc theo Môn"
								:items="DSMon" item-title="MonHocName" item-value="MonHocID"
								:disabled="filterKhoiID === null || filterKhoiID === undefined"
								clearable hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="filterBoSachID" label="Lọc theo Bộ sách"
								:items="DSBoSach" item-title="TenBoSach" item-value="BoSachID"
								clearable hide-details />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<v-data-table
			:headers="headers"
			:items="hocLieuList"
			item-value="HocLieuID"
			items-per-page="-1"
			hide-default-footer
			hover
			style="max-height: calc(100dvh - 77px); overflow-y: auto;">

			<template #item.KhoiID="{ item }">
				{{ DSKhoi.find(k => k.id === item.KhoiID)?.name ?? item.KhoiID }}
			</template>

			<template #item.TinhTrang="{ item }">
				<v-chip size="small"
					:color="item.TinhTrang === 'Public' ? 'success' : 'default'"
					variant="tonal">
					{{ item.TinhTrang }}
				</v-chip>
			</template>

			<template #item.ThumbnailURL="{ item }">
				<v-img v-if="item.ThumbnailURL"
					:src="vueData.v_Set.urlReturnFile + '/FileData/' + item.ThumbnailURL"
					width="60" height="40" cover rounded="sm" class="my-1" />
				<span v-else class="text-disabled">—</span>
			</template>

			<template #item.actions="{ item }">
				<div class="d-flex ga-1">
					<v-btn icon="mdi-pencil" size="small" variant="text" color="primary"
						@click="openEdit(item)" />
					<v-btn icon="mdi-book-edit-outline" size="small" variant="text" color="secondary"
						@click="goToSoanThao(item)" />
					<v-btn icon="mdi-delete" size="small" variant="text" color="error"
						@click="onDelete(item)" />
				</div>
			</template>

			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-book-search-outline</v-icon>
					<p class="text-body-2">Chưa có học liệu nào. Thay đổi bộ lọc hoặc thêm mới.</p>
				</div>
			</template>
		</v-data-table>

		<!-- Dialog thêm / sửa -->
		<uc-dialog
			v-model="dialog"
			:title="isEditMode ? 'Cập nhật học liệu' : 'Thêm học liệu mới'"
			done-text="Lưu"
			:width="560"
			@onSubmit="onSave">

			<v-row dense>
				<v-col cols="12">
					<v-text-field v-model="editedItem.TenHocLieu" label="Tên học liệu"
						:rules="[v => !!v || 'Bắt buộc']" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.KhoiID" label="Khối"
						:items="DSKhoi" item-title="name" item-value="id"
						@update:model-value="onDialogKhoiChange" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.MonHocID" label="Môn học"
						:items="DSMonDialog" item-title="MonHocName" item-value="MonHocID"
						:disabled="!editedItem.KhoiID && editedItem.KhoiID !== 0" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.BoSachID" label="Bộ sách"
						:items="DSBoSach" item-title="TenBoSach" item-value="BoSachID" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.HocKy" label="Học kỳ" :items="[1, 2]" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.TinhTrang" label="Tình trạng"
						:items="['Public', 'Private']" />
				</v-col>
				<v-col cols="12">
					<p class="text-body-2 text-medium-emphasis mb-1">Ảnh thumbnail</p>
					<f-file-upload
						:url="vueData.v_Set.apiFile"
						color="primary"
						variant="outlined"
						@input="onUploadThumbnail" />
					<div v-if="editedItem.ThumbnailURL" class="mt-2 d-flex align-center ga-2">
						<v-img
							:src="vueData.v_Set.urlReturnFile + '/FileData/' + editedItem.ThumbnailURL"
							:width="200"
							:height="120"
							cover
							rounded="sm"
							@error="editedItem.ThumbnailURL = null" />
						<v-btn
							v-if="editedItem.ThumbnailURL"
							icon="mdi-close"
							size="small"
							color="error"
							variant="tonal"
							@click="editedItem.ThumbnailURL = null" />
					</div>
				</v-col>
			</v-row>
		</uc-dialog>
	</Global>
</template>

<script>
export default {
	inject: ['snackbarRef', 'iframeRef'],

	data() {
		return {
			vueData,
			hocLieuList: [],
			DSBoSach: [],
			DSMon: [],
			DSMonDialog: [],
			filterKhoiID: null,
			filterMonHocID: null,
			filterBoSachID: null,
			dialog: false,
			isEditMode: false,
			editedItem: {
				HocLieuID: null,
				TenHocLieu: null,
				BoSachID: null,
				MonHocID: null,
				KhoiID: null,
				HocKy: null,
				ThumbnailURL: null,
				TinhTrang: null,
			},
			DSKhoi: [
				{ id: 0,  name: 'Mầm non' },
				{ id: 1,  name: 'Lớp 1' },
				{ id: 2,  name: 'Lớp 2' },
				{ id: 3,  name: 'Lớp 3' },
				{ id: 4,  name: 'Lớp 4' },
				{ id: 5,  name: 'Lớp 5' },
				{ id: 6,  name: 'Lớp 6' },
				{ id: 7,  name: 'Lớp 7' },
				{ id: 8,  name: 'Lớp 8' },
				{ id: 9,  name: 'Lớp 9' },
				{ id: 10, name: 'Lớp 10' },
				{ id: 11, name: 'Lớp 11' },
				{ id: 12, name: 'Lớp 12' },
			],
			headers: [
				{ title: 'Tên học liệu', value: 'TenHocLieu', sortable: true },
				{ title: 'Khối',         value: 'KhoiID' },
				{ title: 'Bộ sách',      value: 'TenBoSach' },
				{ title: 'Học kỳ',       value: 'HocKy' },
				{ title: 'Tình trạng',   value: 'TinhTrang' },
				{ title: 'Thumbnail',    value: 'ThumbnailURL', sortable: false },
				{ title: 'Thao tác',     value: 'actions',     sortable: false, align: 'center' },
			],
		}
	},

	computed: {
		TitlePage() {
			return getTitlePageByURL(window.location.pathname + window.location.search)
		},
	},

	watch: {
		filterKhoiID(val) {
			this.filterMonHocID = null
			this.DSMon = []
			if (val !== null && val !== undefined) {
				this.getDSMon(val)
			}
			this.getHocLieu()
		},
		filterMonHocID() {
			this.getHocLieu()
		},
		filterBoSachID() {
			this.getHocLieu()
		},
	},

	mounted() {
		this.getDSBoSach()
		this.getHocLieu()
	},

	methods: {
		async getHocLieu() {
			this.hocLieuList = await fetchPromise('lms/FP_HocLieu_GetAll', {
				PageNumber: 1,
				PageSize: 999,
				KhoiID: this.filterKhoiID ?? 0,
				MonHocID: this.filterMonHocID ?? 0,
				BoSachID: this.filterBoSachID ?? 0,
			}, { cache: false })
		},

		async getDSBoSach() {
			this.DSBoSach = await fetchPromise('lms/FP_BoSach_GetList', {})
		},

		async getDSMon(khoiID) {
			this.DSMon = await fetchPromise('lms/MonHoc_GetByKhoiID', {
				KhoiID: khoiID,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem?.HocKi,
			})
		},

		async onDialogKhoiChange(khoiID) {
			this.editedItem.MonHocID = null
			this.DSMonDialog = []
			if (khoiID !== null && khoiID !== undefined) {
				this.DSMonDialog = await fetchPromise('lms/MonHoc_GetByKhoiID', {
					KhoiID: khoiID,
					NienKhoa: vueData.NienKhoa,
					HocKi: vueData.NienKhoaItem?.HocKi,
				})
			}
		},

		openNew() {
			this.isEditMode = false
			this.editedItem = {
				HocLieuID: null,
				TenHocLieu: null,
				BoSachID: null,
				MonHocID: null,
				KhoiID: null,
				HocKy: null,
				ThumbnailURL: null,
				TinhTrang: null,
			}
			this.DSMonDialog = []
			this.dialog = true
		},

		async openEdit(item) {
			this.isEditMode = true
			this.editedItem = { ...item }
			this.DSMonDialog = []
			if (item.KhoiID !== null && item.KhoiID !== undefined) {
				this.DSMonDialog = await fetchPromise('lms/MonHoc_GetByKhoiID', {
					KhoiID: item.KhoiID,
					NienKhoa: vueData.NienKhoa,
					HocKi: vueData.NienKhoaItem?.HocKi,
				})
			}
			this.dialog = true
		},

		onUploadThumbnail(file) {
			this.editedItem.ThumbnailURL = file?.Files?.[0]?.FILE_URL ?? null
		},

		onSave() {
			if (!this.editedItem.TenHocLieu) {
				this.snackbarRef.value.show({ message: 'Vui lòng nhập tên học liệu', color: 'warning' })
				return
			}
			const params = {
				HocLieuID: this.editedItem.HocLieuID ?? 0,
				TenHocLieu: this.editedItem.TenHocLieu,
				BoSachID: this.editedItem.BoSachID,
				MonHocID: this.editedItem.MonHocID,
				KhoiID: this.editedItem.KhoiID,
				HocKy: this.editedItem.HocKy,
				ThumbnailURL: this.editedItem.ThumbnailURL,
				TinhTrang: this.editedItem.TinhTrang,
			}
			const message = this.isEditMode ? 'Cập nhật học liệu thành công' : 'Thêm học liệu thành công'
			ajaxCALL('lms/FP_HocLieu_Save', params, () => {
				this.snackbarRef.value.show({ message, color: 'success' })
				this.dialog = false
				this.getHocLieu()
			})
		},

		onDelete(item) {
			confirm({ title: `Xóa học liệu «${item.TenHocLieu}»?`, action: 'Xóa' }).then(() => {
				ajaxCALL('lms/FP_HocLieu_Delete', { HocLieuID: item.HocLieuID }, () => {
					this.snackbarRef.value.show({ message: 'Xóa học liệu thành công', color: 'success' })
					this.getHocLieu()
				})
			})
		},

		goToSoanThao(item) {
			openWindow({ title: `Soạn thảo: ${item.TenHocLieu}`, url: `/soan-hoc-lieu-v2?HocLieuID=${item.HocLieuID}` })
		},
	},
}
</script>
