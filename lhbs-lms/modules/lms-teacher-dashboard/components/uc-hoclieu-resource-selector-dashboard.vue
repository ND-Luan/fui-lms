<template>
	<div>
		<v-btn v-if="!isPanelOpen" block variant="tonal" color="primary" class="mb-3" @click="isPanelOpen = true">
			<v-icon start>mdi-file-tree-outline</v-icon>
			Gắn vào học liệu số
			<v-chip v-if="isLinked" size="x-small" color="success" variant="flat" class="ms-2">Đã gắn</v-chip>
		</v-btn>
		<v-card v-else variant="tonal" color="primary" class="pa-3 mb-3">
			<div class="d-flex align-center ga-2 mb-2">
				<v-icon size="small">mdi-file-tree-outline</v-icon>
				<span class="text-subtitle-2 font-weight-medium">Gắn vào học liệu số</span>
				<v-spacer />
				<v-chip v-if="isLinked" size="x-small" color="success" variant="flat">Đã gắn</v-chip>
				<v-btn icon="mdi-close" size="x-small" variant="text" aria-label="Đóng học liệu số" @click="isPanelOpen = false" />
			</div>
			<div class="text-caption text-medium-emphasis mb-2">Tùy chọn. Chỉ hiển thị học liệu số loại HOC_LIEU.</div>
			<v-select v-model="selectedHocLieuID" :items="hocLieuItems" item-title="TenHocLieu" item-value="HocLieuID"
				label="Chọn học liệu số" clearable density="compact" variant="outlined" :loading="isLoadingHocLieu"
				:disabled="!khoiId || !monHocId" hide-details="auto" />
			<div v-if="selectedHocLieuID" class="mt-2">
				<div class="text-caption font-weight-medium mb-1">Chọn bài trong cấu trúc học liệu</div>
				<v-treeview v-if="!isLoadingTree && treeNodes.length" v-model:opened="openedTreeNodeIDs" :items="treeNodes"
					item-title="TenNoiDung" item-value="NoiDungID" item-children="children" open-all density="compact"
					color="primary" class="border rounded pa-2" style="max-height: 360px; overflow-y: auto">
					<template v-slot:label="{ item }">
						<div class="d-flex align-center ga-2" @click.stop="toggleNodeSelection(item)">
							<v-checkbox-btn :model-value="isNodeSelected(item)" @update:model-value="toggleNodeSelection(item)"
								@click.stop color="primary" />
							<span>{{ item.TenNoiDung }}</span>
						</div>
					</template>
				</v-treeview>
				<div v-else-if="isLoadingTree" class="text-caption text-medium-emphasis pa-2">Đang tải cấu trúc học liệu...</div>
			</div>
			<div v-if="selectedHocLieuID && !nodeItems.length && !isLoadingTree" class="text-caption text-warning mt-1">
				Học liệu này chưa có node CHUONG, BAI hoặc NHOM_KY_NANG để liên kết.
			</div>
		</v-card>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: { type: Object, default: function () { return {} } },
		khoiId: { type: [Number, String], default: null },
		monHocId: { type: [Number, String], default: null },
		resourceType: { type: String, default: 'LESSON' },
		resourceId: { type: [Number, String], default: 0 },
	},
	emits: ['update:modelValue'],
	data() {
		return {
			hocLieuItems: [],
			nodeItems: [],
			treeNodes: [],
			openedTreeNodeIDs: [],
			selectedHocLieuID: null,
			selectedNoiDungID: null,
			isPanelOpen: false,
			isLoadingHocLieu: false,
			isLoadingTree: false,
		}
	},
	computed: {
		isLinked() {
			return !!(this.selectedHocLieuID && this.selectedNoiDungID)
		},
	},
	watch: {
		khoiId() { this.loadHocLieu() },
		monHocId() { this.loadHocLieu() },
		resourceId() { this.loadMapping() },
		selectedHocLieuID(newValue) {
			this.selectedNoiDungID = null
			this.nodeItems = []
			this.treeNodes = []
			this.openedTreeNodeIDs = []
			if (newValue) this.loadTree(newValue)
			this.emitValue()
		},
		selectedNoiDungID() { this.emitValue() },
	},
	mounted() {
		this.loadHocLieu()
		this.loadMapping()
	},
	methods: {
		rows(response) {
			const value = response?.data ?? response ?? []
			if (Array.isArray(value?.[1])) return value[1]
			return Array.isArray(value) ? value : [value]
		},
		loadHocLieu() {
			if (!this.khoiId || !this.monHocId) {
				this.hocLieuItems = []
				return
			}
			this.isLoadingHocLieu = true
			ajaxCALL('lms/FP_HocLieu_GetByLopMon', { KhoiID: this.khoiId, MonHocID: this.monHocId }, response => {
				this.hocLieuItems = this.rows(response)
				this.isLoadingHocLieu = false
			})
		},
		loadMapping() {
			if (!this.resourceId || Number(this.resourceId) <= 0) return
			ajaxCALL('lms/EL_HocLieuResource_Get', { ResourceType: this.resourceType, ResourceID: this.resourceId }, response => {
				const item = this.rows(response)[0]
				if (!item) return
				this.selectedHocLieuID = item.HocLieuID
				this.selectedNoiDungID = item.NoiDungID
				this.isPanelOpen = true
			})
		},
		loadTree(hocLieuID) {
			this.isLoadingTree = true
			ajaxCALL('lms/FP_NoiDung_GetTreeByHocLieu', { HocLieuID: hocLieuID }, response => {
				const nodes = this.rows(response).filter(node => this.isLinkableNode(node))
				this.nodeItems = this.flattenNodes(nodes)
				this.treeNodes = this.buildTree(nodes)
				this.openedTreeNodeIDs = this.getExpandableIDs(this.treeNodes)
				this.isLoadingTree = false
			})
		},
		isLinkableNode(node) {
			return ['CHUONG', 'BAI', 'NHOM_KY_NANG'].includes(node?.LoaiNoiDung)
		},
		flattenNodes(nodes) {
			return (nodes || []).filter(node => this.isLinkableNode(node))
		},
		buildTree(nodes) {
			const byId = Object.fromEntries((nodes || []).map(node => [node.NoiDungID, { ...node, children: [] }]))
			const roots = []
			Object.values(byId).forEach(node => {
				if (node.ParentID && byId[node.ParentID]) byId[node.ParentID].children.push(node)
				else roots.push(node)
			})
			const sortNodes = list => {
				list.sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0))
				list.forEach(node => sortNodes(node.children))
			}
			sortNodes(roots)
			return roots
		},
		getExpandableIDs(nodes) {
			const ids = []
			const walk = list => (list || []).forEach(node => {
				if (node.children.length) { ids.push(node.NoiDungID); walk(node.children) }
			})
			walk(nodes)
			return ids
		},
		isNodeSelected(node) {
			return String(node?.NoiDungID) === String(this.selectedNoiDungID)
		},
		toggleNodeSelection(node) {
			if (!node || !this.isLinkableNode(node)) return
			this.selectedNoiDungID = this.isNodeSelected(node) ? null : node.NoiDungID
		},
		emitValue() {
			const hocLieu = this.hocLieuItems.find(item => String(item.HocLieuID) === String(this.selectedHocLieuID))
			const node = this.nodeItems.find(item => String(item.NoiDungID) === String(this.selectedNoiDungID))
			this.$emit('update:modelValue', {
				HocLieuID: this.selectedHocLieuID || null,
				NoiDungID: this.selectedNoiDungID || null,
				TenHocLieu: hocLieu?.TenHocLieu || this.modelValue?.TenHocLieu || '',
				TenNoiDung: node?.TenNoiDung || this.modelValue?.TenNoiDung || '',
			})
		},
	},
}
</script>
