<template>
  <v-dialog v-model="isShow" width="860" :close-on-back="false" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon start color="primary">mdi-help-circle-outline</v-icon>
        {{ isEdit ? 'Sửa câu hỏi' : 'Thêm câu hỏi' }}
        <v-spacer />
        <v-icon @click="isShow = false" color="grey">mdi-close</v-icon>
      </v-card-title>
      <v-divider />

      <v-card-text style="max-height: 74vh; overflow-y: auto;">
        <v-form ref="formRef">
          <!-- Basic info row -->
          <v-row dense class="mt-1">
            <v-col cols="8">
              <v-select v-model="form.type" label="Loại câu hỏi *" :items="TypeOptions" item-title="label"
                item-value="value" variant="outlined" density="compact" :rules="[v => !!v || 'Bắt buộc chọn loại']"
                @update:modelValue="onTypeChange" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number="form.points" label="Điểm" type="number" min="0" step="0.5"
                variant="outlined" density="compact" :clearable="false" />
            </v-col>
          </v-row>

          <!-- Question text -->
          <div class="mb-3">
            <f-editor :key="'question-text-' + (item.Id || 'new')"
              v-model="config.questionText" :imageapi="vueData.v_Set.apiImageAdapter"
              label="Nội dung câu hỏi" variant="outlined" rows="3" auto-grow />
          </div>

          <!-- Media -->
          <uc-media
            v-if="config.media"
            :selectedData="config"
            :item="{}"
            :loadingPage="mediaLoading"
            :uploadContext="uploadContext"
            @update:selectedData="v => { config = v }"
            @upload-done="onUploadDone"
            @upload-started="onMediaUploadStarted"
            @upload-abandoned="onMediaUploadAbandoned"
          />

          <v-divider class="mb-3" />
          <div class="d-flex justify-space-between align-center mb-3">
            <p class="text-subtitle-2 font-weight-bold mb-0">Đáp án</p>
            <v-checkbox
              v-if="['QUIZ_SINGLE_CHOICE', 'QUIZ_MULTIPLE_CHOICE', 'QUIZ_MATCHING'].includes(form.type)"
              v-model="config.isAdvanced" label="Nâng cao" color="warning" hide-details density="compact" />
          </div>

          <!-- QUIZ_SINGLE_CHOICE -->
          <template v-if="form.type === 'QUIZ_SINGLE_CHOICE'">
            <v-radio-group v-model="config.correctAnswer" hide-details>
              <div v-for="(opt, i) in config.options" :key="opt.id" class="d-flex align-center ga-2 mb-2">
                <v-radio :value="opt.id" hide-details color="primary" />
                <v-text-field v-if="!config.isAdvanced" v-model="opt.text" variant="outlined" density="compact"
                  hide-details :clearable="false" placeholder="Nhập đáp án..." class="flex-grow-1" />
                <uc-latex-edit v-else v-model:content="opt.text" class="flex-grow-1" />
                <v-btn icon size="x-small" variant="text" color="error" @click="removeOption(i)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </v-radio-group>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-1" @click="addOption">Thêm đáp án</v-btn>
          </template>

          <!-- QUIZ_MULTIPLE_CHOICE -->
          <template v-else-if="form.type === 'QUIZ_MULTIPLE_CHOICE'">
            <div class="mb-3">
              <v-select v-model="config.scoringMode" density="compact" variant="outlined" hide-details
                :items="[{ value: 'equal', title: 'Tính điểm chia đều' }, { value: 'partial', title: 'Tính điểm theo từng ý' }]"
                label="Cách tính điểm" :clearable="false" />
              <v-alert v-if="config.scoringMode === 'partial'" class="mt-2" density="compact" variant="tonal" color="info" type="info">
                <div class="text-caption">
                  <b>Tính điểm theo từng ý:</b><br>
                  Đúng 1 ý: 0,1đ &nbsp;·&nbsp; Đúng 2 ý: 0,25đ &nbsp;·&nbsp; Đúng 3 ý: 0,5đ &nbsp;·&nbsp; Đúng cả 4 ý: 1,0đ<br>
                  <span class="font-weight-medium">Bắt buộc: 4 đáp án, điểm tối đa 1,0đ.</span>
                </div>
              </v-alert>
            </div>
            <div v-for="(opt, i) in config.options" :key="opt.id" class="d-flex align-center ga-2 mb-2">
              <v-checkbox v-model="config.correctAnswers" :value="opt.id" hide-details density="compact"
                color="primary" />
              <v-text-field v-if="!config.isAdvanced" v-model="opt.text" variant="outlined" density="compact"
                hide-details :clearable="false" placeholder="Nhập đáp án..." class="flex-grow-1" />
              <uc-latex-edit v-else v-model:content="opt.text" class="flex-grow-1" />
              <v-btn v-if="config.scoringMode !== 'partial'" icon size="x-small" variant="text" color="error" @click="removeOption(i)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-btn v-if="config.scoringMode !== 'partial'" size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-1" @click="addOption">Thêm đáp án</v-btn>
          </template>

          <!-- QUIZ_TRUE_FALSE -->
          <template v-else-if="form.type === 'QUIZ_TRUE_FALSE'">
            <p class="text-caption font-weight-medium mb-2">Đáp án đúng:</p>
            <v-radio-group v-model="config.correctAnswer" inline hide-details>
              <v-radio :value="true" label="Đúng" color="success" />
              <v-radio :value="false" label="Sai" color="error" class="ml-6" />
            </v-radio-group>
          </template>

          <!-- QUIZ_MULTIPLE_TRUE_FALSE -->
          <template v-else-if="form.type === 'QUIZ_MULTIPLE_TRUE_FALSE'">
            <div class="d-flex align-center ga-2 mb-2">
              <span class="text-caption font-weight-medium" style="width: 80px; text-align: center;">Đúng / Sai</span>
              <span class="text-caption font-weight-medium flex-grow-1">Nội dung mệnh đề</span>
            </div>
            <div v-for="(opt, i) in config.options" :key="i" class="d-flex align-center ga-2 mb-2">
              <div style="width: 80px;" class="d-flex justify-space-evenly">
                <v-checkbox v-model="opt.correctAnswer" color="success" hide-details density="compact"
                  @update:modelValue="v => { if (v) opt.inCorrectAnswer = false }" />
                <v-checkbox v-model="opt.inCorrectAnswer" color="error" hide-details density="compact"
                  @update:modelValue="v => { if (v) opt.correctAnswer = false }" />
              </div>
              <v-text-field v-model="opt.text" variant="outlined" density="compact" hide-details :clearable="false"
                placeholder="Nhập mệnh đề..." class="flex-grow-1" />
              <v-btn v-if="config.options.length > 2" icon size="x-small" variant="text" color="error"
                @click="removeOption(i)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-1"
              @click="addMultipleTrueFalseOption">Thêm mệnh đề</v-btn>
          </template>

          <!-- QUIZ_FILL_IN_BLANK -->
          <template v-else-if="form.type === 'QUIZ_FILL_IN_BLANK'">
            <div v-for="(part, i) in config.parts" :key="i" class="d-flex align-start ga-2 mb-2">
              <v-chip size="x-small" variant="tonal" :color="part.type === 'blank' ? 'indigo' : 'default'"
                class="mt-3 flex-shrink-0" style="min-width: 68px; justify-content: center;">
                {{ part.type === 'blank' ? 'Chỗ trống' : 'Văn bản' }}
              </v-chip>
              <v-text-field v-if="part.type === 'text'" v-model="part.value" variant="outlined" density="compact"
                hide-details :clearable="false" class="flex-grow-1" placeholder="Nhập văn bản..." />
              <div v-else class="flex-grow-1 rounded pa-2" style="border: 1.5px dashed rgba(0,0,0,0.3);">
                <div v-if="part.acceptedAnswers && part.acceptedAnswers.length" class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip v-for="(ans, ai) in part.acceptedAnswers" :key="ai" size="small" color="success"
                    variant="tonal" closable @click:close="part.acceptedAnswers.splice(ai, 1)">
                    {{ ans }}
                  </v-chip>
                </div>
                <p v-else class="text-caption text-medium-emphasis mb-2">Chưa có đáp án — nhập và Enter để thêm</p>
                <v-text-field v-model="blankInputs[i]" placeholder="Nhập đáp án rồi Enter..." variant="outlined"
                  density="compact" hide-details :clearable="false" append-inner-icon="mdi-keyboard-return"
                  @keydown.enter.prevent="addBlankAnswer(part, i)" />
              </div>
              <v-btn icon size="small" variant="text" color="error" class="mt-1" @click="config.parts.splice(i, 1)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <div class="d-flex ga-2 mt-2">
              <v-btn size="small" variant="tonal" prepend-icon="mdi-format-text" @click="addPart('text')">Văn
                bản</v-btn>
              <v-btn size="small" variant="tonal" color="indigo" prepend-icon="mdi-form-textbox"
                @click="addPart('blank')">Chỗ trống</v-btn>
            </div>
          </template>

          <!-- QUIZ_MATCHING -->
          <template v-else-if="form.type === 'QUIZ_MATCHING'">
            <v-row dense class="mb-2">
              <v-col cols="5">
                <p class="text-caption font-weight-medium mb-0">Cột A</p>
              </v-col>
              <v-col cols="5">
                <p class="text-caption font-weight-medium mb-0">Cột B (ghép nối)</p>
              </v-col>
              <v-col cols="2"></v-col>
            </v-row>
            <v-row v-for="(pair, i) in config.columnA" :key="i" dense class="mb-1" align="center">
              <v-col cols="5">
                <v-text-field v-if="!config.isAdvanced" v-model="pair.text" variant="outlined" density="compact"
                  hide-details :clearable="false" placeholder="Cột A..." />
                <uc-latex-edit v-else v-model:content="pair.text" class="w-100" />
              </v-col>
              <v-col cols="5">
                <template v-if="config.columnB[i]">
                  <v-text-field v-if="!config.isAdvanced" v-model="config.columnB[i].text" variant="outlined"
                    density="compact" hide-details :clearable="false" placeholder="Cột B..." />
                  <uc-latex-edit v-else v-model:content="config.columnB[i].text" class="w-100" />
                </template>
              </v-col>
              <v-col cols="2" class="d-flex">
                <v-btn icon size="small" variant="text" color="error" @click="removePair(i)">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-2" @click="addPair">Thêm cặp</v-btn>
          </template>

          <!-- Manual grading types -->
          <template v-else-if="form.type">
            <div class="text-caption text-medium-emphasis rounded pa-3" style="border: 1px dashed rgba(0,0,0,0.2);">
              Loại câu hỏi này chấm điểm thủ công — không cần cấu hình đáp án.
            </div>
          </template>

          <div v-if="!form.type" class="text-caption text-medium-emphasis text-center pa-6">
            Chọn loại câu hỏi để cấu hình đáp án
          </div>

          <v-divider class="my-3" />

          <!-- Skills -->
          <v-select v-model="selectedSkillIds" :items="DSSkill" item-title="TenKyNang"
            item-value="KyNang_MonHoc_ChiTietID" label="Kỹ năng liên kết" multiple chips closable-chips
            :loading="loadingSkills" variant="outlined" density="compact" no-data-text="Không có kỹ năng nào" />
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isShow = false">Hủy</v-btn>
        <v-btn color="primary" variant="outlined" prepend-icon="mdi-content-save" :loading="saving"
          :disabled="mediaLoading.isLoading"
          @click="onSave">Lưu</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Background upload indicator removed — indicator shown inline on question table row -->
</template>

<script>
export default {
  inject: ['snackbarRef'],
  props: {
    modelValue: Boolean,
    item: { type: Object, default: () => ({}) },
    groupId: { type: Number, default: null },
    monHocId: { type: Number, default: null },
    uploadContext: { type: Object, default: () => ({}) },
    isUploading: { type: Boolean, default: false },
    uploadingText: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'saved', 'upload-start', 'upload-end', 'upload-progress'],
  data() {
    return {
      vueData,
      form: { type: null, points: 1, gradingType: 'auto' },
      config: { questionText: '', isAdvanced: false },
      selectedSkillIds: [],
      blankInputs: {},
      mediaLoading: { isLoading: false, text: '' },
      uploadingItemId: null,
      _sessionToItem: {},
      DSSkill: [],
      loadingSkills: false,
      saving: false,
      TypeOptions: [
        { value: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm — 1 đáp án' },
        { value: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm — nhiều đáp án' },
        { value: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai' },
        { value: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều mệnh đề Đúng / Sai' },
        { value: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống' },
        { value: 'QUIZ_MATCHING', label: 'Nối đáp án' },
        { value: 'SHORT_ANSWER', label: 'Trả lời ngắn' },
        { value: 'ESSAY', label: 'Tự luận' },
        { value: 'FILE_UPLOAD', label: 'Nộp File' },
        { value: 'AUDIO_RESPONSE', label: 'Ghi âm trả lời' },
      ],
    }
  },
  computed: {
    isShow: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },
    isEdit() { return !!(this.item && this.item.Id) },
  },
  watch: {
    'mediaLoading.isLoading'(val) {
      if (val) {
        this.uploadingItemId = this.item.Id ?? null
        this.$emit('upload-start', { id: this.item.Id ?? null })
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
      this.form = {
        type: this.item.Type || null,
        points: this.item.Points ?? 1,
        gradingType: this.item.GradingType || 'auto',
      }
      try {
        this.config = this.item.ConfigJson
          ? JSON.parse(this.item.ConfigJson)
          : this.initConfig(this.form.type)
      } catch {
        this.config = this.initConfig(this.form.type)
      }
      if (!this.config.questionText && this.item.QuestionText) {
        this.config.questionText = this.item.QuestionText
      }
      if (!this.config.media) {
        this.config.media = { type: 'YOUTUBE', sourceYT: { id: '', source: '', name: '' }, sourceRecord: { id: '', source: '', name: '' }, sourceFiles: { image: [], file: [] } }
      }
      try {
        const parsed = JSON.parse(this.item.SkillsJson || '[]')
        this.selectedSkillIds = parsed.map(s => s.KyNang_MonHoc_ChiTietID).filter(Boolean)
      } catch {
        this.selectedSkillIds = []
      }
      this.blankInputs = {}
      this.saving = false
      this.loadSkills()
    },
  },
  methods: {
    onUploadDone() {
      if ((this.item.Id ?? null) === this.uploadingItemId) this.onSave()
    },
    onMediaUploadStarted({ sessionId }) {
      this._sessionToItem[sessionId] = this.item?.Id ?? null
    },
    onMediaUploadAbandoned({ sessionId }) {
      const itemId = this._sessionToItem[sessionId]
      delete this._sessionToItem[sessionId]
      if (itemId != null) {
        this.$emit('upload-end', { id: itemId })
        if ((this.item?.Id ?? null) === itemId && this.mediaLoading.isLoading) {
          this.uploadingItemId = null
          this.mediaLoading.isLoading = false
          this.mediaLoading.text = ''
        }
      }
    },
    initConfig(type) {
      const defaultMedia = { type: 'YOUTUBE', sourceYT: { id: '', source: '', name: '' }, sourceRecord: { id: '', source: '', name: '' }, sourceFiles: { image: [], file: [] } }
      const base = { questionText: '', isAdvanced: false, media: defaultMedia }
      switch (type) {
        case 'QUIZ_SINGLE_CHOICE':
          return {
            ...base,
            options: [
              { id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' },
              { id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' },
            ],
            correctAnswer: null,
          }
        case 'QUIZ_MULTIPLE_CHOICE':
          return {
            ...base,
            options: [
              { id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' },
              { id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' },
            ],
            correctAnswers: [],
            scoringMode: 'equal',
          }
        case 'QUIZ_TRUE_FALSE':
          return { ...base, correctAnswer: true }
        case 'QUIZ_MULTIPLE_TRUE_FALSE':
          return {
            ...base,
            options: [
              { id: 'a', text: '', correctAnswer: null, inCorrectAnswer: null },
              { id: 'b', text: '', correctAnswer: null, inCorrectAnswer: null },
            ],
            scoringMode: 'equal',
          }
        case 'QUIZ_FILL_IN_BLANK':
          return {
            ...base, parts: [
              { type: 'text', value: 'Điền vào ' },
              { type: 'blank', id: `blank_${crypto.randomUUID()}`, acceptedAnswers: [] },
              { type: 'text', value: ' này.' },
            ]
          }
        case 'QUIZ_MATCHING':
          return { ...base, columnA: [], columnB: [], correctPairs: [] }
        default:
          return { ...base }
      }
    },
    onTypeChange(type) {
      const qText = this.config.questionText
      const isAdv = this.config.isAdvanced
      this.config = this.initConfig(type)
      this.config.questionText = qText
      this.config.isAdvanced = isAdv
      this.blankInputs = {}
    },
    addOption() {
      if (!Array.isArray(this.config.options)) this.config.options = []
      this.config.options.push({ id: crypto.randomUUID(), text: '' })
    },
    removeOption(i) {
      const opt = this.config.options[i]
      if (Array.isArray(this.config.correctAnswers)) {
        this.config.correctAnswers = this.config.correctAnswers.filter(id => id !== opt.id)
      }
      if (this.config.correctAnswer === opt.id) this.config.correctAnswer = null
      this.config.options.splice(i, 1)
    },
    addMultipleTrueFalseOption() {
      if (!Array.isArray(this.config.options)) this.config.options = []
      this.config.options.push({ id: crypto.randomUUID(), text: '', correctAnswer: null, inCorrectAnswer: null })
    },
    addPart(type) {
      if (!Array.isArray(this.config.parts)) this.config.parts = []
      if (type === 'text') {
        this.config.parts.push({ type: 'text', value: '' })
      } else {
        this.config.parts.push({ type: 'blank', id: `blank_${crypto.randomUUID()}`, acceptedAnswers: [] })
      }
    },
    addBlankAnswer(part, i) {
      const val = (this.blankInputs[i] || '').trim()
      if (!val) return
      if (!Array.isArray(part.acceptedAnswers)) part.acceptedAnswers = []
      part.acceptedAnswers.push(val)
      this.blankInputs[i] = ''
    },
    addPair() {
      const aId = crypto.randomUUID()
      const bId = crypto.randomUUID()
      if (!Array.isArray(this.config.columnA)) {
        this.config.columnA = []; this.config.columnB = []; this.config.correctPairs = []
      }
      this.config.columnA.push({ id: aId, text: '' })
      this.config.columnB.push({ id: bId, text: '' })
      this.config.correctPairs.push({ aId, bId })
    },
    removePair(i) {
      this.config.columnA.splice(i, 1)
      this.config.columnB.splice(i, 1)
      this.config.correctPairs.splice(i, 1)
    },
    async loadSkills() {
      if (!this.monHocId) return
      this.loadingSkills = true
      const groups = await fetchPromise('lms/EL_KyNang_MonHoc_Get', { MonHocID: this.monHocId })
      const dsnhom = (Array.isArray(groups?.[0]) ? groups[0] : groups) ?? []
      if (!dsnhom.length) { this.DSSkill = []; this.loadingSkills = false; return }
      const batch = dsnhom.map(g => ({ url: 'lms/EL_KyNang_MonHoc_ChiTiet_Get', params: { KyNang_MonHocID: g.KyNang_MonHocID } }))
      const results = await fetchBatchPromise(batch)
      this.DSSkill = results.flat() ?? []
      this.loadingSkills = false
    },
    validateQuestion() {
      const stripHtml = s => (s || '').replace(/<[^>]*>/g, '').trim()
      const warn = msg => { this.snackbarRef.value.showSnackbar({ message: msg, color: 'error' }); return false }
      const type = this.form.type

      if (!stripHtml(this.config.questionText))
        return warn('Vui lòng nhập nội dung câu hỏi')

      if (type === 'QUIZ_SINGLE_CHOICE') {
        if (this.config.options.length < 2) return warn('Cần ít nhất 2 đáp án')
        if (this.config.options.some(o => !stripHtml(o.text))) return warn('Các đáp án không được để trống')
        if (!this.config.correctAnswer) return warn('Vui lòng chọn đáp án đúng')
      }

      if (type === 'QUIZ_MULTIPLE_CHOICE') {
        const opts = this.config.options
        if (this.config.scoringMode === 'partial' && opts.length !== 4)
          return warn('Chế độ "theo từng ý" bắt buộc đúng 4 đáp án')
        if (opts.length < 2) return warn('Cần ít nhất 2 đáp án')
        if (opts.some(o => !stripHtml(o.text))) return warn('Các đáp án không được để trống')
        if (!this.config.correctAnswers?.length) return warn('Vui lòng chọn ít nhất một đáp án đúng')
      }

      if (type === 'QUIZ_TRUE_FALSE') {
        if (this.config.correctAnswer === null || this.config.correctAnswer === undefined)
          return warn('Vui lòng chọn đáp án Đúng hoặc Sai')
      }

      if (type === 'QUIZ_MULTIPLE_TRUE_FALSE') {
        if (this.config.options.some(o => !o.text?.trim())) return warn('Các mệnh đề không được để trống')
        if (this.config.options.some(o => !o.correctAnswer && !o.inCorrectAnswer))
          return warn('Vui lòng chọn Đúng hoặc Sai cho mỗi mệnh đề')
      }

      if (type === 'QUIZ_FILL_IN_BLANK') {
        const blanks = this.config.parts.filter(p => p.type === 'blank')
        if (!blanks.length) return warn('Cần ít nhất một chỗ trống trong câu hỏi')
        if (blanks.some(b => !b.acceptedAnswers?.length))
          return warn('Mỗi chỗ trống phải có ít nhất một đáp án')
      }

      if (type === 'QUIZ_MATCHING') {
        if (!this.config.columnA.length) return warn('Cần ít nhất một cặp ghép nối')
        if (this.config.columnA.some(p => !stripHtml(p.text)) || this.config.columnB.some(p => !stripHtml(p.text)))
          return warn('Các ô ghép nối không được để trống')
      }

      return true
    },
    async onSave() {
      const { valid } = await this.$refs.formRef.validate()
      if (!valid) return
      if (!this.validateQuestion()) return
      this.saving = true
      const url = this.isEdit ? 'lms/EL_Question_Update' : 'lms/EL_Question_Create'
      const skills = this.selectedSkillIds.map(id => {
        const s = this.DSSkill.find(x => x.KyNang_MonHoc_ChiTietID === id)
        return { KyNang_MonHoc_ChiTietID: id, TenKyNang: s?.TenKyNang ?? '', NhomKyNang: s?.NhomKyNang ?? '' }
      })
      const payload = {
        ...(this.isEdit ? { Id: this.item.Id } : {}),
        SourceId: this.isEdit ? (this.item.SourceId || null) : `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        GroupId: this.item.GroupId ?? this.groupId,
        Type: this.form.type,
        ...(this.isEdit ? { OrdinalNumber: this.item.OrdinalNumber ?? null } : {}),
        Points: this.form.points ?? 1,
        GradingType: this.form.gradingType || 'auto',
        IsAdvanced: this.config.isAdvanced ? 1 : 0,
        QuestionText: this.config.questionText || null,
        ConfigJson: JSON.stringify(this.config),
        SkillsJson: JSON.stringify(skills),
        User: vueData.user.UserID,
      }
      const res = await fetchPromise(url, payload, { cache: false })
      this.saving = false
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

<style>
.uc-latex-edit {
  line-height: 1.6;
  word-wrap: break-word;
  min-height: 20px;
}
.uc-latex-edit .cursor-pointer {
  cursor: pointer;
}
.uc-latex-edit .empty-content {
  padding: 4px;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  text-align: center;
  color: #666;
  background-color: #fafafa;
}
.uc-latex-edit .empty-content:hover {
  border-color: #1976d2;
  background-color: #f3f7ff;
}
.uc-latex-edit :deep(.MathJax) {
  display: inline-block;
  margin: 0 2px;
}
.uc-latex-edit :deep(.MathJax_Display) {
  margin: 1em 0;
  text-align: center;
}
.uc-latex-edit :deep(p) {
  margin-bottom: 1em;
}
.uc-latex-edit :deep(ul),
.uc-latex-edit :deep(ol) {
  margin-left: 20px;
  margin-bottom: 1em;
}
.uc-latex-edit :deep(h1),
.uc-latex-edit :deep(h2),
.uc-latex-edit :deep(h3) {
  margin: 1em 0 0.5em 0;
  font-weight: bold;
}
</style>
