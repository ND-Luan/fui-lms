<template>
  <Global>
    <uc-assignment-builder
      v-if="dataReady"
      :initial-assignment="assignment"
      :is-edit-mode="isEditMode"
      :on-save="saveAssignment"
      :on-auto-save="autoSaveAssignment"
    />
  </Global>
</template>

<script>
export default {
  inject: ['snackbarRef', 'iframeRef'],
  data() {
    return {
      dataReady: false,
      isEditMode: false,
      assignment: null,
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search)
    vueData.AssignToClassID = parseInt(urlParams.get('AssignToClassID')) || 0
    vueData.AssignToStudentID = parseInt(urlParams.get('AssignToStudentID')) || 0
    vueData.AssignmentID = parseInt(urlParams.get('AssignmentID')) || 0
    vueData.HocKi = localStorage.getItem('HocKi') ?? 1
    this.initPage()
  },
  methods: {
    async initPage() {
      const IsLanguage = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
      const assignmentId = vueData.AssignmentID

      const asmDefault = {
        version: '1.2',
        type: 'GROUPED_MIXED',
        groups: [{
          id: 'group_' + Date.now(),
          title: IsLanguage ? 'Section 1' : 'Phần 1',
          media: {
            type: 'YOUTUBE',
            sourceYT: { id: '', source: '', name: '' },
            sourceRecord: { id: '', source: '', name: '' },
            sourceFiles: { file: [], image: [] },
          },
          description: '',
          advancedFeatures: { isShuffleQuestions: false, isShuffleAnswers: false },
          questions: [],
        }],
      }

      if (assignmentId && assignmentId > 0) {
        this.isEditMode = true
        let apiUrl = 'lms/EL_Teacher_GetAssignmentForEdit'
        let apiParams = { AssignmentID: assignmentId }
        if (vueData.AssignToClassID) {
          apiParams.AssignToClassID = vueData.AssignToClassID
        } else if (vueData.AssignToStudentID) {
          apiUrl = 'lms/EL_Teacher_GetAssignmentForEdit_Student'
          apiParams.AssignToStudentID = vueData.AssignToStudentID
        }
        const res = await fetchPromise(apiUrl, apiParams, { cache: false })
        let assignmentData = { ...(res?.[0] ?? {}) }
        if (!assignmentData.AssignmentConfig) {
          assignmentData.AssignmentConfig = asmDefault
        } else {
          try {
            if (typeof assignmentData.AssignmentConfig === 'string') {
              assignmentData.AssignmentConfig = JSON.parse(assignmentData.AssignmentConfig) || asmDefault
            }
          } catch (e) {
            assignmentData.AssignmentConfig = asmDefault
          }
        }
        vueData.assignment = assignmentData
        this.assignment = assignmentData
      } else {
        this.isEditMode = false
        const newAssignment = {
          Title: '',
          Instructions: '',
          MonHocLopID: null,
          AssignmentConfig: {
            version: '1.2',
            type: 'GROUPED_MIXED',
            groups: [{
              id: 'group_' + crypto.randomUUID(),
              title: IsLanguage ? 'Section 1' : 'Phần 1',
              description: '',
              AdvancedFeatures: { isShuffleQuestions: false, isShuffleAnswers: false },
              questions: [],
              media: {
                type: 'YOUTUBE',
                sourceYT: { id: '', source: '', name: '' },
                sourceRecord: { id: '', source: '', name: '' },
                sourceFiles: { file: [], image: [] },
              },
            }],
          },
          MaxScore: 10,
          Status: 1,
        }
        vueData.assignment = newAssignment
        this.assignment = newAssignment
      }
      this.dataReady = true
    },

    _buildPayload(payload) {
      const dataToSend = {
        ...payload.assignment,
        AssignmentID: vueData.AssignmentID || 0,
        AssignToClassID: vueData.AssignToClassID || 0,
        Is_Full_Quiz: payload.Is_Full_Quiz ? 1 : 0,
        IsBlockCopy_Paste: payload.setting?.IsBlockCopy_Paste,
      }
      dataToSend.Status = payload.isPublishing ? 2 : 1

      const groups = payload.assignment.AssignmentConfig?.groups || []
      let MaxScore = 0
      for (const group of groups) {
        for (const question of group.questions) {
          const pts = Number(question.points)
          MaxScore += (isNaN(pts) || pts < 0) ? 0 : pts
        }
      }
      dataToSend.MaxScore = MaxScore

      const cloneGroup = _.cloneDeep(dataToSend.AssignmentConfig)
      for (const group of cloneGroup.groups) {
        group.questions = group.questions.map(x => {
          if (x.type === 'QUIZ_SINGLE_CHOICE') x.config.correctAnswer = null
          if (x.type === 'QUIZ_MULTIPLE_CHOICE') x.config.correctAnswers = []
          if (x.type === 'QUIZ_TRUE_FALSE') x.config.correctAnswer = null
          if (x.type === 'QUIZ_MULTIPLE_TRUE_FALSE') x.config.options = x.config.options.map(n => ({ ...n, inCorrectAnswer: null, correctAnswer: null }))
          if (x.type === 'QUIZ_FILL_IN_BLANK') x.config.parts = x.config.parts.map(n => { if (n.type === 'blank') n.acceptedAnswers = []; return n })
          if (x.type === 'QUIZ_MATCHING') x.config.correctPairs = []
          return x
        })
      }
      dataToSend.AssignmentConfig_NoAnswer = JSON.stringify(cloneGroup)
      dataToSend.AssignmentConfig = JSON.stringify(dataToSend.AssignmentConfig)
      return dataToSend
    },

    async saveAssignment(payload) {
      const dataToSend = this._buildPayload(payload)
      const res = await fetchPromise('lms/EL_Teacher_SaveAssignment', dataToSend, { cache: false })
      this.snackbarRef.value.showSnackbar({ message: 'Lưu bài tập thành công', color: 'success' })
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('AssignToClassID') && !this.isEditMode) {
        window.open('/lms-teacher-dashboard', '_parent')
        return
      }
      if (!this.isEditMode && res?.[0]?.AssignmentID) {
        const newId = res[0].AssignmentID
        window.history.pushState({}, '', `?AssignmentID=${newId}`)
        vueData.AssignmentID = newId
        this.isEditMode = true
        const savedAssignment = JSON.parse(JSON.stringify(payload.assignment))
        savedAssignment.AssignmentID = newId
        this.assignment = savedAssignment
        vueData.assignment = savedAssignment
      }
    },

    async autoSaveAssignment(payload) {
      const dataToSend = this._buildPayload({ ...payload, isPublishing: false })
      await fetchPromise('lms/EL_Teacher_SaveAssignment', dataToSend, { cache: false, silent: true })
    },
  },
}
</script>
