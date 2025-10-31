<template>
    <v-dialog v-model="isOpen" max-width="1200">
        <v-card>
            <v-card-title class="d-flex ga-2 bg-primary"
                style="max-height: 48px !important; position: sticky; top: 0; z-index: 50;">
                <p>Import câu hỏi từ học liệu số</p>
                <v-spacer></v-spacer>
                <v-btn icon @click="$emit('update:isOpen', false)" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="DataHocLieu" :items-per-page="-1" hide-default-footer
                    class="border" show-expand>
                    <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                        <v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            :text="isExpanded(internalItem) ? 'Đóng' : 'Danh sách nội dung'" class="text-none"
                            color="medium-emphasis" size="small" variant="text" width="205" border slim
                            @click="toggleExpand(internalItem)"></v-btn>
                    </template>
                    <template v-slot:item.Thumnail="{ item }">
                        <v-avatar size="80" :rounded="10">
                            <v-img :src="item?.ThumbnailURL" :cover="false">
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                                    </div>
                                </template>
                            </v-img>
                        </v-avatar>
                    </template>
                    <template v-slot:expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="py-2">
                                <div class="d-flex">
                                    <v-spacer></v-spacer>
                                    <v-btn color="orange" variant="tonal" size="small" @click="importQuestion(question)"
                                        :disabled="CountSelectedQuestion == 0">Import câu hỏi
                                    </v-btn>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td :colspan="columns.length" class="py-2">
                                <v-sheet rounded="lg" border>
                                    <v-table density="compact">
                                        <tbody class="bg-surface-light">
                                            <tr>
                                                <th>Tên nội dung</th>
                                                <th style="width:150px" class="text-center">Loại nội dung</th>
                                                <th style="width:150px" class="text-center">Xem trước</th>
                                                <th style="width:150px" class="text-center">
                                                    <v-checkbox v-model="isSelectedAll" v-tooltip="'Chọn tất cả'"
                                                        style="width: fit-content;margin: auto;"
                                                        :indeterminate="isNotSelectecAll" />
                                                </th>
                                            </tr>
                                        </tbody>

                                        <tbody>
                                            <tr v-for="(question, index) in DataQuestion.filter(l => l.HocLieuID === item.HocLieuID)"
                                                :key="index">
                                                <td class="py-2">
                                                    {{ question.TenNoiDung }}
                                                </td>
                                                <td class="py-2 text-center" style="width:150px">
                                                    <v-icon color="primary">
                                                        {{ getLabelQuestion(question?.LoaiNoiDung)?.icon }}
                                                    </v-icon>
                                                </td>
                                                <td class="py-2 text-center" style="width:150px">
                                                    <v-btn color="pink" variant="tonal" size="small"
                                                        @click="onPreviewQuestion(question)">Xem trước
                                                    </v-btn>
                                                </td>
                                                <td class="py-2 text-center" style="width:150px;">
                                                    <!-- <v-btn color="orange" variant="tonal" size="small"
                                                        @click="importQuestion(question)">Import
                                                    </v-btn> -->
                                                    <v-checkbox v-model="question.isSelected"
                                                        style="width: fit-content;margin: auto;" />
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
    </v-dialog>
</template>
<script>
export default {
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        assignmentDetail: {
            type: Object,
            default: {}
        },
    },
    emits: ['update:isOpen', 'importJson'],
    data() {
        return {
            vueData,
            groupBy: [
                { key: 'TenHocLieu' }
            ],
            headers: [
                { title: 'Ảnh bìa', sortable: false, key: 'Thumnail', width: '120' },
                { title: 'Tên học liệu', sortable: false, key: 'TenHocLieu' },
            ],
            DataHocLieu: [],
            DataQuestion: [],
            defineQuestionType: [
                { type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm', description: "Một đáp án", icon: 'mdi-radiobox-marked', kind: "quiz" },
                { type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm', description: "Nhiều đáp án", icon: 'mdi-checkbox-multiple-marked-outline', kind: "quiz" },
                { type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline', kind: "quiz" },
                { type: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều đúng / Sai', icon: 'mdi-check-circle-outline', kind: "quiz" },
                { type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox', kind: "quiz" },
                { type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge', kind: "quiz" },
            ],
            GroupQuestion: [],
            isSelectedAll: false,
        }
    },
    computed: {
        CountSelectedQuestion() {

            return this.DataQuestion.filter(q => q.isSelected).length
        },
        isNotSelectecAll() {
            return this.CountSelectedQuestion > 0 && this.CountSelectedQuestion < this.DataQuestion.length
        },

    },
    mounted() {
        this.getQuestionFromHocLieu()
    },
    watch: {
        isSelectedAll(val) {
            if (val) {
                this.DataQuestion.forEach(q => {
                    q.isSelected = true
                })
            } else {
                this.DataQuestion.forEach(q => {
                    q.isSelected = false
                })
            }
        },
        CountSelectedQuestion(val) {
            if (val === this.DataQuestion.length) {
                this.isSelectedAll = true
            } else if (val === 0) {
                this.isSelectedAll = false
            }
        },
    },
    methods: {
        getQuestionFromHocLieu() {
            if (!this.assignmentDetail || !this.assignmentDetail.MonHocID || !this.assignmentDetail.KhoiID) return

            let payload = {
                MonHocID: this.assignmentDetail.MonHocID,
                KhoiID: this.assignmentDetail.KhoiID,
            }
            ajaxCALL('lms/EL_Teacher_GetQuestionFromHocLieu', payload, res => {
                this.DataHocLieu = res.data[0]
                this.DataQuestion = res.data[1].map(item => {
                    let objFindHocLieu = res.data[0].find(i => i.HocLieuID === item.HocLieuID)
                    if (objFindHocLieu) {
                        return {
                            ...item,
                            TenHocLieu: objFindHocLieu.TenHocLieu || '',
                            isSelected: false,

                        }
                    } else {
                        return {
                            ...item,
                            TenHocLieu: '',
                            isSelected: false,
                        }
                    }
                })
            });
        },
        importQuestion(question) {
            let listQuestionSelect = this.DataQuestion.filter(q => q.isSelected)
            listQuestionSelect.forEach(q => {
                let source = this.parseQuestionData(q.LoaiNoiDung, JSON.parse(q.DataJson))
                this.GroupQuestion.push(source)
                this.$emit('importJson', source)
            })
            this.$emit('update:isOpen', false)

        },
        onPreviewQuestion(question) {
            openWindow({
                title: "Xem trước câu hỏi",
                url: `https://lms.lhbs.vn/hoc-lieu-view-v2?hoclieuid=${question.HocLieuID}&noidungid=${question.NoiDungID}`,
            })
        },
        parseQuestionData(type, data) {
            console.log('type', type)
            console.log(' data', data)
            if (type === 'QUIZ_TRUE_FALSE') {
                type = 'QUIZ_MULTIPLE_TRUE_FALSE'
            }
            const newQuestion = {
                id: `q_${Date.now()}`,
                type: type,
                label: this.getLabelQuestion(type)?.label,
                ordinalNumber: this.GroupQuestion.length + 1,
                points: 1.0,
                gradingType: 'auto',
                config: {
                    media: {
                        type: "YOUTUBE", //DEFAULT
                        sourceYT: {
                            id: "",
                            name: "",
                            source: ""
                        },
                        sourceRecord: {
                            id: "",
                            name: "",
                            source: ""
                        },
                        sourceFiles: {
                            file: [],
                            image: []
                        }
                    },
                    isAdvanced: data.isAdvanced || false,
                    questionText: data.prompt
                }
            };

            switch (type) {
                case 'QUIZ_SINGLE_CHOICE':
                    newQuestion.config.options = data.options;
                    newQuestion.config.correctAnswer = data.correctAnswer;
                    break;
                case 'QUIZ_MULTIPLE_CHOICE':
                    newQuestion.config.options = data.options;
                    newQuestion.config.correctAnswers = data.correctAnswers;
                    break;
                case 'QUIZ_MULTIPLE_TRUE_FALSE':
                    newQuestion.config.options = data.options
                    break;
                case 'QUIZ_FILL_IN_BLANK':
                    newQuestion.config.parts = data.parts.map(p => {
                        if (p.type === 'blank') {
                            return {
                                type: p.type,
                                id: 'blank_' + Date.now(),
                                acceptedAnswers: [p.correctAnswer]
                            }
                        }
                        else {
                            return p
                        }
                    })
                    break;
                case 'QUIZ_MATCHING':
                    newQuestion.config.columnA = data.columnA
                    newQuestion.config.columnB = data.columnB
                    newQuestion.config.correctPairs = data.correctPairs
                    break;
            }

            return newQuestion
        },
        getLabelQuestion(type) {
            let obj = this.defineQuestionType.find(i => i.type === type)
            return obj
        }

    }
}
</script>