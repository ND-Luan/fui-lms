<template>

    <v-dialog v-model="isOpen" max-width="1600px">
        <v-card>
            <v-card-title class="d-flex" style="background-color: #217d46;">
                <span class="text-white">Khối {{ KhoiMonObj.KhoiID }} - Môn {{ KhoiMonObj.TenMonHoc_HienThi }}</span>
                <v-spacer></v-spacer>
                <v-btn class="text-white" variant="text" icon @click="onclose()">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-data-table v-model:expanded="expanded" :hide-default-footer="true" :items="DataTable" :headers
                    show-expand item-value="TenLop">
                    <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                        <v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            :text="isExpanded(internalItem) ? 'Đóng' : 'Xem chi tiết'" class="text-none"
                            color="medium-emphasis" size="small" variant="text" width="105" border slim
                            @click="toggleExpand(internalItem); console.log('internalItem', internalItem)"></v-btn>
                    </template>

                    <template v-slot:expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="py-2">
                                <v-sheet rounded="lg" border>
                                    <v-table density="compact">
                                        <tbody class="bg-surface-light">
                                            <tr class="bg-green-lighten-1">
                                                <th class="text-white">Bài tập</th>
                                                <th class="text-end text-white">Chưa nộp</th>
                                                <th class="text-end text-white">Đã nộp</th>
                                                <th class="text-end text-white">Đã chấm</th>
                                                <th class="text-end text-white">Điểm tối đa</th>
                                                <th class="text-end text-white">Điểm trung bình</th>
                                                <th class="text-end text-white">Điểm trung vị</th>
                                                <th class="text-end text-white">Tình trạng</th>
                                            </tr>
                                        </tbody>

                                        <tbody>
                                            <tr v-for="bt in item.DSBaiTap">

                                                <td class="py-2">{{ bt.Title }}</td>
                                                <td class="py-2 text-end">
                                                    {{ bt.ConHocSinhChuaNop }}
                                                </td>
                                                <td class="py-2 text-end">{{ bt.SoHocSinhDaNop }}</td>
                                                <td class="py-2 text-end">{{ bt.SoHocSinhCoDiem }}</td>
                                                <td class="py-2 text-end">{{ bt.MaxScore }}</td>
                                                <td class="py-2 text-end">{{ bt.DiemTB }}</td>
                                                <td class="py-2 text-end">{{ bt.DiemTrungVi }}</td>
                                                <td class="py-2 text-end">
                                                    <v-btn color="primary" size="small" variant="tonal"
                                                        @click="onOpenStatusClass(bt)">
                                                        Xem tình trạng</v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-sheet>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
        <v-bottom-sheet v-if="isOpenStatusClass" v-model="isOpenStatusClass" fullscreen>
            <v-card class="table-card">
                <v-card-title
                    class="d-flex flex-column flex-md-row align-md-center align-start justify-md-space-between justify-start border-b bg-orange mb-2">

                    <div>
                        <span class="text-white">{{
                            AssignmentClassInfoDetail.Title
                        }}</span>
                    </div>


                    <v-btn icon @click="onCloseStatusClass" variant="text"
                        class="text-white"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>
                <div class="d-flex flex-column flex-md-row justify-md-end w-100 ga-2 me-2">
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
                        <v-chip :color="statusColors[item.Status]" size="small" variant="flat"
                            class="font-weight-medium">
                            {{ statusTexts[item.Status] }}
                        </v-chip>
                    </template>
                    <template #item.SubmissionTime="{ item }">
                        <span v-if="item.SubmissionTime">{{ formatDate(item.SubmissionTime) }}</span>
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
    </v-dialog>
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
            { title: this.$t('message.GradeAssignment'), key: 'actions', sortable: false, align: 'end' }],
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
            AssignmentClassInfoDetail: {}
        }
    },
    async mounted() {
        console.log('KhoiMonObj', this.KhoiMonObj)
        await this.get_BaoCaoLMS_Dashboard_By_MonHocID_KhoiID()
    },
    computed: {
        processedSubmissions() {
            if (!this.studentSubmissions || !Array.isArray(this.studentSubmissions)) return [];
            return this.studentSubmissions.map(item => ({
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
                // MaxScore: this.stats.MaxScore
            }));
        },
    },
    watch: {

    },
    methods: {
        onclose() {
            this.$emit('update:isOpen', false)
        },
        async get_BaoCaoLMS_Dashboard_By_MonHocID_KhoiID() {
            const response = await new Promise((resolve, reject) => {
                ajaxCALL('/lms/BaoCaoLMS_Dashboard_By_MonHocID_KhoiID', { MonHocID: this.KhoiMonObj.MonHocID, KhoiID: this.KhoiMonObj.KhoiID, NienKhoa: vueData.NienKhoa }, (response) => {
                    resolve(response)
                }, err => {

                })
            })
            this.DataTable = await this.handleData(response.data[0])
            this.expanded = this.DataTable.map(item => item.TenLop)

        },
        async handleData(data) {
            const DSLopHoc = new Set([...data.map(item => item.TenLop)])
            let DataReturn = [...DSLopHoc].map(lop => {
                let DSBaiTap = data.filter(bt => bt.TenLop == lop)
                let obj = {
                    TenLop: lop,
                    DSBaiTap: DSBaiTap,
                    SoLuongBaiTap: DSBaiTap.length,
                    SoLuongHocSinh: DSBaiTap[0].SoLuongHocSinh
                }
                return obj
            })
            return DataReturn
        },
        async fetchStudentSubmissions(assignToClassID) {
            await ajaxCALL("lms/EL_Teacher_GetSubmissionStatusByStudent", {
                AssignToClassID: assignToClassID
            }, (res) => {
                this.studentSubmissionsOriginal = res.data || [];
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
        async onOpenStatusClass(bt) {
            this.AssignmentClassInfoDetail = bt
            await this.fetchStudentSubmissions(bt.AssignToClassID)
            this.isOpenStatusClass = true
        },
        onCloseStatusClass() {
            this.isOpenStatusClass = false
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