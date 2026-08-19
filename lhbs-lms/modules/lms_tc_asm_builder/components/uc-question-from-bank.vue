<template>
	<v-dialog v-model="isOpen" max-width="1200" scrollable>
		<v-card>
			<v-card-title class="d-flex align-center bg-primary text-white py-2 px-4">
				<span>
					<v-icon start>mdi-database-search</v-icon> Import câu hỏi từ Ngân hàng câu hỏi
				</span>
				<v-spacer></v-spacer>
				<v-btn icon variant="text" color="white" @click="$emit('update:isOpen', false)">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>

			<v-card-text class="pa-4">
				<v-row dense align="center" class="mb-3">
					<v-col cols="12" sm="6" md="4">
						<v-select v-model="selectedGroup" :items="DSGroup"
							:item-title="(item) => item.Title || item.GroupName || 'Không có tiêu đề'"
							:item-value="(item) => item" label="Chọn Nhóm câu hỏi" density="compact" variant="outlined"
							hide-details return-object :loading="loadingGroup"></v-select>
					</v-col>

					<v-col cols="12" sm="6" md="4">
						<v-select v-model="filterType" :items="TypeOptions" item-title="label" item-value="value"
							label="Loại câu hỏi" density="compact" variant="outlined" hide-details clearable></v-select>
					</v-col>

					<v-col cols="12" sm="12" md="4">
						<v-text-field v-model="searchQ" label="Tìm kiếm câu hỏi..." density="compact" variant="outlined"
							hide-details prepend-inner-icon="mdi-magnify" clearable></v-text-field>
					</v-col>
				</v-row>

				<v-data-table :headers="headers" :items="filteredQuestions" :loading="loadingQuestions"
					items-per-page="-1" hide-default-footer class="border rounded" density="compact" hover>
					<template #item.select="{ item }">
						<v-checkbox v-model="item.isSelected" hide-details density="compact"></v-checkbox>
					</template>

					<template #header.select>
						<v-checkbox v-model="selectAll" hide-details density="compact" :indeterminate="isIndeterminate"
							@update:model-value="toggleSelectAll"></v-checkbox>
					</template>

					<template #item.Type="{ item }">
						<v-chip size="x-small" :color="getTypeColor(item.Type)" variant="tonal">
							{{ getTypeLabel(item.Type) }}
						</v-chip>
					</template>

					<template #item.QuestionText="{ item }">
						<div class="py-1">
							<div class="text-body-2 font-weight-medium" v-html="item.QuestionText"></div>
							<div v-if="item.Options?.length" class="text-caption text-medium-emphasis mt-1">
								<span>Đáp án: </span>
								<span v-for="(opt, idx) in item.Options" :key="idx" class="me-2">
									<b>{{ String.fromCharCode(65 + idx) }}.</b> {{ opt.text }}
								</span>
							</div>
						</div>
					</template>

					<template #no-data>
						<div v-if="!loadingQuestions && !DSQuestion.length" class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
							<v-icon size="40" class="mb-2 opacity-50">mdi-database-plus-outline</v-icon>
							<p class="text-body-2 mb-1">Chưa có câu hỏi trong ngân hàng</p>
							<p class="text-caption mb-3">Hãy thêm câu hỏi vào ngân hàng để có thể sử dụng trong bài tập.</p>
							<v-btn color="primary" variant="tonal" size="small" @click="openQuestionBank">
								<v-icon start>mdi-open-in-new</v-icon>Mở ngân hàng câu hỏi
							</v-btn>
						</div>
						<div v-else class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
							<v-icon size="40" class="mb-2 opacity-50">mdi-text-box-search-outline</v-icon>
							<p class="text-body-2">Không tìm thấy câu hỏi nào theo bộ lọc</p>
						</div>
					</template>
				</v-data-table>
			</v-card-text>

			<v-divider></v-divider>

			<v-card-actions class="pa-4 bg-surface-light">
				<span class="text-body-2 text-medium-emphasis">
					Đã chọn <b>{{ selectedCount }}</b> câu hỏi
				</span>
				<v-spacer></v-spacer>
				<v-btn variant="outlined" color="grey" @click="$emit('update:isOpen', false)">
					Hủy
				</v-btn>
				<v-btn color="primary" variant="elevated" :disabled="selectedCount === 0" @click="handleImport">
					<v-icon start>mdi-download</v-icon>
					Import {{ selectedCount > 0 ? `(${selectedCount})` : '' }} câu hỏi
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-question-from-bank',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    assignmentDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:isOpen', 'importJson'],
  data() {
    return {
      vueData,
      loadingGroup: false,
      loadingQuestions: false,
      DSGroup: [],
      selectedGroup: null,
      DSQuestion: [],
      filterType: null,
      searchQ: '',
      selectAll: false,
      headers: [
        { title: '', key: 'select', width: 48, sortable: false },
        { title: 'STT', key: 'OrdinalNumber', width: 60 },
        { title: 'Loại câu hỏi', key: 'Type', width: 150 },
        { title: 'Nội dung câu hỏi', key: 'QuestionText' },
        { title: 'Điểm', key: 'Points', width: 70 },
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
    filteredQuestions() {
      return this.DSQuestion.filter((q) => {
        const matchType = !this.filterType || q.Type === this.filterType
        const textSearch = (this.searchQ || '').toLowerCase()
        const matchSearch =
          !textSearch ||
          (q.QuestionText || '').toLowerCase().includes(textSearch) ||
          (q.SearchKey || '').toLowerCase().includes(textSearch)
        return matchType && matchSearch
      })
    },
    selectedCount() {
      return this.DSQuestion.filter((q) => q.isSelected).length
    },
    isIndeterminate() {
      return this.selectedCount > 0 && this.selectedCount < this.filteredQuestions.length
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.getGroups()
      }
    },
    selectedGroup(v) {
      this.DSQuestion = []
      this.selectAll = false
      if (v) this.getQuestions()
    },
  },
  mounted() {
    if (this.isOpen) {
      this.getGroups()
    }
  },
  methods: {
    async getGroups() {
      if (!this.assignmentDetail || !this.assignmentDetail.MonHocID) return
      this.loadingGroup = true
      try {
        const res = await fetchPromise('lms/EL_QuestionGroup_List', {
          MonHocID: this.assignmentDetail.MonHocID,
          KhoiID: this.assignmentDetail.KhoiID || 0,
          IncludeDeleted: false,
          PageNumber: 1,
          PageSize: 100,
        }, { forceRefresh: true })
        const flat = Array.isArray(res?.[0]) ? res[0] : res
        this.DSGroup = flat ?? []
        if (this.DSGroup.length > 0) {
          this.selectedGroup = this.DSGroup[0]
        }
      } catch (err) {
        console.error('Lỗi tải nhóm câu hỏi:', err)
      } finally {
        this.loadingGroup = false
      }
    },
    async getQuestions() {
      if (!this.selectedGroup) return
      this.loadingQuestions = true
      try {
        const res = await fetchPromise('lms/EL_Question_List', {
          GroupId: this.selectedGroup.Id,
          Type: '',
          Search: '',
          IncludeDeleted: false,
          PageNumber: 1,
          PageSize: 100,
        }, { forceRefresh: true })
        const flat = Array.isArray(res?.[0]) ? res[0] : res
        this.DSQuestion = (flat ?? []).map((q) => {
          let config = {}
          try {
            config = typeof q.ConfigJson === 'string' ? JSON.parse(q.ConfigJson) : (q.ConfigJson || {})
          } catch (e) {
            console.error('Lỗi parse ConfigJson:', e)
          }

          let skills = []
          try {
            skills = typeof q.SkillsJson === 'string' ? JSON.parse(q.SkillsJson) : (q.SkillsJson || [])
          } catch (e) {
            console.error('Lỗi parse SkillsJson:', e)
          }

          return {
            ...q,
            ParsedConfig: config,
            Options: config.options || [],
            Skills: skills,
            isSelected: false,
          }
        })
      } catch (err) {
        console.error('Lỗi tải danh sách câu hỏi:', err)
      } finally {
        this.loadingQuestions = false
      }
    },
    toggleSelectAll(val) {
      this.filteredQuestions.forEach((q) => {
        q.isSelected = !!val
      })
    },
    getTypeLabel(type) {
      return this.TypeOptions.find((t) => t.value === type)?.label || type
    },
    getTypeColor(type) {
      return this.TypeOptions.find((t) => t.value === type)?.color || 'grey'
    },
    openQuestionBank() { window.open('/lms-teacher-question-bank', '_blank', 'noopener,noreferrer') },
    handleImport() {
      const selectedList = this.DSQuestion.filter((q) => q.isSelected)
      selectedList.forEach((q) => {
        const parsed = this.parseQuestionToBuilderFormat(q)
        this.$emit('importJson', parsed)
      })
      this.$emit('update:isOpen', false)
    },
    parseQuestionToBuilderFormat(q) {
      let type = q.Type
      if (type === 'QUIZ_TRUE_FALSE') {
        type = 'QUIZ_MULTIPLE_TRUE_FALSE'
      }

      const config = q.ParsedConfig || {}
      const skills = q.Skills || []

      const newQuestion = {
        id: `q_${crypto.randomUUID()}`,
        type: type,
        label: this.getTypeLabel(type),
        points: q.Points || 1.0,
        gradingType: q.GradingType || 'auto',
        skills: skills,
        config: {
          ...config,
          questionText: config.questionText || q.QuestionText || '',
          isAdvanced: q.IsAdvanced || config.isAdvanced || false,
          media: config.media || {
            type: 'YOUTUBE',
            sourceYT: { id: '', name: '', source: '' },
            sourceRecord: { id: '', name: '', source: '' },
            sourceFiles: { file: [], image: [] },
          },
        },
      }

      return newQuestion
    },
  },
	}
</script>