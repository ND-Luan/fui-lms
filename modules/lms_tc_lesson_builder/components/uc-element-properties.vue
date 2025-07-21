<template>
  <v-card flat>
    <v-card-title>Thuộc tính</v-card-title>
    <v-card-text v-if="!element">
      <p class="text-grey text-center">Chọn một nội dung để chỉnh sửa</p>
    </v-card-text>
    <v-card-text v-else>
      <v-text-field label="Loại nội dung" :model-value="element.ElementType" readonly disabled></v-text-field>
      <v-textarea 
        label="Dữ liệu (JSON)"
        :model-value="formattedData"
        @update:model-value="updateData"
        rows="15"
        auto-grow
        :error-messages="jsonError"
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: 'uc-element-properties',
  props: {
    element: { type: Object, default: null }
  },
  emits: ['propertyChange'],
  data() {
    return {
      jsonError: ''
    }
  },
  computed: {
    formattedData() {
      if (!this.element || !this.element.ElementData) return '';
      try {
        const parsed = JSON.parse(this.element.ElementData);
        return JSON.stringify(parsed, null, 2); // Format JSON cho đẹp
      } catch (e) {
        return this.element.ElementData; // Hiển thị text gốc nếu không phải JSON
      }
    }
  },
  methods: {
    updateData(newValue) {
      try {
        JSON.parse(newValue); // Kiểm tra xem JSON có hợp lệ không
        this.$emit('propertyChange', 'ElementData', newValue);
        this.jsonError = '';
      } catch (e) {
        this.jsonError = 'Cú pháp JSON không hợp lệ!';
      }
    }
  }
}
</script>