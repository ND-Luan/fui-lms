<!-- file: uc-lesson-card.vue -->
<template>
  <v-card class="d-flex flex-column" height="100%">
    <v-img
      :src="lesson.ThumbnailURL || 'https://cdn.vuetifyjs.com/images/cards/docks.jpg'"
      class="align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="200px"
      cover
    >
      <v-card-title class="text-white">{{ lesson.Title || 'Chưa có tiêu đề' }}</v-card-title>
    </v-img>

    <v-card-subtitle class="pt-4">
      {{ lesson.TenLop }} - {{ lesson.MonHocName }}
    </v-card-subtitle>

    <v-card-text>
      <div class="d-flex justify-space-between text-caption text-grey">
        <span><v-icon small start>mdi-clock-outline</v-icon> {{ lesson.EstimatedDuration || 0 }} phút</span>
        <span><v-icon small start>mdi-book-open-page-variant-outline</v-icon> {{ lesson.ElementCount || 0 }} mục</span>
      </div>
    </v-card-text>

    <v-spacer></v-spacer>

    <v-divider></v-divider>

    <v-card-actions>
      <v-chip
        :color="getStatusColor(lesson.Status)"
        size="small"
        variant="tonal"
      >
        {{ getStatusText(lesson.Status) }}
      </v-chip>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" icon="mdi-pencil" @click.stop="$emit('edit', lesson)"></v-btn>
      <v-btn size="small" variant="text" icon="mdi-share-variant" @click.stop="$emit('assign', lesson)"></v-btn>
      <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click.stop="$emit('delete', lesson)"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'uc-lesson-card',
  props: {
    lesson: { type: Object, required: true }
  },
  emits: ['edit', 'assign', 'delete'], // Khai báo các event sẽ phát ra
  methods: {
    getStatusText(status) {
      const statuses = { 1: 'Soạn thảo', 2: 'Đã xuất bản', 3: 'Lưu trữ' };
      return statuses[status] || 'Không rõ';
    },
    getStatusColor(status) {
      const colors = { 1: 'blue', 2: 'green', 3: 'grey' };
      return colors[status] || 'grey';
    }
  }
}
</script>