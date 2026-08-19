<template>
	<Global upload-manager>
		<template #header>
			<v-card>
				<v-card-title class="d-flex align-center">
					{{ TitlePage }}
					<v-spacer />
					<v-btn size="small" variant="outlined" color="primary" prepend-icon="mdi-refresh" :loading="isRefreshing" @click="refreshData">
						Làm mới
						<v-tooltip activator="parent" location="top">Làm mới</v-tooltip>
					</v-btn>
				</v-card-title>
			</v-card>
		</template>

		<v-divider />

		<div class="resource-layout">
			<aside class="resource-tree-panel">
				<div class="panel-header">
					<div>
						<div class="text-subtitle-1 font-weight-bold">Cây tài nguyên</div>
						<div class="text-caption text-medium-emphasis">
							{{ selectedLibrary?.TenHocLieu || selectedTreeNode?.label || 'Chưa chọn bộ tài liệu' }}
						</div>
					</div>
				</div>

				<div class="pa-2">
					<v-text-field v-model="treeSearch" label="Tìm trong cây" prepend-inner-icon="mdi-magnify"
						clearable density="compact" hide-details class="mb-2" />
					<!-- Tạm ẩn chức năng tạo thư mục.
					<v-btn block color="primary" variant="tonal" prepend-icon="mdi-folder-plus"
						:disabled="!selectedLibrary" @click="openFolderDialog()">Tạo thư mục</v-btn>
					-->
				</div>

				<v-list v-model:opened="openGradeGroups" density="compact" nav color="primary" class="resource-tree-list">
					<v-list-item :active="selectedTreeNode?.kind === 'innovation-root' || (selectedLibrary?.TaiNguyenLoaiCode === 'SANG_KIEN' && selectedLibrary?.TenHocLieu === 'Sáng kiến')" prepend-icon="mdi-lightbulb-on-outline" title="Sáng kiến"
						@click="selectInnovationRoot()">
						<template #append>
							<div v-if="selectedLibrary?.TaiNguyenLoaiCode === 'SANG_KIEN' && selectedLibrary?.TenHocLieu === 'Sáng kiến'" class="d-flex align-center">
								<v-btn icon size="small" variant="text" color="primary" @click.stop="openLibraryDialog(selectedLibrary)">
									<v-icon size="18">mdi-pencil</v-icon>
									<v-tooltip activator="parent" location="top">Sửa bộ tài liệu</v-tooltip>
								</v-btn>
								<v-btn icon size="small" variant="text" color="error" @click.stop="deleteLibrary(selectedLibrary)">
									<v-icon size="18">mdi-delete-outline</v-icon>
									<v-tooltip activator="parent" location="top">Xóa bộ tài liệu</v-tooltip>
								</v-btn>
							</div>
						</template>
					</v-list-item>
					<v-list-item v-for="item in filteredInnovationLibraries" :key="'sk-' + item.HocLieuID"
						:active="selectedLibraryId === item.HocLieuID" class="pl-8" prepend-icon="mdi-file-document-outline" :title="item.TenHocLieu"
						@click="selectLibraryTreeNode(item)">
						<template #append>
							<div class="d-flex align-center">
								<v-btn icon size="small" variant="text" color="primary" @click.stop="openLibraryDialog(item)">
									<v-icon size="18">mdi-pencil</v-icon>
									<v-tooltip activator="parent" location="top">Sửa bộ tài liệu</v-tooltip>
								</v-btn>
								<v-btn icon size="small" variant="text" color="error" @click.stop="deleteLibrary(item)">
									<v-icon size="18">mdi-delete-outline</v-icon>
									<v-tooltip activator="parent" location="top">Xóa bộ tài liệu</v-tooltip>
								</v-btn>
							</div>
						</template>
					</v-list-item>
					<v-list-item :active="['subject-root', 'subject', 'shared'].includes(selectedTreeNode?.kind)" prepend-icon="mdi-format-list-group" title="Khối môn"
						@click="selectTreeNode({ kind: 'subject-root' })" />
					<v-list-group v-for="grade in filteredGradeTree" :key="'grade-' + grade.KhoiID" :value="'grade-' + grade.KhoiID">
						<template #activator="{ props }">
							<v-list-item v-bind="props" class="pl-8" :title="grade.TenKhoi" />
						</template>
						<template v-for="subject in grade.subjects" :key="'subject-group-' + grade.KhoiID + '-' + subject.MonHocID">
							<v-list-item
								:active="isSubjectActive(grade, subject)" class="pl-8" prepend-icon="mdi-book-open-variant" :title="subject.MonHocName"
								@click="selectSubjectNode(grade, subject)" />
							<v-list-item class="resource-shared-item" prepend-icon="mdi-folder-multiple-outline"
								:active="isSharedActive(grade, subject)" title="Tài liệu chia sẻ/tham khảo"
								@click.stop="selectSharedFolder(grade, subject)">
								<template #append>
									<v-btn v-if="subject.shared" icon size="small" variant="text" color="primary"
										@click.stop="openLibraryDialog(subject.shared)">
										<v-icon size="18">mdi-pencil</v-icon>
										<v-tooltip activator="parent" location="top">Sửa bộ tài liệu</v-tooltip>
									</v-btn>
								</template>
							</v-list-item>
						</template>
					</v-list-group>
				</v-list>
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
							:disabled="!canUploadCurrentContext" @click="$refs.fileInput.click()">
							Upload file
						</v-btn>
					</div>
				</div>

				<GlobalDataTable :headers="headers" :items="visibleFiles" item-value="NoiDungID"
					items-per-page="-1" hide-default-footer hover
					:vDataTableHeight="'calc(100dvh - 158px)'">
					<template #item.TenNoiDung="{ item }">
						<div class="d-flex align-center ga-2">
							<v-icon :color="getFileColor(item)">{{ getFileIcon(item) }}</v-icon>
							<div>
								<div class="font-weight-medium">{{ item.TenNoiDung }}</div>
								<div class="text-caption text-medium-emphasis">{{ getMeta(item).contentType || 'Tệp tin' }}</div>
							</div>
						</div>
					</template>
					<template #item.NguonTaiNguyenCode="{ item }">
						<v-chip size="small" variant="tonal">{{ getSourceLabel(item.NguonTaiNguyenCode) }}</v-chip>
					</template>
					<template #item.NguoiUpload="{ item }">{{ getUploaderLabel(item) }}</template>
					<template #item.fileSize="{ item }">{{ formatFileSize(getMeta(item).fileSize) }}</template>
					<template #item.CreateTime="{ item }">{{ formatDate(item.CreateTime) }}</template>
					<template #item.actions="{ item }">
						<div class="d-flex align-center ga-1">
							<v-btn icon size="small" variant="text" color="primary" @click="openFile(item)">
								<v-icon>mdi-open-in-new</v-icon>
								<v-tooltip activator="parent" location="top">Mở file</v-tooltip>
							</v-btn>
							<v-btn v-if="!isExternalResource(item)" icon size="small" variant="text" color="error" @click="deleteNode(item)">
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
			<div class="resource-library-form">
				<v-text-field v-model="libraryForm.TenHocLieu" label="Tên bộ tài liệu*" />
				<v-select v-model="libraryForm.TaiNguyenLoaiID" label="Loại tài nguyên*" :items="resourceTypes"
					item-title="TenLoai" item-value="TaiNguyenLoaiID"
					:disabled="Boolean(libraryForm.HocLieuID)" @update:model-value="onLibraryTypeChange" />
				<v-select v-if="libraryUsesMucRieng" v-model="libraryForm.TaiNguyenMucID" label="Mức phân loại*"
					:items="resourceLevels" item-title="TenMuc" item-value="TaiNguyenMucID" />
				<v-row class="resource-library-form-row">
				<v-col v-if="libraryUsesKhoiMon" cols="6">
					<v-select v-model="libraryForm.KhoiID" label="Khối" :items="DSKhoi"
						item-title="name" item-value="id" @update:model-value="onLibraryKhoiChange" />
				</v-col>
				<v-col v-if="libraryUsesKhoiMon" cols="6">
					<v-select v-model="libraryForm.MonHocID" label="Môn học" :items="librarySubjects"
						item-title="MonHocName" item-value="MonHocID" />
				</v-col>
				</v-row>
				<v-select v-model="libraryForm.TinhTrang" label="Trạng thái"
					:items="['Private', 'Public']" />
			</div>
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
				selectedResourceTypeId: null,
				selectedResourceLevelId: null,
				selectedKhoi: null,
				selectedMon: null,
				selectedLibraryId: null,
				selectedFolderId: null,
				DSMonHoc: [],
				resourceTypes: [],
				resourceLevels: [],
				librarySubjects: [],
				libraries: [],
				nodes: [],
				sourceFiles: [],
				subjectCatalog: [],
				teacherSubjectScope: [],
				teacherSubjectScopeReady: false,
				isRefreshing: false,
				selectedTreeNode: { kind: 'subject-root' },
				openGradeGroups: [],
				treeSearch: '',
				libraryDialog: false,
				folderDialog: false,
				fileDialog: false,
				libraryForm: {},
				folderForm: {},
				fileForm: {},
				DSKhoi: [
					{ id: 0, name: 'Mầm non', CapID: 0 },
					{ id: 1, name: 'Khối 1', CapID: 1 }, { id: 2, name: 'Khối 2', CapID: 1 },
					{ id: 3, name: 'Khối 3', CapID: 1 }, { id: 4, name: 'Khối 4', CapID: 1 },
					{ id: 5, name: 'Khối 5', CapID: 1 }, { id: 6, name: 'Khối 6', CapID: 2 },
					{ id: 7, name: 'Khối 7', CapID: 2 }, { id: 8, name: 'Khối 8', CapID: 2 },
					{ id: 9, name: 'Khối 9', CapID: 2 }, { id: 10, name: 'Khối 10', CapID: 3 },
					{ id: 11, name: 'Khối 11', CapID: 3 }, { id: 12, name: 'Khối 12', CapID: 3 },
				],
					headers: [
					{ title: 'Tên file', value: 'TenNoiDung', width: 260 },
					{ title: 'Nguồn', value: 'NguonTaiNguyenCode', width: 170 },
					{ title: 'Thuộc bài / vị trí', value: 'ThuocNoiDung', width: 300 },
					{ title: 'Người upload', value: 'NguoiUpload', width: 180 },
					{ title: 'Dung lượng', value: 'fileSize', width: 130 },
					{ title: 'Ngày tải lên', value: 'CreateTime', width: 170 },
					{ title: 'Thao tác', value: 'actions', sortable: false, width: 150 },
				],
			}
		},
		computed: {
			isManager() {
				const right = vueData?.user?.SystemRight ?? vueData?.user?.systemRight ?? ''
				return [3, 9].includes(Number(right))
			},
			TitlePage() {
				return getTitlePageByURL(window.location.pathname + window.location.search) || 'Quản lý tài nguyên'
			},
			selectedLibrary() {
				return this.libraries.find(item => item.HocLieuID === this.selectedLibraryId) || null
			},
			innovationLibraries() {
				return this.libraries.filter(item => item.TaiNguyenLoaiCode === 'SANG_KIEN' && item.TenHocLieu !== 'Sáng kiến')
			},
			filteredInnovationLibraries() {
				const keyword = this.treeSearch.trim().toLowerCase()
				if (!keyword) return this.innovationLibraries
				return this.innovationLibraries.filter(item => String(item.TenHocLieu || '').toLowerCase().includes(keyword))
			},
			gradeTree() {
				const groups = new Map()
				const subjectInScope = (khoiID, monHocID) => this.isManager
					|| this.teacherSubjectScope.some(item => Number(item.KhoiID) === Number(khoiID)
						&& Number(item.MonHocID) === Number(monHocID))
				const ensureSubject = (khoiID, monHocID, monHocName) => {
					if (khoiID === null || khoiID === undefined || monHocID === null || monHocID === undefined) return null
					const grade = groups.get(Number(khoiID)) || {
						KhoiID: Number(khoiID),
						TenKhoi: this.DSKhoi.find(item => item.id === Number(khoiID))?.name || 'Khối ' + khoiID,
						subjects: new Map(),
					}
					groups.set(Number(khoiID), grade)
					const subjectKey = Number(monHocID)
					const subject = grade.subjects.get(subjectKey) || {
						MonHocID: subjectKey,
						MonHocName: monHocName || 'Môn ' + monHocID,
						shared: null,
					}
					grade.subjects.set(subjectKey, subject)
					return subject
				}
				this.subjectCatalog
					.filter(item => subjectInScope(item.KhoiID, item.MonHocID))
					.forEach(item => ensureSubject(item.KhoiID, item.MonHocID, item.MonHocName))
				this.sourceFiles
					.filter(item => subjectInScope(item.KhoiID, item.MonHocID))
					.forEach(item => ensureSubject(item.KhoiID, item.MonHocID, item.MonHocName || item.TenMonHoc))
				this.libraries
					.filter(item => item.TaiNguyenLoaiCode === 'TAI_LIEU_THAM_KHAO')
					.filter(item => subjectInScope(item.KhoiID, item.MonHocID))
					.forEach(item => {
						const subject = ensureSubject(item.KhoiID, item.MonHocID, item.MonHocName)
						if (subject) subject.shared = item
					})
				return Array.from(groups.values())
					.sort((a, b) => a.KhoiID - b.KhoiID)
					.map(grade => ({ ...grade, subjects: Array.from(grade.subjects.values()).sort((a, b) => a.MonHocName.localeCompare(b.MonHocName, 'vi')) }))
			},
			filteredGradeTree() {
				const keyword = this.treeSearch.trim().toLowerCase()
				if (!keyword) return this.gradeTree
				return this.gradeTree
					.map(grade => ({
						...grade,
						subjects: grade.subjects.filter(subject =>
							String(grade.TenKhoi || '').toLowerCase().includes(keyword)
							|| String(subject.MonHocName || '').toLowerCase().includes(keyword)
							|| String(subject.shared?.TenHocLieu || '').toLowerCase().includes(keyword)
						),
					}))
					.filter(grade => String(grade.TenKhoi || '').toLowerCase().includes(keyword) || grade.subjects.length)
			},
			selectedResourceType() {
				return this.resourceTypes.find(item => item.TaiNguyenLoaiID === this.selectedResourceTypeId) || null
			},
			usesKhoiMon() {
				return !this.selectedResourceType || this.selectedResourceType.KieuLoc === 'KHOI_MON'
			},
			usesMucRieng() {
				return this.selectedResourceType?.KieuLoc === 'MUC_RIENG'
			},
			libraryResourceType() {
				return this.resourceTypes.find(item => item.TaiNguyenLoaiID === this.libraryForm.TaiNguyenLoaiID) || null
			},
			libraryUsesKhoiMon() {
				return !this.libraryResourceType || this.libraryResourceType.KieuLoc === 'KHOI_MON'
			},
			libraryUsesMucRieng() {
				return this.libraryResourceType?.KieuLoc === 'MUC_RIENG'
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
				if (this.selectedTreeNode?.kind === 'subject') {
					return this.sourceFiles
						.filter(item => Number(item.KhoiID) === Number(this.selectedTreeNode.KhoiID)
							&& Number(item.MonHocID) === Number(this.selectedTreeNode.MonHocID))
						.map(item => this.normalizeSourceFile(item))
				}
				if (this.selectedTreeNode?.kind === 'shared') {
					return this.nodes.filter(item =>
						item.LoaiNoiDung !== 'THU_MUC'
						&& (item.ParentID || null) === this.selectedFolderId
						&& (item.NguonTaiNguyenCode === 'QUAN_LY_TAI_NGUYEN'
							|| this.getMeta(item).origin === 'QUAN_LY_TAI_NGUYEN')
					)
				}
				return this.nodes.filter(item =>
					item.LoaiNoiDung !== 'THU_MUC'
					&& (item.ParentID || null) === this.selectedFolderId
				)
			},
			currentFolderName() {
				if (this.selectedTreeNode?.kind === 'subject') return this.selectedTreeNode.label
				if (this.selectedTreeNode?.kind === 'shared') return this.selectedTreeNode.label
				if (this.selectedTreeNode?.kind === 'innovation-root') return 'Sáng kiến'
				if (this.selectedTreeNode?.kind === 'subject-root') return 'Khối môn'
				if (!this.selectedLibrary) return 'Danh sách file'
				if (this.selectedFolderId === null) return this.selectedLibrary.TenHocLieu
				return this.folders.find(item => item.NoiDungID === this.selectedFolderId)?.TenNoiDung || 'Danh sách file'
			},
			canUploadCurrentContext() {
				return Boolean(this.selectedLibrary || ['innovation-root', 'shared'].includes(this.selectedTreeNode?.kind))
			},
		},
		watch: {
			selectedResourceTypeId(value) {
				this.selectedResourceLevelId = null
				this.selectedKhoi = null
				this.selectedMon = null
				this.DSMonHoc = []
				this.loadResourceLevels(value)
				this.loadLibraries()
			},
			selectedResourceLevelId() {
				this.selectedLibraryId = null
				this.nodes = []
				this.loadLibraries()
			},
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
			Promise.all([this.initializeResourceTypes(), this.loadContentLibrary(), this.loadSubjectCatalog()])
		},
		methods: {
			async refreshData() {
				this.isRefreshing = true
				try {
					await Promise.all([this.loadLibraries(), this.loadContentLibrary(), this.loadSubjectCatalog()])
					if (this.selectedLibraryId) await this.loadTree()
				} finally {
					this.isRefreshing = false
				}
			},
			notify(message, color = 'success') {
				this.snackbarRef?.value?.showSnackbar?.({ message, color })
			},
			async loadSubjects(khoiID, target = 'filter') {
				const capID = this.DSKhoi.find(item => item.id === khoiID)?.CapID
				const result = await fetchPromise('lms/MonHoc_Get_ByCapID', { CapID: capID })
				if (target === 'dialog') this.librarySubjects = result ?? []
				else this.DSMonHoc = result ?? []
			},
			async initializeResourceTypes() {
				const result = await fetchPromise('lms/FP_TaiNguyenLoai_GetAll', {}, { cache: false })
				this.resourceTypes = result ?? []
				if (!this.selectedResourceTypeId && this.resourceTypes.length) {
					this.selectedResourceTypeId = this.resourceTypes[0].TaiNguyenLoaiID
				} else {
					await this.loadLibraries()
				}
			},
			async loadResourceLevels(typeId) {
				this.resourceLevels = []
				if (!typeId) return
				const type = this.resourceTypes.find(item => item.TaiNguyenLoaiID === typeId)
				if (type?.KieuLoc !== 'MUC_RIENG') return
				const result = await fetchPromise('lms/FP_TaiNguyenMuc_GetAll', { TaiNguyenLoaiID: typeId }, { cache: false })
				this.resourceLevels = result ?? []
			},
			async loadLibraries() {
				const result = await fetchPromise('lms/FP_TaiNguyen_GetAll', {
					KhoiID: 0,
					MonHocID: 0,
					TaiNguyenLoaiID: 0,
					TaiNguyenMucID: 0,
				}, { cache: false })
				this.libraries = result ?? []
			},
			async loadContentLibrary() {
				const result = await fetchPromise('lms/FP_TaiNguyen_SourceFile_GetAll', {}, { cache: false })
				this.sourceFiles = result ?? []
			},
			async loadSubjectCatalog() {
				this.teacherSubjectScopeReady = false
				if (!this.isManager) {
					const nienKhoa = vueData.NienKhoa || (await fetchPromise('lms/NienKhoa_Get', {}, { cache: false }))
					const nienKhoaValue = Array.isArray(nienKhoa)
						? nienKhoa.find(item => item.IsActive)?.NienKhoa
						: nienKhoa
					const hocKi = vueData.NienKhoaItem?.HocKi || 1
					const assigned = await fetchPromise('lms/EL_Teacher_GetKhoi_MonHoc_ByGiaoVienID', {
						NienKhoa: nienKhoaValue,
						HocKi: hocKi,
					}, { cache: false })
					this.teacherSubjectScope = assigned?.[1] || []
				}
				this.teacherSubjectScopeReady = true
				const capIDs = [...new Set(this.DSKhoi.map(item => item.CapID))]
				const results = await Promise.all(capIDs.map(capID => fetchPromise('lms/MonHoc_Get_ByCapID', { CapID: capID })))
				const subjects = []
				this.DSKhoi.forEach(grade => {
					const capIndex = capIDs.indexOf(grade.CapID)
					;(results[capIndex] || []).forEach(subject => {
						if (!subjects.some(item => item.KhoiID === grade.id && item.MonHocID === subject.MonHocID)) {
							subjects.push({ KhoiID: grade.id, MonHocID: subject.MonHocID, MonHocName: subject.MonHocName })
						}
					})
				})
				this.subjectCatalog = subjects
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
			selectTreeNode(node) {
				this.selectedTreeNode = node
				this.selectedLibraryId = null
				this.selectedFolderId = null
				this.nodes = []
			},
			async selectInnovationRoot() {
				this.selectTreeNode({ kind: 'innovation-root' })
				const library = this.libraries.find(item => item.TaiNguyenLoaiCode === 'SANG_KIEN' && item.TenHocLieu === 'Sáng kiến')
				if (library) this.selectLibraryTreeNode(library)
			},
			async selectSharedFolder(grade, subject) {
				this.selectedTreeNode = {
					kind: 'shared',
					KhoiID: grade.KhoiID,
					MonHocID: subject.MonHocID,
					label: grade.TenKhoi + ' / ' + subject.MonHocName + ' / Tài liệu chia sẻ/tham khảo',
				}
				this.selectedFolderId = null
				this.nodes = []
				if (subject.shared?.HocLieuID) this.selectedLibraryId = subject.shared.HocLieuID
			},
			async ensureContextLibrary(typeCode, grade = null, subject = null) {
				let library = this.libraries.find(item => item.TaiNguyenLoaiCode === typeCode
					&& (typeCode === 'SANG_KIEN'
						|| (Number(item.KhoiID) === Number(grade.KhoiID) && Number(item.MonHocID) === Number(subject.MonHocID))))
				if (!library) {
					const type = this.resourceTypes.find(item => (item.TaiNguyenLoaiCode || item.Code) === typeCode)
					if (typeCode === 'SANG_KIEN' && type) await this.loadResourceLevels(type.TaiNguyenLoaiID)
					const result = await fetchPromise('lms/FP_TaiNguyen_Save', {
						HocLieuID: 0,
						TenHocLieu: typeCode === 'SANG_KIEN' ? 'Sáng kiến' : 'Tài liệu chia sẻ/tham khảo',
						TaiNguyenLoaiID: type?.TaiNguyenLoaiID,
						TaiNguyenMucID: typeCode === 'SANG_KIEN' ? this.resourceLevels[0]?.TaiNguyenMucID : null,
						KhoiID: grade?.KhoiID ?? null,
						MonHocID: subject?.MonHocID ?? null,
						TinhTrang: 'Private',
					}, { cache: false })
					library = Array.isArray(result) ? result[0] : result
					await this.loadLibraries()
					library = library?.HocLieuID ? library : this.libraries.find(item => item.TaiNguyenLoaiCode === typeCode
						&& (typeCode === 'SANG_KIEN' || (Number(item.KhoiID) === Number(grade.KhoiID) && Number(item.MonHocID) === Number(subject.MonHocID))))
				}
				if (library?.HocLieuID) this.selectLibraryTreeNode(library)
			},
			selectLibraryTreeNode(item) {
				this.selectedTreeNode = { kind: 'library', label: item.TenHocLieu }
				this.selectedLibraryId = item.HocLieuID
			},
			selectSubjectNode(grade, subject) {
				this.selectedTreeNode = {
					kind: 'subject',
					KhoiID: grade.KhoiID,
					MonHocID: subject.MonHocID,
					label: `${grade.TenKhoi} / ${subject.MonHocName}`,
				}
				this.selectedLibraryId = null
				this.selectedFolderId = null
				this.nodes = []
			},
			isSubjectActive(grade, subject) {
				return this.selectedTreeNode?.kind === 'subject'
					&& Number(this.selectedTreeNode.KhoiID) === Number(grade.KhoiID)
					&& Number(this.selectedTreeNode.MonHocID) === Number(subject.MonHocID)
			},
			isSharedActive(grade, subject) {
				return this.selectedTreeNode?.kind === 'shared'
					&& Number(this.selectedTreeNode.KhoiID) === Number(grade.KhoiID)
					&& Number(this.selectedTreeNode.MonHocID) === Number(subject.MonHocID)
			},
			async openLibraryDialog(item = null) {
				const selectedSubject = this.selectedTreeNode?.kind === 'subject' ? this.selectedTreeNode : null
				const defaultType = selectedSubject
					? this.resourceTypes.find(type => (type.TaiNguyenLoaiCode || type.Code) === 'TAI_LIEU_THAM_KHAO')
					: this.resourceTypes.find(type => (type.TaiNguyenLoaiCode || type.Code) === 'SANG_KIEN')
				this.libraryForm = item
					? { ...item }
					: {
						HocLieuID: 0,
						TenHocLieu: '',
						TaiNguyenLoaiID: defaultType?.TaiNguyenLoaiID || this.selectedResourceTypeId,
						TaiNguyenMucID: this.selectedResourceLevelId,
						KhoiID: selectedSubject?.KhoiID ?? null,
						MonHocID: selectedSubject?.MonHocID ?? null,
						TinhTrang: 'Private',
					}
				this.librarySubjects = []
				await this.loadResourceLevels(this.libraryForm.TaiNguyenLoaiID)
				if (this.libraryUsesKhoiMon && this.libraryForm.KhoiID !== null) {
					await this.loadSubjects(this.libraryForm.KhoiID, 'dialog')
				}
				this.libraryDialog = true
			},
			async onLibraryTypeChange(typeId) {
				this.libraryForm.TaiNguyenMucID = null
				this.libraryForm.KhoiID = null
				this.libraryForm.MonHocID = null
				this.librarySubjects = []
				await this.loadResourceLevels(typeId)
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
				if (!this.libraryForm.TaiNguyenLoaiID) {
					this.notify('Vui lòng chọn loại tài nguyên.', 'warning')
					return
				}
				if (this.libraryUsesMucRieng && !this.libraryForm.TaiNguyenMucID) {
					this.notify('Vui lòng chọn mức phân loại.', 'warning')
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
			async deleteLibrary(item = this.selectedLibrary) {
				if (!item?.HocLieuID) return
				const ok = await this.confirmRef.value.show({
					title: `Xóa bộ tài liệu “${item.TenHocLieu}”? File vật lý sẽ không bị xóa.`,
				})
				if (!ok) return
				await fetchPromise('lms/FP_TaiNguyen_Delete', {
					HocLieuID: item.HocLieuID,
				}, { cache: false })
				if (this.selectedLibraryId === item.HocLieuID) this.selectedLibraryId = null
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
				if (!files.length || !this.canUploadCurrentContext) return
				if (!this.selectedLibrary && this.selectedTreeNode?.kind === 'innovation-root') {
					await this.ensureContextLibrary('SANG_KIEN')
				}
				if (!this.selectedLibrary && this.selectedTreeNode?.kind === 'shared') {
					await this.ensureContextLibrary('TAI_LIEU_THAM_KHAO',
						{ KhoiID: this.selectedTreeNode.KhoiID }, { MonHocID: this.selectedTreeNode.MonHocID })
				}
				if (!this.selectedLibrary) return
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
									origin: 'QUAN_LY_TAI_NGUYEN',
								}
								await fetchPromise('lms/FP_TaiNguyen_Node_Save', {
									NoiDungID: 0,
									HocLieuID: this.selectedLibraryId,
									ParentID: this.selectedFolderId,
									TenNoiDung: metadata.fileName,
					LoaiNoiDung: this.getResourceType(metadata.contentType),
					NguonTaiNguyenCode: 'QUAN_LY_TAI_NGUYEN',
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
			normalizeSourceFile(item) {
				const isAssignment = item.ResourceType === 'ASSIGNMENT'
				return {
					...item,
					NoiDungID: `${item.ResourceType}-${item.ResourceID}-${item.FileID}`,
					TenNoiDung: item.FileName,
					NguonTaiNguyenCode: item.NguonTaiNguyenCode || (isAssignment ? 'GIAO_BAI' : 'HOC_LIEU'),
					NguoiUploadID: item.NguoiUploadID,
					NguoiUploadName: item.NguoiUploadName,
					CreateTime: item.CreateTime,
					ThuocNoiDung: item.ThuocNoiDung || item.ContentTitle || '',
					_meta: {
						contentType: item.ContentType || (isAssignment ? 'File giao bài' : 'File học liệu'),
						fileKind: this.getFileKind(item.FileName, item.ContentType, item.FileURL),
						fileId: item.FileID,
						fileSize: Number(item.FileSize || 0),
						url: item.FileURL,
					},
					_isExternalResource: true,
				}
			},
			isExternalResource(item) {
				return Boolean(item?._isExternalResource)
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
				if (this.isExternalResource(item)) return this.openExternalResource(item)
				const url = this.getFileUrl(item)
				if (url) window.open(url, '_blank', 'noopener')
				},
				openExternalResource(item) {
					const meta = this.getMeta(item)
					const fileId = item.FileID || meta.fileId || meta.FILE_ID
					const url = item.FileURL || item.Url || item.URL || item.Link || item.DetailUrl || meta.url || meta.FILE_URL
					if (fileId && url && /\/FileData\//i.test(url)) return openWindow({ title: item.Title || item.FileName || '', url: url.startsWith('http') ? url : vueData.v_Set.urlReturnFile + url })
					if (url) return openWindow({ title: item.Title || item.FileName || '', url })
					if (fileId) window.open(`${vueData.v_Set.urlReturnFile}/FileData/${fileId}`, '_blank', 'noopener')
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
					NguonTaiNguyenCode: this.fileForm.NguonTaiNguyenCode || 'QUAN_LY_TAI_NGUYEN',
					NguonResourceType: this.fileForm.NguonResourceType,
					NguonResourceID: this.fileForm.NguonResourceID,
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
				const meta = this.getMeta(item)
				const type = meta.contentType || ''
				const kind = meta.fileKind || this.getFileKind(item.TenNoiDung, type, meta.url)
				if (kind === 'pdf') return 'mdi-file-pdf-box'
				if (kind === 'word') return 'mdi-file-word-outline'
				if (kind === 'excel') return 'mdi-file-excel-outline'
				if (kind === 'powerpoint') return 'mdi-file-powerpoint-outline'
				if (kind === 'image') return 'mdi-file-image-outline'
				if (kind === 'video') return 'mdi-file-video-outline'
				if (kind === 'audio') return 'mdi-file-music-outline'
				if (kind === 'archive') return 'mdi-folder-zip-outline'
				if (type.startsWith('video/')) return 'mdi-file-video-outline'
				if (type.startsWith('audio/')) return 'mdi-file-music-outline'
				if (type.startsWith('image/')) return 'mdi-file-image-outline'
				if (type.includes('pdf')) return 'mdi-file-pdf-box'
				if (type.includes('word')) return 'mdi-file-word-outline'
				if (type.includes('presentation') || type.includes('powerpoint')) return 'mdi-file-powerpoint-outline'
				return 'mdi-file-outline'
			},
			getFileColor(item) {
				const meta = this.getMeta(item)
				const type = meta.contentType || ''
				const kind = meta.fileKind || this.getFileKind(item.TenNoiDung, type, meta.url)
				if (kind === 'pdf') return 'red'
				if (kind === 'word') return 'blue'
				if (kind === 'excel') return 'green'
				if (kind === 'powerpoint') return 'orange'
				if (kind === 'image') return 'teal'
				if (kind === 'video') return 'purple'
				if (kind === 'audio') return 'indigo'
				if (type.includes('pdf')) return 'red'
				if (type.startsWith('video/')) return 'purple'
				if (type.startsWith('audio/')) return 'indigo'
				if (type.startsWith('image/')) return 'green'
				return 'primary'
			},
			getFileKind(fileName = '', contentType = '', url = '') {
				const type = String(contentType || '').toLowerCase()
				const name = String(fileName || url || '').toLowerCase().split('?')[0]
				const extension = name.includes('.') ? name.split('.').pop() : ''
				if (type.includes('pdf') || extension === 'pdf') return 'pdf'
				if (type.includes('word') || ['doc', 'docx', 'rtf'].includes(extension)) return 'word'
				if (type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(extension)) return 'excel'
				if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) return 'powerpoint'
				if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image'
				if (type.startsWith('video/') || ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) return 'video'
				if (type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg'].includes(extension)) return 'audio'
				if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive'
				return 'file'
			},
			getSourceLabel(code) {
				return {
					HOC_LIEU: 'Học liệu',
					GIAO_BAI: 'Giao bài',
					QUAN_LY_TAI_NGUYEN: 'Quản lý tài nguyên',
				}[code] || 'Khác'
			},
			getUploaderLabel(item) {
				return item.NguoiUploadName || item.NguoiUploadID || item.CreateUser || '—'
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