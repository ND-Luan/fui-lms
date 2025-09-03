<template>
    <v-container class="page-container" fluid>
        <div v-if="loading && !studentGrades.length" class="text-center pa-10">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            <p class="mt-4 text-muted">Đang tải dữ liệu sổ điểm...</p>
        </div>

        <div v-else>
            <!-- Header & Bộ lọc -->
            <div class="page-header d-flex justify-space-between align-center mb-6">
            
                <!-- ============================================= -->
                <!-- == KHỐI BÊN TRÁI: TIÊU ĐỀ                 == -->
                <!-- ============================================= -->
                <div class="header-title-group d-flex align-center">
                    <v-icon size="40" class="mr-4" color="primary">mdi-table-large-plus</v-icon>
                    <div>
                        <div class="text-h5 font-weight-bold">Sổ điểm Lớp học</div>
                        <!-- Sử dụng v-if để chỉ hiển thị khi có lựa chọn -->
                        <div v-if="selectedClassName" class="text-body-2 text-medium-emphasis text-truncate"
                            :title="selectedClassName">
                            {{ selectedClassName }}
                        </div>
                    </div>
                </div>
            
                <!-- ============================================= -->
                <!-- == KHỐI BÊN PHẢI: BỘ LỌC & HÀNH ĐỘNG      == -->
                <!-- ============================================= -->
                <div class="header-filters d-flex align-center ga-3">
                    <v-select label="Lớp" :items="lopList" item-title="TenLop" item-value="LopID" v-model="selectedLopID"
                        variant="outlined" density="compact" hide-details clearable style="min-width: 200px;" />
                    <v-select label="Môn học" :items="monHocList" item-title="MonHocName" item-value="MonHocID"
                        v-model="selectedMonHocID" variant="outlined" density="compact" hide-details :disabled="!selectedLopID"
                        clearable style="min-width: 200px;" />
                    <v-btn color="primary" @click="exportToCSV" prepend-icon="mdi-file-excel-outline"
                        :disabled="!studentGrades.length || loading" :loading="exporting" variant="flat">
                        Xuất Excel
                    </v-btn>
                </div>
            </div>
            

            <!-- Bảng điểm ma trận -->
            <v-card class="table-card">
                <v-table fixed-header height="90vh" density="compact">
                    <thead>
                        <tr>
                            <th class="fixed-col student-col">Mã HS</th>
                            <th class="fixed-col student-col">Họ tên</th>
                            <th v-for="header in assignmentHeaders" :key="header.AssignToClassID"
                                class="assignment-header text-center">
                                <v-tooltip location="top">
                                    <template v-slot:activator="{ props }">
                                        <span v-bind="props">{{ header.AssignmentTitle }}</span>
                                    </template>
                                    <span>Hạn nộp: {{ formatDate(header.DueDate) }} | Tối đa: {{ header.MaxScore
                                        }}đ</span>
                                </v-tooltip>
                            </th>
                            <th class="fixed-col-right score-col text-center">Điểm TB</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!studentGrades.length">
                            <td :colspan="assignmentHeaders.length + 3" class="text-center text-muted pa-4">
                                Vui lòng chọn Lớp và Môn học để xem dữ liệu.
                            </td>
                        </tr>
                        <tr v-for="student in studentGrades" :key="student.HocSinhID">
                            <td class="fixed-col student-col text-medium-emphasis">{{ student.HocSinhID }}</td>
                            <td class="fixed-col student-col font-weight-medium">{{ student.HoTen }}</td>
                            <td v-for="header in assignmentHeaders" :key="header.AssignToClassID" class="text-center">
                                <uc-gradebook-cell :cell-data="student[header.AssignToClassID]"
                                    @grade="vueData.goToDetailedGradingPage" @update-score="updateStudentScore" />
                            </td>
                            <td class="fixed-col-right score-col text-center font-weight-bold">{{
                                calculateStudentAverage(student) }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="2" class="fixed-col">Điểm TB Lớp</th>
                            <th v-for="header in assignmentHeaders" :key="header.AssignToClassID" class="text-center">
                                {{ getColumnAverage(header.AssignToClassID) }}
                            </th>
                            <th class="fixed-col-right score-col"></th>
                        </tr>
                    </tfoot>
                </v-table>
            </v-card>
        </div>
    </v-container>
</template>

<script>
    export default {
    name: 'uc-gradebook',
    props: {
        initialLopId: Number,
        initialMonHocId: Number
    },
    data() {
        return {
            loading: true,
            lopList: [], monHocList: [],
            selectedLopID: this.initialLopId || null,
            selectedMonHocID: this.initialMonHocId || null,
            assignmentHeaders: [],
            studentGrades: [],
            columnStats: [],
            vueData
        };
    },
    watch: {
        selectedLopID(newLopID, oldLopID) {
            
            if (newLopID && newLopID !== oldLopID) {
                this.monHocList = []; 
                this.selectedMonHocID = null;
                this.clearData();
                this.fetchSubjectsByClass(newLopID);
            }
        },
        selectedMonHocID(newMonHocID, oldMonHocID) {
            if (newMonHocID && newMonHocID !== oldMonHocID) {
                this.fetchData();
            }
        }
    },
    methods: {
        async initialize() {
            await this.fetchMyClasses();
            
            if (this.selectedLopID && !this.selectedMonHocID) {
                await this.fetchSubjectsByClass(this.selectedLopID);
            }
            if (this.selectedLopID && this.selectedMonHocID) {
                this.selectedLopID = this.lopList.find(x=>x.LopID == this.initialLopId)?.LopID??null;
                await this.fetchSubjectsByClass(this.selectedLopID);
                await this.fetchData();
            }
            this.loading = false;
        },
        async fetchMyClasses() {
            await ajaxCALL("lms/EL_Teacher_GetMyClasses", null, (res) => {
                this.lopList = res.data || [];
                if (!this.selectedLopID && this.lopList.length > 0) {
                    
                    this.selectedLopID = this.lopList.find(x=>x.LopID == this.initialLopId)?.LopID??this.lopList[0].LopID;
                }
            });
        },
        async fetchSubjectsByClass(lopId) {
            await ajaxCALL("lms/EL_Teacher_GetSubjectsByClass", { LopID: lopId }, (res) => {
                this.monHocList = res.data || [];
                
                if (!this.selectedMonHocID && this.monHocList.length > 0) {
                    
                    this.selectedMonHocID = this.monHocList.find(x=>x.MonHocID == this.initialMonHocId)?.MonHocID ??this.monHocList[0].MonHocID;

                }
            });
        },
        async fetchData() {
            if (!this.selectedLopID || !this.selectedMonHocID) return;
            this.loading = true;
            await ajaxCALL("lms/EL_Teacher_GetGradebook", { LopID: this.selectedLopID, MonHocID: this.selectedMonHocID }, (res) => {
                if (res && res.data && res.data.length >= 3) {
                    this.assignmentHeaders = res.data[0];
                    this.studentGrades = res.data[1];
                    this.columnStats = res.data[2];
                } else {
                    this.clearData();
                }
            });
            this.loading = false;
        },
        async updateStudentScore(payload) {
            ajaxCALL("lms/EL_Teacher_UpdateQuickGrade", { SubmissionID: payload.submissionId, NewScore: payload.newScore }, (res) => {
                if (res.data && res.data[0] && res.data[0].Success) {
                    Toast.success({ text: "Cập nhật điểm thành công." });
                    this.fetchData(); 
                } else {
                    Toast.error({ text: "Cập nhật điểm thất bại." });
                }
            });
        },
        calculateStudentAverage(student) {
            let totalScore = 0;
            let count = 0;
            this.assignmentHeaders.forEach(header => {
                const cellData = student[header.AssignToClassID];
                if (cellData) {
                    try {
                        const data = JSON.parse(cellData);
                        if (data.status === 'GRADED' && typeof data.score === 'number') {
                            totalScore += data.score;
                            count++;
                        }
                    } catch (e) {}
                }
            });
            return count > 0 ? (totalScore / count).toFixed(2) : '';
        },
        getColumnAverage(assignToClassID) {
            const stat = this.columnStats.find(s => s.AssignToClassID === assignToClassID);
            return stat && stat.AverageScore != null ? stat.AverageScore.toFixed(2) : '';
        },
        exportToCSV() { /* Logic xuất Excel */ },
        formatDate(iso) { 
            if (!iso) return '';
            return new Date(iso).toLocaleDateString('vi-VN');
        },
        clearData() {
            this.assignmentHeaders = [];
            this.studentGrades = [];
            this.columnStats = [];
        },
    },
    mounted() {
        this.initialize();
    }
}
</script>

<style scoped>
   
</style>