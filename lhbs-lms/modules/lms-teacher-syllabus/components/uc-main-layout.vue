<template>
	<Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-select
                v-model="selectedCap"
                label="Chọn cấp"
                :items="DSCap"
                item-title="title"
                item-value="value"
                :return-object="true"
                :hide-details="true"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="selectedKhoi"
                label="Chọn khối"
                :items="DSKhoi"
                item-title="TenKhoiHoc"
                item-value="KhoiID"
                :return-object="true"
                :hide-details="true"
                :disabled="!selectedCap"
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="selectedMon"
                label="Chọn môn học"
                :items="DSMonHoc"
                item-title="MonHocName"
                item-value="MonHocID"
                :return-object="true"
                :hide-details="true"
                :disabled="!selectedKhoi"
              />
            </v-col>
            <v-col cols="12" sm="3" class="d-flex align-center ga-2 flex-wrap justify-end">
              <v-btn variant="outlined" color="primary" @click="onRefresh" :disabled="!selectedMon">
                <v-icon start>mdi-reload</v-icon>Làm mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

     <div style="height: calc(100dvh - 77px); overflow-y: auto; background: #fafafa;" class="pa-4">
      <div class="d-flex align-center mb-4 ga-2">
        <span class="text-subtitle-1 font-weight-bold text-primary">Danh sách chương trình học</span>
        <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">{{ DSSyllabus.length }}</v-chip>
        <v-spacer />
        <v-btn color="success" @click="openAddSyllabus" :disabled="!selectedMon" size="small">
          <v-icon start>mdi-plus</v-icon>Thêm chương trình mới
        </v-btn>
      </div>

      <div v-if="!selectedMon" class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis bg-white border rounded-lg flat">
        <v-icon size="64" class="mb-3 opacity-20">mdi-book-open-blank-variant</v-icon>
        <p class="text-body-2">Vui lòng chọn cấp, khối và môn học ở bộ lọc phía trên</p>
      </div>

      <div v-else-if="!DSSyllabus.length" class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis bg-white border rounded-lg flat">
        <v-icon size="64" class="mb-3 opacity-20">mdi-book-open-blank-variant</v-icon>
        <p class="text-body-2 mb-3">Chưa có chương trình học nào được tạo cho môn học này</p>
        <v-btn color="primary" @click="openAddSyllabus" size="small">
          <v-icon start>mdi-plus</v-icon>Tạo chương trình học đầu tiên
        </v-btn>
      </div>

      <v-expansion-panels v-else v-model="activePanels" multiple class="syllabus-panels">
        <v-expansion-panel
          v-for="syllabus in DSSyllabus"
          :key="syllabus.SyllabusID"
          class="mb-3 border rounded-lg overflow-hidden"
          :value="syllabus.SyllabusID"
        >
          <v-expansion-panel-title class="py-3 px-4 bg-white">
            <div class="d-flex align-center w-100 ga-3 flex-wrap">
              <v-icon color="deep-purple-accent-3" size="28">mdi-book-open-page-variant</v-icon>
              <div class="d-flex flex-column" style="min-width: 200px;">
                <span class="text-subtitle-1 font-weight-bold text-grey-darken-4 text-left">{{ syllabus.Title }}</span>
                <span class="text-caption text-medium-emphasis text-left">
                  Học kỳ: {{ getHocKiText(syllabus.HocKi) }}
                  <span v-if="syllabus.Description"> | {{ syllabus.Description }}</span>
                </span>
              </div>
              
              <!-- Nút hành động trên từng sách -->
              <div class="d-flex align-center ga-1 ms-auto" @click.stop>
                <v-btn size="small" variant="tonal" color="warning" class="me-1" @click="openCloneSyllabusFor(syllabus)">
                  <v-icon start size="16">mdi-content-copy</v-icon>Sao chép cấu trúc
                </v-btn>
                <v-btn size="small" variant="tonal" color="primary" class="me-1" @click="openAddRootNodeFor(syllabus)">
                  <v-icon start size="16">mdi-plus</v-icon>Thêm chương/mục
                </v-btn>
                <v-btn icon size="small" variant="text" color="primary" @click="openEditSyllabus(syllabus)">
                  <v-icon size="20">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="text" color="error" @click="deleteSyllabus(syllabus)">
                  <v-icon size="20">mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="bg-grey-lighten-5 pa-3" style="border-top: 1px solid rgba(0,0,0,0.12)">
            <div v-if="treeLoadingMap[syllabus.SyllabusID]" class="d-flex justify-center py-6">
              <v-progress-circular size="32" indeterminate color="primary" />
            </div>
            
            <uc-editable-treeview-syllabus
              v-else-if="SyllabusTreeMap[syllabus.SyllabusID] && SyllabusTreeMap[syllabus.SyllabusID].length > 0"
              :nodes="SyllabusTreeMap[syllabus.SyllabusID]"
              :syllabus-id="syllabus.SyllabusID"
              @update="handleTreeUpdate(syllabus.SyllabusID, $event)"
              @add-new="openAddChildNode"
              @edit="openEditNode"
              @delete="handleDeleteNode"
            />

            <div v-else class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
              <v-icon size="48" class="mb-2 opacity-30">mdi-folder-open-outline</v-icon>
              <p class="text-body-2 mb-2">Chưa có chương hoặc bài học nào trong chương trình này</p>
              <div class="d-flex ga-2">
                <v-btn size="small" color="primary" @click="openAddRootNodeFor(syllabus)">
                  <v-icon start>mdi-plus</v-icon>Thêm mục đầu tiên
                </v-btn>
                <v-btn size="small" color="warning" variant="tonal" @click="openCloneSyllabusFor(syllabus)">
                  <v-icon start>mdi-content-copy</v-icon>Sao chép cấu trúc từ sách khác
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Dialog Thêm/Sửa Syllabus -->
    <uc-dialog v-model="dialogSyllabus" :title="dialogSyllabusTitle" doneText="Lưu" @onSubmit="saveSyllabus">
      <v-form ref="formSyllabus" class="pa-1">
        <v-text-field
          v-model="formSyllabusData.Title"
          label="Tên chương trình học / Sách giáo khoa"
          :rules="[v => !!v || 'Tên chương trình học không được để trống']"
          required
          class="mb-3"
        />
        <v-textarea
          v-model="formSyllabusData.Description"
          label="Mô tả"
          rows="3"
          class="mb-3"
        />
        <v-select
          v-model="formSyllabusData.HocKi"
          label="Học kỳ"
          :items="HocKiOptions"
          item-title="title"
          item-value="value"
          class="mb-1"
        />
      </v-form>
    </uc-dialog>

    <!-- Dialog Thêm/Sửa Syllabus Node -->
    <uc-dialog v-model="dialogNode" :title="dialogNodeTitle" doneText="Lưu" @onSubmit="saveNode">
      <v-form ref="formNode" class="pa-1">
        <v-text-field
          v-model="formNodeData.Title"
          label="Tiêu đề mục"
          :rules="[v => !!v || 'Tiêu đề không được để trống']"
          required
          class="mb-3"
        />
        <v-select
          v-model="formNodeData.NodeType"
          label="Loại mục"
          :items="NodeTypeOptions"
          item-title="title"
          item-value="value"
          :disabled="isEditingNode"
          class="mb-1"
        />
      </v-form>
    </uc-dialog>

    <!-- Dialog Sao chép cấu trúc -->
    <uc-dialog v-model="dialogCloneSyllabus" title="Sao chép cấu trúc chương trình học" doneText="Xác nhận sao chép" @onSubmit="cloneSyllabusStructure">
      <v-form ref="formClone" class="pa-1">
        <v-select
          v-model="cloneCap"
          label="Cấp học nguồn"
          :items="DSCap"
          item-title="title"
          item-value="value"
          :return-object="true"
          class="mb-3"
        />
        <v-select
          v-model="cloneKhoi"
          label="Khối lớp nguồn"
          :items="cloneDSKhoi"
          item-title="TenKhoiHoc"
          item-value="KhoiID"
          :return-object="true"
          :disabled="!cloneCap"
          class="mb-3"
        />
        <v-select
          v-model="cloneMon"
          label="Môn học nguồn"
          :items="cloneDSMonHoc"
          item-title="MonHocName"
          item-value="MonHocID"
          :return-object="true"
          :disabled="!cloneKhoi"
          class="mb-3"
        />
        <v-select
          v-model="cloneSourceSyllabus"
          label="Chương trình học nguồn (Sách mẫu)"
          :items="cloneDSSourceSyllabus"
          item-title="Title"
          item-value="SyllabusID"
          :return-object="true"
          :disabled="!cloneMon"
          :rules="[v => !!v || 'Vui lòng chọn chương trình học nguồn']"
          required
          class="mb-1"
        />
      </v-form>
    </uc-dialog>
  </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      DSCap: [
        { title: 'Cấp 1', value: 1 },
        { title: 'Cấp 2', value: 2 },
        { title: 'Cấp 3', value: 3 }
      ],
      selectedCap: null,
      DSKhoi: [],
      DSMonHoc: [],
      selectedKhoi: null,
      selectedMon: null,

      DSSyllabus: [],
      SyllabusTreeMap: {},
      treeLoadingMap: {},
      activePanels: [],
      activeSyllabus: null,

      // State cho Syllabus Dialog
      dialogSyllabus: false,
      isEditingSyllabus: false,
      formSyllabusData: {
        SyllabusID: 0,
        Title: '',
        Description: '',
        HocKi: 0
      },
      HocKiOptions: [
        { title: 'Cả năm', value: 0 },
        { title: 'Học kỳ 1', value: 1 },
        { title: 'Học kỳ 2', value: 2 }
      ],

      // State cho Node Dialog
      dialogNode: false,
      isEditingNode: false,
      activeParentNode: null,
      formNodeData: {
        NodeID: 0,
        Title: '',
        NodeType: 'CHAPTER'
      },
      NodeTypeOptions: [
        { title: 'Chương / Mục lớn (CHAPTER)', value: 'CHAPTER' },
        { title: 'Bài học / Nội dung (LESSON)', value: 'LESSON' }
      ],

      // State cho Clone Dialog
      dialogCloneSyllabus: false,
      cloneCap: null,
      cloneKhoi: null,
      cloneMon: null,
      cloneSourceSyllabus: null,
      cloneDSKhoi: [],
      cloneDSMonHoc: [],
      cloneDSSourceSyllabus: []
    }
  },
  computed: {
    TitleCap() { return renderText(parseInt(vueData.CapID)) },
    TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
    dialogSyllabusTitle() {
      return this.isEditingSyllabus ? 'Chỉnh sửa chương trình học' : 'Thêm chương trình học mới'
    },
    dialogNodeTitle() {
      if (this.isEditingNode) {
        return 'Chỉnh sửa mục'
      }
      return this.activeParentNode 
        ? `Thêm mục con cho "${this.activeParentNode.Title}"` 
        : 'Thêm chương/mục lớn mới'
    }
  },
  watch: {
    'vueData.NienKhoa'(v) {
      if (v) {
        this.selectedCap = null
        this.selectedKhoi = null
        this.selectedMon = null
        this.DSKhoi = []
        this.DSMonHoc = []
        this.DSSyllabus = []
        this.SyllabusTreeMap = {}
        this.treeLoadingMap = {}
        this.activePanels = []
        this.initPage()
      }
    },
    selectedCap(v) {
      this.selectedKhoi = null
      this.selectedMon = null
      this.DSKhoi = []
      this.DSMonHoc = []
      this.DSSyllabus = []
      this.SyllabusTreeMap = {}
      this.treeLoadingMap = {}
      this.activePanels = []
      if (v) {
        vueData.CapID = v.value
        this.getKhoiList()
      }
    },
    selectedKhoi(v) {
      this.selectedMon = null
      this.DSMonHoc = []
      this.DSSyllabus = []
      this.SyllabusTreeMap = {}
      this.treeLoadingMap = {}
      this.activePanels = []
      if (v) {
        this.getMonHocList()
      }
    },
    selectedMon(v) {
      this.DSSyllabus = []
      this.SyllabusTreeMap = {}
      this.treeLoadingMap = {}
      this.activePanels = []
      if (v) {
        this.getSyllabusList()
      }
    },
    cloneCap(v) {
      this.cloneKhoi = null
      this.cloneMon = null
      this.cloneSourceSyllabus = null
      this.cloneDSKhoi = []
      this.cloneDSMonHoc = []
      this.cloneDSSourceSyllabus = []
      if (v) {
        this.getCloneKhoiList()
      }
    },
    cloneKhoi(v) {
      this.cloneMon = null
      this.cloneSourceSyllabus = null
      this.cloneDSMonHoc = []
      this.cloneDSSourceSyllabus = []
      if (v) {
        this.getCloneMonHocList()
      }
    },
    cloneMon(v) {
      this.cloneSourceSyllabus = null
      this.cloneDSSourceSyllabus = []
      if (v) {
        this.getCloneSyllabusList()
      }
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    // ----------------------------------------------------
    // API & Data Fetching
    // ----------------------------------------------------
    initPage() {
      let defaultCap = parseInt(vueData.CapID) || 0
      if (![1, 2, 3].includes(defaultCap)) {
        defaultCap = 1
      }
      
      const foundCap = this.DSCap.find(c => c.value === defaultCap)
      if (foundCap) {
        this.selectedCap = foundCap
      } else if (this.DSCap.length > 0) {
        this.selectedCap = this.DSCap[0]
      }
    },

    async getKhoiList() {
      if (!this.selectedCap) return
      const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
        CapID: this.selectedCap.value,
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem?.HocKi || 1
      })
      this.DSKhoi = res ?? []
      if (this.DSKhoi.length > 0) {
        this.selectedKhoi = this.DSKhoi[0]
      }
    },

    async getMonHocList() {
      if (!this.selectedKhoi) return
      const res = await fetchPromise('lms/MonHoc_GetByKhoiID', {
        KhoiID: this.selectedKhoi.KhoiID,
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem?.HocKi || 1
      })
      this.DSMonHoc = res ?? []
      if (this.DSMonHoc.length > 0) {
        this.selectedMon = this.DSMonHoc[0]
      }
    },

    async getSyllabusList() {
      if (!this.selectedKhoi || !this.selectedMon) return
      const res = await fetchPromise('lms/EL_Syllabus_GetByLopMon', {
        KhoiID: this.selectedKhoi.KhoiID,
        MonHocID: this.selectedMon.MonHocID,
        NienKhoa: vueData.NienKhoa
      }, { forceRefresh: true })
      this.DSSyllabus = res ?? []
      
      this.activePanels = this.DSSyllabus.map(s => s.SyllabusID)
      this.SyllabusTreeMap = {}
      this.treeLoadingMap = {}

      if (this.DSSyllabus.length > 0) {
        const promises = this.DSSyllabus.map(s => this.getSyllabusTree(s.SyllabusID))
        await Promise.all(promises)
      }
    },

    async getSyllabusTree(syllabusId) {
      this.treeLoadingMap = { ...this.treeLoadingMap, [syllabusId]: true }
      const res = await fetchPromise('lms/EL_Syllabus_GetTree', {
        SyllabusID: syllabusId
      }, { forceRefresh: true })
      this.SyllabusTreeMap = { ...this.SyllabusTreeMap, [syllabusId]: this.buildTree(res ?? []) }
      this.treeLoadingMap = { ...this.treeLoadingMap, [syllabusId]: false }
    },

    // ----------------------------------------------------
    // Clone Syllabus Structure
    // ----------------------------------------------------
    openCloneSyllabusFor(syllabus) {
      this.activeSyllabus = syllabus
      this.cloneCap = this.selectedCap
      this.cloneKhoi = this.selectedKhoi
      this.cloneMon = this.selectedMon
      this.cloneSourceSyllabus = null
      this.cloneDSSourceSyllabus = []
      this.dialogCloneSyllabus = true
    },

    async getCloneKhoiList() {
      if (!this.cloneCap) return
      const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
        CapID: this.cloneCap.value,
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem?.HocKi || 1
      })
      this.cloneDSKhoi = res ?? []
      if (this.cloneDSKhoi.length > 0) {
        const found = this.cloneDSKhoi.find(k => k.KhoiID === this.selectedKhoi?.KhoiID)
        this.cloneKhoi = found ?? this.cloneDSKhoi[0]
      }
    },

    async getCloneMonHocList() {
      if (!this.cloneKhoi) return
      const res = await fetchPromise('lms/MonHoc_GetByKhoiID', {
        KhoiID: this.cloneKhoi.KhoiID,
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem?.HocKi || 1
      })
      this.cloneDSMonHoc = res ?? []
      if (this.cloneDSMonHoc.length > 0) {
        const found = this.cloneDSMonHoc.find(m => m.MonHocID === this.selectedMon?.MonHocID)
        this.cloneMon = found ?? this.cloneDSMonHoc[0]
      }
    },

    async getCloneSyllabusList() {
      if (!this.cloneKhoi || !this.cloneMon) return
      const res = await fetchPromise('lms/EL_Syllabus_GetByLopMon', {
        KhoiID: this.cloneKhoi.KhoiID,
        MonHocID: this.cloneMon.MonHocID,
        NienKhoa: vueData.NienKhoa
      }, { forceRefresh: true })
      this.cloneDSSourceSyllabus = (res ?? []).filter(s => s.SyllabusID !== this.activeSyllabus?.SyllabusID)
    },

    async cloneSyllabusStructure() {
      if (this.$refs.formClone && !(await this.$refs.formClone.validate()).valid) {
        return
      }

      if (!this.cloneSourceSyllabus) {
        this.snackbarRef.value.showSnackbar({ message: 'Vui lòng chọn chương trình học nguồn', color: 'error' })
        return
      }

      const ok = await this.confirmRef.value.show({
        title: 'Xác nhận sao chép cấu trúc?',
        message: `Hành động này sẽ XÓA TOÀN BỘ cấu trúc hiện tại của chương trình học "${this.activeSyllabus.Title}" và thay thế bằng cấu trúc của chương trình "${this.cloneSourceSyllabus.Title}". Bạn có chắc chắn muốn tiếp tục?`
      })
      if (!ok) return

      const payload = {
        SourceSyllabusID: this.cloneSourceSyllabus.SyllabusID,
        TargetSyllabusID: this.activeSyllabus.SyllabusID,
        sys_UserID: vueData.user.UserID
      }

      const res = await fetchPromise('lms/EL_Syllabus_CloneStructure', payload, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({ message: 'Sao chép cấu trúc chương trình học thành công', color: 'success' })
        this.dialogCloneSyllabus = false
        await this.getSyllabusTree(this.activeSyllabus.SyllabusID)
      }
    },

    buildTree(flatNodes) {
      const nodeMap = {}
      const roots = []

      flatNodes.forEach(node => {
        nodeMap[node.NodeID] = { ...node, children: [] }
      })

      flatNodes.forEach(node => {
        const mappedNode = nodeMap[node.NodeID]
        if (node.ParentID && nodeMap[node.ParentID]) {
          nodeMap[node.ParentID].children.push(mappedNode)
        } else {
          roots.push(mappedNode)
        }
      })

      const sortFunc = (a, b) => (a.SortOrder - b.SortOrder)
      roots.sort(sortFunc)
      
      const sortChildren = (nodes) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            node.children.sort(sortFunc)
            sortChildren(node.children)
          }
        })
      }
      sortChildren(roots)

      return roots
    },

    // ----------------------------------------------------
    // CRUD Syllabus (Sách giáo khoa)
    // ----------------------------------------------------
    openAddSyllabus() {
      this.isEditingSyllabus = false
      this.formSyllabusData = {
        SyllabusID: 0,
        Title: '',
        Description: '',
        HocKi: vueData.NienKhoaItem?.HocKi ?? 1
      }
      this.dialogSyllabus = true
    },

    openEditSyllabus(item) {
      this.isEditingSyllabus = true
      this.formSyllabusData = { ...item }
      this.dialogSyllabus = true
    },

    async saveSyllabus() {
      if (this.$refs.formSyllabus && !(await this.$refs.formSyllabus.validate()).valid) {
        return
      }

      const payload = {
        SyllabusID: this.formSyllabusData.SyllabusID,
        Title: this.formSyllabusData.Title,
        Description: this.formSyllabusData.Description,
        KhoiID: this.selectedKhoi.KhoiID,
        MonHocID: this.selectedMon.MonHocID,
        NienKhoa: vueData.NienKhoa,
        HocKi: this.formSyllabusData.HocKi,
        sys_UserID: vueData.user.UserID
      }

      const res = await fetchPromise('lms/EL_Syllabus_Save', payload, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({
          message: this.isEditingSyllabus ? 'Cập nhật chương trình học thành công' : 'Thêm chương trình học thành công',
          color: 'success'
        })
        this.dialogSyllabus = false
        await this.getSyllabusList()
      }
    },

    async deleteSyllabus(item) {
      const ok = await this.confirmRef.value.show({
        title: `Xác nhận xóa chương trình học "${item.Title}"?`
      })
      if (!ok) return

      await fetchPromise('lms/EL_Syllabus_Delete', {
        SyllabusID: item.SyllabusID,
        sys_UserID: vueData.user.UserID
      }, { cache: false })

      this.snackbarRef.value.showSnackbar({ message: 'Đã xóa chương trình học', color: 'success' })
      await this.getSyllabusList()
    },

    // ----------------------------------------------------
    // CRUD Syllabus Nodes (Chương / Bài)
    // ----------------------------------------------------
    openAddRootNodeFor(syllabus) {
      this.isEditingNode = false
      this.activeParentNode = null
      this.activeSyllabus = syllabus
      this.formNodeData = {
        NodeID: 0,
        Title: '',
        NodeType: 'CHAPTER'
      }
      this.dialogNode = true
    },

    openAddChildNode(parentNode) {
      this.isEditingNode = false
      this.activeParentNode = parentNode
      this.activeSyllabus = this.DSSyllabus.find(s => s.SyllabusID === parentNode.SyllabusID)
      this.formNodeData = {
        NodeID: 0,
        Title: '',
        NodeType: 'LESSON'
      }
      this.dialogNode = true
    },

    openEditNode(node) {
      this.isEditingNode = true
      this.activeParentNode = null
      this.activeSyllabus = this.DSSyllabus.find(s => s.SyllabusID === node.SyllabusID)
      this.formNodeData = {
        NodeID: node.NodeID,
        Title: node.Title,
        NodeType: node.NodeType
      }
      this.dialogNode = true
    },

    async saveNode() {
      if (this.$refs.formNode && !(await this.$refs.formNode.validate()).valid) {
        return
      }

      const payload = {
        NodeID: this.formNodeData.NodeID,
        SyllabusID: this.activeSyllabus.SyllabusID,
        ParentID: this.isEditingNode ? undefined : (this.activeParentNode ? this.activeParentNode.NodeID : null),
        Title: this.formNodeData.Title,
        NodeType: this.formNodeData.NodeType,
        SortOrder: 0,
        sys_UserID: vueData.user.UserID
      }

      const res = await fetchPromise('lms/EL_SyllabusNode_Save', payload, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({
          message: this.isEditingNode ? 'Cập nhật mục thành công' : 'Thêm mục mới thành công',
          color: 'success'
        })
        this.dialogNode = false
        await this.getSyllabusTree(this.activeSyllabus.SyllabusID)
      }
    },

    async handleDeleteNode(node) {
      const ok = await this.confirmRef.value.show({
        title: `Xác nhận xóa mục "${node.Title}" và tất cả các mục con bên trong?`
      })
      if (!ok) return

      await fetchPromise('lms/EL_SyllabusNode_Delete', {
        NodeID: node.NodeID,
        sys_UserID: vueData.user.UserID
      }, { cache: false })

      this.snackbarRef.value.showSnackbar({ message: 'Đã xóa mục', color: 'success' })
      await this.getSyllabusTree(node.SyllabusID)
    },

    // ----------------------------------------------------
    // Kéo thả & Cập nhật Cấu trúc Cây
    // ----------------------------------------------------
    async handleTreeUpdate(syllabusId, updatedNodes) {
      this.SyllabusTreeMap = {
        ...this.SyllabusTreeMap,
        [syllabusId]: updatedNodes
      }

      const flatList = this.flattenTree(updatedNodes)
      
      const payload = {
        JsonData: JSON.stringify(flatList),
        sys_UserID: vueData.user.UserID
      }

      const res = await fetchPromise('lms/EL_SyllabusNode_UpdateTreeStructure', payload, { cache: false })
      if (res) {
        this.snackbarRef.value.showSnackbar({ message: 'Cập nhật cấu trúc cây thành công', color: 'success' })
        await this.getSyllabusTree(syllabusId)
      }
    },

    flattenTree(nodes, parentId = null) {
      let result = []
      nodes.forEach((node, index) => {
        result.push({
          id: node.NodeID,
          order: index * 10,
          parent: parentId
        })
        if (node.children && node.children.length > 0) {
          result = result.concat(this.flattenTree(node.children, node.NodeID))
        }
      })
      return result
    },

    // ----------------------------------------------------
    // Helpers
    // ----------------------------------------------------
    getHocKiText(hk) {
      if (hk === 1) return 'Học kỳ 1'
      if (hk === 2) return 'Học kỳ 2'
      return 'Cả năm'
    },

    async onRefresh() {
      if (this.selectedMon) {
        await this.getSyllabusList()
      }
    }
  }
	}
</script>