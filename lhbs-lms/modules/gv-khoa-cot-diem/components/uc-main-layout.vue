<template>
	<Global>
        <template #header>
            <v-card>
                <v-card-title class="d-flex align-center">
                    {{ TitlePage }} • {{ TitleCap }}
                    <v-spacer />
                    <v-btn variant="outlined" color="primary" prepend-icon="mdi-reload" @click="onRefresh">
                        Làm mới
                    </v-btn>
                </v-card-title>
            </v-card>
        </template>

        <v-divider />

        <div class="khoa-cot-diem-layout">
            <aside class="khoa-cot-diem-tree-panel">
                <div class="pa-3">
                    <div class="text-subtitle-1 font-weight-bold">Danh sách khối, lớp, môn</div>
                    <div class="text-caption text-medium-emphasis">Chọn môn để xem các cột điểm</div>
                    <v-text-field v-model="treeSearch" label="Tìm khối, lớp hoặc môn"
                        prepend-inner-icon="mdi-magnify" clearable density="compact" hide-details class="mt-3" />
                </div>
                <v-divider />
                <v-treeview v-if="treeNodes.length" v-model:opened="openedTreeNodeIDs"
                    v-model:activated="activatedTreeNodeIDs" :items="filteredTreeNodes" item-title="title"
                    item-value="id" item-children="children"
                    activatable density="compact" color="primary" class="pa-2"
                    @update:opened="onTreeOpened" @update:activated="onTreeActivated">
                    <template #append="{ item }">
                        <v-btn v-if="['khoi', 'lop'].includes((item.raw || item).type)"
                            size="small" variant="text" color="primary" prepend-icon="mdi-refresh"
                            @click.stop="onLoadWholeScope(item.raw || item)">
                            {{ (item.raw || item).type === 'khoi' ? 'Tải khối' : 'Tải lớp' }}
                        </v-btn>
                    </template>
                </v-treeview>
                <div v-else class="pa-4 text-caption text-medium-emphasis">
                    Đang tải danh sách khối, lớp, môn...
                </div>
            </aside>

            <main class="khoa-cot-diem-table-panel">
                <div class="pa-3 d-flex align-center flex-wrap ga-3">
                    <div>
                        <div class="text-subtitle-1 font-weight-bold">
                            {{ isSummaryView ? summaryTitle : (selectedSubjectTitle || 'Danh sách cột điểm') }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                            {{ isSummaryView ? 'Danh sách tổng hợp lớp, môn và cột điểm' : (selectedSubjectContext || 'Vui lòng chọn môn học trên cây') }}
                        </div>
                    </div>
                    <v-spacer />
                    <v-select v-if="!isSummaryView" v-model="MaNhomCotDiemItem" label="Nhóm cột điểm" :items="DSMaNhomCotDiem"
                        item-title="TenNhomCotDiemDisplay" item-value="MaNhomCotDiem" :disabled="!MonHocItem"
                        return-object density="compact" hide-details style="max-width: 230px" />
                </div>
                <v-divider />

                <v-card-text class="py-2 d-flex align-center ga-2 flex-wrap">
            <v-chip v-if="!isSummaryView && selectedStatusFilter !== null" size="small" color="info" variant="tonal">
                Đang lọc: {{ selectedStatusFilter ? 'Đã khóa' : 'Chưa khóa' }}
            </v-chip>

            <v-chip v-if="!isSummaryView && hasMixedSelectedStatus" size="small" color="warning" variant="tonal">
                Đang chọn lẫn Đã khóa/Chưa khóa
            </v-chip>

            <v-btn v-if="!isSummaryView && canShowLockButton" size="small" color="success" variant="outlined"
                :disabled="selectedUnlockedCount === 0 || hasMixedSelectedStatus"
                @click="onLockSelected">
                <v-icon start>mdi-lock</v-icon>
                Khóa đã chọn ({{ selectedUnlockedCount }})
            </v-btn>

            <v-btn v-if="!isSummaryView && canShowUnlockButton" size="small" color="warning" variant="outlined"
                :disabled="selectedLockedCount === 0 || hasMixedSelectedStatus"
                @click="onOpenUnlockSelected">
                <v-icon start>mdi-lock-open</v-icon>
                Mở khóa đã chọn ({{ selectedLockedCount }})
            </v-btn>

            <v-btn v-if="!isSummaryView && selectedStatusFilter !== null" size="small" color="primary" variant="text"
                @click="clearSelectionFilter">
                Hiện tất cả
            </v-btn>
                </v-card-text>

                <v-divider />

                <v-data-table v-if="isSummaryView" :headers="summaryHeaders" :items="summaryRows"
                    items-per-page="-1" hide-default-footer hover>
                    <template #item.TenTinhTrang="{ item }">
                        <v-chip size="x-small" :color="item.MauTinhTrang" variant="tonal">{{ item.TenTinhTrang }}</v-chip>
                    </template>
                </v-data-table>

                <v-data-table v-else v-model="DSSelected" :headers="headers" :items="DSView" :row-props="getRowProps"
            item-selectable="IsSelectable" item-value="RowKey" :show-select="true"
            items-per-page="-1" hide-default-footer hover style="max-height: calc(100dvh - 77px); overflow-y: auto;">
            <template #item.actions="{ item }">
                <v-btn size="small" :color="item.IsLocked ? 'warning' : 'success'" variant="outlined"
                    @click="onClickToggle(item)">
                    <v-icon start>{{ item.IsLocked ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
                    {{ item.IsLocked ? 'Mở khóa' : 'Khóa' }}
                </v-btn>
            </template>

            <template #item.TenTinhTrang="{ item }">
                <v-chip size="x-small" :color="item.MauTinhTrang || 'default'" variant="tonal">
                    {{ item.TenTinhTrang || 'Chưa cập nhật' }}
                </v-chip>
            </template>

            <template #no-data>

                <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
                    <p class="text-body-2">Chọn môn học để xem danh sách cột điểm</p>
                </div>
            </template>
                </v-data-table>
            </main>
        </div>

        <v-dialog v-model="summaryLoading.show" persistent max-width="430">
            <v-card class="pa-5">
                <div class="text-subtitle-1 font-weight-bold mb-2">Đang tải dữ liệu cột điểm</div>
                <div class="text-body-2 text-medium-emphasis mb-3">{{ summaryLoading.label }}</div>
                <v-progress-linear :model-value="summaryLoading.percent" color="primary" rounded height="8" />
                <div class="text-caption text-center mt-2">
                    Đã tải {{ summaryLoading.current }} / {{ summaryLoading.total }} môn
                </div>
            </v-card>
        </v-dialog>

        <uc-dialog v-model="dialogKhoa.show" title="Xác nhận mở khóa" done-text="Xác nhận"
            @onSubmit="onConfirmMoKhoa">
            <v-textarea v-model="dialogKhoa.LyDo" label="Lý do mở khóa" rows="3" auto-grow
                placeholder="Nhập lý do mở khóa cột điểm..." />
        </uc-dialog>

        <uc-dialog v-model="dialogMoKhoaSelected.show" title="Mở khóa cột điểm đã chọn" done-text="Xác nhận"
            @onSubmit="onConfirmMoKhoaSelected">
            <v-textarea v-model="dialogMoKhoaSelected.LyDo" label="Lý do mở khóa" rows="3" auto-grow
                placeholder="Nhập lý do mở khóa các cột điểm đã chọn..." />
        </uc-dialog>
    </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
    data() {
        return {
            vueData,
            CapID: vueData.CapID,
            treeNodes: [],
            openedTreeNodeIDs: [],
            activatedTreeNodeIDs: [],
            treeSubjectMap: {},
            treeSearch: '',
            DSLop: [],
            LopItem: null,
            DSMonHoc: [],
            MonHocItem: null,
            DSMaNhomCotDiem: [],
            MaNhomCotDiemItem: null,
            DS: [],
            summaryRows: [],
            viewMode: 'empty',
            summaryTitleText: '',
            summaryLoading: { show: false, current: 0, total: 0, percent: 0, label: '' },
            DSSelected: [],
            dialogKhoa: { show: false, item: null, LyDo: '' },
            dialogMoKhoaSelected: { show: false, LyDo: '' },
            headers: [
                { title: 'STT', key: 'STT', width: 60 },
                { title: 'Mã cột điểm', key: 'MaCotDiemDisplay', minWidth: 160 },
                { title: 'Tên cột điểm', key: 'TenCotDiem_VI', minWidth: 220 },
                { title: 'Tình trạng', key: 'TenTinhTrang', minWidth: 120, sortable: false },
                { title: 'Thao tác', key: 'actions', width: 130, sortable: false },
            ],
            summaryHeaders: [
                { title: 'Lớp', key: 'TenLop', minWidth: 120 },
                { title: 'Môn học', key: 'TenMonHoc', minWidth: 180 },
                { title: 'Nhóm cột điểm', key: 'TenNhomCotDiem', minWidth: 150 },
                { title: 'Mã cột điểm', key: 'MaCotDiemDisplay', minWidth: 150 },
                { title: 'Tên cột điểm', key: 'TenCotDiem_VI', minWidth: 200 },
                { title: 'Tình trạng', key: 'TenTinhTrang', minWidth: 120, sortable: false },
            ],
        }
    },
    computed: {
        TitleCap() { return renderText(parseInt(this.CapID)) },
        TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
        HocKi() { return vueData.NienKhoaItem?.HocKi },
        HocKiCode() { return this.HocKi === 1 ? 'HK1' : 'HK2' },
        isSummaryView() { return this.viewMode === 'summary' },
        summaryTitle() { return this.summaryTitleText },
        selectedSubjectTitle() {
            return this.MonHocItem?.TenMonHoc || this.MonHocItem?.TenMonHoc_HienThi || ''
        },
        selectedSubjectContext() {
            if (!this.LopItem || !this.MonHocItem) return ''
            return `${this.LopItem.TenLop || ''} • ${this.LopItem.TenKhoiHoc || ''}`
        },
        filteredTreeNodes() {
            const keyword = this.treeSearch?.trim().toLocaleLowerCase()
            if (!keyword) return this.treeNodes
            const filterNodes = nodes => (nodes || []).reduce((result, node) => {
                const children = filterNodes(node.children)
                const matched = node.title?.toLocaleLowerCase().includes(keyword)
                if (matched || children.length) result.push({ ...node, children })
                return result
            }, [])
            return filterNodes(this.treeNodes)
        },
        selectedRows() {
            if (!this.DSSelected?.length) return []
            const selectedKeys = new Set(
                this.DSSelected
                    .map(x => (typeof x === 'string' ? x : x?.RowKey))
                    .filter(Boolean)
            )
            return this.DS.filter(x => selectedKeys.has(x.RowKey))
        },
        selectedStatusFilter() {
            if (!this.selectedRows.length) return null
            const firstStatus = !!this.selectedRows[0].IsLocked
            const sameStatus = this.selectedRows.every(x => !!x.IsLocked === firstStatus)
            return sameStatus ? firstStatus : null
        },
        DSView() {
            if (this.selectedStatusFilter === null) {
                return this.DS.map(x => ({ ...x, IsSelectable: true }))
            }
            return this.DS.map(x => ({
                ...x,
                IsSelectable: !!x.IsLocked === this.selectedStatusFilter,
            }))
        },
        selectedLockedCount() {
            return this.selectedRows.filter(x => !!x.IsLocked).length
        },
        selectedUnlockedCount() {
            return this.selectedRows.filter(x => !x.IsLocked).length
        },
        hasMixedSelectedStatus() {
            if (this.selectedRows.length <= 1) return false
            return this.selectedLockedCount > 0 && this.selectedUnlockedCount > 0
        },
        canShowLockButton() {
            if (this.hasMixedSelectedStatus) return false
            return this.selectedStatusFilter !== true
        },
        canShowUnlockButton() {
            if (this.hasMixedSelectedStatus) return false
            return this.selectedStatusFilter !== false
        },
    },
    watch: {
        MaNhomCotDiemItem(v) {
            this.DS = []
            this.summaryRows = []
            this.viewMode = 'empty'
            if (v) this.getDS()
        },
        HocKi() {
            this.MaNhomCotDiemItem = null
            this.DSMaNhomCotDiem = []
            this.DS = []
            this.MonHocItem = null
            this.LopItem = null
            this.activatedTreeNodeIDs = []
            this.getAllLop()
        },
        DS() {
            this.DSSelected = []
        },
    },
    mounted() {
        this.getAllLop()
    },
    methods: {
        normalizeMaCotDiem(maCotDiem) {
            if (typeof maCotDiem !== 'string') return maCotDiem
            const splitIndex = maCotDiem.indexOf('_')
            if (splitIndex <= 0) return maCotDiem
            const prefix = maCotDiem.slice(0, splitIndex)
            return /^\d+$/.test(prefix) ? maCotDiem.slice(splitIndex + 1) : maCotDiem
        },
        hasNumericPrefix(maCotDiem) {
            if (typeof maCotDiem !== 'string') return false
            const splitIndex = maCotDiem.indexOf('_')
            if (splitIndex <= 0) return false
            const prefix = maCotDiem.slice(0, splitIndex)
            return /^\d+$/.test(prefix)
        },
        getKhoaKey(monHocLopID, maCotDiem) {
            const monHocLopIDNum = Number(monHocLopID || 0)
            return `${monHocLopIDNum}__${this.normalizeMaCotDiem(maCotDiem || '')}`
        },
        pickKhoaInfo(current, next) {
            if (!current) return next
            if (Number(next.KhoaCotDiemID || 0) > Number(current.KhoaCotDiemID || 0)) {
                return next
            }
            return current
        },
        async getAllLop() {
            const resKhoi = await fetchPromise('lms/KhoiHocByCapHoc_Get', { CapID: this.CapID })
            const dsKhoi = resKhoi.data ?? resKhoi ?? []
            if (!dsKhoi.length) return
            this.treeNodes = dsKhoi.map(khoi => ({
                id: `khoi-${khoi.KhoiID}`,
                title: khoi.TenKhoiHoc,
                type: 'khoi',
                KhoiID: khoi.KhoiID,
                loaded: false,
                children: [{ id: `loading-khoi-${khoi.KhoiID}`, title: 'Mở để tải danh sách lớp', type: 'loading' }],
            }))
        },
        findTreeNode(nodes, id) {
            for (const node of nodes || []) {
                if (node.id === id) return node
                const found = this.findTreeNode(node.children, id)
                if (found) return found
            }
            return null
        },
        async onTreeOpened(ids) {
            const openedID = ids?.[ids.length - 1]
            const node = this.findTreeNode(this.treeNodes, openedID)
            if (!node || node.loaded) return
            if (node.type === 'khoi') await this.loadTreeClasses(node)
            if (node.type === 'lop') await this.loadTreeSubjects(node)
        },
        async loadSummaryForNode(node) {
            let subjectNodes = []
            if (node.type === 'khoi') {
                if (!node.loaded) await this.loadTreeClasses(node)
                this.LopItem = { TenKhoiHoc: node.title, KhoiID: node.KhoiID }
                this.summaryRows = []
                for (const lopNode of node.children || []) {
                    if (!lopNode.loaded) await this.loadTreeSubjects(lopNode)
                    this.LopItem = lopNode.Lop
                    subjectNodes.push(...(lopNode.children || []))
                }
            } else if (node.type === 'lop') {
                if (!node.loaded) await this.loadTreeSubjects(node)
                this.LopItem = node.Lop
                subjectNodes = node.children || []
            } else {
                return
            }

            this.summaryLoading = {
                show: true,
                current: 0,
                total: subjectNodes.length,
                percent: 0,
                label: 'Đang chuẩn bị dữ liệu lớp và môn học...',
            }
            try {
                for (const subjectNode of subjectNodes) {
                    this.summaryLoading.label = `Đang tải ${subjectNode.title}...`
                    await this.loadSummarySubject(subjectNode)
                    this.summaryLoading.current += 1
                    this.summaryLoading.percent = this.summaryLoading.total
                        ? Math.round(this.summaryLoading.current * 100 / this.summaryLoading.total)
                        : 100
                }
            } finally {
                this.summaryLoading.show = false
            }
        },
        async onLoadWholeScope(node) {
            const scopeNode = this.findTreeNode(this.treeNodes, node?.id)
            if (!scopeNode || !['khoi', 'lop'].includes(scopeNode.type)) return
            this.viewMode = 'summary'
            this.summaryTitleText = scopeNode.type === 'khoi'
                ? `Tổng hợp ${scopeNode.title}`
                : `Tổng hợp ${scopeNode.title}`
            this.summaryRows = []
            await this.loadSummaryForNode(scopeNode)
        },
        async loadSummarySubject(subjectNode) {
            const lop = subjectNode.Lop
            const mon = subjectNode.MonHoc
            const groupRes = await fetchPromise('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID', {
                TemplateBangDiemID: mon.TemplateBangDiemID,
            })
            const groups = (groupRes.data ?? groupRes ?? []).filter(x => x.Semester === this.HocKiCode)
            for (const group of groups) {
                const [scoreRes, lockRes] = await Promise.all([
                    fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom', {
                        LopID: lop.LopID,
                        MonHocID: mon.MonHocID,
                        TemplateBangDiemID: mon.TemplateBangDiemID,
                        MaNhomCotDiem: group.MaNhomCotDiem,
                        ThuTuNhom: group.ThuTuNhom,
                        Semester: group.Semester,
                        NienKhoa: vueData.NienKhoa,
                        KhoiID: lop.KhoiID,
                    }, { cache: false }),
                    fetchPromise('lms/KhoaCotDiem_Get', {
                        LopID: lop.LopID,
                        MonHocLopID: mon.MonHocLopID,
                        MaNhomCotDiem: group.MaNhomCotDiem,
                        Semester: group.Semester,
                        NienKhoa: vueData.NienKhoa,
                    }, { cache: false }),
                ])
                const scores = scoreRes.data ?? scoreRes ?? []
                const locks = lockRes.data ?? lockRes ?? []
                const firstStudentID = scores[0]?.HocSinhID
                const columns = firstStudentID ? scores.filter(x => x.HocSinhID === firstStudentID) : []
                const lockMap = locks.reduce((map, item) => {
                    const key = this.getKhoaKey(item.MonHocLopID, item.MaCotDiem)
                    const current = map[key]
                    if (!current || Number(item.KhoaCotDiemID || 0) >= Number(current.KhoaCotDiemID || 0)) {
                        map[key] = item
                    }
                    return map
                }, {})
                columns.forEach(column => {
                    const maCotDiem = column.MaCotDiem || ''
                    const lock = lockMap[this.getKhoaKey(column.MonHocLopID || mon.MonHocLopID, maCotDiem)] || {}
                    const isLocked = !!lock.TinhTrang
                    this.summaryRows.push({
                        RowKey: `summary-${lop.LopID}-${mon.MonHocID}-${group.MaNhomCotDiem}-${maCotDiem}`,
                        TenLop: lop.TenLop,
                        TenMonHoc: mon.TenMonHoc,
                        TenNhomCotDiem: group.TenNhomCotDiem_VI || group.MaNhomCotDiem,
                        MaCotDiemDisplay: maCotDiem,
                        TenCotDiem_VI: column.TenCotDiem_VI || maCotDiem,
                        TenTinhTrang: isLocked ? 'Đã khóa' : 'Chưa khóa',
                        MauTinhTrang: isLocked ? 'success' : 'warning',
                    })
                })
            }
        },
        async loadTreeClasses(node) {
            node.loading = true
            const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
                NienKhoa: vueData.NienKhoa,
                KhoiID: node.KhoiID,
            })
            const dsLop = res.data ?? res ?? []
            const khoi = { KhoiID: node.KhoiID, TenKhoiHoc: node.title }
            dsLop.forEach(lop => {
                const item = {
                    ...lop,
                    TenLopDisplay: `${lop.TenLop} (${node.title})`,
                    TenKhoiHoc: node.title,
                    KhoiID: node.KhoiID,
                }
                this.DSLop.push(item)
            })
            node.children = dsLop.map(lop => ({
                id: `lop-${lop.LopID}`,
                title: lop.TenLop,
                type: 'lop',
                Lop: { ...lop, ...khoi, TenKhoiHoc: node.title },
                LopID: lop.LopID,
                loaded: false,
                children: [{ id: `loading-lop-${lop.LopID}`, title: 'Mở để tải danh sách môn', type: 'loading' }],
            }))
            node.loaded = true
            node.loading = false
        },
        async loadTreeSubjects(node) {
            node.loading = true
            const lop = node.Lop
            const res = await fetchPromise('lms/MonHoc_Get_ByLopID_BoMon', {
                LopID: lop.LopID,
                NienKhoa: vueData.NienKhoa,
                HocKi: this.HocKi,
            })
            const dsMonHoc = res.data ?? res ?? []
            const subjects = dsMonHoc.map(mon => ({
                ...mon,
                TenMonHoc: mon.TenMonHoc_HienThi || mon.TenMonHoc || '',
                Lop: lop,
            }))
            this.DSMonHoc = subjects
            this.treeSubjectMap[lop.LopID] = subjects
            node.children = subjects.map(mon => ({
                id: `mon-${lop.LopID}-${mon.MonHocID}`,
                title: mon.TenMonHoc,
                type: 'mon',
                Lop: lop,
                MonHoc: mon,
            }))
            node.loaded = true
            node.loading = false
        },
        async onTreeActivated(ids) {
            const activeID = ids?.[ids.length - 1]
            if (!activeID) return
            const node = this.findTreeNode(this.treeNodes, activeID)
            if (!node || node.type === 'loading') return
            if (node.type === 'khoi') {
                if (!node.loaded) await this.loadTreeClasses(node)
                this.viewMode = 'empty'
                this.summaryTitleText = ''
                this.summaryRows = []
                this.DS = []
                return
            }
            if (node.type === 'lop') {
                if (!node.loaded) await this.loadTreeSubjects(node)
                this.viewMode = 'empty'
                this.summaryTitleText = ''
                this.summaryRows = []
                this.DS = []
                return
            }
            if (node.type !== 'mon') return
            this.viewMode = 'detail'
            this.summaryTitleText = ''
            this.summaryRows = []
            this.LopItem = node.Lop
            this.MonHocItem = node.MonHoc
            this.DSMonHoc = this.treeSubjectMap[node.Lop.LopID] || []
            this.MaNhomCotDiemItem = null
            this.DSMaNhomCotDiem = []
            this.DS = []
            this.getMaNhomCotDiem()
        },
        async getMonHoc() {
            if (!this.LopItem) return
            const res = await fetchPromise('lms/MonHoc_Get_ByLopID_BoMon', {
                LopID: this.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
                HocKi: this.HocKi,
            })
            const dsMonHoc = res.data ?? res ?? []
            this.DSMonHoc = dsMonHoc.map(x => ({
                ...x,
                TenMonHoc: x.TenMonHoc_HienThi || x.TenMonHoc || '',
            }))
            if (this.DSMonHoc.length === 1) this.MonHocItem = this.DSMonHoc[0]
        },
        async getMaNhomCotDiem() {
            if (!this.MonHocItem) return
            const res = await fetchPromise('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID', {
                TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
            })
            const dsNhom = res.data ?? res ?? []
            this.DSMaNhomCotDiem = dsNhom
                .filter(x => x.Semester === this.HocKiCode)
                .map(x => ({
                    ...x,
                    TenNhomCotDiemDisplay: x.TenNhomCotDiem_VI || x.MaNhomCotDiem,
                }))
            if (this.DSMaNhomCotDiem.length === 1) this.MaNhomCotDiemItem = this.DSMaNhomCotDiem[0]
        },
        async getDS() {
            if (!this.LopItem || !this.MonHocItem || !this.MaNhomCotDiemItem) {
                this.DS = []
                return
            }
            try {
                const [resBangDiem, resKhoaCotDiem] = await Promise.all([
                    fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom', {
                        LopID: this.LopItem.LopID,
                        MonHocID: this.MonHocItem.MonHocID,
                        TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
                        MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                        ThuTuNhom: this.MaNhomCotDiemItem.ThuTuNhom,
                        Semester: this.MaNhomCotDiemItem.Semester,
                        NienKhoa: vueData.NienKhoa,
                        KhoiID: this.LopItem.KhoiID,
                    }, { cache: false }),
                    fetchPromise('lms/KhoaCotDiem_Get', {
                        LopID: this.LopItem.LopID,
                        MonHocLopID: this.MonHocItem.MonHocLopID,
                        MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                        Semester: this.MaNhomCotDiemItem.Semester,
                        NienKhoa: vueData.NienKhoa,
                    }, { cache: false }),
                ])

                const dsBangDiem = resBangDiem.data ?? resBangDiem ?? []
                const dsKhoaCotDiem = resKhoaCotDiem.data ?? resKhoaCotDiem ?? []

                const firstHocSinhID = dsBangDiem[0]?.HocSinhID
                const dsCotDiemTheoNhom = firstHocSinhID
                    ? dsBangDiem.filter(x => x.HocSinhID === firstHocSinhID)
                    : []

                const khoaMap = dsKhoaCotDiem.reduce((acc, item) => {
                    const key = this.getKhoaKey(item.MonHocLopID, item.MaCotDiem)
                    const nextInfo = {
                        TinhTrang: !!item.TinhTrang,
                        KhoaCotDiemID: Number(item.KhoaCotDiemID || 0),
                    }
                    acc[key] = this.pickKhoaInfo(acc[key], nextInfo)
                    return acc
                }, {})

                const monHocLopByDisplayMap = dsKhoaCotDiem.reduce((acc, item) => {
                    const maCotDiemDisplay = item.MaCotDiem || ''
                    if (!maCotDiemDisplay) return acc
                    const next = {
                        MonHocLopID: Number(item.MonHocLopID || 0),
                        KhoaCotDiemID: Number(item.KhoaCotDiemID || 0),
                    }
                    const current = acc[maCotDiemDisplay]
                    if (!current || next.KhoaCotDiemID >= current.KhoaCotDiemID) {
                        acc[maCotDiemDisplay] = next
                    }
                    return acc
                }, {})

                this.DS = dsCotDiemTheoNhom.map((cotDiem, index) => {
                    const maCotDiemDisplay = cotDiem.MaCotDiem || ''
                    const inferredMonHocLopID = monHocLopByDisplayMap[maCotDiemDisplay]?.MonHocLopID || 0
                    const rowMonHocLopID = Number(cotDiem.MonHocLopID || 0)
                    const monHocLopID = this.hasNumericPrefix(maCotDiemDisplay)
                        ? Number(inferredMonHocLopID || rowMonHocLopID || this.MonHocItem.MonHocLopID || 0)
                        : Number(rowMonHocLopID || inferredMonHocLopID || this.MonHocItem.MonHocLopID || 0)
                    const maCotDiemSave = this.normalizeMaCotDiem(maCotDiemDisplay)
                    const khoaInfo = khoaMap[this.getKhoaKey(monHocLopID, maCotDiemDisplay)] || {}
                    const isLocked = !!khoaInfo.TinhTrang
                    return {
                        RowKey: `${monHocLopID}_${maCotDiemDisplay}_${index}`,
                        STT: index + 1,
                        MonHocLopID: monHocLopID,
                        MaCotDiemDisplay: maCotDiemDisplay,
                        MaCotDiemSave: maCotDiemSave,
                        TenCotDiem_VI: cotDiem.TenCotDiem_VI || maCotDiemDisplay,
                        KhoaCotDiemID: khoaInfo.KhoaCotDiemID || null,
                        IsLocked: isLocked,
                        TenTinhTrang: isLocked ? 'Đã khóa' : 'Chưa khóa',
                        MauTinhTrang: isLocked ? 'success' : 'warning',
                    }
                })
            } catch (error) {
                this.DS = []
            }
        },
        _confirm() {
            return this.confirmRef?.value
        },
        clearSelectionFilter() {
            this.DSSelected = []
        },
        getRowProps(ctx) {
            const row = ctx?.item?.raw || ctx?.item || {}
            if (this.selectedStatusFilter === null) return {}
            const isDimmed = !!row.IsLocked !== this.selectedStatusFilter
            return isDimmed ? { class: 'row-dimmed' } : {}
        },
        async lockItem(item) {
            if (item.KhoaCotDiemID) {
                await fetchPromise('lms/KhoaCotDiem_TinhTrang_Upd_ByKhoaCotDiem', {
                    KhoaCotDiemID: item.KhoaCotDiemID,
                    TinhTrang: 1,
                    LyDo: '',
                }, { cache: false })
            } else {
                await fetchPromise('lms/KhoaCotDiem_Ins_And_Upd', {
                    LopID: this.LopItem.LopID,
                    MonHocLopID: item.MonHocLopID || this.MonHocItem.MonHocLopID,
                    MaCotDiem: item.MaCotDiemSave || this.normalizeMaCotDiem(item.MaCotDiemDisplay),
                    IsKhoaCotDiem: true,
                }, { cache: false })
            }
        },
        onClickToggle(item) {
            if (item.IsLocked && item.KhoaCotDiemID) {
                this.dialogKhoa = { show: true, item, LyDo: '' }
            } else {
                this.onLock(item)
            }
        },
        async onLock(item) {
            const ok = await this._confirm()?.show({ title: `Khóa cột điểm "${item.TenCotDiem_VI}"?`, type: 'confirm' })
            if (!ok) return
            await this.lockItem(item)
            this.snackbarRef.value.showSnackbar({ message: 'Khóa cột điểm thành công', color: 'success' })
            this.getDS()
        },
        async onLockSelected() {
            if (this.hasMixedSelectedStatus) {
                this.snackbarRef.value.showSnackbar({ message: 'Không thể thao tác khi đang chọn lẫn cột đã khóa và chưa khóa', color: 'warning' })
                return
            }
            const items = this.selectedRows.filter(x => !x.IsLocked)
            if (!items.length) return
            const ok = await this._confirm()?.show({ title: `Khóa ${items.length} cột điểm đã chọn?`, type: 'confirm' })
            if (!ok) return
            for (const item of items) {
                await this.lockItem(item)
            }
            this.snackbarRef.value.showSnackbar({ message: `Khóa thành công ${items.length} cột điểm`, color: 'success' })
            await this.getDS()
        },
        onOpenUnlockSelected() {
            if (this.hasMixedSelectedStatus) {
                this.snackbarRef.value.showSnackbar({ message: 'Không thể thao tác khi đang chọn lẫn cột đã khóa và chưa khóa', color: 'warning' })
                return
            }
            if (!this.selectedLockedCount) return
            this.dialogMoKhoaSelected = { show: true, LyDo: '' }
        },
        async onConfirmMoKhoaSelected() {
            const lyDo = this.dialogMoKhoaSelected.LyDo?.trim()
            if (!lyDo) {
                this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập lý do mở khóa', color: 'error' })
                return
            }
            const items = this.selectedRows.filter(x => !!x.IsLocked && !!x.KhoaCotDiemID)
            if (!items.length) {
                this.snackbarRef.value.showSnackbar({ message: 'Không có cột đã khóa hợp lệ để mở', color: 'warning' })
                return
            }
            for (const item of items) {
                await fetchPromise('lms/KhoaCotDiem_TinhTrang_Upd_ByKhoaCotDiem', {
                    KhoaCotDiemID: item.KhoaCotDiemID,
                    TinhTrang: 0,
                    LyDo: lyDo,
                }, { cache: false })
            }
            this.dialogMoKhoaSelected.show = false
            this.snackbarRef.value.showSnackbar({ message: `Mở khóa thành công ${items.length} cột điểm`, color: 'success' })
            await this.getDS()
        },
        async onConfirmMoKhoa() {
            if (!this.dialogKhoa.LyDo?.trim()) {
                this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập lý do mở khóa', color: 'error' })
                return
            }
            if (!this.dialogKhoa.item?.KhoaCotDiemID) {
                this.snackbarRef.value.showSnackbar({ message: 'Không tìm thấy định danh khóa cột điểm', color: 'error' })
                return
            }
            await fetchPromise('lms/KhoaCotDiem_TinhTrang_Upd_ByKhoaCotDiem', {
                KhoaCotDiemID: this.dialogKhoa.item.KhoaCotDiemID,
                TinhTrang: 0,
                LyDo: this.dialogKhoa.LyDo.trim(),
            }, { cache: false })
            this.dialogKhoa.show = false
            this.snackbarRef.value.showSnackbar({ message: 'Mở khóa thành công', color: 'success' })
            this.getDS()
        },
        async onRefresh() {
            if (!this.MaNhomCotDiemItem) {
                this.snackbarRef.value.showSnackbar({
                    message: 'Vui lòng chọn đủ bộ lọc trước khi làm mới',
                    color: 'warning',
                })
                return
            }
            await this.getDS()
        },
    },
	}
</script>
