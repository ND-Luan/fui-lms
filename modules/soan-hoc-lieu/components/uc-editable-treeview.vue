<template>
    <div class="editable-tree" :style="{'padding-left': depth > 0 ? '20px' : '0px'}">
        <div v-for="node in items" :key="node.HocLieuID" class="node-wrapper">
            <div class="node-item" :class="{ 'is-active': isActive(node) }" @click="handleClick(node)">
                <div class="node-info">
                    <v-icon class="node-icon">{{ getIcon(node.LoaiHocLieu) }}</v-icon>
                    <span class="node-title">({{node.ThuTu}}) {{ node.TenHocLieu }}</span>
                </div>
                <div class="node-actions">
                    <v-tooltip text="Thêm mục con">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" icon size="x-small" variant="text" @click.stop="handleAddChild(node)">
                                <v-icon color="green">mdi-plus-box-outline</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip text="Xóa mục này">
                         <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" icon size="x-small" variant="text" @click.stop="handleDeleteNode(node)">
                                <v-icon color="red">mdi-delete-outline</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </div>
            </div>
            <div v-if="node.children && node.children.length > 0" class="children-container">
                <uc-editable-treeview 
                    :items="node.children" 
                    :depth="depth + 1" 
                    :selected-id="selectedId"
                    :on-node-click="onNodeClick"
                    :on-add-child="onAddChild"
                    :on-delete-node="onDeleteNode"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'uc-editable-treeview',
    props: {
        items: { type: Array, default: () => [] },
        depth: { type: Number, default: 0 },
        selectedId: { type: [Number, String], default: null },
        onNodeClick: { type: Function, default: () => {} },
        onAddChild: { type: Function, default: () => {} },
        onDeleteNode: { type: Function, default: () => {} }
    },
    methods: {
        handleClick(node) { 
            if (this.onNodeClick) this.onNodeClick(node);
        },
        handleAddChild(node) {
            if (this.onAddChild) this.onAddChild(node);
        },
        handleDeleteNode(node) {
            if (this.onDeleteNode) this.onDeleteNode(node);
        },
        isActive(node) { return this.selectedId === node.HocLieuID; },
        getIcon(loai) {
            switch((loai || '').toUpperCase()) {
                case 'CHUONG': return 'mdi-folder-outline';
                case 'BAI': return 'mdi-notebook-outline';
                case 'VIDEO': return 'mdi-play-circle-outline';
                case 'HTML': return 'mdi-language-html5';
                case 'TAILIEU': return 'mdi-file-document-outline';
                case 'INTERACTIVE': return 'mdi-xml';
                default: return 'mdi-bookmark-outline';
            }
        }
    }
}
</script>

<style scoped>
.node-wrapper { border-left: 1px solid #e0e0e0; }
.node-wrapper:last-child { border-left-color: transparent; }
.node-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; margin-top: 4px; border-radius: 4px; }
.node-item:hover { background-color: #f5f5f5; }
.node-item.is-active { background-color: #e3f2fd; border: 1px solid #90caf9; }
.node-info { display: flex; align-items: center; cursor: pointer; flex-grow: 1; }
.node-icon { margin-right: 8px; color: #546e7a; }
.node-title { font-size: 0.95rem; }
.node-actions { display: none; }
.node-item:hover .node-actions { display: flex; align-items: center; }
</style>