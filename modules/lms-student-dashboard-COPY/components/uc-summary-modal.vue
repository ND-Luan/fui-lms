<template>
  <!-- 
    (CẢI TIẾN) Bất kỳ hành động nào làm thay đổi model-value (như nhấn Esc)
    sẽ đều gọi hàm closeDialog.
  -->
  <v-dialog :model-value="visible" @update:model-value="closeDialog" persistent :width="mobile ? '80%' : 800">
    <v-card v-if="loading">
      <v-card-text class="text-center pa-10">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <p class="mt-4">Đang tải kết quả...</p>
      </v-card-text>
    </v-card>

    <v-card v-else-if="summaryData && summaryData.overview">
      <v-card-title class="text-h5 font-weight-bold" style="white-space: wrap;">{{ summaryData.overview.Title
      }}</v-card-title>
      <v-card-subtitle>Kết quả bài làm</v-card-subtitle>
      <v-divider class="my-2"></v-divider>
      <v-card-text class="py-4">
        <p>
          <strong>Điểm tổng:</strong>
          <span class='text-h6 font-weight-bold text-red-darken-2'>
            {{ summaryData.overview.Score }} / {{ summaryData.overview.MaxScore }}
          </span>
        </p>
        <div v-if='summaryData.overview.TeacherComment && summaryData.overview.TeacherComment.trim() !== ""'>
          <p class='mt-3'><strong>Nhận xét chung của giáo viên:</strong></p>
          <div class='pa-3 bg-grey-lighten-4 rounded' v-html='summaryData.overview.TeacherComment'></div>
        </div>
      </v-card-text>
      <v-divider class="my-2"></v-divider>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left" style="width: 60%;">Câu hỏi</th>
            <th class="text-center">Kết quả</th>
            <th class="text-center">Điểm</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaryData.details" :key="item.QuestionID">
            <td v-html="item.QuestionText"></td>
            <td class="text-center">
              <v-icon :color="getStatusInfo(item).color">
                {{ getStatusInfo(item).icon }}
              </v-icon>
            </td>
            <td class="text-center">{{ item.Score }} / {{ item.MaxScore }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-divider></v-divider>
      <v-card-actions class="pa-4 bg-grey-lighten-5" style="position: sticky; bottom: 0;">
        <v-spacer></v-spacer>
        <v-btn text="Đóng" @click="closeDialog" color="grey-darken-1"></v-btn>
        <v-btn text="Xem lại bài làm chi tiết" @click="navigateToDetails" color="primary" variant="text"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'uc-summary-modal',
  props: {
    visible: Boolean,
    loading: Boolean,
    summaryData: Object
  },
  emits: [
    'update:visible',
    'navigate-to-details'
  ],
  data() {
    const { mobile } = Vuetify.useDisplay()
    return {
      mobile
    };
  },
  methods: {
    navigateToDetails() {
      if (this.summaryData && this.summaryData.overview && this.summaryData.overview.AssignToClassID) {
        console.log('this.summaryData.overview', this.summaryData.overview)
        this.$emit('navigate-to-details', this.summaryData.overview.AssignToClassID);
      } else {
        Vue.$toast.error('Không thể điều hướng đến chi tiết bài làm vì thiếu thông tin AssignToClassID.');
      }
    },
    closeDialog() {
      if (this.visible) {
        this.$emit('update:visible', false);
      }
    },
    getStatusInfo(item) {
      if (item.Score === 0) {
        return { icon: 'mdi-close-circle', color: 'error' };
      }
      if (item.Score > 0 && item.Score === item.MaxScore) {
        return { icon: 'mdi-check-circle', color: 'success' };
      }
      if (item.Score > 0 && item.Score < item.MaxScore) {
        return { icon: 'mdi-star-half-full', color: 'orange' };
      }
      return { icon: 'mdi-help-circle', color: 'grey' };
    },
  }
}
</script>