<template>
  <uc-dialog v-model="isShow" :title="isEdit ? 'Sửa nhóm câu hỏi' : 'Thêm nhóm câu hỏi'" done-text="Lưu"
    :isShowDoneBtn="false"
    @onSubmit="onSave">
    <v-form ref="form">
      <v-row dense>
        <v-col cols="12">
          <v-text-field v-model="form.Title" label="Tên nhóm *" :rules="[v => !!v || 'Bắt buộc nhập tên nhóm']" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.Description" label="Mô tả" rows="2" auto-grow />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model.number="form.OrdinalNumber" label="Thứ tự hiển thị" type="number" min="0" />
        </v-col>
      </v-row>
      <v-divider class="my-3" />
      <uc-media v-if="form.media" :selectedData="form" :item="{}" :loadingPage="mediaLoading"
        :uploadContext="uploadContext"
        @update:selectedData="v => { form = v }"
        @upload-done="onUploadDone"
        @upload-started="onMediaUploadStarted"
        @upload-abandoned="onMediaUploadAbandoned" />
      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" variant="outlined" prepend-icon="mdi-content-save"
          :disabled="mediaLoading.isLoading"
          @click="onSave">Lưu</v-btn>
      </div>
    </v-form>
  </uc-dialog>

  <!-- Background upload indicator removed — indicator shown inline on group list item -->
</template>

<script>
export default {
  inject: ['snackbarRef'],
  props: {
    modelValue: Boolean,
    item: { type: Object, default: () => ({}) },
    uploadContext: { type: Object, default: () => ({}) },
    isUploading: { type: Boolean, default: false },
    uploadingText: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'saved', 'upload-start', 'upload-end', 'upload-progress'],
  data() {
    return {
      form: {},
      mediaLoading: { isLoading: false, text: '' },
      uploadingItemId: null,
      _sessionToItem: {},
      defaultMedia: {
        type: 'YOUTUBE',
        sourceYT: { id: '', source: '', name: '' },
        sourceRecord: { id: '', source: '', name: '' },
        sourceFiles: { image: [], file: [] },
      }
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
    'mediaLoading.isLoading'(val) {
      if (val) {
        this.uploadingItemId = this.form.Id ?? null
        this.$emit('upload-start', { id: this.form.Id ?? null })
      } else if (this.uploadingItemId !== null) {
        this.$emit('upload-end', { id: this.uploadingItemId })
      }
    },
    'mediaLoading.text'(val) {
      if (this.uploadingItemId !== null)
        this.$emit('upload-progress', { id: this.uploadingItemId, text: val })
    },
    modelValue(v) {
      if (!v) return
      this.mediaLoading = { isLoading: this.isUploading, text: this.isUploading ? this.uploadingText : '', sessionId: crypto.randomUUID() }
      this.uploadingItemId = null
      let media = this.defaultMedia
      try { if (this.item.MediaJson) media = JSON.parse(this.item.MediaJson) } catch { }
      this.form = { ...this.item, media }
    },
  },
  methods: {
    onUploadDone() {
      if ((this.form.Id ?? null) === this.uploadingItemId) this.onSave()
    },
    onMediaUploadStarted({ sessionId }) {
      this._sessionToItem[sessionId] = this.form?.Id ?? null
    },
    onMediaUploadAbandoned({ sessionId }) {
      const itemId = this._sessionToItem[sessionId]
      delete this._sessionToItem[sessionId]
      if (itemId != null) {
        this.$emit('upload-end', { id: itemId })
        if ((this.form?.Id ?? null) === itemId && this.mediaLoading.isLoading) {
          this.uploadingItemId = null
          this.mediaLoading.isLoading = false
          this.mediaLoading.text = ''
        }
      }
    },
    async onSave() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return
      const { media, ...rest } = this.form
      const payload = { ...rest, MediaJson: JSON.stringify(media), User: vueData.user.UserID }
      const url = this.isEdit ? 'lms/EL_QuestionGroup_Update' : 'lms/EL_QuestionGroup_Create'
      const res = await fetchPromise(url, payload, { cache: false })
      const result = Array.isArray(res) ? res[0] : res
      if (result?.Id || result?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Lưu thành công', color: 'success' })
        this.isShow = false
        this.$emit('saved')
      }
    },
  },
}
</script>
