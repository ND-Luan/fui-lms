<template>
	<v-expansion-panels v-model="mediaPanelOpen">
        <v-expansion-panel>
            <v-expansion-panel-title v-if="!hasMedia" class="pa-2 font-weight-medium">
                <div class="d-flex align-center ga-2 w-100">
                    <span>Media</span>
                    <div v-if="hasMedia" class="d-flex align-center ga-1 flex-wrap">
                        <v-chip v-if="hasYoutube" size="x-small" color="red" variant="tonal">
                            <v-icon start size="13">mdi-video-outline</v-icon>Video
                        </v-chip>
                        <v-chip v-if="hasAudio" size="x-small" color="teal" variant="tonal">
                            <v-icon start size="13">mdi-multimedia</v-icon>Audio
                        </v-chip>
                        <v-chip v-if="hasFiles" size="x-small" color="blue" variant="tonal">
                            <v-icon start size="13">mdi-file</v-icon>{{ fileCount }} file
                        </v-chip>
                    </div>
                </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <div class="media-type-tabs mt-2" role="tablist">
                    <v-btn class="media-type-tab" :class="{ 'media-type-tab--active': selectedData.media.type === 'YOUTUBE' }"
                        variant="text" @click="selectedData.media.type = 'YOUTUBE'">
                        <v-icon size="16">mdi-video-outline</v-icon><span>Video</span><i v-if="hasYoutube" class="media-type-dot" />
                    </v-btn>
                    <v-btn class="media-type-tab" :class="{ 'media-type-tab--active': selectedData.media.type === 'RECORD_AUDIO' }"
                        variant="text" @click="selectedData.media.type = 'RECORD_AUDIO'">
                        <v-icon size="16">mdi-music-note-outline</v-icon><span>Audio</span><i v-if="hasAudio" class="media-type-dot" />
                    </v-btn>
                    <v-btn class="media-type-tab" :class="{ 'media-type-tab--active': selectedData.media.type === 'FILE' }"
                        variant="text" @click="selectedData.media.type = 'FILE'">
                        <v-icon size="16">mdi-file-outline</v-icon><span>File</span><i v-if="hasFiles" class="media-type-dot" />
                    </v-btn>
                </div>
                <v-alert class="mt-3" density="compact" variant="tonal" color="info"
                    icon="mdi-information-outline">
                    Media tải lên bài tập sẽ được bổ sung vào Tài nguyên nhà trường.
                </v-alert>

                <div v-if="selectedData.media.type === 'YOUTUBE'" class="d-flex flex-column ga-2 mt-3">
                    <div class="media-input-row pb-2">
                        <v-text-field v-model="selectedData.media.sourceYT.source"
                            :placeholder="IsEngLish ? 'Paste video link' : 'Dán link video...'"
                            :hint="IsEngLish ? '*Paste a YouTube or other video link.' : '*Dán đường link YouTube hoặc video khác'"
                            persistent-hint :clearable="false" @change="emitUpdate" />
                        <v-btn @click="$refs.fileInput.click()" color="primary" variant="outlined">Tải video</v-btn>
                        <input ref="fileInput" type="file" accept="video/*" @change="handleInputChange($event, 'YOUTUBE')" hidden />
                    </div>
                    <div v-if="hasYoutube" class="assignment-media-video-card">
                        <iframe class="assignment-media-video"
                            :src="renderUrlYoutube(selectedData.media.sourceYT.source)" title="YouTube video player"
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen />
                        <div class="media-card-footer">
                            <span class="text-caption text-truncate">{{ selectedData.media.sourceYT.name || 'Video YouTube' }}</span>
                            <v-btn class="media-card-delete" size="small" variant="text" color="error"
                                @click="removeYoutube" aria-label="Xóa video">
                                <v-icon size="17">mdi-close</v-icon>
                            </v-btn>
                        </div>
                    </div>
                    <div v-else class="assignment-media-empty">
                        <v-icon size="30">mdi-video-off-outline</v-icon>
                        <span>Chưa có video</span>
                    </div>
                </div>

                <div v-else-if="selectedData.media.type === 'RECORD_AUDIO'" class="d-flex flex-column ga-2 mt-3">
                    <div class="media-input-row mb-2">
                        <v-text-field v-model="selectedData.media.sourceRecord.source"
                            :placeholder="IsEngLish ? 'Paste audio link' : 'Dán link audio...'" :clearable="false" @change="emitUpdate" />
                        <v-btn @click="$refs.inputUploadRecordAudio.click()" variant="outlined" color="primary">Tải audio</v-btn>
                        <input ref="inputUploadRecordAudio" type="file" accept="audio/*" @change="handleInputChange($event, 'UPLOAD_RECORD_AUDIO')" hidden />
                    </div>
                    <uc-audio-record v-model:file="fileRecordAudio" v-model:src="selectedData.media.sourceRecord.source"
                        v-model:isSaveFile="isSaveFile" @handleSave="handleFileChange(fileRecordAudio, 'RECORD_AUDIO')" />
                    <div v-if="!hasAudio" class="assignment-media-empty">
                        <v-icon size="30">mdi-music-note-off</v-icon>
                        <span>Chưa có audio</span>
                    </div>
                    <v-btn v-if="hasAudio" size="small" variant="text" color="error" class="align-self-start" @click="removeAudio">
                        <v-icon start>mdi-delete-outline</v-icon>Xóa audio
                    </v-btn>
                </div>

                <div v-else class="d-flex flex-column ga-3 mt-3">
                    <v-btn @click="$refs.inputFile.click()" color="primary" variant="outlined" class="align-self-start">Tải file</v-btn>
                    <input ref="inputFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" @change="handleInputChange($event, 'FILE')" hidden />

                    <div class="text-subtitle-2">Hình ảnh</div>
                    <div v-if="images.length" class="assignment-media-image-grid">
                        <div v-for="(file, index) in images" :key="file.id || file.resourceFileId || index" class="assignment-media-image-card">
                            <v-img :src="imageSource(file)" cover class="assignment-media-image-preview">
                                <template #placeholder><div class="d-flex align-center justify-center fill-height"><v-progress-circular indeterminate color="primary" /></div></template>
                            </v-img>
                            <div class="media-card-footer">
                                <span class="text-caption text-truncate">{{ file.name }} <small class="text-medium-emphasis">({{ formatFileSize(file.fileSize) }})</small></span>
                                <v-btn class="media-card-delete" size="small" variant="text" color="error"
                                    @click="removeFile('image', index)" aria-label="Xóa ảnh">
                                    <v-icon size="17">mdi-close</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </div>
                    <div v-else class="assignment-media-empty"><v-icon size="30">mdi-image-off-outline</v-icon><span>Chưa có hình ảnh</span></div>

                    <div class="text-subtitle-2">Tệp đính kèm</div>
                    <div v-if="files.length" class="assignment-media-file-list">
                        <div v-for="(file, index) in files" :key="file.id || file.resourceFileId || index" class="assignment-media-file-card">
                            <iframe v-if="isPreviewable(file)" :src="file.source" class="assignment-media-file-preview" frameborder="0" />
                            <div v-else class="assignment-media-file-fallback"><v-icon>mdi-file-outline</v-icon><span>{{ file.name }}</span></div>
                            <div class="media-card-footer">
                                <span class="text-caption text-truncate">{{ file.name }} <small class="text-medium-emphasis">({{ formatFileSize(file.fileSize) }})</small></span>
                                <v-btn class="media-card-delete" size="small" variant="text" color="error"
                                    @click="removeFile('file', index)" aria-label="Xóa file">
                                    <v-icon size="17">mdi-close</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </div>
                    <div v-else class="assignment-media-empty"><v-icon size="30">mdi-file-outline</v-icon><span>Chưa có tệp đính kèm</span></div>
                </div>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
	export default {
		name: 'uc-media',
    props: { selectedData: Object, item: Object, loadingPage: Object },
    emits: ['update:selectedData'],
    data() {
        this.$i18n.locale = localStorage.getItem('IsLanguage') === 'true' ? 'en' : 'vi'
        return { isSaveFile: false, fileRecordAudio: null, mediaPanelOpen: null }
    },
    computed: {
        IsEngLish() { return this.$i18n.locale === 'en' },
        media() { return this.selectedData?.media || {} },
        images() { return this.media.sourceFiles?.image || [] },
        files() { return this.media.sourceFiles?.file || [] },
        hasYoutube() { return !!this.media.sourceYT?.source },
        hasAudio() { return !!this.media.sourceRecord?.source },
        hasFiles() { return this.images.length > 0 || this.files.length > 0 },
        hasMedia() { return this.hasYoutube || this.hasAudio || this.hasFiles },
        fileCount() { return this.images.length + this.files.length },
    },
    watch: {
        hasMedia: {
            immediate: true,
            handler(value) { this.mediaPanelOpen = value ? 0 : null }
        },
        selectedData: {
            deep: true,
            handler() { if (this.hasMedia) this.mediaPanelOpen = 0 }
        }
    },
    methods: {
        getUploadManager() { return window.UploadManager },
        assignmentId() { return Number(vueData?.AssignmentID || vueData?.assignment?.AssignmentID || 0) },
        async handleInputChange(event, type) {
            const file = event?.target?.files?.[0]
            if (event?.target) event.target.value = ''
            await this.handleFileChange(file, type)
        },
        async handleFileChange(file, typeMedia) {
            if (!file) return
            try {
                const manager = this.getUploadManager()
                if (!manager) throw new Error('UploadManager chưa được khởi tạo')
                if (typeMedia === 'YOUTUBE') {
                    const uploaded = await this.uploadWithManager('uploadLmsYoutube', file, {
                        playlistName: `LMS_Assignment_${this.assignmentId()}`,
                        title: file.name.replace(/\.[^/.]+$/, '')
                    })
                    this.selectedData.media.sourceYT = { ...uploaded, fileSize: file.size, mediaSource: 'upload' }
                    this.emitUpdate()
                    this.registerResourceInBackground(file, 'VIDEO', this.selectedData.media.sourceYT)
                } else if (typeMedia === 'FILE') {
                    const isImage = file.type.startsWith('image/')
                    const allowed = isImage || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
                    if (!allowed) throw new Error('Chỉ hỗ trợ hình ảnh, PDF, Word và PowerPoint')
                    const uploaded = await this.uploadWithManager('uploadLmsFile', file)
                    const uploadedFile = uploaded?.Files?.[0]
                    if (!uploadedFile?.FILE_ID) throw new Error('API lưu trữ không trả về FILE_ID')
                    const source = {
                        id: uploadedFile.FILE_ID,
                        name: uploadedFile.FILE_NAME || file.name,
                        source: uploadedFile.FILE_URL || `/FileData/${uploadedFile.FILE_ID}`,
                        fileSize: Number(uploadedFile.FILE_SIZE || file.size || 0),
                        mediaSource: 'db',
                    }
                    if (!this.media.sourceFiles) this.media.sourceFiles = { file: [], image: [] }
                    if (!Array.isArray(this.media.sourceFiles[isImage ? 'image' : 'file'])) this.media.sourceFiles[isImage ? 'image' : 'file'] = []
                    this.media.sourceFiles[isImage ? 'image' : 'file'].push(source)
                    this.emitUpdate()
                    this.registerResourceInBackground(file, isImage ? 'IMAGE' : 'FILE', source)
                } else if (typeMedia === 'RECORD_AUDIO' || typeMedia === 'UPLOAD_RECORD_AUDIO') {
                    const uploaded = await this.uploadWithManager('uploadLmsGoogleDrive', file, { folderPath: `LMS_Assignment/Assignment_${this.assignmentId()}/${vueData?.user?.UserID || ''}` })
                    this.selectedData.media.sourceRecord = { ...uploaded, fileSize: file.size, mediaSource: 'upload' }
                    this.isSaveFile = true
                    this.emitUpdate()
                    this.registerResourceInBackground(file, 'AUDIO', this.selectedData.media.sourceRecord)
                }
                this.emitUpdate()
            } catch (error) {
                console.error('Lỗi upload media bài tập:', error)
                Vue.$toast.error(error?.message || 'Không thể tải media lên', { position: 'top' })
            }
        },
        uploadWithManager(method, file, options) {
            return new Promise((resolve, reject) => this.getUploadManager()[method](file, { ...options, onComplete: resolve, onError: reject }))
        },
        registerResourceInBackground(file, resourceType, source) {
            this.registerResource(file, resourceType, source).catch(error => {
                console.error('Lỗi bổ sung media bài tập vào tài nguyên:', error)
                Vue.$toast.warning('Media đã được thêm vào bài tập nhưng chưa bổ sung được vào tài nguyên.', { position: 'top' })
            })
        },
        async registerResource(file, resourceType, source) {
            const assignmentID = this.assignmentId()
            if (!assignmentID) {
                Vue.$toast.warning('Bài tập chưa có mã, file sẽ được bổ sung vào tài nguyên sau khi lưu bài.', { position: 'top' })
                return
            }
            // File đã nằm trên Drive/YouTube. Không upload lại vào FileData:
            // endpoint FileData có giới hạn kích thước và sẽ trả 413 với video/file lớn.
            const metadata = {
                uploadSource: source.mediaSource === 'db' ? 'db' : (source.mediaSource === 'upload' && source.source?.includes('youtube.com') ? 'youtube' : 'gdrive'),
                fileId: source.id,
                fileName: source.name || file.name,
                contentType: file.type || '',
                fileSize: Number(source.fileSize || file.size || 0),
                url: source.source,
                origin: 'GIAO_BAI',
                publishSource: resourceType,
                assignmentID,
                mediaContext: this.item,
            }
            const response = await fetchPromise('lms/FP_TaiNguyen_File_Register', {
                KhoiID: vueData?.assignment?.KhoiID || vueData?.KhoiID || 0,
                MonHocID: vueData?.assignment?.MonHocID || vueData?.MonHocID || 0,
                TenNoiDung: metadata.fileName,
                LoaiNoiDung: resourceType,
                NguonTaiNguyenCode: 'GIAO_BAI',
                NguonResourceType: 'ASSIGNMENT',
                NguonResourceID: assignmentID,
                DataJson: JSON.stringify(metadata)
            }, { cache: false })
            const registered = Array.isArray(response) ? response[0] : response
            if (registered?.NoiDungID) source.resourceNodeId = registered.NoiDungID
        },
        async removeYoutube() { await this.removeSource(this.media.sourceYT, () => { this.selectedData.media.sourceYT = { id: '', name: '', source: '' } }) },
        async removeAudio() { await this.removeSource(this.media.sourceRecord, () => { this.selectedData.media.sourceRecord = { id: '', name: '', source: '' } }) },
        async removeFile(type, index) { const source = this.media.sourceFiles[type][index]; await this.removeSource(source, () => this.media.sourceFiles[type].splice(index, 1)) },
        async removeSource(source, removeLocal) {
            try {
                this.setLoading(true, 'Đang xóa media...')
                const manager = this.getUploadManager()
                if (source?.id && source.mediaSource === 'db') {
                    await manager.deleteLmsFile(source.id)
                } else if (source?.id && (source.mediaSource === 'upload' || source.source?.includes('drive.google.com'))) {
                    const token = await fetchPromise('lms/FP_Youtube_Token_Get', {}, { forceRefresh: true, cache: false })
                    await manager.deleteFromGoogleDrive(source.id, { accessToken: token?.access_token })
                }
                if (source?.resourceNodeId) {
                    await fetchPromise('lms/FP_TaiNguyen_Node_Delete', { NoiDungID: source.resourceNodeId }, { cache: false })
                } else if (source?.resourceFileId) {
                    // Tương thích dữ liệu cũ từng lưu bản sao vào FileData.
                    await manager.deleteLmsFile(source.resourceFileId)
                }
                removeLocal()
                this.emitUpdate()
            } catch (error) {
                console.error('Lỗi xóa media bài tập:', error)
                Vue.$toast.error(error?.message || 'Không thể xóa media', { position: 'top' })
            } finally { this.setLoading(false) }
        },
        setLoading(value, text = '') { if (this.loadingPage) { this.loadingPage.isLoading = value; if (text) this.loadingPage.text = text } },
        emitUpdate() { this.$emit('update:selectedData', this.selectedData) },
        imageSource(file) { return file?.source?.includes('drive.google.com') ? `https://drive.google.com/thumbnail?id=${file.id || this.getDriveFileId(file.source)}&sz=w1000` : file?.source },
        getDriveFileId(url) { const match = url?.match(/\/d\/([^/]+)/); return match ? match[1] : null },
        isPreviewable(file) { return /\.pdf($|\?)/i.test(file?.name || '') || file?.mimeType === 'application/pdf' },
        formatFileSize(size) {
            const value = Number(size || 0)
            if (!value) return '—'
            if (value < 1024) return `${value} B`
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
            return `${(value / (1024 * 1024)).toFixed(1)} MB`
        },
        renderUrlYoutube,
    }
	}
</script>