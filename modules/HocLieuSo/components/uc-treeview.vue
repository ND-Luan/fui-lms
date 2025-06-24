<!-- === uc-treeview (Phiên bản tương thích tuyệt đối) === -->
<template>
  <div class="course-accordion-level" :class="'level-' + depth">
    <div v-for="(node, index) in items" :key="node.HocLieuID" class="node-wrapper">
      <!-- 
        SỬA LỖI: Gán class trực tiếp, chỉ binding class 'is-active'
        Dùng class của chính node đó (node.LoaiHocLieu)
      -->
      <div class="node-item"
        :class="[ node.LoaiHocLieu ? 'type-' + node.LoaiHocLieu.toLowerCase() : '', { 'is-active': isActive(node) } ]"
        @click="handleClick(node)">
        <div class="toggle-icon-wrapper" @click.stop="toggle(node)">
          <v-icon v-if="hasChildren(node)" class="toggle-icon">
            {{ isNodeOpen(node) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
          </v-icon>
        </div>
        <v-icon class="node-type-icon" :color="getLessonIcon(node.LoaiHocLieu).color">
          {{ getLessonIcon(node.LoaiHocLieu).icon }}
        </v-icon>
        <span class="node-title">{{ node.TenHocLieu }}</span>
      </div>

      <div v-if="hasChildren(node) && isNodeOpen(node)" class="children-container">
        <!-- SỬA LỖI: Truyền `depth` vào như một prop bình thường -->
        <uc-treeview :items="node.children" :depth="depth + 1" :on-node-click="onNodeClick" :selected-id="selectedId" />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
  name: 'uc-treeview',
  props: {
    items: { type: Array, default: () => [] },
    depth: { type: Number, default: 0 },
    onNodeClick: { type: Function, default: () => {} },
    selectedId: { type: [Number, String], default: null }
  },
  methods: {
    hasChildren(node) {
      return node.children && node.children.length > 0;
    },
    isNodeOpen(node) {
      // Mặc định mở 2 cấp đầu tiên (depth 0 và 1)
      return typeof node.isOpen === 'undefined' ? (this.depth < 2) : node.isOpen;
    },
    toggle(node) {
      if (typeof node.isOpen === 'undefined') {
        node.isOpen = false; 
      } else {
        node.isOpen = !node.isOpen;
      }
    },
    handleClick(node) {
      if (this.onNodeClick) {
        this.onNodeClick(node);
      }
    },
    isActive(node) {
      return this.selectedId === node.HocLieuID;
    },
    getLessonIcon(loaiHocLieu) {
        switch((loaiHocLieu || '').toUpperCase()) {
            case 'CHUONG': return { icon: 'mdi-folder-outline', color: '#546e7a' };
            case 'BAI': return { icon: 'mdi-notebook-outline', color: '#039be5' };
            case 'VIDEO': return { icon: 'mdi-play-circle-outline', color: '#e53935' };
            case 'HTML': return { icon: 'mdi-xml', color: '#43a047' };
            case 'TAILIEU': return { icon: 'mdi-file-document-outline', color: '#fb8c00' };
            case 'INTERACTIVE': return { icon: 'mdi-puzzle-outline', color: '#5e35b1' };
            default: return { icon: 'mdi-bookmark-outline', color: '#757575' };
        }
    }
  }
}
</script>
