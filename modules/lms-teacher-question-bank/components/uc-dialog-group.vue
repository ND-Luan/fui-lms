<template>
  <uc-dialog
    v-model="isShow"
    :title="isEdit ? 'Sửa nhóm câu hỏi' : 'Thêm nhóm câu hỏi'"
    done-text="Lưu"
    @onSubmit="onSave"
  >
    <v-form ref="form">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model="form.Title"
            label="Tên nhóm *"
            :rules="[v => !!v || 'Bắt buộc nhập tên nhóm']"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="form.Description"
            label="Mô tả"
            rows="2"
            auto-grow
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="form.OrdinalNumber"
            label="Thứ tự hiển thị"
            type="number"
            min="0"
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
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return { form: {} }
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
      if (v) this.form = { ...this.item }
    },
  },
  methods: {
    async onSave() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return
      const url = this.isEdit ? 'lms/EL_QuestionGroup_Update' : 'lms/EL_QuestionGroup_Create'
      const res = await fetchPromise(url, { ...this.form, User: vueData.user.UserID }, { cache: false })
      if (res?.Id || res?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Lưu thành công', color: 'success' })
        this.$emit('saved')
      }
    },
  },
}
</script>
