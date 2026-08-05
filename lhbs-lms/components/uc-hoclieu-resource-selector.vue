<template>
	<v-card variant="tonal" color="primary" class="pa-3 mb-3">
		<div class="d-flex align-center ga-2 mb-2">
			<v-icon size="small">mdi-file-tree-outline</v-icon>
			<span class="text-subtitle-2 font-weight-medium">Gắn vào học liệu số</span>
			<v-spacer />
			<v-chip v-if="isLinked" size="x-small" color="success" variant="flat">Đã gắn</v-chip>
		</div>
		<div class="text-caption text-medium-emphasis mb-2">
			Tùy chọn. Chỉ hiển thị học liệu số loại HOC_LIEU.
		</div>
		<v-select v-model="selectedHocLieuID" :items="hocLieuItems" item-title="TenHocLieu"
			item-value="HocLieuID" label="Chọn học liệu số" clearable density="compact" variant="outlined"
			:loading="isLoadingHocLieu" :disabled="!khoiId || !monHocId" hide-details="auto" />
		<div v-if="selectedHocLieuID" class="mt-2">
			<div class="text-caption font-weight-medium mb-1">Chọn bài trong cấu trúc học liệu</div>
			<v-list v-if="!isLoadingTree && treeNodes.length" density="compact" class="border rounded">
				<v-list-item v-for="node in visibleTreeItems" :key="node.NoiDungID"
					:class="{ 'bg-primary-lighten-5': String(selectedNoiDungID) === String(node.NoiDungID) }"
					:style="{ paddingLeft: (node.level * 16 + 8) + 'px' }" class="px-2">
					<template #prepend>
						<v-btn v-if="node.children.length" icon size="x-small" variant="text"
							@click.stop="toggleNode(node)">
							<v-icon>{{ isExpanded(node) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
						</v-btn>
						<span v-else class="tree-indent" />
					</template>
					<v-list-item-title class="text-body-2">{{ node.TenNoiDung }}</v-list-item-title>
					<template #append>
						<v-btn v-if="node.LoaiNoiDung === 'BAI'" size="x-small"
							:variant="String(selectedNoiDungID) === String(node.NoiDungID) ? 'flat' : 'outlined'"
							color="primary" @click.stop="selectNode(node)">
							{{ String(selectedNoiDungID) === String(node.NoiDungID) ? 'Đã chọn' : 'Chọn' }}
						</v-btn>
						<v-chip v-else size="x-small" variant="text" color="grey">{{ node.LoaiNoiDung }}</v-chip>
					</template>
				</v-list-item>
			</v-list>
			<div v-else-if="isLoadingTree" class="text-caption text-medium-emphasis pa-2">
				Đang tải cấu trúc học liệu...
			</div>
		</div>
		<div v-if="selectedHocLieuID && !nodeItems.length && !isLoadingTree" class="text-caption text-warning mt-1">
			Học liệu này chưa có node loại BAI để liên kết.
		</div>
	</v-card>
</template>

<script>
export default {
	name: 'uc-hoclieu-resource-selector',
	props: {
		modelValue: { type: Object, default: () => ({}) },
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
			expandedNodeIDs: [],
			selectedHocLieuID: null,
			selectedNoiDungID: null,
			isLoadingHocLieu: false,
			isLoadingTree: false,
			initialized: false,
		}
	},
	computed: {
		isLinked() {
			return !!(this.selectedHocLieuID && this.selectedNoiDungID)
		},
		visibleTreeItems() {
			const result = []
			const walk = (nodes, level) => {
				(nodes || []).forEach(node => {
					result.push({ ...node, level })
					if (node.children.length && this.isExpanded(node)) walk(node.children, level + 1)
				})
			}
			walk(this.treeNodes, 0)
			return result
		},
	},
	watch: {
		khoiId: 'loadHocLieu',
		monHocId: 'loadHocLieu',
		resourceId: {
			handler() { this.loadMapping() },
			immediate: true,
		},
		selectedHocLieuID(newValue) {
			this.selectedNoiDungID = null
			this.nodeItems = []
			this.treeNodes = []
			this.expandedNodeIDs = []
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
			ajaxCALL('lms/FP_HocLieu_GetByLopMon', {
				KhoiID: this.khoiId,
				MonHocID: this.monHocId,
			}, response => {
				this.hocLieuItems = this.rows(response)
				this.isLoadingHocLieu = false
			})
		},
		loadTree(hocLieuID) {
			this.isLoadingTree = true
			ajaxCALL('lms/FP_NoiDung_GetTreeByHocLieu', { HocLieuID: hocLieuID }, response => {
				const nodes = this.rows(response)
				this.nodeItems = this.flattenBaiNodes(nodes)
				this.treeNodes = this.buildTree(nodes)
				this.expandedNodeIDs = this.getExpandableIDs(this.treeNodes)
				this.isLoadingTree = false
			})
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
				if (node.children.length) {
					ids.push(node.NoiDungID)
					walk(node.children)
				}
			})
			walk(nodes)
			return ids
		},
		isExpanded(node) {
			return this.expandedNodeIDs.some(id => String(id) === String(node.NoiDungID))
		},
		toggleNode(node) {
			const id = node.NoiDungID
			this.expandedNodeIDs = this.isExpanded(node)
				? this.expandedNodeIDs.filter(item => String(item) !== String(id))
				: [...this.expandedNodeIDs, id]
		},
		selectNode(node) {
			if (node.LoaiNoiDung !== 'BAI') return
			this.selectedNoiDungID = node.NoiDungID
		},
		flattenBaiNodes(nodes) {
			const byId = Object.fromEntries((nodes || []).map(node => [node.NoiDungID, node]))
			return (nodes || []).filter(node => node.LoaiNoiDung === 'BAI').map(node => {
				const path = []
				let current = node
				while (current) {
					path.unshift(current.TenNoiDung)
					current = byId[current.ParentID]
				}
				return { ...node, displayName: path.join(' → ') }
			})
		},
		loadMapping() {
			if (!this.resourceId || Number(this.resourceId) <= 0) return
			ajaxCALL('lms/EL_HocLieuResource_Get', {
				ResourceType: this.resourceType,
				ResourceID: this.resourceId,
			}, response => {
				const item = this.rows(response)[0]
				if (!item) return
				this.selectedHocLieuID = item.HocLieuID
				this.selectedNoiDungID = item.NoiDungID
				if (item.HocLieuID) this.loadTree(item.HocLieuID)
			})
		},
		emitValue() {
			const hocLieu = this.hocLieuItems.find(item => String(item.HocLieuID) === String(this.selectedHocLieuID))
			const node = this.nodeItems.find(item => String(item.NoiDungID) === String(this.selectedNoiDungID))
			this.$emit('update:modelValue', {
				HocLieuID: this.selectedHocLieuID || null,
				NoiDungID: this.selectedNoiDungID || null,
				TenHocLieu: hocLieu?.TenHocLieu || this.modelValue?.TenHocLieu || '',
				TenNoiDung: node?.displayName || this.modelValue?.TenNoiDung || '',
			})
		},
	},
}
</script>
