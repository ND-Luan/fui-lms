<template>
  <uc-dialog
    v-model="isShow"
    :title="isEdit ? 'Sửa câu hỏi' : 'Thêm câu hỏi'"
    done-text="Lưu"
    width="720"
    @onSubmit="onSave"
  >
    <v-form ref="form">
      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="form.Type"
            label="Loại câu hỏi *"
            :items="TypeOptions"
            item-title="label"
            item-value="value"
            :rules="[v => !!v || 'Bắt buộc chọn loại']"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="form.Label"
            label="Nhãn (Label)"
          />
        </v-col>
        <v-col cols="2">
          <v-text-field
            v-model.number="form.OrdinalNumber"
            label="Thứ tự"
            type="number"
            min="0"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="form.QuestionText"
            label="Nội dung câu hỏi"
            rows="3"
            auto-grow
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model.number="form.Points"
            label="Điểm"
            type="number"
            min="0"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="form.GradingType"
            label="Kiểu chấm điểm"
            placeholder="ALL_OR_NOTHING"
          />
        </v-col>
        <v-col cols="4" class="d-flex align-center">
          <v-checkbox
            v-model="form.IsAdvanced"
            label="Câu nâng cao"
            color="warning"
            hide-details
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="form.ConfigJson"
            label="Cấu hình câu hỏi (ConfigJson)"
            rows="4"
            auto-grow
            placeholder='{"options": [], "correctAnswers": []}'
            hint='JSON định nghĩa đáp án, lựa chọn, media… Xem tài liệu để biết cấu trúc theo từng loại câu.'
            persistent-hint
            font-family="monospace"
          />
        </v-col>
        <v-col cols="12">
          <v-select
            v-model="selectedSkillIds"
            :items="DSSkill"
            item-title="TenKyNang"
            item-value="KyNang_MonHoc_ChiTietID"
            label="Kỹ năng liên kết"
            multiple
            chips
            closable-chips
            :loading="loadingSkills"
            :hint="DSSkill.length ? '' : 'Chọn môn học để tải kỹ năng'"
            persistent-hint
            no-data-text="Không có kỹ năng nào"
          />
        </v-col>
      </v-row>
    </v-form>
  </uc-dialog>
</template>

<script>
export default {
  inject: ['snackbarRef'],
  props: {
    modelValue: Boolean,
    item: { type: Object, default: () => ({}) },
    groupId: { type: Number, default: null },
    monHocId: { type: Number, default: null },
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return {
      form: {},
      selectedSkillIds: [],
      DSSkill: [],
      loadingSkills: false,
      TypeOptions: [
        { value: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án' },
        { value: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án' },
        { value: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai' },
        { value: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống' },
        { value: 'QUIZ_SHORT_ANSWER', label: 'Trả lời ngắn' },
        { value: 'QUIZ_ESSAY', label: 'Tự luận' },
        { value: 'QUIZ_MATCHING', label: 'Nối đáp án' },
      ],
    }
  },
  computed: {
    isShow: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },
    isEdit() { return !!this.form.Id },
  },
  watch: {
    modelValue(v) {
      if (v) {
        this.form = { ...this.item, GroupId: this.item.GroupId ?? this.groupId }
        try {
          const parsed = JSON.parse(this.form.SkillsJson || '[]')
          this.selectedSkillIds = parsed.map(s => s.KyNang_MonHoc_ChiTietID).filter(Boolean)
        } catch { this.selectedSkillIds = [] }
        this.loadSkills()
      }
    },
  },
  methods: {
    async loadSkills() {
      if (!this.monHocId) return
      this.loadingSkills = true
      const groups = await fetchPromise('lms/EL_KyNang_MonHoc_Get', { MonHocID: this.monHocId })
      const dsnhom = groups ?? []
      if (!dsnhom.length) { this.DSSkill = []; this.loadingSkills = false; return }
      const batch = dsnhom.map(g => ({ url: 'lms/EL_KyNang_MonHoc_ChiTiet_Get', params: { KyNang_MonHocID: g.KyNang_MonHocID } }))
      const results = await fetchBatchPromise(batch)
      this.DSSkill = results.flat() ?? []
      this.loadingSkills = false
    },
    async onSave() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return
      const url = this.isEdit ? 'lms/EL_Question_Update' : 'lms/EL_Question_Create'
      const skills = this.selectedSkillIds.map(id => {
        const s = this.DSSkill.find(x => x.KyNang_MonHoc_ChiTietID === id)
        return { KyNang_MonHoc_ChiTietID: id, TenKyNang: s?.TenKyNang ?? '', NhomKyNang: s?.NhomKyNang ?? '' }
      })
      const payload = { ...this.form, SkillsJson: JSON.stringify(skills), User: vueData.user.UserID }
      const res = await fetchPromise(url, payload, { cache: false })
      if (res?.Id || res?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Lưu thành công', color: 'success' })
        this.$emit('saved')
      }
    },
  },
}
</script>
