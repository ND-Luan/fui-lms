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
							<v-select v-model="filterKhoiID" label="Lọc theo Khối" :items="DSKhoi" item-title="name"
								item-value="id" clearable hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="filterMonHocID" label="Lọc theo Môn" :items="DSMon"
								item-title="MonHocName" item-value="MonHocID"
								:disabled="filterKhoiID === null || filterKhoiID === undefined" clearable
								hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="filterBoSachID" label="Lọc theo Bộ sách" :items="DSBoSach"
								item-title="TenBoSach" item-value="BoSachID" clearable hide-details />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<v-data-table :headers="headers" :items="hocLieuList" item-value="HocLieuID" items-per-page="-1"
			hide-default-footer hover style="max-height: calc(100dvh - 79px); overflow-y: auto;">

			<template #item.KhoiID="{ item }">
				{{ DSKhoi.find(k => k.id === item.KhoiID)?.name ?? item.KhoiID }}
			</template>

			<template #item.TinhTrang="{ item }">
				<v-chip size="small" :color="item.TinhTrang === 'Public' ? 'success' : 'default'" variant="tonal">
					{{ item.TinhTrang }}
				</v-chip>
			</template>

			<template #item.ThumbnailURL="{ item }">
				<div v-if="getThumbnailUrls(item).length" class="d-flex align-center ga-1 py-1">
					<v-img v-for="url in getThumbnailUrls(item).slice(0, 3)" :key="url" :src="getImgUrl(url)" width="50"
						height="60" class="cursor-pointer rounded border" @click="openImageTab(url)" />
					<v-chip v-if="getThumbnailUrls(item).length > 3" size="x-small" variant="tonal">
						+{{ getThumbnailUrls(item).length - 3 }}
					</v-chip>
				</div>
				<span v-else class="text-disabled">—</span>
			</template>

			<template #item.actions="{ item }">
				<div class="d-flex ga-1">
					<v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)" />
					<v-btn icon="mdi-book-edit-outline" size="small" variant="text" color="secondary"
						@click="goToSoanThao(item)" />
					<v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="onDelete(item)" />
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
		<uc-dialog v-model="dialog" :title="isEditMode ? 'Cập nhật học liệu' : 'Thêm học liệu mới'" done-text="Lưu"
			:width="560" @onSubmit="onSave">

			<v-row dense>
				<v-col cols="12">
					<v-text-field v-model="editedItem.TenHocLieu" label="Tên học liệu"
						:rules="[v => !!v || 'Bắt buộc']" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.KhoiID" label="Khối" :items="DSKhoi" item-title="name" item-value="id"
						@update:model-value="onDialogKhoiChange" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.MonHocID" label="Môn học" :items="DSMonDialog" item-title="MonHocName"
						item-value="MonHocID" :disabled="!editedItem.KhoiID && editedItem.KhoiID !== 0" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.BoSachID" label="Bộ sách" :items="DSBoSach" item-title="TenBoSach"
						item-value="BoSachID" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.HocKy" label="Học kỳ" :items="[1, 2]" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.TinhTrang" label="Tình trạng" :items="['Public', 'Private']" />
				</v-col>
				<v-col cols="12">
					<p class="text-body-2 text-medium-emphasis mb-1">Ảnh thumbnail (có thể chọn nhiều ảnh)</p>
					<input ref="thumbnailInput" type="file" accept="image/*" multiple class="d-none"
						@change="onSelectThumbnailFiles">
					<v-btn color="primary" variant="outlined" prepend-icon="mdi-image-multiple-outline"
						:loading="pendingUploads > 0" @click="$refs.thumbnailInput.click()">
						Chọn nhiều ảnh
					</v-btn>
					<div v-if="editedItem.ThumbnailURLs.length" class="mt-3 d-flex flex-wrap ga-2">
						<div v-for="(url, index) in editedItem.ThumbnailURLs" :key="url" class="position-relative">
							<v-img :src="getImgUrl(url)" :width="110" :height="140"
								class="cursor-pointer rounded border" @click="openImageTab(url)"
								@error="handleImgError" />
							<v-chip v-if="index === 0" size="x-small" color="primary"
								class="position-absolute top-0 left-0 ma-1">Ảnh chính</v-chip>
							<v-btn icon="mdi-close" size="x-small" color="error"
								class="position-absolute top-0 right-0 ma-1" @click="onRemoveThumbnail(url)" />
						</div>
					</div>
				</v-col>
			</v-row>
		</uc-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],

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
			pendingUploads: 0,
			editedItem: {
				HocLieuID: null,
				TenHocLieu: null,
				BoSachID: null,
				MonHocID: null,
				KhoiID: null,
				HocKy: null,
				ThumbnailURL: null,
				ThumbnailURLs: [],
				TinhTrang: null,
			},
			DSKhoi: [
				{ id: 0,  name: 'Mầm non', CapID: 0 },
				{ id: 1,  name: 'Lớp 1',   CapID: 1 },
				{ id: 2,  name: 'Lớp 2',   CapID: 1 },
				{ id: 3,  name: 'Lớp 3',   CapID: 1 },
				{ id: 4,  name: 'Lớp 4',   CapID: 1 },
				{ id: 5,  name: 'Lớp 5',   CapID: 1 },
				{ id: 6,  name: 'Lớp 6',   CapID: 2 },
				{ id: 7,  name: 'Lớp 7',   CapID: 2 },
				{ id: 8,  name: 'Lớp 8',   CapID: 2 },
				{ id: 9,  name: 'Lớp 9',   CapID: 2 },
				{ id: 10, name: 'Lớp 10',  CapID: 3 },
				{ id: 11, name: 'Lớp 11',  CapID: 3 },
				{ id: 12, name: 'Lớp 12',  CapID: 3 },
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
				Loai: 'HOC_LIEU',
			}, { cache: false })
		},

		async getDSBoSach() {
			this.DSBoSach = await fetchPromise('lms/FP_BoSach_GetList', {})
		},

		async getDSMon(khoiID) {
			const capID = this.DSKhoi.find(x => x.id === khoiID)?.CapID
			this.DSMon = await fetchPromise('lms/MonHoc_Get_ByCapID', {
				CapID: capID,
			})
		},

		async onDialogKhoiChange(khoiID) {
			this.editedItem.MonHocID = null
			this.DSMonDialog = []
			if (khoiID !== null && khoiID !== undefined) {
				const capID = this.DSKhoi.find(x => x.id === khoiID)?.CapID
				this.DSMonDialog = await fetchPromise('lms/MonHoc_Get_ByCapID', {
					CapID: capID,
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
				ThumbnailURLs: [],
				TinhTrang: null,
			}
			this.DSMonDialog = []
			this.dialog = true
		},

		async openEdit(item) {
			this.isEditMode = true
			this.editedItem = {
				...item,
				ThumbnailURLs: this.getThumbnailUrls(item),
			}
			this.DSMonDialog = []
			if (item.KhoiID !== null && item.KhoiID !== undefined) {
				const capID = this.DSKhoi.find(x => x.id === item.KhoiID)?.CapID
				this.DSMonDialog = await fetchPromise('lms/MonHoc_Get_ByCapID', {
					CapID: capID,
				})
			}
			this.dialog = true
		},

		onSelectThumbnailFiles(event) {
			const files = Array.from(event.target.files || [])
			event.target.value = ''
			files.forEach(file => this.uploadThumbnail(file))
		},

		uploadThumbnail(file) {
			if (!file?.type?.startsWith('image/')) return
			if (!window.UploadManager?.uploadLmsFile) {
				this.snackbarRef.value.showSnackbar({ message: 'Dịch vụ tải tệp chưa sẵn sàng', color: 'error' })
				return
			}
			this.pendingUploads += 1
			window.UploadManager.uploadLmsFile(file, {
				onComplete: response => {
					const item = response?.Files?.[0] || response
					const url = item?.FILE_URL || item?.file_url || item?.FILE_ID || item?.file_id
					if (url && !this.editedItem.ThumbnailURLs.includes(url)) {
						this.editedItem.ThumbnailURLs.push(url)
						this.syncPrimaryThumbnail()
					}
					this.pendingUploads -= 1
				},
				onError: error => {
					this.pendingUploads -= 1
					this.snackbarRef.value.showSnackbar({
						message: 'Tải ảnh thất bại: ' + (error?.message || ''),
						color: 'error',
					})
				},
			})
		},

		async onRemoveThumbnail(fileUrl) {
			if (!fileUrl) return

			const ok = await this.confirmRef?.value?.show({ title: 'Xác nhận xóa ảnh thumbnail này?' })
			if (!ok) return

			const previousUrls = [...this.editedItem.ThumbnailURLs]
			this.editedItem.ThumbnailURLs = this.editedItem.ThumbnailURLs.filter(url => url !== fileUrl)
			this.syncPrimaryThumbnail()
			let dbSaved = false

			try {
				if (this.isEditMode && this.editedItem.HocLieuID) {
					await fetchPromise('lms/FP_HocLieu_Save', this.buildSaveParams(), { cache: false })
					dbSaved = true
				}
				await this.deleteStoredThumbnailFiles([fileUrl])
				this.snackbarRef.value.showSnackbar({
					message: 'Đã xóa ảnh thumbnail và tự động lưu',
					color: 'success',
				})
				if (this.isEditMode) await this.getHocLieu()
			} catch (error) {
				if (!dbSaved) {
					this.editedItem.ThumbnailURLs = previousUrls
					this.syncPrimaryThumbnail()
				}
				this.snackbarRef.value.showSnackbar({
					message: dbSaved
						? 'Đã lưu thay đổi nhưng chưa xóa được file ảnh: ' + (error?.message || '')
						: 'Xóa ảnh thumbnail thất bại: ' + (error?.message || ''),
					color: 'error',
				})
			}
		},

		getThumbnailUrls(item) {
			if (Array.isArray(item?.ThumbnailURLs)) return item.ThumbnailURLs.filter(Boolean)
			if (typeof item?.ThumbnailURLs === 'string' && item.ThumbnailURLs.trim()) {
				try {
					const urls = JSON.parse(item.ThumbnailURLs)
					if (Array.isArray(urls)) return urls.filter(Boolean)
				} catch (error) {
					console.warn('ThumbnailURLs không phải JSON hợp lệ', error)
				}
			}
			return item?.ThumbnailURL ? [item.ThumbnailURL] : []
		},

		syncPrimaryThumbnail() {
			this.editedItem.ThumbnailURL = this.editedItem.ThumbnailURLs[0] || null
		},

		toNullableInt(value) {
			if (value === null || value === undefined || value === '') return null
			const normalized = typeof value === 'object'
				? value.id ?? value.value ?? value.HocLieuID ?? value.BoSachID ?? value.MonHocID ?? value.KhoiID
				: value
			const number = Number(normalized)
			return Number.isInteger(number) ? number : null
		},

		buildSaveParams() {
			this.syncPrimaryThumbnail()
			const boSachID = this.toNullableInt(this.editedItem.BoSachID)
			const monHocID = this.toNullableInt(this.editedItem.MonHocID)
			const khoiID = this.toNullableInt(this.editedItem.KhoiID)
			const hocKy = this.toNullableInt(this.editedItem.HocKy)
			return {
				HocLieuID: this.toNullableInt(this.editedItem.HocLieuID) ?? 0,
				TenHocLieu: String(this.editedItem.TenHocLieu || '').trim(),
				...(boSachID !== null ? { BoSachID: boSachID } : {}),
				...(monHocID !== null ? { MonHocID: monHocID } : {}),
				...(khoiID !== null ? { KhoiID: khoiID } : {}),
				...(hocKy !== null ? { HocKy: hocKy } : {}),
				ThumbnailURL: this.editedItem.ThumbnailURL,
				ThumbnailURLs: JSON.stringify(this.editedItem.ThumbnailURLs),
				TinhTrang: this.editedItem.TinhTrang || 'Private',
				Loai: 'HOC_LIEU',
			}
		},

		getImgUrl(url) {
			if (!url) return ''
			if (url.startsWith('http://') || url.startsWith('https://')) {
				return url
			}
			if (url.startsWith('/FileData/')) {
				return vueData.v_Set.urlReturnFile + url
			}
			if (url.startsWith('/')) {
				return vueData.v_Set.urlReturnFile + url
			}
			return vueData.v_Set.urlReturnFile + '/FileData/' + url
		},

		openImageTab(url) {
			const fullUrl = this.getImgUrl(url)
			if (fullUrl) {
				window.open(fullUrl, '_blank')
			}
		},

		handleImgError() {
			// Không tự động clear tránh giật lag khi đang gõ URL
		},

		async onSave() {
			if (!this.editedItem.TenHocLieu) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập tên học liệu', color: 'warning' })
				return
			}
			if (this.pendingUploads > 0) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng chờ tải ảnh hoàn tất', color: 'warning' })
				return
			}

			const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu học liệu?' })
			if (!ok) return

			const params = this.buildSaveParams()
			const message = this.isEditMode ? 'Cập nhật học liệu thành công' : 'Thêm học liệu thành công'
			try {
				await fetchPromise('lms/FP_HocLieu_Save', params, { cache: false })
				this.snackbarRef.value.showSnackbar({ message, color: 'success' })
				this.dialog = false
				await this.getHocLieu()
			} catch (error) {
				this.snackbarRef.value.showSnackbar({ message: 'Lưu học liệu thất bại: ' + error.message, color: 'error' })
			}
		},

		async deleteStoredThumbnailFiles(urls) {
			if (!window.UploadManager?.deleteLmsFile) return
			const storedUrls = [...new Set(urls)].filter(url =>
				typeof url === 'string'
				&& !url.startsWith('http://')
				&& !url.startsWith('https://')
			)
			await Promise.all(storedUrls.map(url => {
				const fileId = url.replace(/^\/FileData\//i, '').replace(/^\//, '')
				return window.UploadManager.deleteLmsFile(fileId)
			}))
		},

		async onDelete(item) {
			const ok = await this.confirmRef.value.show({ title: `Xóa học liệu «${item.TenHocLieu}»?` })
			if (!ok) return

			try {
				await this.deleteStoredThumbnailFiles(this.getThumbnailUrls(item))

				// 2. Chỉ khi xóa file vật lý không bị lỗi mới xóa bản ghi trong CSDL
				await fetchPromise('lms/FP_HocLieu_Delete', {
					HocLieuID: this.toNullableInt(item.HocLieuID),
				}, { cache: false })
				this.snackbarRef.value.showSnackbar({ message: 'Xóa học liệu thành công', color: 'success' })
				await this.getHocLieu()
			} catch (err) {
				console.error('Lỗi khi xóa học liệu:', err)
				this.snackbarRef.value.showSnackbar({ message: 'Xóa học liệu thất bại do không thể xóa tệp ảnh: ' + (err.message || ''), color: 'error' })
			}
		},

		goToSoanThao(item) {
			openWindow({ title: `Soạn thảo: ${item.TenHocLieu}`, url: `/soan-hoc-lieu-v2?HocLieuID=${item.HocLieuID}` })
		},
	},
	}
</script>