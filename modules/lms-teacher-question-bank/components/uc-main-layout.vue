<template>
  <Global>
    <template #header>
      <v-card>
        <v-card-text class="d-flex align-center ga-2 flex-wrap py-2">
          <span class="text-subtitle-1 font-weight-bold">{{ TitlePage }}</span>
          <template v-if="AssignmentItem">
            <v-icon size="small" class="text-medium-emphasis">mdi-chevron-right</v-icon>
            <v-chip size="small" color="primary" variant="tonal" closable @click:close="AssignmentItem = null">
              {{ AssignmentItem.Title }}
            </v-chip>
          </template>
          <v-spacer />
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
              <template v-for="mon in khoi.children" :key="mon.MonHocID">
                <v-list-item rounded="lg" class="mb-1" style="padding-left: 24px;" @click="toggleMonHoc(khoi, mon)">
                  <template #prepend>
                    <v-icon size="small">{{ mon._open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">{{ mon.TenMonHoc_HienThi }}</v-list-item-title>
                  <template #append>
                    <v-progress-circular v-if="mon._loading" size="12" width="2" indeterminate />
                  </template>
                </v-list-item>
                <template v-if="mon._open">
                  <v-list-item v-for="asgn in mon.children" :key="asgn.AssignmentID" rounded="lg" class="mb-1"
                    style="padding-left: 40px;"
                    :active="AssignmentItem && AssignmentItem.AssignmentID === asgn.AssignmentID" color="primary"
                    @click="selectAssignment(asgn)">
                    <v-list-item-title class="text-caption" style="white-space: normal; line-height: 1.3;">{{ asgn.Title
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption opacity-60 d-flex ga-1 flex-wrap">
                      <span v-if="asgn.TuanHienThi">{{ asgn.TuanHienThi }}</span>
                      <span v-if="asgn.TuanHienThi && asgn.Chuong"> • </span>
                      <span v-if="asgn.Chuong">{{ asgn.Chuong }}</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <div v-if="!mon.children.length" class="text-caption text-medium-emphasis pa-2"
                    style="padding-left: 40px;">Không có bài tập</div>
                </template>
              </template>
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
            <v-list-item-title class="text-body-2 font-weight-medium">{{ group.Title }}</v-list-item-title>
            <v-list-item-subtitle v-if="group.Description" class="text-caption">
              {{ group.Description }}
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex align-center ga-1">
                <v-btn icon size="x-small" variant="text" color="primary" @click.stop="openEditGroup(group)">
                  <v-icon size="small">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Sửa</v-tooltip>
                </v-btn>
                <v-btn icon size="x-small" variant="text" color="error" @click.stop="deleteGroup(group)">
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
            <div class="text-body-2 text-truncate" style="max-width: 260px;"
              v-html="item.QuestionText || item.Label || '-'" />
          </template>
          <template #item.Points="{ item }">
            <span class="text-body-2">{{ item.Points ?? '-' }}</span>
          </template>
          <template #item.IsAdvanced="{ item }">
            <v-icon v-if="item.IsAdvanced" color="warning" size="small">mdi-star</v-icon>
            <span v-else class="text-medium-emphasis text-caption">-</span>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex align-center ga-1">
              <v-btn icon size="small" variant="text" color="primary" @click="openEditQuestion(item)">
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="deleteQuestion(item)">
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
    <uc-dialog-group v-model="dialogGroup" :item="formGroup" @saved="onGroupSaved" />

    <!-- Dialog Câu hỏi -->
    <uc-dialog-question v-model="dialogQuestion" :item="formQuestion"
      :group-id="selectedGroup ? selectedGroup.Id : null" :mon-hoc-id="AssignmentItem ? AssignmentItem.MonHocID : null"
      @saved="onQuestionSaved" />
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
      AssignmentItem: null,
      DSGroup: [],
      selectedGroup: null,
      DSQuestion: [],
      searchQ: '',
      filterType: null,
      dialogGroup: false,
      formGroup: {},
      dialogQuestion: false,
      formQuestion: {},
      headersQuestion: [
        { title: 'STT', key: 'OrdinalNumber', width: 56 },
        { title: 'Loại', key: 'Type', width: 160 },
        { title: 'Nội dung', key: 'QuestionText' },
        { title: 'Điểm', key: 'Points', width: 70 },
        { title: 'Nâng cao', key: 'IsAdvanced', width: 90 },
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
  },
  watch: {
    AssignmentItem(v) {
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
          khoiMap[m.KhoiID].children.push({ ...m, _open: false, _loading: false, _loaded: false, children: [] })
        }
      }
      this.treeKhoi = Object.values(khoiMap)
      this.treeLoading = false
    },
    toggleKhoi(khoi) {
      khoi._open = !khoi._open
    },
    async toggleMonHoc(khoi, mon) {
      mon._open = !mon._open
      if (mon._open && !mon._loaded) {
        mon._loading = true
        const res = await fetchPromise('lms/EL_Assignment_Get_By_KhoiID_MonHocID', {
          KhoiID: khoi.KhoiID,
          MonHocID: mon.MonHocID,
        })
        mon.children = res ?? []
        mon._loaded = true
        mon._loading = false
      }
    },
    selectAssignment(asgn) {
      this.AssignmentItem = asgn
    },
    async getGroups() {
      const res = await fetchPromise('lms/EL_QuestionGroup_List', { AssignmentId: this.AssignmentItem?.AssignmentID })
      this.DSGroup = res ?? []
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
        Type: this.filterType || null,
        Search: this.searchQ || null,
      })
      this.DSQuestion = res ?? []
    },
    getTypeLabel(type) {
      return this.TypeOptions.find(t => t.value === type)?.label ?? type
    },
    getTypeColor(type) {
      return this.TypeOptions.find(t => t.value === type)?.color ?? 'grey'
    },
    openAddGroup() {
      this.formGroup = { AssignmentId: this.AssignmentItem?.AssignmentID }
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
      if (res?.Action === 'Deleted' || res?.status === 'success') {
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
      if (this.AssignmentItem) await this.getGroups()
    },
    async onGroupSaved() {
      this.dialogGroup = false
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
      const ok = await this.confirmRef.value.show({ title: `Xóa câu hỏi "${q.Label || ('#' + q.Id)}"?` })
      if (!ok) return
      const res = await fetchPromise('lms/EL_Question_Delete', { Id: q.Id, User: vueData.user.UserID }, { cache: false })
      if (res?.Action === 'Deleted' || res?.status === 'success') {
        this.snackbarRef.value.showSnackbar({ message: 'Đã xóa câu hỏi', color: 'success' })
        await this.loadQuestions()
      }
    },
    async onQuestionSaved() {
      this.dialogQuestion = false
      await this.loadQuestions()
    },
  },
}
</script>
