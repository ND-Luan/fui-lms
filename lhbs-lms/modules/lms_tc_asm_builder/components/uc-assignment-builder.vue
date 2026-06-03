<template>
	<div class="assignment-builder">
        <!-- Mobile: Library Drawer (left) -->
        <v-navigation-drawer v-if="isMobile" v-model="isLibraryDrawerOpen" location="left" temporary width="300">
            <uc-assignment-component-library @add-component="addComponent" :in-drawer="true" @close="isLibraryDrawerOpen = false" style="height: 100%; overflow: auto" />
        </v-navigation-drawer>

        <!-- Mobile: Properties Drawer (right) -->
        <v-navigation-drawer v-if="isMobile" v-model="isPropertiesDrawerOpen" location="right" temporary width="320">
            <uc-assignment-properties v-if="selectedItem" :assignment="assignment" :groups="assignment.AssignmentConfig?.groups" :item="selectedItem" @update:groups="updateGroups" :in-drawer="true" @close="isPropertiesDrawerOpen = false" />
            <div v-else class="pa-6 text-center text-medium-emphasis">
                <v-icon size="48" class="mb-2">mdi-cursor-default-click-outline</v-icon>
                <p class="text-body-2 mt-2">Chọn câu hỏi để chỉnh sửa</p>
            </div>
        </v-navigation-drawer>

        <!-- Mobile: Top Bar -->
        <div v-if="isMobile" class="mobile-top-bar d-flex align-center pa-2 ga-2">
            <v-btn icon variant="text" size="small" @click="isLibraryDrawerOpen = true">
                <v-icon>mdi-menu</v-icon>
                <v-tooltip activator="parent" location="bottom">Thêm câu hỏi</v-tooltip>
            </v-btn>
            <span class="text-body-2 flex-grow-1 text-truncate font-weight-medium">{{ assignment.Title || 'Bài soạn' }}</span>
            <v-chip v-if="autoSaveStatus" size="x-small" :color="autoSaveStatus === 'saving' ? 'grey' : 'success'" variant="tonal">
                <v-icon v-if="autoSaveStatus === 'saving'" start size="12" class="mdi-spin">mdi-loading</v-icon>
                <v-icon v-else start size="12">mdi-check-circle-outline</v-icon>
                {{ autoSaveStatus === 'saving' ? 'Đang lưu...' : 'Đã lưu' }}
            </v-chip>
            <v-btn icon variant="text" size="small" :disabled="!selectedItem" @click="isPropertiesDrawerOpen = true">
                <v-icon>mdi-tune-variant</v-icon>
                <v-tooltip activator="parent" location="bottom">Thuộc tính</v-tooltip>
            </v-btn>
        </div>

        <!-- Desktop: 3-col layout -->
        <v-row v-if="!isMobile" class="ma-0" dense>
            <v-col cols="12" md="2">
                <div class="pa-3 py-2 d-flex align-center justify-space-between bg-grey-lighten-4">
                    <span class="text-caption font-weight-bold text-uppercase opacity-70">
                        {{ assignment.AssignmentType === 'INTEGRATED' ? 'Thư viện' : 'Thư viện câu hỏi' }}
                    </span>
                    <v-chip :color="assignment.AssignmentType === 'INTEGRATED' ? 'info' : 'primary'" variant="flat" size="x-small" class="font-weight-bold">
                        {{ assignment.AssignmentType === 'INTEGRATED' ? 'NGUỒN NGOÀI' : 'LMS' }}
                    </v-chip>
                </div>
                <v-divider />
                <div v-if="assignment.AssignmentType !== 'INTEGRATED'">
                    <uc-assignment-component-library @add-component="addComponent" :hide-title="true" style="height: calc(-285px + 100dvh); overflow: auto" />
                </div>
                <div v-else class="pa-4 text-center">
                    <v-icon size="64" color="info" class="mb-4 opacity-20">mdi-link-variant</v-icon>
                    <v-alert type="info" variant="tonal" density="compact" text="Chế độ tích hợp đang bật." class="text-caption mb-4" />
                </div>

                <v-divider />

                <div class="pa-2">
                    <p class="text-subtitle-2 px-1 pt-2 mb-0">
                        {{ $t('message.Setting') }}
                    </p>
                    <div class="px-0">
                        <v-checkbox v-model="setting.IsBlockCopy_Paste" label="Chặn copy paste" density="compact" hide-details />
                    </div>
                    <v-divider class="my-2" />
                    <div class="mt-1">
                        <div class="text-display text-center mb-2">
                            {{ $t('message.TotalScore') }}
                            <v-chip variant="text" class="ps-1 pe-0 font-weight-medium" color="primary" size="medium">
                                {{ totalScoreAsm }}
                            </v-chip>
                        </div>
                        <v-row dense>
                            <v-col cols="12" v-if="!assignment.ExternalLink">
                                <v-btn @click="onOpenPreview" variant="outlined" color="teal" block size="small"> <v-icon start class="me-1">mdi-file-eye-outline</v-icon>{{ $t('message.Preview') }} </v-btn>
                            </v-col>
                            <v-col cols="12">
                                <v-btn @click="onRemarkQuestion" variant="outlined" color="amber" block size="small" :disabled="assignment.AssignmentType === 'INTEGRATED'">
                                    <v-icon start class="me-1">mdi-update</v-icon>{{ $t('message.SortNumber') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="12">
                                <v-btn @click="isOpenDialogSource = true" variant="flat" color="primary" block size="small"> <v-icon start class="me-1">mdi-cog-outline</v-icon>Thiết lập nguồn </v-btn>
                            </v-col>
                        </v-row>
                    </div>
                </div>
                <v-divider vertical />
            </v-col>

            <v-col cols="12" md="7" style="height: calc(100dvh); overflow: auto" class="d-flex flex-column">
                <!-- Top Bar (Clean) -->
                <div class="pa-4 pb-0 d-flex align-center justify-space-between">
                    <div class="d-flex align-center ga-2">
                        <span class="text-subtitle-1 font-weight-bold">
                            {{ assignment.Title || 'Chưa đặt tiêu đề' }}
                        </span>
                    </div>

                    <div v-if="assignment.AssignmentType === 'INTEGRATED'" class="d-flex align-center ga-2">
                        <v-chip size="small" variant="outlined" color="success" v-if="assignment.IntegrationSource && assignment.IntegrationSource !== 'LMS'">
                            {{ getSourceName(assignment.IntegrationSource) }}
                        </v-chip>
                        <v-chip size="small" variant="outlined" color="primary" v-if="!assignment.ExternalLink"> {{ totalScoreAsm }} điểm </v-chip>
                        <v-chip size="small" variant="outlined" color="primary" v-else> Điểm tối đa: {{ assignment.MaxScore }} </v-chip>
                    </div>
                </div>

                <v-divider class="my-4" />

                <div>
                    <uc-assignment-canvas
                        class="flex-grow-1 overflow-auto"
                        v-if="!assignment.ExternalLink"
                        :groups="assignment?.AssignmentConfig?.groups"
                        :selected-item="selectedItem"
                        @update:groups="updateGroups"
                        @update:selected-item="selectedItem = $event"
                    />

                    <div v-else class="px-4 pb-4 h-100 d-flex flex-column">
                        <div v-if="!assignment.ExternalLink" class="pa-10 text-center text-medium-emphasis">
                            <v-icon size="64" color="primary" class="mb-4">mdi-link-variant</v-icon>
                            <h3 class="text-h6 mb-2">Bài tập tích hợp nguồn ngoài</h3>
                            <p>Vui lòng nhập link bài tập để xem trước nội dung tại đây.</p>
                        </div>
                        <div v-else class="flex-grow-1 d-flex flex-column">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <div class="d-flex align-center ga-2">
                                    <v-icon color="success">mdi-eye-outline</v-icon>
                                    <span class="text-subtitle-2 font-weight-bold">Xem trước (Iframe)</span>
                                </div>
                                <v-btn size="x-small" variant="text" color="primary" @click="$forceUpdate()"> <v-icon start>mdi-refresh</v-icon>Tải lại preview </v-btn>
                            </div>
                            <v-card flat border class="flex-grow-1" style="min-height: 500px">
                                <iframe :src="assignment.ExternalLink" width="100%" height="100%" frameborder="0"></iframe>
                            </v-card>
                        </div>
                    </div>
                </div>
                <v-divider vertical />
            </v-col>
            <v-col class="pa-0" cols="12" md="3">
                <div style="height: calc(100dvh - 45px); overflow: auto" class="position-relative">
                    <uc-assignment-properties v-if="selectedItem" :assignment="assignment" :groups="assignment.AssignmentConfig?.groups" :item="selectedItem" @update:groups="updateGroups" />
                </div>
                <v-divider />
                <v-row class="ma-0" dense v-if="assignment.AssignmentConfig?.groups?.length > 0 || assignment.AssignmentType === 'INTEGRATED'">
                    <!-- <v-col :cols="!vueData.AssignToClassID ? 4 : 6">
						<v-btn @click="onOpenPreview" text='Xem trước' color="teal" block />
					</v-col> -->
                    <v-col cols="12" v-if="autoSaveStatus" class="pb-0">
                        <v-chip size="x-small" :color="autoSaveStatus === 'saving' ? 'grey' : 'success'" variant="tonal" class="w-100 justify-center">
                            <v-icon v-if="autoSaveStatus === 'saving'" start size="12" class="mdi-spin">mdi-loading</v-icon>
                            <v-icon v-else start size="12">mdi-check-circle-outline</v-icon>
                            <span v-if="autoSaveStatus === 'saving'">Đang lưu tự động...</span>
                            <span v-else
                                >Đã lưu tự động<span v-if="lastSavedRelative"> — {{ lastSavedRelative }}</span></span
                            >
                        </v-chip>
                    </v-col>
                    <v-col :cols="!vueData.AssignToClassID ? 6 : 12">
                        <v-btn color="info" variant="outlined" block @click="handleSave(true)"> <v-icon start class="me-1">mdi-content-save-outline</v-icon>{{ $t('message.SaveAssignment') }} </v-btn>
                    </v-col>
                    <v-col cols="6" v-if="!vueData.AssignToClassID">
                        <v-btn class="w-100" variant="outlined" color="success" @click="openDialogAssignToStudent"> <v-icon start class="me-1">mdi-clipboard-arrow-right-outline</v-icon>{{ $t('message.Assigned') }} </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- Mobile: Canvas -->
        <div v-if="isMobile" style="height: calc(100dvh - 96px); overflow: auto; padding-bottom: 64px">
            <div class="pa-2 d-flex align-center justify-space-between">
                <v-chip :color="assignment.ExternalLink ? 'info' : 'primary'" variant="tonal" size="small">
                    {{ assignment.ExternalLink ? 'NGUỒN NGOÀI' : 'Hệ thống LMS' }}
                </v-chip>
                <v-btn size="small" variant="outlined" color="primary" @click="isOpenDialogSource = true"> <v-icon start>mdi-cog-outline</v-icon>Thiết lập nguồn </v-btn>
            </div>

            <div v-if="assignment.ExternalLink" class="pa-2 ga-2 d-flex flex-column">
                <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center ga-1">
                        <v-icon size="small" color="success">mdi-eye-outline</v-icon>
                        <span class="text-caption font-weight-bold">Xem trước (Iframe)</span>
                    </div>
                    <v-btn size="x-small" variant="text" color="primary" @click="$forceUpdate()"> <v-icon start>mdi-refresh</v-icon>Refresh </v-btn>
                </div>
                <v-card v-if="assignment.ExternalLink" flat border>
                    <iframe :src="assignment.ExternalLink" width="100%" height="100%" frameborder="0"></iframe>
                </v-card>
                <v-alert v-else type="info" variant="tonal" density="compact" text="Vui lòng thiết lập link bài tập để xem trước." />
            </div>
            <uc-assignment-canvas v-else :groups="assignment?.AssignmentConfig?.groups" :selected-item="selectedItem" @update:groups="updateGroups" @update:selected-item="selectedItem = $event" />
        </div>

        <!-- Mobile: Bottom Bar -->
        <div v-if="isMobile && (assignment.AssignmentConfig?.groups?.length > 0 || assignment.ExternalLink)" class="mobile-bottom-bar d-flex ga-2 pa-2">
            <v-btn variant="outlined" color="info" class="flex-grow-1" @click="handleSave(true)"> <v-icon start>mdi-content-save-outline</v-icon>{{ $t('message.SaveAssignment') }} </v-btn>
            <v-btn v-if="!vueData.AssignToClassID" variant="outlined" color="success" class="flex-grow-1" @click="openDialogAssignToStudent"> <v-icon start>mdi-clipboard-arrow-right-outline</v-icon>{{ $t('message.Assigned') }} </v-btn>
        </div>

        <uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
        <v-dialog v-model="isOpenDialogForAssignToStudent" max-width="800px">
            <v-card>
                <v-card-title class="bg-warning d-flex">
                    <span class="text-white">
                        {{ $t('message.AssignAssignment') }}
                    </span>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" icon="mdi-close" color="white" @click="isOpenDialogForAssignToStudent = false"></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row dense class="mb-3">
                        <v-col cols="12">
                            <p class="text-subtitle-2 mb-3">
                                {{ $t('message.Time') }}
                            </p>
                            <div class="d-flex ga-3">
                                <v-text-field :model-value="formattedDate(deadlines?.date)" :label="$t('message.ExpirationDate')" readonly variant="outlined" @click="openDate(id)" />
                                <v-text-field :model-value="formattedTime(deadlines?.time)" :label="$t('message.ExpirationTime')" readonly variant="outlined" @click="openTime(id)" />
                            </div>
                        </v-col>
                    </v-row>
                    <v-divider class="mb-1"></v-divider>
                    <div class="d-flex flex-column ga-1 my-1">
                        <span class="text-subtitle-2">Phân quyền cho giáo viên quản lí</span>
                        <v-select v-model="GiaoVienPermissionSelected" label="Chọn giáo viên" :items="DSGiaoVien_Permission" item-title="HoTenGV" item-value="GiaoVienID" multiple chips>
                            <template #chip="{ item }">
                                <v-chip color="blue">{{ item.title }}</v-chip>
                            </template>
                        </v-select>
                    </div>
                    <v-divider class="mb-1"></v-divider>
                    <div class="d-flex">
                        <span class="text-subtitle-2 d-flex align-center">
                            {{ $t('message.ChooseClassToAssign') }}
                        </span>
                        <v-spacer></v-spacer>
                        <div class="d-flex ga-2" @click="selectedAllClass()">
                            <v-checkbox color="success" :indeterminate="isIndeterminate" v-model="isAllSelected" :label="$t('message.SelectAll')"> </v-checkbox>
                        </div>
                    </div>
                    <div class="d-flex ga-5 flex-wrap">
                        <v-tooltip v-for="item in classOptions" :key="item.LopID" :text="classDisabledReason(item.LopID)" location="top" :disabled="!classDisabledReason(item.LopID)">
                            <template #activator="{ props: tipProps }">
                                <div v-bind="tipProps" class="d-flex ga-1 justify-center align-center" :class="{ 'opacity-40': !!classDisabledReason(item.LopID) }">
                                    <v-checkbox v-model="selectedClass" :value="item.LopID" color="success" :disabled="!!classDisabledReason(item.LopID)" hide-details />
                                    <p>{{ item.TenLop }}</p>
                                </div>
                            </template>
                        </v-tooltip>
                    </div>
                    <v-divider class="mb-2"></v-divider>
                    <div class="d-flex mb-2">
                        <p class="text-subtitle-2 d-flex align-center">
                            {{ $t('message.ChooseStudentToAssign') }}
                        </p>
                        <v-spacer></v-spacer>
                        <v-chip color="pink">{{ $t('message.Selected') }}: {{ DSHocSinhSelected.length }} {{ $t('message.Students') }}</v-chip>
                    </div>
                    <div class="d-flex">
                        <v-combobox v-model="DSHocSinhSelected" return-object :items="mappedItems" :label="$t('message.studentList')" density="compact" item-color="success" chips multiple variant="outlined">
                            <template #chip="{ item }">
                                <v-chip color="green">{{ item.title }}</v-chip>
                            </template>

                            <template #item="{ props, item }">
                                <v-list-item v-bind="props" :disabled="item.raw.disabled" @click.stop="item.raw.disabled && $event.stopPropagation()"> </v-list-item>
                            </template>
                        </v-combobox>
                    </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="primary" @click="onAssignToStudentAndSave" :loading="isLoadDSHocSinh">
                        {{ $t('message.AssignAssignment') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Dialog chọn ngày (dùng 1 cái cho tất cả lớp) -->
        <v-dialog v-model="dateDialogVisible" max-width="350">
            <v-card>
                <v-date-picker v-model="deadlines.date" @update:model-value="dateDialogVisible = false" />
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="dateDialogVisible = false">Hủy</v-btn>
                    <v-btn color="primary" @click="dateDialogVisible = false">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog chọn giờ (dùng 1 cái cho tất cả lớp) -->
        <v-dialog v-model="timeDialogVisible" max-width="350">
            <v-card>
                <v-time-picker v-model="deadlines.time" format="24hr" @update:model-value="timeDialogVisible = false" />
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="timeDialogVisible = false">Hủy</v-btn>
                    <v-btn color="primary" @click="timeDialogVisible = false">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <uc-dialog v-model="isOpenDialogSource" title="Thiết lập nguồn bài tập" width="550" doneText="Hoàn tất" @onSubmit="onConfirmSource">
            <div class="pa-0">
                <p class="text-body-2 mb-4">Bạn có thể nhúng bài tập từ các nguồn bên ngoài (như Azota, Etest, Quizizz, Google Forms...) bằng cách dán đường dẫn (Link) vào đây.</p>

                <div class="ga-4 d-flex flex-column">
                    <v-row dense>
                        <v-col cols="6">
                            <v-select
                                v-model="assignment.IntegrationSource"
                                :items="[
                                    { title: 'Azota', value: 'AZOTA' },
                                    { title: 'Etest (LHBS)', value: 'ETEST' },
                                    { title: 'Khác', value: 'OTHER' },
                                ]"
                                label="Nguồn tích hợp"
                                variant="outlined"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="assignment.MaxScore" label="Thang điểm tối đa" variant="outlined" density="compact" hide-details type="number" prepend-inner-icon="mdi-star-outline" />
                        </v-col>
                        <v-col cols="12" class="mt-2">
                            <v-text-field
                                v-model="assignment.ExternalLink"
                                label="Đường dẫn (Link) bài tập từ nguồn ngoài"
                                variant="outlined"
                                density="compact"
                                hide-details
                                placeholder="https://azota.vn/..."
                                clearable
                                prepend-inner-icon="mdi-link-variant"
                            />
                            <div class="text-caption text-medium-emphasis mt-1">Dán link từ Azota, Etest hoặc nguồn khác vào đây. Nếu có link, hệ thống sẽ chuyển sang chế độ "Nguồn ngoài".</div>
                        </v-col>
                    </v-row>
                </div>

                <v-divider class="my-4" />
                <div class="text-caption text-medium-emphasis">
                    <v-icon size="small" class="me-1">mdi-information-outline</v-icon>
                    Để soạn bài tập trực tiếp trên LMS, vui lòng để trống ô "Đường dẫn".
                    <!-- <div class="mt-1">Hoặc chuyển nguồn tích hợp về LMS.</div> -->
                </div>
            </div>
        </uc-dialog>
    </div>
</template>

<script>
	export default {
		name: 'uc-assignment-builder',
    inject: ['confirmRef'],
    props: {
        initialAssignment: undefined,
        isEditMode: Boolean,
        onSave: { type: Function, default: () => {} },
        onAutoSave: { type: Function, default: () => {} },
    },
    data() {
        const toggle = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
        this.$i18n.locale = toggle ? 'en' : 'vi'
        return {
            SelectedClasses: null,
            timeDialogVisible: false,
            dateDialogVisible: false,
            isOpenDialogForAssignToStudent: false,
            isOpenDialogSource: false,
            setting: {
                IsBlockCopy_Paste: false,
            },
            vueData,
            loadingPage: {
                isLoading: false,
                text: 'Đang tải dữ liệu...',
            },
            assignment: {
                Title: '',
                Instructions: '',
                // ExternalLink: '',
                AssignmentConfig: { groups: [] },
            },
            selectedItem: null,
            fileAudio: null,
            classOptions: [],
            isOpenSheetAssignToClass: false,
            deadlines: {
                date: null,
                time: null,
            },
            selectedClass: [],
            classAssigned: [],
            isLoadDSHocSinh: false,
            DSHocSinhByLopID: [],
            DSHocSinhSelected: [],
            DSGiaoVien_Permission: [],
            GiaoVienPermissionSelected: [],
            autoSaveStatus: null,
            lastSavedAt: null,
            relativeTimeNow: null,
            isLibraryDrawerOpen: false,
            isPropertiesDrawerOpen: false,
            isSaving: false,
            _skipNextAutoSave: false,
            autoSaveTimer: null,
            relativeTimeTimer: null,
        }
    },
    mounted() {
        console.log('vueData.NienKhoaItem', vueData.NienKhoaItem)
        ajaxCALL(
            '/lms/EL_Teacher_GetLop_GiaoBai',
            {
                AssignmentID: vueData.assignment.AssignmentID,
                MonHocID: vueData.assignment.MonHocID,
                ResourceType: 'ASSIGNMENT',
            },
            (res) => {
                this.classOptions = res.data
                console.log('this.classOptions', this.classOptions)
            },
        )
    },
    beforeUnmount() {
        clearTimeout(this.autoSaveTimer)
        clearInterval(this.relativeTimeTimer)
    },
    computed: {
        isMobile() {
            return this.$vuetify.display.smAndDown
        },
        lastSavedRelative() {
            if (!this.lastSavedAt) return ''
            const now = this.relativeTimeNow || Date.now()
            const diff = Math.floor((now - this.lastSavedAt) / 1000)
            if (diff < 10) return 'vừa lưu'
            if (diff < 60) return `${diff} giây trước`
            return `${Math.floor(diff / 60)} phút trước`
        },
        isIndeterminate: function () {
            return this.selectedClass.length != 0 && this.selectedClass.length !== this.classOptions.length
        },
        isAllSelected: function () {
            return this.selectedClass.length != 0 && this.selectedClass.length == this.classOptions.length
        },
        totalScoreAsm() {
            if (this.assignment.ExternalLink) {
                return this.formatNumber(this.assignment.MaxScore || 0, 2)
            }
            if (!this.assignment?.AssignmentConfig?.groups) return this.formatNumber(0)

            let total = 0

            this.assignment.AssignmentConfig.groups.forEach((group) => {
                group.questions.forEach((question) => {
                    total += Number(question?.points ?? 0)
                })
            })

            return this.formatNumber(total, 2)
        },
        mappedItems: function () {
            return this.DSHocSinhByLopID.filter((item) => !this.selectedClass.includes(item.LopID)).map((item) => {
                return { title: item.TenLop + ` - ` + item.Ho + ' ' + item.Ten, value: item.HocSinhID, ...item }
            })
        },
        DSHocSinhAssigned: function () {
            return this.DSHocSinhByLopID.filter((item) => item.disabled)
        },
    },
    methods: {
        onConfirmSource() {
            const maxScore = Number(this.assignment.MaxScore)
            if (!this.assignment.MaxScore || isNaN(maxScore) || maxScore <= 0) {
                Vue.$toast.warning('Vui lòng nhập thang điểm tối đa hợp lệ.', { position: 'top' })
                return
            }

            const link = (this.assignment.ExternalLink || '').trim()
            if (!link) {
                Vue.$toast.warning('Vui lòng nhập đường dẫn link bài tập.', { position: 'top' })
                return
            }

            if (this.assignment.IntegrationSource === 'AZOTA' && !link.includes('azota.vn')) {
                Vue.$toast.warning('Đường dẫn không hợp lệ. Vui lòng nhập link từ Azota (azota.vn).', { position: 'top' })
                return
            }
            if (this.assignment.IntegrationSource === 'ETEST' && !link.includes('etest.lhbs.vn')) {
                Vue.$toast.warning('Đường dẫn không hợp lệ. Vui lòng nhập link từ Etest (etest.lhbs.vn).', { position: 'top' })
                return
            }

            this.isOpenDialogSource = false
        },
        getSourceName(code) {
            const sources = {
                AZOTA: 'Azota',
                ETEST: 'Etest (LHBS)',
                OTHER: 'Khác',
                LMS: 'LMS',
            }
            return sources[code] || code
        },
        scheduleAutoSave() {
            if (!this.isEditMode) return
            // Skip auto-save triggered by initial data load
            if (this._skipNextAutoSave) {
                this._skipNextAutoSave = false
                return
            }
            clearTimeout(this.autoSaveTimer)
            this.autoSaveTimer = setTimeout(async () => {
                // Skip if a manual save is already in progress
                if (this.isSaving) return
                this.isSaving = true
                try {
                    const groups = this.assignment.AssignmentConfig?.groups || []
                    const link = this.assignment.ExternalLink?.trim() || ''

                    // Nếu có link, kiểm tra domain hợp lệ mới auto-save
                    if (link !== '') {
                        if (this.assignment.IntegrationSource === 'AZOTA' && !link.includes('azota.vn')) return
                        if (this.assignment.IntegrationSource === 'ETEST' && !link.includes('etest.lhbs.vn')) return
                    }

                    const isNotFullQuiz = this.assignment.ExternalLink ? false : vueData.isCheckAllGroupFullQuiz(groups)
                    const payload = {
                        assignment: this.assignment,
                        isPublishing: false,
                        Is_Full_Quiz: !isNotFullQuiz,
                        setting: this.setting,
                    }
                    this.autoSaveStatus = 'saving'
                    await this.onAutoSave(payload)
                    this.lastSavedAt = Date.now()
                    this.relativeTimeNow = Date.now()
                    this.autoSaveStatus = 'saved'
                    clearInterval(this.relativeTimeTimer)
                    this.relativeTimeTimer = setInterval(() => {
                        this.relativeTimeNow = Date.now()
                    }, 10000)
                } finally {
                    this.isSaving = false
                }
            }, 2000)
        },
        formatNumber(value, decimals = 2) {
            const num = Number(value)

            if (isNaN(num)) return (0).toFixed(decimals)

            return num.toFixed(decimals)
        },
        onRemarkQuestion() {
            let number = 0
            this.assignment?.AssignmentConfig?.groups.forEach((group) => {
                group.questions = group.questions.map((x) => {
                    number++ // tăng lần lượt 1, 2, 3, 4...
                    x.ordinalNumber = number
                    return x
                })
            })
        },
        async onOpenPreview() {
            const groups = this.assignment.AssignmentConfig.groups
            const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
            if (isNotChoose) {
                Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: 'top' })
                return
            }
            await this.handleSave(true)
            openWindow({
                title: 'Xem trước bài soạn',
                url: `/lms-tc-asm-preview?AssignmentID=${vueData.AssignmentID || 0}&AssignToClassID=${vueData.AssignToClassID || 0}`,
            })
        },
        selectedAllClass() {
            if (this.isAllSelected) {
                this.selectedClass = []
            } else {
                this.selectedClass = this.classOptions.map((i) => i.LopID)
            }
        },
        handleClickClass(item) {
            if (!this.selectedClass.includes(item.LopID)) {
                this.selectedClass.push(item.LopID)
            } else {
                let indexOfLopID = this.selectedClass.indexOf(item.LopID)
                this.selectedClass.splice(indexOfLopID, 1)
            }
        },
        openSheetAssignToClass() {
            const groups = this.assignment.AssignmentConfig.groups
            const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
            if (isNotChoose) {
                Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: 'top' })
                return
            }
            this.isOpenSheetAssignToClass = true
        },
        openDialogAssignToStudent() {
            const groups = this.assignment.AssignmentConfig.groups
            const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
            if (isNotChoose) {
                Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: 'top' })
                return
            }
            this.isOpenDialogForAssignToStudent = true
        },
        async onAssignToClassAndSave() {
            if (this.deadlines?.date == null || this.deadlines?.time == null) {
                Vue.$toast.error('Vui lòng nhập ngày giờ', { position: 'top' })
                return
            }
            if (this.selectedClass.length == 0) {
                Vue.$toast.error('Vui lòng chọn ít nhất 1 lớp để giao bài!', { position: 'top' })
                return
            }
            const d = { date: this.deadlines?.date, time: this.deadlines?.time }
            const due = this.getDue(d)
            // truyền true => isPushlish = true
            const groups = this.assignment.AssignmentConfig.groups
            const isNotFullQuiz = vueData.isCheckAllGroupFullQuiz(groups)
            await this.handleSave(true)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // thực sự delay 2s

            Vue.$toast.success('Lưu bài và giao bài thành công!', { position: 'top' })
            this.isOpenDialogForAssignToStudent = false
            // Quay về trang dashboard
            if (window !== window.top) {
                window.parent.postMessage({ type: 'iframeRef_closeWindow' }, '*')
            } else {
                window.open('/lms-teacher-dashboard', '_parent')
            }
        },
        async onAssignToStudentAndSave() {
            if (this.deadlines?.date == null || this.deadlines?.time == null) {
                Vue.$toast.error('Vui lòng nhập ngày giờ', { position: 'top' })
                return
            }
            if (this.DSHocSinhSelected.length == 0 && this.selectedClass.length == 0) {
                Vue.$toast.error('Vui lòng chọn ít nhất 1 lớp hoặc 1 học sinh để giao bài!', { position: 'top' })
                return
            }

            // Xác nhận trước khi giao
            const dlg = this._confirm()
            if (!dlg) return
            const ok = await dlg.show({
                title: 'Xác nhận giao bài',
                text: this._buildAssignSummary(),
            })
            if (!ok) return
            await this._doAssign()
            this.isOpenDialogForAssignToStudent = false
            if (window !== window.top) {
                window.parent.postMessage({ type: 'iframeRef_closeWindow' }, '*')
            } else {
                window.open('/lms-teacher-dashboard', '_parent')
            }
        },
        _confirm() {
            if (!this.confirmRef?.value?.show) {
                console.error('GlobalConfirmDialog chưa được đăng ký')
                return null
            }
            return this.confirmRef.value
        },
        addComponent(componentInfo) {
            const newGroups = [...JSON.parse(JSON.stringify(this.assignment.AssignmentConfig.groups))]
            let ordinalNumber = 1
            let previousQuestion = 1
            for (let i = 0; i < newGroups.length; i++) {
                if (newGroups[i].questions.length > 0) {
                    ordinalNumber += newGroups[i].questions.length
                    previousQuestion = ordinalNumber
                } else {
                    ordinalNumber = previousQuestion
                }
            }

            const newQuestion = vueData.buildNewQuestion(componentInfo, ordinalNumber)

            if (newGroups.length > 0) {
                newGroups[newGroups.length - 1].questions.push(newQuestion)
            } else {
                newGroups.push({
                    id: `group_${crypto.randomUUID()}`,
                    title: 'Phần 1',
                    description: '',
                    media: {
                        type: 'YOUTUBE',
                        sourceYT: {
                            id: '',
                            source: '',
                            name: '',
                        },
                        sourceRecord: {
                            id: '',
                            source: '',
                            name: '',
                        },
                        sourceFiles: {
                            file: [],
                            image: [],
                        },
                    },
                    questions: [newQuestion],
                })
            }
            this.updateGroups(newGroups)
            this.selectedItem = { type: 'question', groupIndex: newGroups.length - 1, qIndex: newGroups[newGroups.length - 1].questions.length - 1 }
            if (this.isMobile) {
                this.isLibraryDrawerOpen = false
            }
        },
        updateGroups(newGroups) {
            this.assignment.AssignmentConfig.groups = newGroups.map((item) => {
                if (!item.media) {
                    let media = {
                        type: 'YOUTUBE',
                        sourceYT: {
                            id: '',
                            source: '',
                            name: '',
                        },
                        sourceRecord: {
                            id: '',
                            source: '',
                            name: '',
                        },
                        sourceFiles: {
                            file: [],
                            image: [],
                        },
                    }
                    return { ...item, media }
                } else {
                    return item
                }
            })
        },
        async handleSave(isPublishing) {
            console.log('luu......')
            const groups = this.assignment.AssignmentConfig.groups
            if (!this.assignment.ExternalLink) {
                const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
                if (isNotChoose) {
                    Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: 'top' })
                    return
                }
            } else {
                const link = this.assignment.ExternalLink.trim()
                const maxScore = Number(this.assignment.MaxScore)
                
                if (link === '') {
                    Vue.$toast.warning('Vui lòng nhập link bài tập.', { position: 'top' })
                    return
                }

                if (!this.assignment.MaxScore || isNaN(maxScore) || maxScore <= 0) {
                    Vue.$toast.warning('Vui lòng nhập thang điểm tối đa hợp lệ.', { position: 'top' })
                    return
                }

                // Kiểm tra domain theo nguồn tích hợp
                if (this.assignment.IntegrationSource === 'AZOTA' && !link.includes('azota.vn')) {
                    Vue.$toast.warning('Đường dẫn không hợp lệ. Vui lòng nhập link từ Azota (azota.vn).', { position: 'top' })
                    return
                }
                if (this.assignment.IntegrationSource === 'ETEST' && !link.includes('etest.lhbs.vn')) {
                    Vue.$toast.warning('Đường dẫn không hợp lệ. Vui lòng nhập link từ Etest (etest.lhbs.vn).', { position: 'top' })
                    return
                }
            }
            const isNotFullQuiz = this.assignment.ExternalLink ? false : vueData.isCheckAllGroupFullQuiz(groups)
            const payload = {
                assignment: this.assignment,
                isPublishing: isPublishing,
                Is_Full_Quiz: !isNotFullQuiz,
                setting: this.setting,
            }
            console.log('payload', payload)
            // Cancel any pending auto-save and guard against concurrent saves
            clearTimeout(this.autoSaveTimer)
            if (this.isSaving) return
            this.isSaving = true
            try {
                this.autoSaveStatus = 'saving'
                await this.onSave(payload)
                this.lastSavedAt = Date.now()
                this.relativeTimeNow = Date.now()
                this.autoSaveStatus = 'saved'
                clearInterval(this.relativeTimeTimer)
                this.relativeTimeTimer = setInterval(() => {
                    this.relativeTimeNow = Date.now()
                }, 10000)
            } finally {
                this.isSaving = false
            }
        },
        // ==== Helpers hiển thị ====
        formattedDate(dateStr) {
            return dateStr ? dayjs(dateStr).format('DD/MM/YYYY') : ''
        },
        formattedTime(timeStr) {
            return timeStr ? dayjs(timeStr, 'HH:mm').format('HH:mm') : ''
        },
        formatDate(dateStr) {
            if (!dateStr) return '—'
            const d = dayjs(dateStr)
            return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(dateStr)
        },
        getDue(d) {
            if (!d.date || !d.time) return null

            const dateObj = dayjs(d.date) // parse ISO date
            const [hour, minute] = d.time.split(':').map(Number)

            return dateObj.hour(hour).minute(minute).second(0).format('YYYY-MM-DD HH:mm:ss')
        },

        openDate() {
            if (!this.deadlines) this.deadlines = { date: null, time: null }
            this.dateDialogVisible = true
        },

        openTime() {
            if (!this.deadlines) this.deadlines = { date: null, time: null }
            this.timeDialogVisible = true
        },
        loadDSHocSinhByDSLopID(DSLopID) {
            return new Promise((resolve, reject) => {
                ajaxCALL('/lms/HocSinhLop_GetByLopIDList', { DSLopID, AssignmentID: vueData.AssignmentID }, (res) => {
                    if (res && res.data) {
                        resolve(
                            res.data.map((item) => {
                                return {
                                    ...item,
                                    isSelected: false,
                                    disabled: item.Is_Assigned == 1 ? true : false,
                                }
                            }),
                        )
                    } else {
                        resolve([])
                    }
                })
            })
        },
        async _doAssign() {
            this.isLoadDSHocSinh = true
            const d = { date: this.deadlines?.date, time: this.deadlines?.time }
            const due = this.getDue(d)
            const groups = this.assignment.AssignmentConfig.groups
            const isNotFullQuiz = vueData.isCheckAllGroupFullQuiz(groups)
            await this.handleSave(true)
            await new Promise((resolve) => setTimeout(resolve, 500))
            if (this.DSHocSinhSelected.length > 0) {
                for (const item of this.DSHocSinhSelected) {
                    const payload = [
                        {
                            LopID: item.LopID,
                            HocSinhID: item.HocSinhID,
                            DueDate: due,
                            MaxScore: this.totalScoreAsm,
                            Status: 1,
                            ResourceType: 'ASSIGNMENT',
                            ResourceID: vueData.AssignmentID,
                            LimitAssigned: 1,
                            Is_Full_Quiz: !isNotFullQuiz ? 1 : 0,
                        },
                    ]
                    ajaxCALL('/lms/EL_Teacher_AssignToStudent', { AssignmentID: vueData.AssignmentID, JsonStudentItems: payload })
                }
            }
            if (this.selectedClass.length > 0) {
                for (const id of this.selectedClass) {
                    const payload = [
                        {
                            LopID: id,
                            DueDate: due,
                            MaxScore: this.totalScoreAsm,
                            Status: 1,
                            ResourceType: 'ASSIGNMENT',
                            ResourceID: vueData.AssignmentID,
                            LimitAssigned: 1,
                            Is_Full_Quiz: !isNotFullQuiz ? 1 : 0,
                        },
                    ]
                    ajaxCALL('/lms/EL_Teacher_AssignToClasses_CLASS', {
                        AssignmentID: vueData.AssignmentID,
                        JsonClassItems: payload,
                        ListTeacherPermission: this.GiaoVienPermissionSelected.length > 0 ? this.GiaoVienPermissionSelected.join(',') : '',
                    })
                }
            }
            Vue.$toast.success('Lưu bài và giao bài thành công!', { position: 'top' })
            this.isLoadDSHocSinh = false
        },
        _buildAssignSummary() {
            const lines = []
            if (this.selectedClass.length > 0) {
                const lopThong = []
                const lopNhom = []
                this.selectedClass.forEach((id) => {
                    const lop = this.classOptions.find((c) => c.LopID == id)
                    const tenLop = lop?.TenLop || id
                    const isNhom = this.DSHocSinhByLopID.some((hs) => hs.LopID == id && hs.IsNhom)
                    isNhom ? lopNhom.push(tenLop) : lopThong.push(tenLop)
                })
                if (lopThong.length) lines.push(`• ${lopThong.length} lớp: ${lopThong.join(', ')}`)
                if (lopNhom.length) lines.push(`• ${lopNhom.length} nhóm: ${lopNhom.join(', ')}`)
            }
            if (this.DSHocSinhSelected.length > 0) {
                lines.push(`• ${this.DSHocSinhSelected.length} học sinh riêng lẻ`)
            }
            return lines.join('\n')
        },
        classDisabledReason(LopID) {
            if (this.DSHocSinhAssigned.some((hs) => hs.LopID == LopID)) return 'Lớp này đã được giao bài trước đó'
            if (this.DSHocSinhSelected.some((hs) => hs.LopID == LopID)) return 'Đã chọn học sinh riêng lẻ trong lớp này'
            return ''
        },
        loadDSHocSinhAssignedByLopID(LopID) {
            return new Promise((resolve, reject) => {
                ajaxCALL('/lms/Teacher_GetDSHocSinh_AssignToStudent_ByLopID', { LopID, AssignmentID: vueData.AssignmentID }, (res) => {
                    if (res && res.data) {
                        resolve(res.data)
                    } else {
                        resolve([])
                    }
                })
            })
        },
        async loadDSGiaoVien_Permission() {
            let data = await new Promise((resolve, reject) => {
                ajaxCALL(
                    '/lms/EL_Teacher_GetTeacherByMonHocID',
                    {
                        MonHocID: vueData.assignment.MonHocID,
                        AssignmentID: vueData.AssignmentID,
                        HocKi: vueData.HocKi,
                    },
                    (res) => {
                        if (res && res.data) {
                            resolve(res.data)
                        } else {
                            resolve([])
                        }
                    },
                )
            })
            this.DSGiaoVien_Permission = data
        },
    },
    watch: {
        'assignment.ExternalLink'(v) {
            if (v && v.trim() !== '') {
                this.assignment.AssignmentType = 'INTEGRATED'
            } else {
                this.assignment.AssignmentType = 'LMS'
            }
        },
        initialAssignment: {
            handler(newVal) {
                if (newVal) {
                    // Prevent the deep assignment watcher from triggering auto-save on initial load
                    this._skipNextAutoSave = true
                    this.assignment = JSON.parse(JSON.stringify(newVal))
                }
            },
            immediate: true,
        },

        selectedItem: function (item) {
            this.fileAudio = null
            if (item && this.isMobile) {
                this.isPropertiesDrawerOpen = true
            }
        },
        assignment: {
            handler(newVal) {
                if (newVal && this.isEditMode) {
                    vueData.AssignmentDataLog = _.cloneDeep(newVal)
                }
                this.scheduleAutoSave()
            },
            deep: true,
        },
        selectedClass: {
            handler(newVal) {
                if (this.selectedClass.length > 0) {
                    this.DSHocSinhSelected = this.DSHocSinhSelected.filter((item) => !this.selectedClass.includes(item.LopID))
                }
            },
            deep: true,
        },
        isOpenDialogForAssignToStudent: {
            async handler(newVal) {
                if (newVal) {
                    this.GiaoVienPermissionSelected = []
                    let DSLop = JSON.stringify(this.classOptions.map((item) => item.LopID))
                    this.DSHocSinhByLopID = await this.loadDSHocSinhByDSLopID(DSLop)
                    console.log('this.DSHocSinhByLopID', this.DSHocSinhByLopID)
                    this.loadDSGiaoVien_Permission()
                } else {
                    this.deadlines = {
                        date: null,
                        time: null,
                    }
                }
            },
            deep: true,
        },
    },
	}
</script>