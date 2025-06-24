<!-- === uc-soan-hoc-lieu-view === -->
<template>
	<div class="layout-container">
		<!-- Header Section -->
		<div class="header-section">
			<div class="header-content">
				<div class="header-info">
					<h2 class="page-title">
						<v-icon class="title-icon">mdi-book-open-page-variant</v-icon>
						Soạn thảo Học liệu
					</h2>
					<p class="page-subtitle">Quản lý cấu trúc nội dung và tổ chức bài học</p>
				</div>
				<div class="header-actions" v-if="selectedHocLieu">
					<v-btn color="primary" variant="elevated" size="large" @click="addNewRootNode" class="add-root-btn">
						<v-icon start>mdi-plus-circle</v-icon>
						Thêm mục gốc
					</v-btn>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="main-content">
			<!-- Sidebar - Book Selection -->
			<div class="sidebar">
				<div class="sidebar-card">
					<div class="sidebar-header">
						<v-icon class="sidebar-icon">mdi-library-books</v-icon>
						<h3 class="sidebar-title">Chọn Học Liệu</h3>
					</div>

					<div class="book-selection">
						<v-select label="Bộ sách" :items="['Kết nối tri thức', 'Chân trời sáng tạo']"
							v-model="selectedBoSach" variant="outlined" density="comfortable"
							prepend-inner-icon="mdi-bookshelf" class="book-selector"></v-select>

						<div class="book-list-container">
							<div class="book-list-header">
								<span class="list-title">Sách trong bộ</span>
								<v-chip size="small" color="primary" variant="flat">{{ DSHocLieu.length }}</v-chip>
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
										<p class="book-meta">{{ selectedBoSach }}</p>
									</div>
									<div class="book-status"
										v-if="selectedHocLieu && selectedHocLieu.HocLieuID === sach.HocLieuID">
										<v-icon color="success">mdi-check-circle</v-icon>
									</div>
								</div>
							</div>

							<div v-else class="empty-state">
								<v-icon size="48" color="grey-lighten-1">mdi-book-off-outline</v-icon>
								<p>Chưa có học liệu nào</p>
							</div>
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
							<h3 class="selected-title">{{ selectedHocLieu.TenHocLieu }}</h3>
							<p class="selected-meta">{{ selectedBoSach }} • Đang soạn thảo</p>
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
								Chọn một cuốn sách từ danh sách bên trái để bắt đầu tạo và chỉnh sửa cấu trúc nội dung.
							</p>
							<v-btn color="primary" variant="outlined" size="large" @click="scrollToSidebar">
								<v-icon start>mdi-arrow-left</v-icon>
								Chọn học liệu
							</v-btn>
						</div>
					</div>

					<div v-else class="tree-content">
						<div class="tree-header">
							<div class="tree-stats">
								<v-chip size="small" color="info" variant="flat">
									<v-icon start size="small">mdi-sitemap</v-icon>
									{{ getTreeStats() }} mục
								</v-chip>
							</div>
							<div class="tree-actions">
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
								:hoc-lieu-id="selectedHocLieu.HocLieuID" @update="onTreeUpdate"
								@add-new="addNewChildNode" @edit="editNode" @delete="deleteNode" :key="treeKey"
								class="tree-view" />

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
		<uc-noi-dung-dialog v-model:is-open="isDialogOpen" :item="editingItem" @save="onSaveItem" />
	</div>

</template>

<script>
	export default {
	    name: 'uc-soan-hoc-lieu-view',
	    props: ['khoiIdProp', 'monHocIdProp'],
	    data() {
	        return {
	            selectedBoSach: 'Kết nối tri thức',
	            DSHocLieu: [],
	            selectedHocLieu: null,
	            treeNoiDung: [],
	            isLoadingTree: false,
	            treeKey: 0,
	            // THÊM: State để quản lý dialog
	            isDialogOpen: false,
	            editingItem: null
	        }
	    },
	    mounted() {
	        this.fetchHocLieu();
	    },
	    methods: {
	        fetchHocLieu() {
	            ajaxCALL('lms/FP_HocLieu_GetByLopMon', {
	                KhoiID: this.khoiIdProp,
	                MonHocID: this.monHocIdProp
	            }, (res) => {
	                if (res && res.data) {
	                    this.DSHocLieu = res.data;
	                }
	            });
	        },
	        async selectHocLieu(sach) {
	            this.selectedHocLieu = sach;
	            this.isLoadingTree = true;
	            await this.fetchTreeNoiDung();
	            this.isLoadingTree = false;
	            console.log("Cây đã được xây dựng xong:", this.treeNoiDung);
	        },
	        fetchTreeNoiDung() {
	            return new Promise((resolve, reject) => {
	                if (!this.selectedHocLieu) {
	                    return reject("Chưa chọn học liệu");
	                }
	                ajaxCALL('lms/FP_NoiDung_GetTreeByHocLieu', { HocLieuID: this.selectedHocLieu.HocLieuID }, (res) => {
	                    if (res && res.data && res.data.length > 1) {
	                        const flatList = res.data[1] || [];
	                        this.buildTree(flatList);
	                        this.treeKey += 1;
	                        resolve();
	                    } else {
	                        this.treeNoiDung = [];
	                        reject("Dữ liệu API không hợp lệ");
	                    }
	                });
	            });
	        },
	        // HÀM MỚI: Mở dialog
	        onOpenDialog(itemToEdit = null) {
	            if (!this.selectedHocLieu) {
	                Vue.$toast.warning("Vui lòng chọn một cuốn sách trước.");
	                return;
	            }
	
	            if (itemToEdit) {
	                // Trường hợp Sửa hoặc Thêm con
	                // Nếu là thêm con, itemToEdit là node cha
	                if (itemToEdit.parent) {
	                    this.editingItem = {
	                        HocLieuID: this.selectedHocLieu.HocLieuID,
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
	                    ParentID: null,
	                    LoaiNoiDung: 'CHUONG',
	                    ThuTu: this.treeNoiDung.length
	                };
	            }
	            this.isDialogOpen = true;
	        },
	
	        // HÀM MỚI: Xử lý sự kiện save từ dialog
	        onSaveItem(item) {
	            console.log("Dữ liệu nhận từ dialog để lưu:", item);
	            ajaxCALL('lms/FP_NoiDung_Save', item, (res) => {
	                if (res.data && res.data[0]) {
	                    Vue.$toast.success("Đã lưu thành công!");
	                    this.fetchTreeNoiDung(); // Tải lại cây để cập nhật
	                } else {
	                    Vue.$toast.error("Lưu thất bại!");
	                }
	            });
	        },
	
	        // HÀM MỚI: Xử lý sự kiện delete từ cây
	        onDeleteNode(node) {
	            CONFIRM(`Bạn có chắc chắn muốn xóa mục "${node.TenNoiDung}" và tất cả các mục con của nó?`, () => {
	                ajaxCALL('lms/FP_NoiDung_Delete', { NoiDungID: node.NoiDungID }, (res) => {
	                    Vue.$toast.success("Đã xóa thành công!");
	                    this.fetchTreeNoiDung();
	                });
	            });
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
	        onTreeUpdate(newTree) {
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
	            ajaxCALL('lms/FP_NoiDung_UpdateTreeStructure', { JsonData: JSON.stringify(dataToUpdate) }, (res) => {
	                // Vue.$toast.success("Đã cập nhật cấu trúc cây!");
	                console.log("Cập nhật thành công!");
	            });
	        },
	        getTreeStats() {
	            const countNodes = (nodes) => nodes.reduce((count, node) => count + 1 + (node.children ? countNodes(node.children) : 0), 0);
	            return countNodes(this.treeNoiDung);
	        },
	        scrollToSidebar() {
	            const sidebar = document.querySelector('.sidebar');
	            if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth' });
	        },
	        collapseAll() {
	            console.log("Thu gọn tất cả");
	        },
	        expandAll() {
	            console.log("Mở rộng tất cả");
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

<style scoped>

</style>