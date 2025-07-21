<template>
  <v-card flat>
    <v-card-title>Nội dung bài giảng</v-card-title>
    <v-card-text>
      <div v-if="!elements || elements.length === 0" class="text-center text-grey pa-10 border-dashed">
        <v-icon size="48">mdi-text-box-plus-outline</v-icon>
        <p class="mt-4">Hãy thêm nội dung từ cột bên trái</p>
      </div>
      <!-- Chúng ta sẽ dùng thư viện kéo thả sau, giờ dùng list đơn giản -->
      <v-list>
        <v-list-item
          v-for="(element, index) in elements"
          :key="element.ElementID || 'new-' + index"
          :active="selectedElement && selectedElement.ElementID === element.ElementID"
          @click="$emit('elementSelect', element)"
          class="mb-2 border rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-drag-vertical</v-icon>
          </template>
          
          <v-list-item-title>{{ element.ElementType }} - {{ getElementTitle(element) }}</v-list-item-title>
          
          <template v-slot:append>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click.stop="$emit('elementDelete', element)"></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: 'uc-lesson-canvas',
  props: {
    elements: { type: Array, default: () => [] },
    selectedElement: { type: Object, default: null }
  },
  emits: ['elementSelect', 'elementDelete'],
  methods: {
    getElementTitle(element) {
      try {
        const data = JSON.parse(element.ElementData);
        return data.title || data.question || 'Nội dung...';
      } catch (e) {
        return 'Nội dung...';
      }
    }
  }
}
</script>
<style scoped>
  .border-dashed {
    border: 2px dashed #ccc;
    border-radius: 8px;
  }
</style>