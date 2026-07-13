<template>
	<Global upload-manager>
		<template #header>
			<v-card>
				<v-card-text class="header-content">
					<span class="page-title">Soạn thảo học liệu</span>
					<template v-if="selectedKhoi !== null">
						<v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
						<span class="text-body-2 text-medium-emphasis">{{ getKhoiName(selectedKhoi) }}</span>
					</template>
					<template v-if="selectedMon">
						<v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
						<v-chip size="small" color="primary" variant="tonal">{{ getMonName(selectedMon) }}</v-chip>
					</template>
					<template v-if="selectedHocLieu">
						<v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
						<v-chip size="small" color="secondary" variant="tonal">{{ selectedHocLieu.TenHocLieu }}</v-chip>
					</template>
					<v-spacer />
					<div class="header-actions" v-if="selectedHocLieu">
						<v-btn color="success" variant="tonal" size="small" @click="addNewRootNode"
							class="add-root-btn">
							<v-icon start>mdi-plus-circle</v-icon>
							Thêm mục gốc
						</v-btn>
					</div>
				</v-card-text>
			</v-card>
		</template>
		<v-divider />

		<!-- Main Content -->
		<div class="main-content">
			<!-- Filter & Book Selection -->
			<div class="filter-panel">
				<div class="filter-header">
					<div class="filter-title">
						<v-icon class="sidebar-icon">mdi-library-books</v-icon>
						<h3 class="sidebar-title">Chọn học liệu</h3>
					</div>
					<v-chip size="small" color="primary" variant="tonal">{{ DSHocLieu.length }} sách</v-chip>
				</div>

				<div class="book-selection">
					<div class="filter-controls">
						<v-select label="Bộ sách" :items="DSBoSach" v-model="selectedBoSach" variant="outlined"
							density="compact" prepend-inner-icon="mdi-bookshelf" class="book-selector"
							item-title="TenBoSach" item-value="BoSachID"></v-select>

						<v-select v-model="selectedKhoi" label="Chọn khối" :items="DSKhoi" item-title="name"
							item-value="id" variant="outlined" density="compact" />

						<v-select class="my-6" v-model="selectedMon" label="Chọn môn học" :items="DSMonHoc"
							item-title="MonHocName" item-value="MonHocID" variant="outlined" density="compact" />
					</div>

					<div class="book-list-container">
						<div class="book-list-header">
							<span class="list-title">Sách trong bộ</span>
						</div>

						<div class="book-list" v-if="DSHocLieu.length > 0">
							<div v-for="sach in DSHocLieu" :key="sach.HocLieuID" class="book-item"
								:class="{ 'active': selectedHocLieu && selectedHocLieu.HocLieuID === sach.HocLieuID }"
								@click="selectHocLieu(sach)">
								<div class="book-icon">
									<v-icon color="primary">mdi-book</v-icon>
								</div>
								<div class="book-info">
									<h4 class="book-title">{{ sach.TenHocLieu }}</h4>
									<!-- <p class="book-meta">{{ selectedBoSach }}</p> -->
									<p class="book-meta">{{ sach.TenBoSach }}</p>
								</div>
								<div class="book-status"
									v-if="selectedHocLieu && selectedHocLieu.HocLieuID === sach.HocLieuID">
									<v-icon color="success">mdi-check-circle</v-icon>
								</div>
							</div>
						</div>

						<div v-else class="empty-state">
							<v-icon size="40" color="grey-lighten-1">mdi-book-off-outline</v-icon>
							<p>Chưa có học liệu nào</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Main Editor -->
			<div class="editor-section">
				<!-- Selected Book Info -->
				<div class="selected-book-info" v-if="selectedHocLieu">
					<div class="book-badge">
						<v-icon class="badge-icon">mdi-book-open</v-icon>
						<div class="badge-content">
							<p class="selected-title">{{ selectedHocLieu.TenHocLieu }}</p>
							<p class="selected-meta">{{ selectedHocLieu.TenBoSach }} • Đang soạn thảo</p>
						</div>
					</div>
				</div>

				<!-- Tree Editor -->
				<div class="tree-editor">
					<div v-if="!selectedHocLieu" class="welcome-state">
						<div class="welcome-content">
							<v-icon size="80" color="primary" class="welcome-icon">mdi-file-tree</v-icon>
							<h3 class="welcome-title">Chào mừng đến với Trình soạn thảo</h3>
							<p class="welcome-description">
								Chọn một cuốn sách ở vùng phía trên để bắt đầu tạo và chỉnh sửa cấu trúc nội dung.
							</p>
							<v-btn color="primary" variant="outlined" size="large" @click="scrollToSidebar">
								<v-icon start>mdi-arrow-up</v-icon>
								Chọn học liệu
							</v-btn>
						</div>
					</div>

					<div v-else class="tree-content">
						<div class="tree-header">
							<div class="tree-stats">
								<span class="text-subtitle-2 font-weight-bold">Cấu trúc nội dung</span>
								<v-chip size="small" color="info" variant="flat">
									<v-icon start size="small">mdi-sitemap</v-icon>
									{{ getTreeStats() }} mục
								</v-chip>
							</div>
							<div class="tree-actions">
								<v-btn size="small" variant="text" color="primary" @click="refreshTree"
									:loading="isLoadingTree">
									<v-icon start>mdi-refresh</v-icon>
									Tải lại
								</v-btn>
								<v-btn size="small" variant="text" @click="collapseAll">
									<v-icon start>mdi-collapse-all</v-icon>
									Thu gọn
								</v-btn>
								<v-btn size="small" variant="text" @click="expandAll">
									<v-icon start>mdi-expand-all</v-icon>
									Mở rộng
								</v-btn>
							</div>
						</div>

						<div class="tree-container">
							<v-skeleton-loader v-if="isLoadingTree" type="list-item-two-line@5" class="tree-skeleton">
							</v-skeleton-loader>

							<uc-editable-treeview-v2 v-else :nodes="treeNoiDung"
								:hoc-lieu-id="selectedHocLieu.HocLieuID" :collapsed-node-ids="collapsedNodeIds"
								:drag-state="treeDragState" :key="treeKey" @update="onTreeUpdate"
								@add-new="onAddNewChild" @edit="onEditItem" @delete="onDeleteNode" />

							<div v-if="!isLoadingTree && treeNoiDung.length === 0" class="empty-tree">
								<v-icon size="64" color="grey-lighten-2">mdi-file-tree-outline</v-icon>
								<h4>Chưa có nội dung</h4>
								<p>Hãy thêm chương hoặc bài học đầu tiên</p>
								<v-btn color="primary" @click="addNewRootNode" class="mt-4">
									<v-icon start>mdi-plus</v-icon>
									Thêm mục đầu tiên
								</v-btn>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- THÊM: Tích hợp Dialog vào đây -->
		<uc-noi-dung-dialog v-model:is-open="isDialogOpen" :item="editingItem" @save="onSaveItem"
			@refresh-tree="fetchTreeNoiDung" @update-item="editingItem = $event" />
	</Global>
</template>

<script>
	export default {
		name: 'uc-main-layout',
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	props: ['khoiIdProp', 'monHocIdProp'],
	data() {
		return {
			vueData,
			selectedBoSach: null,
			DSHocLieu: [],
			selectedHocLieu: null,
			treeNoiDung: [],
			isLoadingTree: false,
			treeKey: 0,
			collapsedNodeIds: {},
			treeDragState: {
				info: null
			},
			// THÊM: State để quản lý dialog
			isDialogOpen: false,
			editingItem: null,
			selectedMon: null,
			selectedKhoi: null,
			DSBoSach: [],
			DSMonHoc: [],
			DSKhoi: [
				{ id: 0, name: "Mầm non", CapID: 0 },
				{ id: 1, name: "Khối 1" , CapID: 1},
				{ id: 2, name: "Khối 2" , CapID: 1},
				{ id: 3, name: "Khối 3" , CapID: 1},
				{ id: 4, name: "Khối 4" , CapID: 1},
				{ id: 5, name: "Khối 5" , CapID: 1},

				{ id: 6, name: "Khối 6" , CapID: 2},
				{ id: 7, name: "Khối 7" , CapID: 2},
				{ id: 8, name: "Khối 8" , CapID: 2},
				{ id: 9, name: "Khối 9" , CapID: 2},

				{ id: 10, name: "Khối 10" , CapID: 3},
				{ id: 11, name: "Khối 11" , CapID: 3},
				{ id: 12, name: "Khối 12" , CapID: 3},
			]
		}
	},
		mounted() {
			this.getDSBoSach()
		},
	watch: {
		selectedKhoi: function (selectedKhoi) {
			this.selectedMon = null
			this.selectedHocLieu = null
			this.DSHocLieu = []
			this.treeNoiDung = []
			if (selectedKhoi) this.getDSMonHoc()
		},
		selectedMon: function (selectedMon) {
			this.selectedHocLieu = null
			this.DSHocLieu = []
			this.treeNoiDung = []
			if (selectedMon) this.fetchHocLieu()
		}
	},
		methods: {
			notify(message, color = 'success') {
				this.snackbarRef?.value?.showSnackbar?.({ message, color });
			},
			async getDSBoSach() {
				const res = await fetchPromise('lms/FP_BoSach_GetList');
				this.DSBoSach = res ?? [];
				this.selectedBoSach = this.DSBoSach[0] ? this.DSBoSach[0].BoSachID : null;
			},
			async getDSMonHoc() {
				const capid = this.DSKhoi.find(x=> x.id == this.selectedKhoi)?.CapID
				const res = await fetchPromise('lms/MonHoc_Get_ByCapID', {CapID: capid});
				this.DSMonHoc = res ?? [];
		},
		getKhoiName(khoiId) {
			const khoi = this.DSKhoi.find(item => item.id === khoiId);
			return khoi ? khoi.name : '';
		},
		getMonName(monHocId) {
			const mon = this.DSMonHoc.find(item => item.MonHocID === monHocId);
			return mon ? (mon.MonHocName || mon.TenMonHoc_HienThi || mon.TenMonHoc || '') : '';
		},
			async fetchHocLieu() {
				const res = await fetchPromise('lms/FP_HocLieu_GetByLopMon', {
					KhoiID: this.selectedKhoi,
					MonHocID: this.selectedMon
				});
				this.DSHocLieu = res ?? [];
			},
		async selectHocLieu(sach) {

			this.selectedHocLieu = sach;
			this.isLoadingTree = true;
			this.collapsedNodeIds = {};
			await this.fetchTreeNoiDung();
			this.isLoadingTree = false;
			console.log("Cây đã được xây dựng xong:", this.treeNoiDung);
		},
			async fetchTreeNoiDung() {
				if (!this.selectedHocLieu) {
					throw new Error("Chưa chọn học liệu");
				}
				const res = await fetchPromise('lms/FP_NoiDung_GetTreeByHocLieu', {
					HocLieuID: this.selectedHocLieu.HocLieuID
				}, { forceRefresh: true });
				const flatList = Array.isArray(res?.[1]) ? res[1] : [];
				this.buildTree(flatList);
				this.treeKey += 1;
			},
			async refreshTree() {
				if (!this.selectedHocLieu) return;
				this.isLoadingTree = true;
				try {
					await this.fetchTreeNoiDung();
					this.notify("Tải lại cấu trúc thành công!");
				} catch (e) {
					console.error(e);
					this.notify("Tải lại thất bại!", "error");
				} finally {
					this.isLoadingTree = false;
				}
			},
		// HÀM MỚI: Mở dialog
		onOpenDialog(itemToEdit = null) {
				if (!this.selectedHocLieu) {
					this.notify("Vui lòng chọn một cuốn sách trước.", "warning");
					return;
				}

			if (itemToEdit) {
				// Trường hợp Sửa hoặc Thêm con
				// Nếu là thêm con, itemToEdit là node cha
				if (itemToEdit.parent) {
					this.editingItem = {
						HocLieuID: this.selectedHocLieu.HocLieuID,
						TenHocLieu: this.selectedHocLieu.TenHocLieu,
						ParentID: itemToEdit.parent.NoiDungID,
						LoaiNoiDung: 'BAI', // Mặc định
						ThuTu: itemToEdit.parent.children ? itemToEdit.parent.children.length : 0
					};
				} else { // Trường hợp sửa
					this.editingItem = itemToEdit;
				}
			} else {
				// Trường hợp Thêm mục gốc
				this.editingItem = {
					HocLieuID: this.selectedHocLieu.HocLieuID,
					TenHocLieu: this.selectedHocLieu.TenHocLieu,
					ParentID: null,
					LoaiNoiDung: 'CHUONG',
					ThuTu: this.treeNoiDung.length
				};
			}
			this.isDialogOpen = true;
		},
		escapeHtml(unsafeString) {
			if (typeof unsafeString !== 'string') {
				return '';
			}
			const element = document.createElement('div');
			element.textContent = unsafeString;
			return element.innerHTML;
		},

		onEditItem(itemToEdit) {
			if (!itemToEdit) return;
			console.log("Chỉnh sửa node:", itemToEdit);
			this.editingItem = { ...itemToEdit, TenHocLieu: this.selectedHocLieu.TenHocLieu }; // Gán item cần sửa
			this.isDialogOpen = true;
		},

		// HÀM MỚI: Chỉ để mở dialog khi THÊM MỤC GỐC
		onAddNewRoot() {
			if (!this.selectedHocLieu) return;
			console.log("Thêm mục gốc mới...");
			this.editingItem = {
				HocLieuID: this.selectedHocLieu.HocLieuID,
				TenHocLieu: this.selectedHocLieu.TenHocLieu,
				ParentID: null,
				LoaiNoiDung: 'CHUONG',
				ThuTu: this.treeNoiDung.length
			};
			this.isDialogOpen = true;
		},

		// HÀM MỚI: Chỉ để mở dialog khi THÊM MỤC CON
		onAddNewChild(parentNode) {
			if (!parentNode) return;
			console.log("Thêm node con cho:", parentNode);
			this.editingItem = {
				HocLieuID: this.selectedHocLieu.HocLieuID,
				TenHocLieu: this.selectedHocLieu.TenHocLieu,
				ParentID: parentNode.NoiDungID,
				LoaiNoiDung: 'BAI',
				ThuTu: parentNode.children ? parentNode.children.length : 0
			};
			this.isDialogOpen = true;
		},

		// HÀM MỚI: Xử lý sự kiện save từ dialog
			async onSaveItem(item) {
				console.log("Dữ liệu nhận từ dialog để lưu:", item);
				item.ParentID = item.ParentID ?? 0
				const res = await fetchPromise('lms/FP_NoiDung_Save', item, { cache: false });
				if (res?.[0] || res) {
					this.notify("Đã lưu thành công!");
					if (res[0]) {
						this.editingItem = res[0];
					}
					this.fetchTreeNoiDung();
				} else {
					this.notify("Lưu thất bại!", "error");
				}
			},

		// HÀM MỚI: Xử lý sự kiện delete từ cây
			async onDeleteNode(node) {
				console.log('node', node)
				const ok = await this.confirmRef.value.show({
					title: `Bạn có chắc chắn muốn xóa mục "${node.TenNoiDung}" và tất cả các mục con của nó?`
				});
				if (!ok) return;
				await fetchPromise('lms/FP_NoiDung_Delete', { NoiDungID: node.NoiDungID }, { cache: false });
				this.notify("Đã xóa thành công!");
				this.fetchTreeNoiDung();
		},
		buildTree(flatList) {
			if (!flatList || flatList.length === 0) { this.treeNoiDung = []; return; }
			const nodeMap = {};
			const roots = [];
			flatList.forEach(item => { nodeMap[item.NoiDungID] = { ...item, children: [] }; });
			Object.values(nodeMap).forEach(node => {
				if (node.ParentID && nodeMap[node.ParentID]) {
					nodeMap[node.ParentID].children.push(node);
				} else { roots.push(node); }
			});
			const sortNodes = (nodes) => {
				if (!nodes) return;
				nodes.sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0));
				nodes.forEach(node => { if (node.children.length > 0) sortNodes(node.children); });
			};
			sortNodes(roots);
			this.treeNoiDung = roots;
		},
		addNewRootNode() {
			console.log("Thêm mục gốc mới...");
			this.onOpenDialog();
		},
			async onTreeUpdate(newTree) {
			console.log("Cấu trúc cây mới:", newTree);
			this.treeNoiDung = newTree; // Fix: sử dụng newTree thay vì newNodes

			const dataToUpdate = [];
			const flatten = (nodes, parentId) => {
				nodes.forEach((node, index) => {
					dataToUpdate.push({
						id: node.NoiDungID,
						order: index,
						parent: parentId
					});
					if (node.children && node.children.length > 0) {
						flatten(node.children, node.NoiDungID);
					}
				});
			};
			flatten(newTree, null);

			console.log("Dữ liệu gửi lên API UpdateTreeStructure:", JSON.stringify(dataToUpdate));
				await fetchPromise('lms/FP_NoiDung_UpdateTreeStructure', { JsonData: JSON.stringify(dataToUpdate) }, { cache: false });
				console.log("Cập nhật thành công!");
		},
		getTreeStats() {
			const countNodes = (nodes) => nodes.reduce((count, node) => count + 1 + (node.children ? countNodes(node.children) : 0), 0);
			return countNodes(this.treeNoiDung);
		},
		scrollToSidebar() {
			const filterPanel = document.querySelector('.filter-panel');
			if (filterPanel) filterPanel.scrollIntoView({ behavior: 'smooth' });
		},
		collapseAll() {
			const collapsed = {};
			const markNodesWithChildren = (nodes) => {
				nodes.forEach(node => {
					if (node.children && node.children.length > 0) {
						collapsed[node.NoiDungID] = true;
						markNodesWithChildren(node.children);
					}
				});
			};
			markNodesWithChildren(this.treeNoiDung);
			this.collapsedNodeIds = collapsed;
		},
		expandAll() {
			this.collapsedNodeIds = {};
		},
		addNewChildNode(node) {
			console.log("Thêm node con cho:", node);
			this.onOpenDialog(node);
		},
		editNode(node) {
			console.log("Chỉnh sửa node:", node);
			this.onOpenDialog(node);
		},
		deleteNode(node) {
			console.log("Xóa node:", node);
			this.onOpenDialog(node);
		}

	}
	}
</script>