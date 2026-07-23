<template>
	<Global upload-manager>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="selectedKhoi" label="Lọc theo Khối" :items="DSKhoi"
								item-title="name" item-value="id" clearable hide-details />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="selectedMon" label="Lọc theo Môn" :items="DSMonHoc"
								item-title="MonHocName" item-value="MonHocID" clearable
								:disabled="selectedKhoi === null || selectedKhoi === undefined" hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="selectedLibraryId" label="Bộ tài liệu" :items="libraries"
								item-title="TenHocLieu" item-value="HocLieuID" clearable hide-details />
						</v-col>
						<v-col cols="12" sm="2" class="d-flex align-center ga-2 flex-wrap">
							<v-btn color="primary" prepend-icon="mdi-folder-plus-outline" @click="openLibraryDialog()">
								Tạo bộ
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<div class="resource-layout">
			<aside class="resource-tree-panel">
				<div class="panel-header">
					<div>
						<div class="text-subtitle-1 font-weight-bold">Cây tài nguyên</div>
						<div class="text-caption text-medium-emphasis">
							{{ selectedLibrary?.TenHocLieu || 'Chưa chọn bộ tài liệu' }}
						</div>
					</div>
					<div class="d-flex align-center ga-1">
						<v-btn v-if="selectedLibrary" icon size="small" variant="text" color="primary"
							@click="openLibraryDialog(selectedLibrary)">
							<v-icon>mdi-pencil</v-icon>
							<v-tooltip activator="parent" location="top">Sửa bộ tài liệu</v-tooltip>
						</v-btn>
						<v-btn v-if="selectedLibrary" icon size="small" variant="text" color="error"
							@click="deleteLibrary">
							<v-icon>mdi-delete-outline</v-icon>
							<v-tooltip activator="parent" location="top">Xóa bộ tài liệu</v-tooltip>
						</v-btn>
					</div>
				</div>

				<div v-if="selectedLibrary" class="pa-2">
					<v-btn block color="primary" variant="tonal" prepend-icon="mdi-folder-plus"
						@click="openFolderDialog()">
						Tạo thư mục
					</v-btn>
				</div>

				<v-list v-if="selectedLibrary" density="compact" nav class="resource-tree-list">
					<v-list-item :active="selectedFolderId === null" prepend-icon="mdi-folder-home-outline"
						title="Thư mục gốc" @click="selectFolder(null)" />
					<v-list-item v-for="folder in flatFolders" :key="folder.NoiDungID"
						:active="selectedFolderId === folder.NoiDungID"
						:style="{ paddingLeft: (16 + folder.depth * 20) + 'px' }"
						prepend-icon="mdi-folder-outline" @click="selectFolder(folder.NoiDungID)">
						<v-list-item-title>{{ folder.TenNoiDung }}</v-list-item-title>
						<template #append>
							<v-btn icon size="x-small" variant="text" color="primary"
								@click.stop="openFolderDialog(folder)">
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
							<v-btn icon size="x-small" variant="text" color="error"
								@click.stop="deleteNode(folder)">
								<v-icon>mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-list-item>
				</v-list>

				<div v-else class="empty-panel">
					<v-icon size="48">mdi-bookshelf</v-icon>
					<p>Chọn hoặc tạo một bộ tài liệu</p>
				</div>
			</aside>

			<main class="resource-file-panel">
				<div class="panel-header">
					<div>
						<div class="text-subtitle-1 font-weight-bold">{{ currentFolderName }}</div>
						<div class="text-caption text-medium-emphasis">{{ visibleFiles.length }} file</div>
					</div>
					<div class="d-flex align-center ga-2">
						<input ref="fileInput" type="file" multiple class="d-none" @change="uploadSelectedFiles">
						<v-btn color="primary" prepend-icon="mdi-cloud-upload-outline"
							:disabled="!selectedLibrary" @click="$refs.fileInput.click()">
							Upload file
						</v-btn>
					</div>
				</div>

				<GlobalDataTable :headers="headers" :items="visibleFiles" item-value="NoiDungID"
					items-per-page="-1" hide-default-footer hover
					v-data-table-height="'calc(100dvh - 158px)'">
					<template #item.TenNoiDung="{ item }">
						<div class="d-flex align-center ga-2">
							<v-icon :color="getFileColor(item)">{{ getFileIcon(item) }}</v-icon>
							<div>
								<div class="font-weight-medium">{{ item.TenNoiDung }}</div>
								<div class="text-caption text-medium-emphasis">{{ getMeta(item).contentType || 'Tệp tin' }}</div>
							</div>
						</div>
					</template>
					<template #item.fileSize="{ item }">{{ formatFileSize(getMeta(item).fileSize) }}</template>
					<template #item.CreateTime="{ item }">{{ formatDate(item.CreateTime) }}</template>
					<template #item.actions="{ item }">
						<div class="d-flex align-center ga-1">
							<v-btn icon size="small" variant="text" color="primary" @click="openFile(item)">
								<v-icon>mdi-open-in-new</v-icon>
								<v-tooltip activator="parent" location="top">Mở file</v-tooltip>
							</v-btn>
							<v-btn icon size="small" variant="text" color="secondary" @click="openFileDialog(item)">
								<v-icon>mdi-pencil</v-icon>
								<v-tooltip activator="parent" location="top">Sửa metadata</v-tooltip>
							</v-btn>
							<v-btn icon size="small" variant="text" color="error" @click="deleteNode(item)">
								<v-icon>mdi-delete-outline</v-icon>
								<v-tooltip activator="parent" location="top">Xóa khỏi kho</v-tooltip>
							</v-btn>
						</div>
					</template>
					<template #no-data>
						<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
							<v-icon size="48" class="mb-3 opacity-40">mdi-file-upload-outline</v-icon>
							<p class="text-body-2">Chưa có file trong thư mục này</p>
						</div>
					</template>
				</GlobalDataTable>
			</main>
		</div>

		<uc-dialog v-model="libraryDialog" :title="libraryForm.HocLieuID ? 'Sửa bộ tài liệu' : 'Tạo bộ tài liệu'"
			done-text="Lưu" :width="560" @onSubmit="saveLibrary">
			<v-text-field v-model="libraryForm.TenHocLieu" label="Tên bộ tài liệu*" />
			<v-row>
				<v-col cols="6">
					<v-select v-model="libraryForm.KhoiID" label="Khối" :items="DSKhoi"
						item-title="name" item-value="id" @update:model-value="onLibraryKhoiChange" />
				</v-col>
				<v-col cols="6">
					<v-select v-model="libraryForm.MonHocID" label="Môn học" :items="librarySubjects"
						item-title="MonHocName" item-value="MonHocID" />
				</v-col>
			</v-row>
			<v-select v-model="libraryForm.TinhTrang" label="Trạng thái"
				:items="['Private', 'Public']" />
		</uc-dialog>

		<uc-dialog v-model="folderDialog" :title="folderForm.NoiDungID ? 'Sửa thư mục' : 'Tạo thư mục'"
			done-text="Lưu" :width="480" @onSubmit="saveFolder">
			<v-text-field v-model="folderForm.TenNoiDung" label="Tên thư mục*" />
			<v-select v-model="folderForm.ParentID" label="Thư mục cha" :items="folderOptions"
				item-title="title" item-value="value" clearable />
		</uc-dialog>

		<uc-dialog v-model="fileDialog" title="Thông tin tài nguyên" done-text="Lưu"
			:width="520" @onSubmit="saveFileMetadata">
			<v-text-field v-model="fileForm.TenNoiDung" label="Tên hiển thị*" />
			<v-select v-model="fileForm.ParentID" label="Thư mục" :items="folderOptions"
				item-title="title" item-value="value" clearable />
			<v-textarea v-model="fileForm.description" label="Mô tả" rows="3" />
		</uc-dialog>
	</Global>
</template>

<script>
	export default {
		name: 'uc-main-layout',
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			return {
				vueData,
				selectedKhoi: null,
				selectedMon: null,
				selectedLibraryId: null,
				selectedFolderId: null,
				DSMonHoc: [],
				librarySubjects: [],
				libraries: [],
				nodes: [],
				libraryDialog: false,
				folderDialog: false,
				fileDialog: false,
				libraryForm: {},
				folderForm: {},
				fileForm: {},
				DSKhoi: [
					{ id: 0, name: 'Mầm non', CapID: 0 },
					{ id: 1, name: 'Lớp 1', CapID: 1 }, { id: 2, name: 'Lớp 2', CapID: 1 },
					{ id: 3, name: 'Lớp 3', CapID: 1 }, { id: 4, name: 'Lớp 4', CapID: 1 },
					{ id: 5, name: 'Lớp 5', CapID: 1 }, { id: 6, name: 'Lớp 6', CapID: 2 },
					{ id: 7, name: 'Lớp 7', CapID: 2 }, { id: 8, name: 'Lớp 8', CapID: 2 },
					{ id: 9, name: 'Lớp 9', CapID: 2 }, { id: 10, name: 'Lớp 10', CapID: 3 },
					{ id: 11, name: 'Lớp 11', CapID: 3 }, { id: 12, name: 'Lớp 12', CapID: 3 },
				],
				headers: [
					{ title: 'Tên file', value: 'TenNoiDung' },
					{ title: 'Dung lượng', value: 'fileSize', width: 130 },
					{ title: 'Ngày tải lên', value: 'CreateTime', width: 170 },
					{ title: 'Thao tác', value: 'actions', sortable: false, width: 150 },
				],
			}
		},
		computed: {
			TitlePage() {
				return getTitlePageByURL(window.location.pathname + window.location.search) || 'Quản lý tài nguyên'
			},
			selectedLibrary() {
				return this.libraries.find(item => item.HocLieuID === this.selectedLibraryId) || null
			},
			folders() {
				return this.nodes.filter(item => item.LoaiNoiDung === 'THU_MUC')
			},
			flatFolders() {
				const result = []
				const visit = (parentId, depth) => {
					this.folders
						.filter(item => (item.ParentID || null) === parentId)
						.sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0))
						.forEach(item => {
							result.push({ ...item, depth })
							visit(item.NoiDungID, depth + 1)
						})
				}
				visit(null, 0)
				return result
			},
			folderOptions() {
				return [
					{ title: 'Thư mục gốc', value: null },
					...this.flatFolders.map(item => ({
						title: `${'— '.repeat(item.depth)}${item.TenNoiDung}`,
						value: item.NoiDungID,
					})),
				]
			},
			visibleFiles() {
				return this.nodes.filter(item =>
					item.LoaiNoiDung !== 'THU_MUC'
					&& (item.ParentID || null) === this.selectedFolderId
				)
			},
			currentFolderName() {
				if (!this.selectedLibrary) return 'Danh sách file'
				if (this.selectedFolderId === null) return this.selectedLibrary.TenHocLieu
				return this.folders.find(item => item.NoiDungID === this.selectedFolderId)?.TenNoiDung || 'Danh sách file'
			},
		},
		watch: {
			selectedKhoi(value) {
				this.selectedMon = null
				this.DSMonHoc = []
				this.selectedLibraryId = null
				this.nodes = []
				if (value !== null && value !== undefined) this.loadSubjects(value)
				this.loadLibraries()
			},
			selectedMon() {
				this.selectedLibraryId = null
				this.nodes = []
				this.loadLibraries()
			},
			selectedLibraryId(value) {
				this.selectedFolderId = null
				this.nodes = []
				if (value) this.loadTree()
			},
		},
		mounted() {
			this.loadLibraries()
		},
		methods: {
			notify(message, color = 'success') {
				this.snackbarRef?.value?.showSnackbar?.({ message, color })
			},
			async loadSubjects(khoiID, target = 'filter') {
				const capID = this.DSKhoi.find(item => item.id === khoiID)?.CapID
				const result = await fetchPromise('lms/MonHoc_Get_ByCapID', { CapID: capID })
				if (target === 'dialog') this.librarySubjects = result ?? []
				else this.DSMonHoc = result ?? []
			},
			async loadLibraries() {
				const result = await fetchPromise('lms/FP_TaiNguyen_GetAll', {
					KhoiID: this.selectedKhoi ?? 0,
					MonHocID: this.selectedMon ?? 0,
				}, { cache: false })
				this.libraries = result ?? []
			},
			async loadTree() {
				const result = await fetchPromise('lms/FP_TaiNguyen_GetTree', {
					HocLieuID: this.selectedLibraryId,
				}, { forceRefresh: true })
				this.nodes = result ?? []
			},
			selectFolder(folderId) {
				this.selectedFolderId = folderId
			},
			async openLibraryDialog(item = null) {
				this.libraryForm = item
					? { ...item }
					: {
						HocLieuID: 0,
						TenHocLieu: '',
						KhoiID: this.selectedKhoi,
						MonHocID: this.selectedMon,
						TinhTrang: 'Private',
					}
				this.librarySubjects = []
				if (this.libraryForm.KhoiID !== null) {
					await this.loadSubjects(this.libraryForm.KhoiID, 'dialog')
				}
				this.libraryDialog = true
			},
			async onLibraryKhoiChange(khoiID) {
				this.libraryForm.MonHocID = null
				this.librarySubjects = []
				if (khoiID !== null && khoiID !== undefined) {
					await this.loadSubjects(khoiID, 'dialog')
				}
			},
			async saveLibrary() {
				if (!String(this.libraryForm.TenHocLieu || '').trim()) {
					this.notify('Vui lòng nhập tên bộ tài liệu.', 'warning')
					return
				}
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu bộ tài liệu?' })
				if (!ok) return
				const result = await fetchPromise('lms/FP_TaiNguyen_Save', this.libraryForm, { cache: false })
				const saved = Array.isArray(result) ? result[0] : result
				this.libraryDialog = false
				await this.loadLibraries()
				if (saved?.HocLieuID) this.selectedLibraryId = saved.HocLieuID
				this.notify('Đã lưu bộ tài liệu.')
			},
			async deleteLibrary() {
				const ok = await this.confirmRef.value.show({
					title: `Xóa bộ tài liệu “${this.selectedLibrary.TenHocLieu}”? File vật lý sẽ không bị xóa.`,
				})
				if (!ok) return
				await fetchPromise('lms/FP_TaiNguyen_Delete', {
					HocLieuID: this.selectedLibraryId,
				}, { cache: false })
				this.selectedLibraryId = null
				await this.loadLibraries()
				this.notify('Đã xóa bộ tài liệu.')
			},
			openFolderDialog(item = null) {
				this.folderForm = item
					? { ...item }
					: {
						NoiDungID: 0,
						HocLieuID: this.selectedLibraryId,
						ParentID: this.selectedFolderId,
						TenNoiDung: '',
						LoaiNoiDung: 'THU_MUC',
						ThuTu: this.nodes.length,
						DataJson: '{}',
					}
				this.folderDialog = true
			},
			async saveFolder() {
				if (!String(this.folderForm.TenNoiDung || '').trim()) {
					this.notify('Vui lòng nhập tên thư mục.', 'warning')
					return
				}
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu thư mục?' })
				if (!ok) return
				await fetchPromise('lms/FP_TaiNguyen_Node_Save', {
					...this.folderForm,
					HocLieuID: this.selectedLibraryId,
					LoaiNoiDung: 'THU_MUC',
					DataJson: '{}',
				}, { cache: false })
				this.folderDialog = false
				await this.loadTree()
				this.notify('Đã lưu thư mục.')
			},
			async uploadSelectedFiles(event) {
				const files = Array.from(event.target.files || [])
				event.target.value = ''
				if (!files.length || !this.selectedLibrary) return
				if (!window.UploadManager?.uploadLmsFile) {
					this.notify('UploadManager chưa được khởi tạo.', 'error')
					return
				}

				files.forEach(file => {
					window.UploadManager.uploadLmsFile(file, {
						onComplete: async response => {
							try {
								const uploaded = response?.Files?.[0]
								if (!uploaded?.FILE_ID) throw new Error('API upload không trả về FILE_ID.')
								const metadata = {
									uploadSource: 'db',
									fileId: uploaded.FILE_ID,
									fileName: uploaded.FILE_NAME || file.name,
									contentType: uploaded.FILE_CONTENTTYPE || file.type,
									fileSize: Number(uploaded.FILE_SIZE || file.size || 0),
									url: uploaded.FILE_URL || `/FileData/${uploaded.FILE_ID}`,
									origin: 'RESOURCE_LIBRARY',
								}
								await fetchPromise('lms/FP_TaiNguyen_Node_Save', {
									NoiDungID: 0,
									HocLieuID: this.selectedLibraryId,
									ParentID: this.selectedFolderId,
									TenNoiDung: metadata.fileName,
									LoaiNoiDung: this.getResourceType(metadata.contentType),
									ThuTu: this.nodes.length,
									DataJson: JSON.stringify(metadata),
								}, { cache: false })
								await this.loadTree()
								await this.loadLibraries()
								this.notify(`Đã lưu ${metadata.fileName} vào kho.`)
							} catch (error) {
								console.error(error)
								this.notify(error.message || 'Không thể đăng ký file vào kho.', 'error')
							}
						},
						onError: error => this.notify(error?.message || `Upload ${file.name} thất bại.`, 'error'),
					})
				})
			},
			getResourceType(contentType = '') {
				if (contentType.startsWith('video/')) return 'VIDEO'
				if (contentType.startsWith('audio/')) return 'AUDIO'
				if (contentType.startsWith('image/')) return 'HINH_ANH'
				return 'TAI_LIEU'
			},
			getMeta(item) {
				if (item?._meta) return item._meta
				try {
					return typeof item?.DataJson === 'string' ? JSON.parse(item.DataJson) : (item?.DataJson || {})
				} catch (error) {
					return {}
				}
			},
			getFileUrl(item) {
				const meta = this.getMeta(item)
				const fileId = meta.fileId || meta.FILE_ID
				const url = meta.url || meta.FILE_URL
				if (url?.startsWith('http')) return url
				if (url?.startsWith('/')) return vueData.v_Set.urlReturnFile + url
				if (fileId) return `${vueData.v_Set.urlReturnFile}/FileData/${fileId}`
				return ''
			},
			openFile(item) {
				const url = this.getFileUrl(item)
				if (url) window.open(url, '_blank', 'noopener')
			},
			openFileDialog(item) {
				const meta = this.getMeta(item)
				this.fileForm = {
					...item,
					description: meta.description || '',
					_meta: meta,
				}
				this.fileDialog = true
			},
			async saveFileMetadata() {
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận cập nhật thông tin file?' })
				if (!ok) return
				const metadata = { ...this.fileForm._meta, description: this.fileForm.description || '' }
				await fetchPromise('lms/FP_TaiNguyen_Node_Save', {
					NoiDungID: this.fileForm.NoiDungID,
					HocLieuID: this.selectedLibraryId,
					ParentID: this.fileForm.ParentID,
					TenNoiDung: this.fileForm.TenNoiDung,
					LoaiNoiDung: this.fileForm.LoaiNoiDung,
					ThuTu: this.fileForm.ThuTu || 0,
					DataJson: JSON.stringify(metadata),
				}, { cache: false })
				this.fileDialog = false
				await this.loadTree()
				this.notify('Đã cập nhật thông tin file.')
			},
			async deleteNode(item) {
				const label = item.LoaiNoiDung === 'THU_MUC' ? 'thư mục và các mục con' : 'metadata file khỏi kho'
				const ok = await this.confirmRef.value.show({
					title: `Xóa ${label} “${item.TenNoiDung}”? FileData không bị xóa.`,
				})
				if (!ok) return
				await fetchPromise('lms/FP_TaiNguyen_Node_Delete', {
					NoiDungID: item.NoiDungID,
				}, { cache: false })
				if (this.selectedFolderId === item.NoiDungID) this.selectedFolderId = null
				await this.loadTree()
				this.notify('Đã xóa khỏi kho tài nguyên.')
			},
			getFileIcon(item) {
				const type = this.getMeta(item).contentType || ''
				if (type.startsWith('video/')) return 'mdi-file-video-outline'
				if (type.startsWith('audio/')) return 'mdi-file-music-outline'
				if (type.startsWith('image/')) return 'mdi-file-image-outline'
				if (type.includes('pdf')) return 'mdi-file-pdf-box'
				if (type.includes('word')) return 'mdi-file-word-outline'
				if (type.includes('presentation') || type.includes('powerpoint')) return 'mdi-file-powerpoint-outline'
				return 'mdi-file-outline'
			},
			getFileColor(item) {
				const type = this.getMeta(item).contentType || ''
				if (type.includes('pdf')) return 'red'
				if (type.startsWith('video/')) return 'purple'
				if (type.startsWith('audio/')) return 'indigo'
				if (type.startsWith('image/')) return 'green'
				return 'primary'
			},
			formatFileSize(value) {
				const size = Number(value || 0)
				if (!size) return '—'
				if (size < 1024) return `${size} B`
				if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`
				return `${(size / 1048576).toFixed(1)} MB`
			},
			formatDate(value) {
				if (!value) return '—'
				return new Date(value).toLocaleString('vi-VN')
			},
		},
	}
</script>