<template>
	<Global>
    <template #header>
      <v-card>
        <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-select
                v-model="KhoiItem"
                label="Chọn khối"
                :items="DSKhoi"
                item-title="TenKhoiHoc"
                item-value="KhoiID"
                return-object
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="LopItem"
                label="Chọn lớp"
                :items="DSLop"
                item-title="TenLop"
                item-value="LopID"
                return-object
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="MonHocItem"
                label="Chọn môn học"
                :items="DSMonHoc"
                item-title="MonHocName"
                item-value="MonHocID"
                return-object
              />
            </v-col>
            <v-col cols="12" sm="3" class="d-flex align-center ga-2 flex-wrap">
              <v-btn variant="outlined" color="primary" :loading="loading" @click="onRefresh">
                <v-icon start>mdi-reload</v-icon>Làm mới
              </v-btn>
              <v-btn variant="outlined" color="primary" :disabled="!FilteredRows.length" @click="exportExcel">
                <v-icon start>mdi-file-excel</v-icon>Xuất Excel
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="ScoreColumnMeta.length" align="center" class="mt-1">
            <v-col cols="12" class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                :color="FilterPreset === 'all' ? 'primary' : 'default'"
                :variant="FilterPreset === 'all' ? 'flat' : 'tonal'"
                @click="applyPreset('all')"
              >
                Hiển thị tất cả
              </v-chip>
              <v-chip
                :color="FilterPreset === 'core' ? 'primary' : 'default'"
                :variant="FilterPreset === 'core' ? 'flat' : 'tonal'"
                @click="applyPreset('core')"
              >
                Cột cốt lõi
              </v-chip>
              <v-chip
                :color="FilterPreset === 'group' ? 'primary' : 'default'"
                :variant="FilterPreset === 'group' ? 'flat' : 'tonal'"
                @click="applyPreset('group')"
              >
                Theo nhóm đã chọn
              </v-chip>
              <v-chip color="info" variant="tonal">
                Nhóm: {{ SelectedGroupKeys.length }}/{{ GroupOptions.length }}
              </v-chip>
              <v-chip color="info" variant="tonal">
                Cột: {{ SelectedColumnKeys.length }}/{{ ScoreColumnMeta.length }}
              </v-chip>
              <v-chip color="info" variant="tonal">
                Học kì: {{ SelectedSemesterKeys.length }}/{{ SemesterOptions.length }}
              </v-chip>
              <v-btn variant="text" color="primary" @click="openFilterDialog">
                <v-icon start>mdi-tune-vertical</v-icon>
                Bộ lọc nâng cao (Dialog)
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <v-divider />

    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <span>Tổng bảng điểm quá trình</span>
        <v-chip size="small" color="primary" variant="tonal">Tổng số học sinh: {{ FilteredRows.length }}</v-chip>
        <v-chip v-if="MonHocItem" size="small" color="primary" variant="tonal">{{ MonHocItem.MonHocName }}</v-chip>
      </v-card-title>
      <v-card-text class="px-0">
        <v-progress-linear v-if="loading" color="primary" indeterminate />
        <uc-jexcel
          v-if="FilteredRows.length"
          class="height-excel"
          v-model="instance"
          :freezeColumns="freezeColumns"
          :data-source="FilteredRows"
          :columns="columnHeader"
          :nestedHeaders="nestedHeaders"
          :key="keyComp"
        />
        <uc-empty v-else />
      </v-card-text>
    </v-card>

    <uc-dialog
      v-model="isShowFilterDialog"
      title="Bộ lọc nâng cao"
      doneText="Áp dụng"
      width="1000"
      @onSubmit="onApplyAdvancedFilter"
    >
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="DraftSelectedSemesterKeys"
            label="Chọn học kì / cả năm"
            :items="SemesterOptions"
            item-title="title"
            item-value="value"
            multiple
          />
        </v-col>
        <v-col cols="12" sm="6" class="d-flex align-center ga-2 flex-wrap">
          <v-chip color="info" variant="tonal">Môn: {{ DraftSelectedSubjectFilterIDs.length }}</v-chip>
          <v-chip color="info" variant="tonal">Nhóm: {{ DraftSelectedGroupKeys.length }}</v-chip>
          <v-chip color="info" variant="tonal">Cột: {{ DraftSelectedColumnKeys.length }}</v-chip>
          <v-btn
            v-if="isCap2Or3"
            size="small"
            variant="tonal"
            color="primary"
            @click="applyDraftAutoTotalForeignLanguage"
          >
            Tự động Total ngoại ngữ C2/C3
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="mb-3" />

      <v-row>
        <v-col cols="12">
          <div class="text-body-2 font-weight-medium mb-2">Chọn môn học</div>
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip
              v-for="subject in DraftSubjectTree"
              :key="`subject-${subject.subjectId}`"
              :color="isDraftSubjectSelected(subject.subjectId) ? 'primary' : 'default'"
              :variant="isDraftSubjectSelected(subject.subjectId) ? 'flat' : 'tonal'"
              @click="toggleDraftSubject(subject.subjectId)"
            >
              {{ subject.subjectTitle }}
            </v-chip>
          </div>
        </v-col>

        <v-col
          v-for="subject in DraftVisibleSubjectTree"
          :key="`subject-block-${subject.subjectId}`"
          cols="12"
        >
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center ga-2 text-body-1">
              <span>{{ subject.subjectTitle }}</span>
              <v-chip size="x-small" color="primary" variant="tonal">{{ subject.groups.length }} nhóm</v-chip>
            </v-card-title>
            <v-card-text>
              <div
                v-for="group in subject.groups"
                :key="`group-${group.groupKey}`"
                class="mb-3"
              >
                <div class="d-flex align-center ga-2 flex-wrap mb-2">
                  <v-chip
                    :color="isDraftGroupSelected(group.groupKey) ? 'primary' : 'default'"
                    :variant="isDraftGroupSelected(group.groupKey) ? 'flat' : 'tonal'"
                    @click="toggleDraftGroup(subject.subjectId, group.groupKey)"
                  >
                    {{ group.groupTitle }}
                  </v-chip>
                </div>

                <div v-if="isDraftGroupSelected(group.groupKey)" class="d-flex align-center ga-2 flex-wrap">
                  <v-chip
                    v-for="column in group.columns"
                    :key="`column-${column.key}`"
                    size="small"
                    :color="isDraftColumnSelected(column.key) ? 'primary' : 'default'"
                    :variant="isDraftColumnSelected(column.key) ? 'flat' : 'tonal'"
                    @click="toggleDraftColumn(subject.subjectId, group.groupKey, column.key)"
                  >
                    {{ column.title }}
                    <v-tooltip v-if="!isColumnHasScore(column.key)" activator="parent" location="top">
                      Không có điểm
                    </v-tooltip>
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </uc-dialog>
  </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
  data() {
    return {
      vueData,
      instance: null,
      freezeColumns: 3,
      keyComp: 0,
      loading: false,
      DSKhoi: [],
      DSLop: [],
      DSMonHoc: [],
      KhoiItem: null,
      LopItem: null,
      MonHocItem: null,
      ScoreColumnMeta: [],
      RawRows: [],
      FilteredRows: [],
      GroupOptions: [],
      SubjectOptions: [],
      SemesterOptions: [
        { value: 'HK1', title: 'Học kì 1' },
        { value: 'HK2', title: 'Học kì 2' },
        { value: 'CANAM', title: 'Cả năm' },
        { value: 'KHAC', title: 'Khác/không xác định' },
      ],
      ColumnOptions: [],
      SelectedGroupKeys: [],
      SelectedSubjectFilterIDs: [],
      SelectedSemesterKeys: ['HK1', 'HK2', 'CANAM', 'KHAC'],
      SelectedColumnKeys: [],
      isShowFilterDialog: false,
      DraftSelectedGroupKeys: [],
      DraftSelectedSubjectFilterIDs: [],
      DraftSelectedSemesterKeys: [],
      DraftSelectedColumnKeys: [],
      DraftColumnOptions: [],
      FilterPreset: 'all',
      columnHeader: [],
      nestedHeaders: [[{ title: '', colspan: 3 }]],
      ColumnHasScoreMap: {},
    }
  },
  computed: {
    isCap2Or3() {
      const capId = parseInt(vueData.CapID)
      return capId === 2 || capId === 3
    },
    TitleCap() {
      return renderText(parseInt(vueData.CapID))
    },
    TitlePage() {
      return getTitlePageByURL(window.location.pathname + window.location.search)
    },
    DraftSubjectTree() {
      const selectedSemesters = new Set(this.DraftSelectedSemesterKeys)
      const source = this.ScoreColumnMeta
        .filter((item) => selectedSemesters.has(item.semesterTag))
        .sort((a, b) => this.sortScoreMeta(a, b))

      const subjectMap = new Map()
      for (const item of source) {
        if (!subjectMap.has(item.monHocID)) {
          subjectMap.set(item.monHocID, {
            subjectId: item.monHocID,
            subjectTitle: item.monHocName,
            monOrder: item.monOrder,
            groupMap: new Map(),
          })
        }

        const subject = subjectMap.get(item.monHocID)
        if (!subject.groupMap.has(item.groupKey)) {
          subject.groupMap.set(item.groupKey, {
            groupKey: item.groupKey,
            groupTitle: item.groupTitle,
            appearanceIndex: item.appearanceIndex,
            columns: [],
          })
        }

        subject.groupMap.get(item.groupKey).columns.push({
          key: item.key,
          title: item.title,
          appearanceIndex: item.appearanceIndex,
        })
      }

      return Array.from(subjectMap.values())
        .sort((a, b) => a.monOrder - b.monOrder)
        .map((subject) => ({
          subjectId: subject.subjectId,
          subjectTitle: subject.subjectTitle,
          groups: Array.from(subject.groupMap.values())
            .sort((a, b) => a.appearanceIndex - b.appearanceIndex)
            .map((group) => ({
              groupKey: group.groupKey,
              groupTitle: group.groupTitle,
              columns: group.columns.sort((a, b) => a.appearanceIndex - b.appearanceIndex),
            })),
        }))
    },
    DraftVisibleSubjectTree() {
      const selectedSubjects = new Set(this.DraftSelectedSubjectFilterIDs)
      return this.DraftSubjectTree.filter((subject) => selectedSubjects.has(subject.subjectId))
    },
  },
  watch: {
    'vueData.NienKhoa'() {
      this.KhoiItem = null
      this.LopItem = null
      this.MonHocItem = null
      this.DSKhoi = []
      this.DSLop = []
      this.DSMonHoc = []
      this.resetGrid()
      this.getKhoi(true)
    },
    KhoiItem(v) {
      this.LopItem = null
      this.MonHocItem = null
      this.DSLop = []
      this.DSMonHoc = []
      this.resetGrid()
      if (v) this.getLop(true)
    },
    LopItem(v) {
      this.MonHocItem = null
      this.DSMonHoc = []
      this.resetGrid()
      if (v) this.getMonHoc(true)
    },
    MonHocItem(v) {
      this.resetGrid()
      if (v) this.onRefresh(true)
    },
    SelectedGroupKeys() {
      this.FilterPreset = 'group'
      this.syncColumnOptions()
      this.applyColumnFilter()
    },
    SelectedSubjectFilterIDs() {
      this.FilterPreset = 'group'
      this.syncColumnOptions()
      this.applyColumnFilter()
    },
    SelectedSemesterKeys() {
      this.FilterPreset = 'group'
      this.syncColumnOptions()
      this.applyColumnFilter()
    },
    SelectedColumnKeys() {
      this.FilterPreset = 'group'
      this.applyColumnFilter()
    },
    DraftSelectedGroupKeys() {
      this.syncDraftColumnOptions()
      this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) =>
        this.DraftColumnOptions.some((item) => item.value === key)
      )
    },
    DraftSelectedSubjectFilterIDs() {
      this.syncDraftColumnOptions()
      this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) =>
        this.DraftColumnOptions.some((item) => item.value === key)
      )
    },
    DraftSelectedSemesterKeys() {
      this.syncDraftColumnOptions()
      this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) =>
        this.DraftColumnOptions.some((item) => item.value === key)
      )
      const subjectSet = new Set(this.DraftSubjectTree.map((item) => item.subjectId))
      this.DraftSelectedSubjectFilterIDs = this.DraftSelectedSubjectFilterIDs.filter((id) => subjectSet.has(id))
      const groupSet = new Set(
        this.DraftSubjectTree.flatMap((subject) => subject.groups.map((group) => group.groupKey))
      )
      this.DraftSelectedGroupKeys = this.DraftSelectedGroupKeys.filter((key) => groupSet.has(key))
    },
  },
  mounted() {
    this.getKhoi()
  },
  methods: {
    resetGrid() {
      this.ScoreColumnMeta = []
      this.RawRows = []
      this.FilteredRows = []
      this.GroupOptions = []
      this.SubjectOptions = []
      this.ColumnOptions = []
      this.SelectedGroupKeys = []
      this.SelectedSubjectFilterIDs = []
      this.SelectedSemesterKeys = this.SemesterOptions.map((item) => item.value)
      this.SelectedColumnKeys = []
      this.FilterPreset = 'all'
      this.isShowFilterDialog = false
      this.DraftSelectedGroupKeys = []
      this.DraftSelectedSubjectFilterIDs = []
      this.DraftSelectedSemesterKeys = []
      this.DraftSelectedColumnKeys = []
      this.DraftColumnOptions = []
      this.columnHeader = []
      this.nestedHeaders = [[{ title: '', colspan: 3 }]]
      this.ColumnHasScoreMap = {}
      this.keyComp += 1
    },
    async getKhoi(forceRefresh = false) {
      const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
        CapID: parseInt(vueData.CapID),
        NienKhoa: vueData.NienKhoa,
        HocKi: vueData.NienKhoaItem.HocKi,
      }, { forceRefresh })
      this.DSKhoi = res ?? []
    },
    async getLop(forceRefresh = false) {
      if (!this.KhoiItem?.KhoiID) return
      const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
        KhoiID: this.KhoiItem.KhoiID,
        NienKhoa: vueData.NienKhoa,
      }, { forceRefresh })
      this.DSLop = res ?? []
    },
    async getMonHoc(forceRefresh = false) {
      if (!this.LopItem?.LopID) return
      const res = await fetchPromise('lms/MonHoc_Get_ByLopID', {
        LopID: this.LopItem.LopID,
        NienKhoa: vueData.NienKhoa,
      }, { forceRefresh })
      const allMon = { MonHocID: 0, MonHocName: 'Tất cả môn', isAll: true }
      this.DSMonHoc = [allMon, ...(res ?? [])]
      this.MonHocItem = allMon
    },
    async onRefresh(forceRefresh = false) {
      if (!this.LopItem?.LopID || !this.MonHocItem) return
      this.loading = true
      try {
        if (this.MonHocItem.isAll) {
          await this.loadAllSubjects(forceRefresh)
        } else {
          await this.loadSingleSubject(this.MonHocItem, forceRefresh)
        }
      } finally {
        this.loading = false
      }
    },
    async loadSingleSubject(subject, forceRefresh = false) {
      if (!subject?.MonHocID || !subject?.TemplateBangDiemID) return
      const records = await fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID', {
        LopID: this.LopItem.LopID,
        MonHocID: subject.MonHocID,
        TemplateBangDiemID: subject.TemplateBangDiemID,
        NienKhoa: vueData.NienKhoa,
      }, { forceRefresh })
      const mapped = (records ?? []).map((item) => ({
        ...item,
        _MonHocID: subject.MonHocID,
        _MonHocName: subject.MonHocName,
        _MonHocCode: this.resolveMonHocCode(subject),
      }))
      this.buildGrid(mapped, false)
    },
    async loadAllSubjects(forceRefresh = false) {
      const subjects = this.DSMonHoc.filter((item) => !item.isAll)
      if (!subjects.length) {
        this.resetGrid()
        return
      }

      const responses = await Promise.all(
        subjects.map((subject) =>
          fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID', {
            LopID: this.LopItem.LopID,
            MonHocID: subject.MonHocID,
            TemplateBangDiemID: subject.TemplateBangDiemID,
            NienKhoa: vueData.NienKhoa,
          }, { forceRefresh })
        )
      )

      const records = []
      subjects.forEach((subject, index) => {
        const rows = responses[index] ?? []
        rows.forEach((item) => {
          records.push({
            ...item,
            _MonHocID: subject.MonHocID,
            _MonHocName: subject.MonHocName,
            _MonHocCode: this.resolveMonHocCode(subject),
          })
        })
      })

      this.buildGrid(records, true)
    },
    buildGrid(records, isAllMode) {
      if (!records.length) {
        this.resetGrid()
        return
      }

      const studentMap = new Map()
      const metaMap = new Map()
      const monOrderMap = {}
      this.DSMonHoc.filter((item) => !item.isAll).forEach((item, index) => {
        monOrderMap[item.MonHocID] = index
      })

      let appearanceIndex = 0
      for (const item of records) {
        const hocSinhID = item.HocSinhID
        if (!studentMap.has(hocSinhID)) {
          studentMap.set(hocSinhID, {
            HocSinhID: item.HocSinhID,
            SoDanhBo: item.SoDanhBo,
            HoVaTenHocSinh: [item.Ho, item.Ten].filter(Boolean).join(' ').trim() || item.HoTen || '',
          })
        }

        const scoreKey = isAllMode
          ? `${item._MonHocID}__${item.MaCotDiem}`
          : item.MaCotDiem
        const groupKey = isAllMode
          ? `${item._MonHocID}__${item.MaNhomCotDiem}`
          : item.MaNhomCotDiem
        const groupTitle = isAllMode
          ? `${item._MonHocCode} • ${item.TenNhomCotDiem_VI}`
          : item.TenNhomCotDiem_VI
        const columnTitle = item.TenCotDiem_VI

        if (!metaMap.has(scoreKey)) {
          metaMap.set(scoreKey, {
            key: scoreKey,
            title: columnTitle,
            groupKey,
            groupTitle,
            monHocID: item._MonHocID,
            monHocName: item._MonHocName,
            monHocCode: item._MonHocCode,
            semesterTag: this.getSemesterTag(item, isAllMode),
            typeValue: item.GiaTriCotDiem,
            width: item.WidthCSS,
            background: item.HexBackground,
            thuTuNhom: item.ThuTuNhom ?? 0,
            thuTuCotDiem: item.ThuTuCotDiem ?? 0,
            monOrder: monOrderMap[item._MonHocID] ?? 999,
            appearanceIndex: appearanceIndex++,
          })
        }

        studentMap.get(hocSinhID)[scoreKey] = this.normalizeScoreValue(item)
      }

      const scoreColumns = Array.from(metaMap.values()).sort((a, b) => {
        return this.sortScoreMeta(a, b)
      })

      this.ScoreColumnMeta = scoreColumns
      this.RawRows = Array.from(studentMap.values())
      this.ColumnHasScoreMap = this.buildColumnHasScoreMap(scoreColumns, this.RawRows)
      this.initColumnFilters()
    },
    buildColumnHasScoreMap(scoreColumns, rows) {
      const result = {}
      scoreColumns.forEach((item) => {
        result[item.key] = false
      })

      for (const row of rows) {
        for (const item of scoreColumns) {
          if (result[item.key]) continue
          if (this.hasScoreValue(row[item.key])) {
            result[item.key] = true
          }
        }
      }

      return result
    },
    hasScoreValue(value) {
      if (value === null || value === undefined) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    },
    isColumnHasScore(columnKey) {
      return !!this.ColumnHasScoreMap[columnKey]
    },
    normalizeScoreValue(item) {
      if (item.GiaTriCotDiem === 'number') {
        const numberVal = parseFloat(item.KetQuaDanhGia_VI)
        return Number.isNaN(numberVal) ? null : numberVal
      }
      return item.KetQuaDanhGia_VI ?? null
    },
    initColumnFilters() {
      const groupMap = new Map()
      const subjectMap = new Map()
      for (const item of this.ScoreColumnMeta) {
        if (!groupMap.has(item.groupKey)) {
          groupMap.set(item.groupKey, item.groupTitle)
        }
        if (!subjectMap.has(item.monHocID)) {
          subjectMap.set(item.monHocID, item.monHocName)
        }
      }

      this.GroupOptions = Array.from(groupMap.entries()).map(([value, title]) => ({ value, title }))
      this.SubjectOptions = Array.from(subjectMap.entries()).map(([value, title]) => ({ value, title }))
      this.SelectedSubjectFilterIDs = this.SubjectOptions.map((item) => item.value)
      this.SelectedGroupKeys = this.GroupOptions.map((item) => item.value)
      this.SelectedSemesterKeys = this.SemesterOptions.map((item) => item.value)
      this.syncColumnOptions()
      this.SelectedColumnKeys = this.ColumnOptions
        .map((item) => item.value)
        .filter((key) => this.isColumnHasScore(key))
      this.FilterPreset = 'all'
      this.applyColumnFilter()
    },
    syncColumnOptions() {
      const selectedGroups = new Set(this.SelectedGroupKeys)
      const selectedSubjects = new Set(this.SelectedSubjectFilterIDs)
      const selectedSemesters = new Set(this.SelectedSemesterKeys)
      const options = this.ScoreColumnMeta
        .filter((item) => selectedGroups.has(item.groupKey)
          && selectedSubjects.has(item.monHocID)
          && selectedSemesters.has(item.semesterTag))
        .map((item) => ({ value: item.key, title: item.title }))

      const optionSet = new Set(options.map((item) => item.value))
      this.ColumnOptions = options
      this.SelectedColumnKeys = this.SelectedColumnKeys.filter((item) => optionSet.has(item))
    },
    applyColumnFilter() {
      const selectedGroups = new Set(this.SelectedGroupKeys)
      const selectedSubjects = new Set(this.SelectedSubjectFilterIDs)
      const selectedSemesters = new Set(this.SelectedSemesterKeys)
      const selectedColumns = new Set(this.SelectedColumnKeys)
      const visibleScoreMeta = this.ScoreColumnMeta.filter(
        (item) => selectedGroups.has(item.groupKey)
          && selectedSubjects.has(item.monHocID)
          && selectedSemesters.has(item.semesterTag)
          && selectedColumns.has(item.key)
      )

      this.columnHeader = [
        {
          type: 'text',
          title: 'Mã học sinh',
          name: 'HocSinhID',
          width: 120,
          readOnly: true,
        },
        {
          type: 'text',
          title: 'Số danh bộ',
          name: 'SoDanhBo',
          width: 120,
          readOnly: true,
        },
        {
          type: 'text',
          title: 'Họ tên học sinh',
          name: 'HoVaTenHocSinh',
          width: 300,
          align: 'left',
          readOnly: true,
        },
        ...visibleScoreMeta.map((item) => this.toJexcelColumn(item)),
      ]

      this.FilteredRows = this.RawRows.map((row) => {
        const next = {
          HocSinhID: row.HocSinhID,
          SoDanhBo: row.SoDanhBo,
          HoVaTenHocSinh: row.HoVaTenHocSinh,
        }
        for (const item of visibleScoreMeta) {
          next[item.key] = row[item.key] ?? null
        }
        return next
      })

      this.nestedHeaders = this.buildNestedHeaders(visibleScoreMeta)
      this.keyComp += 1
    },
    applyPreset(type) {
      this.FilterPreset = type
      if (type === 'all') {
        this.SelectedSubjectFilterIDs = this.SubjectOptions.map((item) => item.value)
        this.SelectedGroupKeys = this.GroupOptions.map((item) => item.value)
        this.SelectedSemesterKeys = this.SemesterOptions.map((item) => item.value)
        this.syncColumnOptions()
        this.SelectedColumnKeys = this.ColumnOptions.map((item) => item.value)
        this.applyColumnFilter()
        return
      }

      if (type === 'core') {
        this.SelectedSubjectFilterIDs = this.SubjectOptions.map((item) => item.value)
        this.SelectedGroupKeys = this.GroupOptions.map((item) => item.value)
        this.SelectedSemesterKeys = this.SemesterOptions.map((item) => item.value)
        this.syncColumnOptions()
        const coreKeys = this.ScoreColumnMeta
          .filter((item) => this.isCoreColumn(item.title))
          .map((item) => item.key)
        this.SelectedColumnKeys = coreKeys.length
          ? coreKeys
          : this.ColumnOptions.slice(0, Math.min(10, this.ColumnOptions.length)).map((item) => item.value)
        this.applyColumnFilter()
        return
      }

      this.syncColumnOptions()
      this.applyColumnFilter()
    },
    openFilterDialog() {
      this.DraftSelectedGroupKeys = [...this.SelectedGroupKeys]
      this.DraftSelectedSubjectFilterIDs = [...this.SelectedSubjectFilterIDs]
      this.DraftSelectedSemesterKeys = [...this.SelectedSemesterKeys]
      this.syncDraftColumnOptions()
      this.DraftSelectedColumnKeys = this.DraftColumnOptions
        .map((item) => item.value)
        .filter((key) => this.isColumnHasScore(key))
      this.isShowFilterDialog = true
    },
    onApplyAdvancedFilter() {
      this.SelectedGroupKeys = [...this.DraftSelectedGroupKeys]
      this.SelectedSubjectFilterIDs = [...this.DraftSelectedSubjectFilterIDs]
      this.SelectedSemesterKeys = [...this.DraftSelectedSemesterKeys]
      this.syncColumnOptions()
      const optionSet = new Set(this.ColumnOptions.map((item) => item.value))
      this.SelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) => optionSet.has(key))
      this.applyColumnFilter()
      this.FilterPreset = 'group'
      this.isShowFilterDialog = false
    },
    isDraftSubjectSelected(subjectId) {
      return this.DraftSelectedSubjectFilterIDs.includes(subjectId)
    },
    isDraftGroupSelected(groupKey) {
      return this.DraftSelectedGroupKeys.includes(groupKey)
    },
    isDraftColumnSelected(columnKey) {
      return this.DraftSelectedColumnKeys.includes(columnKey)
    },
    toggleDraftSubject(subjectId) {
      const subject = this.DraftSubjectTree.find((item) => item.subjectId === subjectId)
      if (!subject) return

      const hasSubject = this.isDraftSubjectSelected(subjectId)
      if (hasSubject) {
        this.DraftSelectedSubjectFilterIDs = this.DraftSelectedSubjectFilterIDs.filter((id) => id !== subjectId)
        const subjectGroupSet = new Set(subject.groups.map((group) => group.groupKey))
        this.DraftSelectedGroupKeys = this.DraftSelectedGroupKeys.filter((key) => !subjectGroupSet.has(key))
        const subjectColumnSet = new Set(
          subject.groups.flatMap((group) => group.columns.map((column) => column.key))
        )
        this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) => !subjectColumnSet.has(key))
      } else {
        this.DraftSelectedSubjectFilterIDs = [...this.DraftSelectedSubjectFilterIDs, subjectId]
        const groupToAdd = subject.groups.map((group) => group.groupKey)
        this.DraftSelectedGroupKeys = [...new Set([...this.DraftSelectedGroupKeys, ...groupToAdd])]
        const columnToAdd = subject.groups
          .flatMap((group) => group.columns.map((column) => column.key))
          .filter((key) => this.isColumnHasScore(key))
        this.DraftSelectedColumnKeys = [...new Set([...this.DraftSelectedColumnKeys, ...columnToAdd])]
      }

      this.syncDraftColumnOptions()
    },
    toggleDraftGroup(subjectId, groupKey) {
      const subject = this.DraftSubjectTree.find((item) => item.subjectId === subjectId)
      if (!subject) return
      const group = subject.groups.find((item) => item.groupKey === groupKey)
      if (!group) return

      const hasGroup = this.isDraftGroupSelected(groupKey)
      if (hasGroup) {
        this.DraftSelectedGroupKeys = this.DraftSelectedGroupKeys.filter((key) => key !== groupKey)
        const groupColumnSet = new Set(group.columns.map((column) => column.key))
        this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) => !groupColumnSet.has(key))
      } else {
        if (!this.isDraftSubjectSelected(subjectId)) {
          this.DraftSelectedSubjectFilterIDs = [...this.DraftSelectedSubjectFilterIDs, subjectId]
        }
        this.DraftSelectedGroupKeys = [...new Set([...this.DraftSelectedGroupKeys, groupKey])]
        const columnToAdd = group.columns.map((column) => column.key).filter((key) => this.isColumnHasScore(key))
        this.DraftSelectedColumnKeys = [...new Set([...this.DraftSelectedColumnKeys, ...columnToAdd])]
      }

      this.syncDraftColumnOptions()
    },
    toggleDraftColumn(subjectId, groupKey, columnKey) {
      const hasColumn = this.isDraftColumnSelected(columnKey)
      if (hasColumn) {
        this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) => key !== columnKey)
      } else {
        if (!this.isDraftSubjectSelected(subjectId)) {
          this.DraftSelectedSubjectFilterIDs = [...this.DraftSelectedSubjectFilterIDs, subjectId]
        }
        if (!this.isDraftGroupSelected(groupKey)) {
          this.DraftSelectedGroupKeys = [...new Set([...this.DraftSelectedGroupKeys, groupKey])]
        }
        this.DraftSelectedColumnKeys = [...new Set([...this.DraftSelectedColumnKeys, columnKey])]
      }

      this.syncDraftColumnOptions()
    },
    applyDraftAutoTotalForeignLanguage() {
      if (!this.isCap2Or3) return

      const foreignSubjects = this.DraftSubjectTree.filter((subject) =>
        this.isForeignLanguageSubject(subject.subjectTitle, subject.subjectId)
      )

      if (!foreignSubjects.length) {
        this.snackbarRef.value.showSnackbar({
          message: 'Không tìm thấy môn ngoại ngữ trong bộ lọc hiện tại.',
          color: 'warning',
        })
        return
      }

      const foreignSubjectSet = new Set(foreignSubjects.map((subject) => subject.subjectId))
      const foreignGroupSet = new Set(
        foreignSubjects.flatMap((subject) => subject.groups.map((group) => group.groupKey))
      )
      const foreignColumnSet = new Set(
        foreignSubjects.flatMap((subject) =>
          subject.groups.flatMap((group) => group.columns.map((column) => column.key))
        )
      )
      const totalForeignColumnKeys = foreignSubjects.flatMap((subject) =>
        subject.groups.flatMap((group) =>
          group.columns
            .filter((column) => this.isTotalColumnByKey(column.key))
            .map((column) => column.key)
        )
      )

      if (!totalForeignColumnKeys.length) {
        this.snackbarRef.value.showSnackbar({
          message: 'Không có MaCotDiem chứa Total cho môn ngoại ngữ trong phạm vi đang lọc.',
          color: 'warning',
        })
        return
      }

      this.DraftSelectedSubjectFilterIDs = [
        ...new Set([
          ...this.DraftSelectedSubjectFilterIDs.filter((id) => !foreignSubjectSet.has(id)),
          ...Array.from(foreignSubjectSet),
        ]),
      ]

      this.DraftSelectedGroupKeys = [
        ...new Set([
          ...this.DraftSelectedGroupKeys.filter((key) => !foreignGroupSet.has(key)),
          ...Array.from(foreignGroupSet),
        ]),
      ]

      this.DraftSelectedColumnKeys = [
        ...new Set([
          ...this.DraftSelectedColumnKeys.filter((key) => !foreignColumnSet.has(key)),
          ...totalForeignColumnKeys,
        ]),
      ]

      this.syncDraftColumnOptions()
      this.DraftSelectedColumnKeys = this.DraftSelectedColumnKeys.filter((key) =>
        this.DraftColumnOptions.some((item) => item.value === key)
      )

      this.snackbarRef.value.showSnackbar({
        message: 'Đã áp dụng tự động: môn ngoại ngữ chỉ lấy cột Total.',
        color: 'success',
      })
    },
    syncDraftColumnOptions() {
      const selectedGroups = new Set(this.DraftSelectedGroupKeys)
      const selectedSubjects = new Set(this.DraftSelectedSubjectFilterIDs)
      const selectedSemesters = new Set(this.DraftSelectedSemesterKeys)
      this.DraftColumnOptions = this.ScoreColumnMeta
        .filter((item) => selectedGroups.has(item.groupKey)
          && selectedSubjects.has(item.monHocID)
          && selectedSemesters.has(item.semesterTag))
        .map((item) => ({ value: item.key, title: item.title }))
    },
    isForeignLanguageSubject(subjectTitle, subjectId) {
      const title = (subjectTitle || '').toLowerCase()
      if ([5, 46, 76].includes(subjectId)) return true
      return title.includes('tiếng anh')
        || title.includes('tieng anh')
        || title.includes('english')
        || title.includes('ngoại ngữ')
        || title.includes('ngoai ngu')
    },
    isTotalColumnByKey(columnKey) {
      const maCotDiem = (columnKey || '').split('__').pop() || ''
      return maCotDiem.toLowerCase().includes('total')
    },
    getSemesterTag(item, isAllMode) {
      const parts = [item.MaCotDiem, item.MaNhomCotDiem, item.TenCotDiem_VI, item.TenNhomCotDiem_VI]
      if (isAllMode) parts.push(item._MonHocName)
      const value = parts.filter(Boolean).join(' ').toLowerCase()
      if (
        value.includes('ca nam')
        || value.includes('cả năm')
        || value.includes('canam')
        || value.includes('tb cn')
        || value.includes('tb_cn')
      ) {
        return 'CANAM'
      }
      if (
        value.includes('hk1')
        || value.includes('hki')
        || value.includes('gk1')
        || value.includes('ck1')
      ) {
        return 'HK1'
      }
      if (
        value.includes('hk2')
        || value.includes('hkii')
        || value.includes('gk2')
        || value.includes('ck2')
      ) {
        return 'HK2'
      }
      return 'KHAC'
    },
    isCoreColumn(title) {
      const value = (title || '').toLowerCase()
      return value.includes('tổng')
        || value.includes('tong')
        || value.includes('tb')
        || value.includes('trung bình')
        || value.includes('giữa')
        || value.includes('cuối')
        || value.includes('gk')
        || value.includes('ck')
    },
    buildNestedHeaders(visibleScoreMeta) {
      const groups = []
      let currentGroup = null
      for (const item of visibleScoreMeta) {
        if (!currentGroup || currentGroup.groupKey !== item.groupKey) {
          currentGroup = {
            title: item.groupTitle,
            colspan: 1,
            groupKey: item.groupKey,
          }
          groups.push(currentGroup)
        } else {
          currentGroup.colspan += 1
        }
      }
      return [[{ title: '', colspan: 3 }, ...groups.map((item) => ({ title: item.title, colspan: item.colspan }))]]
    },
    toJexcelColumn(item) {
      const width = this.getColumnWidth(item)
      if (item.typeValue === 'number') {
        return {
          type: 'numeric',
          title: item.title,
          name: item.key,
          width,
          decimal: '.',
          mask: '0.00',
          backGroundColor: item.background,
          readOnly: true,
        }
      }

      if (item.typeValue === 'Dropdown_text') {
        return {
          type: 'dropdown',
          title: item.title,
          name: item.key,
          width,
          source: ['Done', 'Not Yet'],
          backGroundColor: item.background,
          align: 'center',
          readOnly: true,
        }
      }

      if (item.typeValue === 'Dropdown_THC') {
        return {
          type: 'dropdown',
          title: item.title,
          name: item.key,
          width,
          source: ['T', 'H', 'C'],
          backGroundColor: item.background,
          align: 'center',
          readOnly: true,
        }
      }

      if (item.typeValue === 'Dropdown_TDC') {
        return {
          type: 'dropdown',
          title: item.title,
          name: item.key,
          width,
          source: ['T', 'Đ', 'C'],
          backGroundColor: item.background,
          align: 'center',
          readOnly: true,
        }
      }

      if (item.typeValue === 'Dropdown_CD_D') {
        return {
          type: 'dropdown',
          title: item.title,
          name: item.key,
          width,
          source: ['CĐ', 'Đ'],
          backGroundColor: item.background,
          align: 'center',
          readOnly: true,
        }
      }

      if (item.typeValue === 'ICO_Star') {
        return {
          type: 'html',
          title: item.title,
          name: item.key,
          width,
          backGroundColor: item.background,
          align: 'center',
          readOnly: true,
        }
      }

      return {
        type: 'text',
        title: item.title,
        name: item.key,
        width,
        backGroundColor: item.background,
        readOnly: true,
      }
    },
    resolveMonHocCode(subject) {
      const code = subject?.MonHocCode || subject?.MaMonHoc || subject?.MonHocShortCode
      if (code) return String(code).trim()
      const words = String(subject?.MonHocName || '').trim().split(/\s+/).filter(Boolean)
      if (!words.length) return 'MH'
      return words.slice(0, 3).map((word) => word[0].toUpperCase()).join('')
    },
    parseColumnWidth(widthValue) {
      const parsed = parseInt(widthValue, 10)
      return Number.isNaN(parsed) ? null : parsed
    },
    getColumnWidth(item) {
      const titleLen = String(item?.title || '').trim().length
      const perChar = item?.typeValue === 'number' ? 7 : 8
      const autoWidth = Math.min(320, Math.max(90, titleLen * perChar + 40))
      const configWidth = this.parseColumnWidth(item?.width)
      if (configWidth === null) return autoWidth
      return Math.max(autoWidth, configWidth)
    },
    sortScoreMeta(a, b) {
      if ((a.appearanceIndex ?? 0) !== (b.appearanceIndex ?? 0)) {
        return (a.appearanceIndex ?? 0) - (b.appearanceIndex ?? 0)
      }
      if ((a.monOrder ?? 0) !== (b.monOrder ?? 0)) return (a.monOrder ?? 0) - (b.monOrder ?? 0)
      if ((a.thuTuNhom ?? 0) !== (b.thuTuNhom ?? 0)) return (a.thuTuNhom ?? 0) - (b.thuTuNhom ?? 0)
      if ((a.thuTuCotDiem ?? 0) !== (b.thuTuCotDiem ?? 0)) return (a.thuTuCotDiem ?? 0) - (b.thuTuCotDiem ?? 0)
      return String(a.key || '').localeCompare(String(b.key || ''))
    },
    exportExcel() {
      if (!this.FilteredRows.length || !window.XLSX) return
      const headers = this.columnHeader.map((item) => item.title)
      const keys = this.columnHeader.map((item) => item.name)
      const dataRows = this.FilteredRows.map((item) => keys.map((key) => item[key] ?? ''))
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TongBangDiemQuaTrinh')
      const lopName = this.LopItem?.TenLop ?? 'Lop'
      const monName = this.MonHocItem?.MonHocName ?? 'MonHoc'
      XLSX.writeFile(workbook, `TongBangDiemQuaTrinh_${lopName}_${monName}.xlsx`)
    },
  },
	}
</script>