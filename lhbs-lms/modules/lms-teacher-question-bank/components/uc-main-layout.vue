<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-text class="d-flex align-center ga-2 flex-wrap py-2">
          <span class="text-subtitle-1 font-weight-bold">{{ TitlePage }}</span>
          <template v-if="selectedKhoiName">
            <v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
            <span class="text-body-2 text-medium-emphasis">{{ selectedKhoiName }}</span>
          </template>
          <template v-if="selectedMon">
            <v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
            <v-chip size="small" color="primary" variant="tonal" closable @click:close="selectedMon = null">
              {{ selectedMon.TenMonHoc_HienThi }}
            </v-chip>
          </template>
          <template v-if="selectedGroup">
            <v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
            <v-chip size="small" color="secondary" variant="tonal" closable @click:close="selectedGroup = null; DSQuestion = []">
              {{ selectedGroup.Title }}
            </v-chip>
          </template>
          <v-spacer />
          <v-btn v-if="selectedMon" variant="tonal" color="indigo" size="small" @click="dialogSkill = true">
            <v-icon start>mdi-brain</v-icon>Quản lý kỹ năng
          </v-btn>
          <v-btn variant="outlined" color="primary" size="small" @click="onRefresh">
            <v-icon start>mdi-reload</v-icon>Làm mới
          </v-btn>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <v-row no-gutters style="height: calc(100dvh - 53px); overflow: hidden;">
      <!-- Sidebar: Tree navigation -->
      <v-col cols="2"
        style="height: 100%; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.12); background: rgba(0,0,0,0.02);">
        <v-list density="compact" nav class="pa-1 pt-2">
          <div v-if="treeLoading" class="d-flex justify-center py-6">
            <v-progress-circular size="24" indeterminate />
          </div>
          <template v-for="khoi in treeKhoi" :key="khoi.KhoiID">
            <v-list-item rounded="lg" class="mb-1" @click="toggleKhoi(khoi)">
              <template #prepend>
                <v-icon size="small">{{ khoi._open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">{{ khoi.TenKhoiHoc || ('Khối ' + khoi.KhoiID)
              }}</v-list-item-title>
              <template #append>
                <v-progress-circular v-if="khoi._loading" size="14" width="2" indeterminate />
              </template>
            </v-list-item>
            <template v-if="khoi._open">
              <v-list-item v-for="mon in khoi.children" :key="mon.MonHocID" rounded="lg" class="mb-1"
                style="padding-left: 24px;"
                :active="selectedMon && selectedMon.MonHocID === mon.MonHocID && selectedMon.KhoiID === mon.KhoiID"
                color="primary" @click="selectMonHoc(mon)">
                <v-list-item-title class="text-caption">{{ mon.TenMonHoc_HienThi }}</v-list-item-title>
              </v-list-item>
              <div v-if="!khoi.children.length && !khoi._loading" class="text-caption text-medium-emphasis pa-2"
                style="padding-left: 24px;">Không có môn học</div>
            </template>
          </template>
        </v-list>
      </v-col>

      <!-- Panel trái: Nhóm câu hỏi -->
      <v-col cols="3" style="height: 100%; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.12);">
        <div class="d-flex align-center pa-3 ga-2">
          <span class="text-subtitle-2 font-weight-bold">Nhóm câu hỏi</span>
          <v-chip size="x-small" color="primary" variant="tonal">{{ DSGroup.length }}</v-chip>
          <v-spacer />
          <v-btn icon size="x-small" variant="tonal" color="success" @click="openAddGroup">
            <v-icon>mdi-plus</v-icon>
            <v-tooltip activator="parent" location="top">Thêm nhóm</v-tooltip>
          </v-btn>
        </div>
        <v-divider />

        <v-list density="compact" nav class="pa-2">
          <v-list-item v-for="group in DSGroup" :key="group.Id" :active="selectedGroup && selectedGroup.Id === group.Id"
            color="primary" rounded="lg" class="mb-1" @click="selectGroup(group)">
            <v-list-item-title class="text-body-2 font-weight-medium d-flex align-center ga-1">
              {{ group.Title }}
              <v-icon v-if="hasMedia(group.MediaJson, 'group')" size="14" color="teal" title="Có media">
                mdi-paperclip
              </v-icon>
            </v-list-item-title>
            <v-list-item-subtitle v-if="uploadingGroups[group.Id]?.text"
              class="text-caption text-primary">
              {{ uploadingGroups[group.Id].text }}
            </v-list-item-subtitle>

            <v-list-item-subtitle v-else-if="group.Description" class="text-caption">
              {{ group.Description }}
            </v-list-item-subtitle>
      <template #append>
                <div class="d-flex align-center ga-1">
                  <v-progress-circular v-if="uploadingGroups[group.Id]" size="14" width="2" indeterminate color="primary" />
                  <v-btn icon size="x-small" variant="text" color="primary" @click.stop="openEditGroup(group)">
                  <v-icon size="small">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Sửa</v-tooltip>
                </v-btn>
                <v-btn icon size="x-small" variant="text" color="error" v-if="!uploadingGroups[group.Id]" @click.stop="deleteGroup(group)">
                  <v-icon size="small">mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-list-item>
          <div v-if="!DSGroup.length" class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
            <v-icon size="40" class="mb-2 opacity-40">mdi-folder-question-outline</v-icon>
            <p class="text-caption">Chưa có nhóm nào</p>
          </div>
        </v-list>
      </v-col>

      <!-- Panel phải: Câu hỏi trong nhóm -->
      <v-col cols="7" style="height: 100%; overflow-y: auto;">
        <div class="d-flex align-center pa-3 ga-2 flex-wrap">
          <span class="text-subtitle-2 font-weight-bold">
            {{ selectedGroup ? selectedGroup.Title : 'Câu hỏi' }}
          </span>
          <v-chip v-if="selectedGroup" size="x-small" color="primary" variant="tonal">
            {{ DSQuestion.length }} câu
          </v-chip>
          <v-spacer />
          <template v-if="selectedGroup">
            <v-text-field v-model="searchQ" placeholder="Tìm câu hỏi..." density="compact" hide-details clearable
              style="max-width: 200px;" @keyup.enter="loadQuestions" @click:clear="onClearSearch" />
            <v-select v-model="filterType" :items="TypeOptions" item-title="label" item-value="value"
              placeholder="Loại câu" density="compact" hide-details clearable style="max-width: 180px;"
              @update:modelValue="loadQuestions" />
            <v-btn size="small" variant="tonal" color="primary" @click="loadQuestions">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-btn size="small" variant="tonal" color="success" @click="openAddQuestion">
              <v-icon start>mdi-plus</v-icon>Thêm câu hỏi
            </v-btn>
          </template>
        </div>
        <v-divider />

        <div v-if="!selectedGroup" class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis">
          <v-icon size="52" class="mb-3 opacity-30">mdi-cursor-default-click-outline</v-icon>
          <p class="text-body-2">Chọn nhóm để xem câu hỏi</p>
        </div>

        <v-data-table v-else :headers="headersQuestion" :items="DSQuestion" item-value="Id" items-per-page="-1"
          hide-default-footer hover style="max-height: calc(100dvh - 140px); overflow-y: auto;">
          <template #item.OrdinalNumber="{ index }">
            <span class="text-caption text-medium-emphasis">{{ index + 1 }}</span>
          </template>
          <template #item.Type="{ item }">
            <v-chip size="x-small" :color="getTypeColor(item.Type)" variant="tonal">
              {{ getTypeLabel(item.Type) }}
            </v-chip>
          </template>
          <template #item.QuestionText="{ item }">
            <div class="text-body-2 text-truncate" style="max-width: 260px;" v-html="item.QuestionText || '-'" />
          </template>
          <template #item.Points="{ item }">
            <span class="text-body-2">{{ item.Points ?? '-' }}</span>
          </template>
          <template #item.IsAdvanced="{ item }">
            <v-icon v-if="item.IsAdvanced" color="warning" size="small">mdi-star</v-icon>
            <span v-else class="text-medium-emphasis text-caption">-</span>
          </template>
          <template #item.media="{ item }">
            <template v-if="uploadingQuestions[item.Id]">
              <v-progress-circular size="14" width="2" indeterminate color="primary" />
              <v-tooltip activator="parent" location="top">{{ uploadingQuestions[item.Id].text || 'Đang upload...' }}</v-tooltip>
            </template>
            <v-icon v-else-if="hasMedia(item.ConfigJson, 'question')" color="teal" size="small">mdi-paperclip</v-icon>
            <span v-else class="text-medium-emphasis text-caption">-</span>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex align-center ga-1">
              <v-btn icon size="small" variant="text" color="primary" @click="openEditQuestion(item)">
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
              </v-btn>
              <v-btn v-if="!uploadingQuestions[item.Id]" icon size="small" variant="text" color="error" @click="deleteQuestion(item)">
                <v-icon>mdi-delete-outline</v-icon>
                <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
              </v-btn>
            </div>
          </template>
          <template #no-data>
            <div class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
              <v-icon size="36" class="mb-2 opacity-40">mdi-help-circle-outline</v-icon>
              <p class="text-caption">Nhóm này chưa có câu hỏi</p>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Dialog Nhóm -->
    <uc-dialog-group v-model="dialogGroup" :item="formGroup"
      :upload-context="selectedMon ? { MonHocName: selectedMon.TenMonHoc_HienThi, KhoiID: selectedMon.KhoiID } : {}"
      :is-uploading="!!uploadingGroups[formGroup.Id]"
      :uploading-text="uploadingGroups[formGroup.Id]?.text || ''"
      @saved="onGroupSaved"
      @upload-start="onGroupUploadStart"
      @upload-end="onGroupUploadEnd"
      @upload-progress="onGroupUploadProgress" />

    <!-- Dialog Câu hỏi -->
    <uc-dialog-question v-model="dialogQuestion" :item="formQuestion"
      :group-id="selectedGroup ? selectedGroup.Id : null" :mon-hoc-id="selectedMon ? selectedMon.MonHocID : null"
      :upload-context="selectedMon ? { MonHocName: selectedMon.TenMonHoc_HienThi, KhoiID: selectedMon.KhoiID } : {}"
      :is-uploading="!!uploadingQuestions[formQuestion.Id]"
      :uploading-text="uploadingQuestions[formQuestion.Id]?.text || ''"
      @saved="onQuestionSaved"
      @upload-start="onQuestionUploadStart"
      @upload-end="onQuestionUploadEnd"
      @upload-progress="onQuestionUploadProgress" />

    <!-- Dialog Quản lý kỹ năng -->
    <uc-dialog-skill-manager v-model="dialogSkill" :mon-hoc-id="selectedMon ? selectedMon.MonHocID : null"
      :mon-hoc-name="selectedMon ? selectedMon.TenMonHoc_HienThi : ''" />
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      treeKhoi: [],
      treeLoading: false,
      selectedMon: null,
      DSGroup: [],
      selectedGroup: null,
      DSQuestion: [],
      searchQ: '',
      filterType: null,
      dialogGroup: false,
      formGroup: {},
      dialogQuestion: false,
      formQuestion: {},
      dialogSkill: false,
      uploadingGroups: {},
      uploadingQuestions: {},
      headersQuestion: [
        { title: 'STT', key: 'OrdinalNumber', width: 56 },
        { title: 'Loại', key: 'Type', width: 160 },
        { title: 'Nội dung', key: 'QuestionText' },
        { title: 'Điểm', key: 'Points', width: 70 },
        { title: 'Nâng cao', key: 'IsAdvanced', width: 90 },
        { title: 'Media', key: 'media', width: 70, sortable: false },
        { title: '', key: 'actions', width: 96, sortable: false },
      ],
      TypeOptions: [
        { value: 'QUIZ_SINGLE_CHOICE', label: 'TN 1 đáp án', color: 'blue' },
        { value: 'QUIZ_MULTIPLE_CHOICE', label: 'TN nhiều đáp án', color: 'indigo' },
        { value: 'QUIZ_TRUE_FALSE', label: 'Đúng/Sai', color: 'teal' },
        { value: 'QUIZ_FILL_IN_BLANK', label: 'Điền chỗ trống', color: 'green' },
        { value: 'QUIZ_SHORT_ANSWER', label: 'Trả lời ngắn', color: 'cyan' },
        { value: 'QUIZ_ESSAY', label: 'Tự luận', color: 'orange' },
        { value: 'QUIZ_MATCHING', label: 'Nối đáp án', color: 'purple' },
      ],
    }
  },
  computed: {
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
    selectedKhoiName() {
      if (!this.selectedMon) return null
      const k = this.treeKhoi.find(x => x.KhoiID === this.selectedMon.KhoiID)
      return k ? (k.TenKhoiHoc || ('Khối ' + k.KhoiID)) : null
    },
  },
  watch: {
    selectedMon(v) {
      this.DSGroup = []; this.selectedGroup = null; this.DSQuestion = []
      if (v) this.getGroups()
    },
  },
  mounted() {
    this.getTeacherKhoiMon()
  },
  methods: {
    async getTeacherKhoiMon() {
      this.treeLoading = true
      const res = await fetchPromise('lms/EL_Teacher_GetKhoi_MonHoc_ByGiaoVienID', {
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem.HocKi,
      })
      console.log('Khoi-MonHoc:', res)
      const dsKhoi = res?.[0] ?? []
      const dsMon = res?.[1] ?? []
      const khoiMap = {}
      for (const k of dsKhoi) {
        khoiMap[k.KhoiID] = { ...k, _open: false, children: [] }
      }
      for (const m of dsMon) {
        if (khoiMap[m.KhoiID]) {
          khoiMap[m.KhoiID].children.push({ ...m })
        }
      }
      this.treeKhoi = Object.values(khoiMap)
      this.treeLoading = false
    },
    toggleKhoi(khoi) {
      khoi._open = !khoi._open
    },
    selectMonHoc(mon) {
      this.selectedMon = mon
    },
    async getGroups() {
      const res = await fetchPromise('lms/EL_QuestionGroup_List', {
        MonHocID: this.selectedMon?.MonHocID,
        KhoiID: this.selectedMon?.KhoiID,
        IncludeDeleted: false,
        PageNumber: 1,
        PageSize: 100,
      }, { forceRefresh: true })
      console.log('[getGroups] res:', res)
      const flat = Array.isArray(res?.[0]) ? res[0] : res
      this.DSGroup = flat ?? []
      if (this.selectedGroup) {
        const found = this.DSGroup.find(g => g.Id === this.selectedGroup.Id)
        this.selectedGroup = found ?? null
        if (!found) this.DSQuestion = []
      }
    },
    async selectGroup(group) {
      this.selectedGroup = group
      this.searchQ = ''
      this.filterType = null
      await this.loadQuestions()
    },
    async loadQuestions() {
      if (!this.selectedGroup) return
      this.DSQuestion = []
      const res = await fetchPromise('lms/EL_Question_List', {
        GroupId: this.selectedGroup.Id,
        Type: this.filterType || '',
        Search: this.searchQ || '',
        IncludeDeleted: false,
        PageNumber: 1,
        PageSize: 100
      }, { forceRefresh: true })
      console.log('[loadQuestions] res:', res)
      const flat = Array.isArray(res?.[0]) ? res[0] : res
      this.DSQuestion = flat ?? []
    },
    getTypeLabel(type) {
      return this.TypeOptions.find(t => t.value === type)?.label ?? type
    },
    getTypeColor(type) {
      return this.TypeOptions.find(t => t.value === type)?.color ?? 'grey'
    },
    hasMedia(jsonStr, source) {
      try {
        const obj = JSON.parse(jsonStr || 'null')
        if (!obj) return false
        const m = source === 'question' ? obj.media : obj
        if (!m) return false
        return !!(m.sourceYT?.id || m.sourceRecord?.id ||
          m.sourceFiles?.image?.length || m.sourceFiles?.file?.length)
      } catch { return false }
    },
    openAddGroup() {
      this.formGroup = {
        SourceId: crypto.randomUUID(),
        MonHocID: this.selectedMon?.MonHocID,
        KhoiID: this.selectedMon?.KhoiID,
      }
      this.dialogGroup = true
    },
    openEditGroup(group) {
      this.formGroup = { ...group }
      this.dialogGroup = true
    },
    async deleteGroup(group) {
      const ok = await this.confirmRef.value.show({ title: `Xóa nhóm "${group.Title}"?` })
      if (!ok) return
      const res = await fetchPromise('lms/EL_QuestionGroup_Delete', { Id: group.Id, User: vueData.user.UserID }, { cache: false })
      const result = Array.isArray(res) ? res[0] : res
      if (result?.Action === 'Deleted' || result?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Đã xóa nhóm', color: 'success' })
        if (this.selectedGroup?.Id === group.Id) { this.selectedGroup = null; this.DSQuestion = [] }
        await this.getGroups()
      }
    },
    onClearSearch() {
      this.searchQ = ''
      this.loadQuestions()
    },
    async onRefresh() {
      if (this.selectedMon) await this.getGroups()
    },
    async onGroupSaved() {
      await this.getGroups()
    },
    openAddQuestion() {
      this.formQuestion = { GroupId: this.selectedGroup.Id }
      this.dialogQuestion = true
    },
    openEditQuestion(q) {
      this.formQuestion = { ...q }
      this.dialogQuestion = true
    },
    async deleteQuestion(q) {
      const ok = await this.confirmRef.value.show({ title: `Xóa câu hỏi "#${q.Id}"?` })
      if (!ok) return
      const res = await fetchPromise('lms/EL_Question_Delete', { Id: q.Id, User: vueData.user.UserID }, { cache: false })
      const result = Array.isArray(res) ? res[0] : res
      if (result?.Action === 'Deleted' || result?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Đã xóa câu hỏi', color: 'success' })
        await this.loadQuestions()
      }
    },
    async onQuestionSaved() {
      await this.loadQuestions()
    },
    onGroupUploadStart({ id }) { if (id !== null && !this.uploadingGroups[id]) this.uploadingGroups[id] = { text: '' } },
    onGroupUploadEnd({ id }) { delete this.uploadingGroups[id] },
    onGroupUploadProgress({ id, text }) { if (this.uploadingGroups[id]) this.uploadingGroups[id].text = text },
    onQuestionUploadStart({ id }) { if (id !== null && !this.uploadingQuestions[id]) this.uploadingQuestions[id] = { text: '' } },
    onQuestionUploadEnd({ id }) { delete this.uploadingQuestions[id] },
    onQuestionUploadProgress({ id, text }) { if (this.uploadingQuestions[id]) this.uploadingQuestions[id].text = text },
  },
}
</script>
