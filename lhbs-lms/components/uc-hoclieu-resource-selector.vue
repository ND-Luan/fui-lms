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
		<v-select v-if="selectedHocLieuID" v-model="selectedNoiDungID" :items="nodeItems"
			item-title="displayName" item-value="NoiDungID" label="Chọn bài trong học liệu" clearable
			density="compact" variant="outlined" :loading="isLoadingTree" hide-details="auto" />
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
				this.nodeItems = this.flattenBaiNodes(this.rows(response))
				this.isLoadingTree = false
			})
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
			const hocLieu = this.hocLieuItems.find(item => item.HocLieuID === this.selectedHocLieuID)
			const node = this.nodeItems.find(item => item.NoiDungID === this.selectedNoiDungID)
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
