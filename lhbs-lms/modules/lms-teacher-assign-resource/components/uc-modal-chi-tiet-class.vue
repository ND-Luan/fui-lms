<template>

    <v-bottom-sheet v-model="isOpen" fullscreen>
        <v-card class="table-card">
            <v-card-title style="background-color: #217d46;"
                class="d-flex flex-column flex-md-row align-md-center align-start justify-md-space-between justify-start border-b  mb-2">

                <div>
                    <span class="text-white">{{
                        AssignmentClassInfoDetail.Title
                        }}</span>
                </div>


                <v-btn icon @click="onclose" variant="text" class="text-white"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <div class="d-flex flex-column flex-md-row justify-md-end w-100 ga-2 me-2">
                <div class="d-flex flex-wrap ga-2 align-center pa-2">
                    <span><b>Sỉ số: </b>{{ lopTinhTrangInfo.SiSo }} học sinh | </span>
                    <span><b>Chưa nộp: </b>{{ lopTinhTrangInfo.NOT_SUBMITTED }} | </span>
                    <span><b>Đang làm: </b>{{ lopTinhTrangInfo.IN_PROGRESS }} | </span>
                    <span><b>Đã nộp: </b>{{ lopTinhTrangInfo.SUBMITTED }} | </span>
                    <span><b>Chấm nháp: </b> {{ lopTinhTrangInfo.SAVE_DRAFT }} | </span>
                    <span><b>Đã chấm: </b>{{ lopTinhTrangInfo.GRADED }}</span>
                </div>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" :label="$t('message.FindStudent')" prepend-inner-icon="mdi-magnify"
                    variant="outlined" density="compact" hide-details style="max-width: 300px;" />
            </div>
            <v-data-table class="table-custom" :headers="headersStatusClass" :items="processedSubmissions"
                :search="search" :items-per-page="-1" :hide-default-footer="true" @update:sort-by="false"
                density="compact" item-value="HocSinhID">

                <!-- <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                        <v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            :text="isExpanded(internalItem) ? $t('message.Close') : $t('message.ViewDetail')"
                            class="text-none" color="medium-emphasis" size="small" variant="text"
                            style="    min-width: fit-content !important;" border slim
                            @click=" toggleExpand(internalItem); console.log('internalItem', internalItem)"
                            :disabled="!internalItem.raw.SubmissionStatus"></v-btn>
                    </template>

<template v-slot:expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="py-2">
                                <v-sheet rounded="lg" border>
                                    <v-table density="compact" :mobile="isMobile">
                                        <tbody class="bg-surface-light">
                                            <tr>
                                                <th>{{ $t('message.SubmissionNumber') }}</th>
                                                <th>{{ $t('message.Status') }}</th>
                                                <th>{{ $t('message.SubmissionTime') }}</th>
                                                <th>{{ $t('message.Score') }}</th>
                                                <th></th>
                                            </tr>
                                        </tbody>

                                        <tbody>
                                            <tr v-for="(obj, index) in getAllAssigned(item)">
                                                <td class="py-2">
                                                    <v-chip size="small" variant="flat" color="deep-orange-lighten-1"
                                                        class="me-1" v-if="obj.Status !== 'NOT_SUBMITTED'">
                                                        {{ $t('message.Attempt') }} {{ index + 1 }}
                                                    </v-chip>
                                                </td>
                                                <td class="py-2">
                                                    <v-chip :color="statusColors[item.Status]" size="small"
                                                        variant="flat" class="font-weight-medium">
                                                        {{ statusTexts[item.Status] }}
                                                    </v-chip>
                                                </td>
                                                <td class="py-2"><span v-if="obj.SubmissionTime">{{
                                                        formatDate(obj.SubmissionTime) }}</span>
                                                    <span v-else class="text-medium-emphasis">—</span>
                                                </td>
                                                <td class="py-2">
                                                    <span class="font-weight-bold" :class="getScoreColor(obj.Score)">
                                                        {{ obj.Score != null ? obj.Score : '—' }}
                                                    </span>
                                                    <span class="font-weight-bold text-success"
                                                        v-tooltip="$t('message.MaximumScore')">
                                                        /{{ stats.MaxScore || '-' }}
                                                    </span>
                                                </td>
                                                <td class="py-2 text-end">
                                                    <v-btn size="small" color="primary" variant="flat"
                                                        :disabled="!obj.SubmissionID || obj.SubmissionStatus == 1 || obj.SubmissionStatus == 0"
                                                        @click.stop="RedirectToGrade(obj)">
                                                        {{ obj.SubmissionStatus == 4 ? $t('message.ReviewGraded') :
                                                        $t('message.GradeAssignment') }}
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-sheet>

                            </td>
                        </tr>
                    </template> -->

                <template #item.HocSinhID="{ item }">
                    <div class="text-muted">{{ item.HocSinhID }}</div>
                </template>
                <template #item.HoTen="{ item }">
                    <div class="font-weight-medium text-secondary">{{ item.HoTen }}</div>
                </template>
                <template #item.Status="{ item }">
                    <v-chip :color="statusColors[item.Status]" size="small" variant="flat" class="font-weight-medium">
                        {{ statusTexts[item.Status] }}
                    </v-chip>
                </template>
                <template #item.SubmissionTime="{ item }">
                    <span v-if="item.SubmissionTime">{{ formatDate(item.SubmissionTime) }}</span>
                    <span v-else class="text-medium-emphasis">—</span>
                </template>
                <template #item.GradedDate="{ item }">
                    <span v-if="item.GradedDate">{{ formatDate(item.GradedDate) }}</span>
                    <span v-else class="text-medium-emphasis">—</span>
                </template>
                <!-- <template #item.thongtinnopbai="{ item }">
                        <div class="d-flex flex-wrap ga-2">
                            <v-chip v-for="(obj, index) in getAllAssigned(item)" :key="index"
                                :color="statusColors[obj.Status]" size="small" variant="flat"
                                class="font-weight-medium " :class="obj.Status !== 'NOT_SUBMITTED' ? 'ps-0' : ''"
                                style="min-height: fit-content;">
                                <v-chip size="small" variant="flat" color="deep-orange-lighten-1" class="me-1"
                                    v-if="obj.Status !== 'NOT_SUBMITTED'">
                                    Lần {{ index + 1 }}
                                </v-chip>
                                {{
                                    statusTexts[obj.Status]
                                }}
                            </v-chip>
                        </div>

                    </template> -->
                <template #item.Score="{ item }">
                    <span class="font-weight-bold" :class="getScoreColor(item.Score)">
                        {{ item.Score != null ? item.Score : '—' }}
                    </span>
                    <span class="font-weight-bold text-success" v-tooltip="$t('message.MaximumScore')">
                        / {{ item.MaxScore != null ? item.MaxScore : '—' }}
                    </span>
                </template>
                <template #no-data>
                    <div class="text-center pa-4 text-medium-emphasis">
                        {{ $t('message.PleaseSelectClassSubjectAssignment') }}
                    </div>
                </template>
            </v-data-table>
        </v-card>
    </v-bottom-sheet>
</template>
<script>
export default {
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        KhoiMonObj: {
            type: Object,
            default: {}
        },
        AssignToClassID: {
            type: Number,
            default: null
        },
        Title: {
            type: String,
            default: ''
        },
        AssignToClassInfo: {
            type: Object,
            default: {}
        }
    },
    emits: ['update:isOpen'],
    data() {
        return {
            search: '',
            DataTable: [],
            isOpenStatusClass: false,
            headers: [
                {
                    title: 'Lớp học',
                    key: 'TenLop'
                },
                {
                    title: 'Sỉ số',
                    key: 'SoLuongHocSinh',
                    align: 'end'
                },
                {
                    title: 'Số lượng bài tập',
                    key: 'SoLuongBaiTap',
                    align: 'end'
                },
                { width: 1, key: 'data-table-expand', align: 'end' },
            ],
            headersStatusClass: [{ title: this.$t('message.StudentID'), key: 'HocSinhID', sortable: false, width: 100, align: 'center' },
            { title: this.$t('message.RegistrationNumber'), key: 'SoDanhBo', sortable: false, width: 130, align: 'center' },
            { title: this.$t('message.StudentName'), key: 'HoTen', sortable: false, width: 300 }, { title: this.$t('message.Status'), key: 'Status', sortable: true },
            { title: this.$t('message.SubmissionTime'), key: 'SubmissionTime', sortable: true },
            { title: this.$t('message.Score'), key: 'Score', sortable: true },
            { title: 'Giáo viên chấm', value: 'GradedByTeacherID', sortable: true },
            { title: 'Thời gian chấm', key: 'GradedDate', sortable: true },
            ],
            statusColors: { 'SUBMITTED': 'info', 'GRADED': 'success', 'NOT_SUBMITTED': 'grey', 'SAVE_DRAFT': 'purple', 'IN_PROGRESS': 'teal', 'RESUBMIT': 'warning' },
            statusTexts: {
                'SUBMITTED': this.$t('message.Submitted'),
                'GRADED': this.$t('message.Graded'),
                'NOT_SUBMITTED': this.$t('message.NotSubmitted'),
                'SAVE_DRAFT': this.$t('message.DraftGrading'),
                'IN_PROGRESS': this.$t('message.DoingAssignment'),
                'RESUBMIT': this.$t('message.ResubmissionRequested')
            },
            expanded: [],
            studentSubmissionsOriginal: [],
            studentSubmissions: [],
            AssignmentClassInfoDetail: {
                Title: this.Title
            },
            lopTinhTrangInfo: {
                'SiSo': 0,
                'NOT_SUBMITTED': 0,
                'IN_PROGRESS': 0,
                'SUBMITTED': 0,
                'SAVE_DRAFT': 0,
                'GRADED': 0
            }
        }
    },
    async mounted() {
        await this.fetchStudentSubmissions(this.AssignToClassID)
    },
    computed: {
        processedSubmissions() {
            if (!this.studentSubmissions || !Array.isArray(this.studentSubmissions)) return [];
            return this.studentSubmissions.map(item => {
                return {
                    HocSinhID: item.HocSinhID,
                    SoDanhBo: item.SoDanhBo,
                    HoTen: item.HoTen || 'Lỗi dữ liệu',
                    Status: item.Status || 'NOT_SUBMITTED',
                    SubmissionTime: item.SubmissionTime,
                    Score: item.Score,
                    IncorrectQuestionsJSON: item.IncorrectQuestionsJSON,
                    SubmissionID: item.SubmissionID,
                    SubmissionStatus: item.SubmissionStatus,
                    SubmissionContent: item.SubmissionContent,
                    MaxScore: this.AssignToClassInfo.MaxScore,
                    GradedByTeacherID: item.GradedByTeacherID,
                    GradedDate: item.GradedDate,
                }
            });
        },
    },
    watch: {

    },
    methods: {
        onclose() {
            this.$emit('update:isOpen', false)
        },

        async fetchStudentSubmissions(assignToClassID) {
            await ajaxCALL("lms/EL_Teacher_GetSubmissionStatusByStudent", {
                AssignToClassID: assignToClassID
            }, (res) => {
                this.studentSubmissionsOriginal = res.data || [];
                this.lopTinhTrangInfo['SiSo'] = this.studentSubmissionsOriginal.length;
                this.studentSubmissionsOriginal.forEach(item => {
                    switch (item.Status) {
                        case 'NOT_SUBMITTED':
                            this.lopTinhTrangInfo['NOT_SUBMITTED'] += 1;
                            break;
                        case 'IN_PROGRESS':
                            this.lopTinhTrangInfo['IN_PROGRESS'] += 1;
                            break;
                        case 'SUBMITTED':
                            this.lopTinhTrangInfo['SUBMITTED'] += 1;
                            break;
                        case 'SAVE_DRAFT':
                            this.lopTinhTrangInfo['SAVE_DRAFT'] += 1;
                            break;
                        case 'GRADED':
                            this.lopTinhTrangInfo['GRADED'] += 1;
                            break;
                        default:
                            break;
                    }
                })

                this.studentSubmissions = res.data.reduce((acc, obj) => {
                    const existIndex = acc.findIndex(x => x.HocSinhID === obj.HocSinhID);
                    if (existIndex === -1) {
                        acc.push(obj);
                    } else if ((acc[existIndex].Score ?? -Infinity) < (obj.Score ?? -Infinity)) {
                        acc[existIndex] = obj;
                    }
                    return acc;
                }, []);
            });
        },
        getScoreColor(score) {
            if (score == null) return '';
            if (score < 5.0) return 'score-bad'; if (score < 7.0) return 'score-average'; return 'score-good';
        },
        formatDate(iso) {
            if (!iso) return '—';
            return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
        },
    }
}
</script>