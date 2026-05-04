<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <div class="d-flex align-center">
          <v-icon size="28" class="mr-2">mdi-clipboard-text-outline</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">Tình trạng nộp bài</div>
            <div class="text-caption text-medium-emphasis">{{ pageSubtitle }}</div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end gap-2">
        <v-select v-model="selectedClassId" :items="classes" item-title="name" item-value="id" label="Lớp" variant="solo" density="comfortable" hide-details style="max-width: 180px" />
        <v-select v-model="selectedAssignmentId" :items="assignments" item-title="title" item-value="id" label="Bài tập" variant="solo" density="comfortable" hide-details style="max-width: 220px" />
        <v-text-field v-model="search" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" variant="solo" density="comfortable" hide-details style="max-width: 240px" />
      </v-col>
    </v-row>

    <!-- KPIs -->
    <v-row class="mb-4" dense align="stretch">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 kpi fill-height" rounded="xl" elevation="2">
          <div class="text-overline">Tổng học sinh</div>
          <div class="text-h5">{{ totalStudents }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 kpi fill-height" rounded="xl" elevation="2">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-overline">Đã nộp</div>
              <div class="text-h5">{{ submittedCount }}</div>
            </div>
            <div class="text-caption text-medium-emphasis">{{ completionRate.toFixed(0) }}%</div>
          </div>
          <v-progress-linear class="mt-2" :model-value="completionRate" height="8" rounded />
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 kpi fill-height" rounded="xl" elevation="2">
          <div class="text-overline">Điểm TB</div>
          <div class="text-h5">{{ averageScore.toFixed(1) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bảng -->
    <v-card rounded="xl" elevation="2">
      <v-data-table :headers="headers" :items="filteredRows" :items-per-page="10" density="comfortable" class="rounded-xl">
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'Đã nộp' ? 'success' : 'warning'" size="x-small" variant="flat">{{ item.status }}</v-chip>
        </template>
        <template #item.submittedAt="{ item }">
          <span v-if="item.submittedAt">{{ formatDate(item.submittedAt) }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.score="{ item }">
          <span>{{ item.score != null ? item.score.toFixed(1) : '—' }}</span>
        </template>
        <template #item.actions="{ item }">
          <v-btn size="x-small" color="primary" variant="flat" @click="openGradeDialog(item)">Chấm bài</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog chấm bài -->
    <v-dialog v-model="gradeDialog.open" max-width="620">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Chấm bài - {{ gradeDialog.current?.name }}</v-card-title>
        <v-card-text>
          <div class="mb-3 text-body-2 text-medium-emphasis">Bài: {{ currentAssignment.title }}</div>
          <v-row class="mt-4" dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model.number="gradeDialog.score" :max="currentAssignment.maxScore" :min="0" type="number" label="Điểm" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="gradeDialog.bonus" label="Điểm cộng (tuỳ chọn)" type="number" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="gradeDialog.comment" label="Nhận xét" rows="3" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="gradeDialog.open = false">Huỷ</v-btn>
          <v-btn color="primary" @click="saveGrade">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'ClassSubmissionStatusOptions',
  data() {
    return {
      classes: [{ id: '10A1', name: '10A1' }],
      assignments: [
        { id: 'HW1', title: 'Bài tập 1', maxScore: 10, questions: ['Q1','Q2','Q3','Q4','Q5'] },
      ],
      selectedClassId: '10A1',
      selectedAssignmentId: 'HW1',
      students: [
        { id: 's1', name: 'Nguyễn An' },
        { id: 's2', name: 'Trần Bình' },
        { id: 's3', name: 'Lê Chi' },
        { id: 's4', name: 'Phạm Dũng' },
      ],
      submissions: [
        { studentId: 's1', assignmentId: 'HW1', submittedAt: '2025-08-10T19:10:00', score: 8.5 },
        { studentId: 's2', assignmentId: 'HW1', submittedAt: '2025-08-11T08:05:00', score: 6.0 },
        { studentId: 's3', assignmentId: 'HW1', submittedAt: '2025-08-12T09:40:00', score: 9.0 },
      ],
      search: '',
      headers: [
        { title: 'Học sinh', key: 'name' },
        { title: 'Trạng thái', key: 'status' },
        { title: 'Thời gian nộp', key: 'submittedAt' },
        { title: 'Điểm', key: 'score' },
        { title: 'Chấm bài', key: 'actions', sortable: false },
      ],
      gradeDialog: {
        open: false,
        current: null,
        score: null,
        bonus: 0,
        comment: '',
      },
    }
  },
  computed: {
    pageSubtitle(){
      const cls = this.classes.find(c => c.id === this.selectedClassId)?.name || ''
      const asg = this.assignments.find(a => a.id === this.selectedAssignmentId)?.title || ''
      return asg && cls ? `${asg} · Lớp ${cls}` : ''
    },
    currentAssignment(){
      return this.assignments.find(a => a.id === this.selectedAssignmentId) || { id:'', title:'', maxScore:10, questions:[] }
    },
    assignmentSubmissions(){
      return this.submissions.filter(s => s.assignmentId === this.currentAssignment.id)
    },
    rows(){
      const byId = new Map(this.assignmentSubmissions.map(s => [s.studentId, s]))
      return this.students.map(stu => {
        const sub = byId.get(stu.id)
        return {
          id: stu.id,
          name: stu.name,
          status: sub ? 'Đã nộp' : 'Chưa nộp',
          submittedAt: sub?.submittedAt || null,
          score: sub?.score ?? null,
        }
      })
    },
    filteredRows(){
      const q = this.search.trim().toLowerCase()
      return !q ? this.rows : this.rows.filter(r => r.name.toLowerCase().includes(q))
    },
    totalStudents(){ return this.students.length },
    submittedCount(){ return this.assignmentSubmissions.length },
    completionRate(){ return this.totalStudents ? (this.submittedCount / this.totalStudents) * 100 : 0 },
    averageScore(){
      const arr = this.assignmentSubmissions.map(s => s.score).filter(v => typeof v === 'number')
      if (!arr.length) return 0
      return arr.reduce((a,b)=>a+b,0) / arr.length
    },
  },
  methods: {
    formatDate(iso){
      try { return new Date(iso).toLocaleString() } catch { return '—' }
    },
    openGradeDialog(row){
      this.gradeDialog.open = true
      this.gradeDialog.current = row
      this.gradeDialog.score = row.score ?? null
      this.gradeDialog.comment = ''
    },
    saveGrade(){
      const idx = this.submissions.findIndex(s => s.studentId === this.gradeDialog.current.id && s.assignmentId === this.currentAssignment.id)
      if (idx !== -1){
        const base = Number(this.gradeDialog.score ?? 0)
        const bonus = Number(this.gradeDialog.bonus ?? 0)
        this.submissions[idx].score = Math.max(0, Math.min(this.currentAssignment.maxScore, base + bonus))
      }
      this.gradeDialog.open = false
    },
  }
}
</script> 
