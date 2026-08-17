<template>
	<v-dialog v-model="isOpen" max-width="1200">
		<v-card>
			<v-card-title class="d-flex align-center ga-2 bg-primary text-white" style="min-height: 48px;">
				<span class="text-subtitle-1 font-weight-bold" style="color: white !important;">Import bài học từ học liệu số</span>
				<v-spacer></v-spacer>
				<v-btn icon color="white" @click="$emit('update:isOpen', false)" variant="text">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-card-text>
				<v-data-table :headers="headers" :items="DataHocLieu" :items-per-page="-1" hide-default-footer
					class="border" show-expand>
					<template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
						<v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
							:text="isExpanded(internalItem) ? $t('message.Close') : $t('message.ContentList')"
							class="text-none" color="medium-emphasis" size="small" variant="text" width="205" border
							slim @click="toggleExpand(internalItem)"></v-btn>
					</template>
					<template v-slot:item.Thumnail="{ item }">
						<div class="d-flex align-center justify-center bg-grey-lighten-3" style="width: 80px; height: 80px;">
							<v-img v-if="getThumbnailUrl(item) && !thumbnailErrors[item.HocLieuID]"
								:src="getThumbnailUrl(item)" :cover="true" width="80" height="80"
								@error="thumbnailErrors[item.HocLieuID] = true">
								<template v-slot:placeholder>
									<div class="d-flex align-center justify-center fill-height">
										<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
									</div>
								</template>
							</v-img>
							<v-icon v-else color="grey" size="32">mdi-book-open-page-variant-outline</v-icon>
						</div>
					</template>
					<template v-slot:expanded-row="{ columns, item }">
						<tr>
							<td :colspan="columns.length" class="py-2">
								<v-sheet rounded="lg" border>
									<v-table density="compact">
										<tbody class="bg-surface-light">
											<tr>
												<th>{{ $t('message.ContentName') }}</th>
								<th style="width:220px" class="text-center">{{ $t('message.ContentType')
													}}</th>
												<th style="width:150px" class="text-center">{{ $t('message.Preview') }}
												</th>
												<th style="width:150px" class="text-center">{{ $t('message.Actions') }}
												</th>
											</tr>
										</tbody>

										<tbody>
											<tr v-for="lesson in DataLesson.filter(l => l.HocLieuID === item.HocLieuID)"
												:key="lesson.LessonID">

												<td class="py-2">
													{{ lesson.TenNoiDung }}
												</td>
								<td class="py-2 text-center" style="width:220px">
									<div class="d-inline-flex align-center ga-2">
										<v-icon color="orange" size="20">{{ getContentType(lesson.LoaiNoiDung).icon }}</v-icon>
										<span>{{ getContentType(lesson.LoaiNoiDung).label }}</span>
									</div>
												</td>
												<td class="py-2 text-center" style="width:150px">
													<v-btn color="pink" variant="tonal" size="small"
														@click="onPreviewLesson(lesson)">{{ $t('message.Preview') }}
													</v-btn>
												</td>
												<td class="py-2 text-center" style="width:150px">
													<v-btn color="orange" variant="tonal" size="small"
														@click="importLesson(lesson)">Import
													</v-btn>
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
	        lessonDetail: {
	            type: Object,
	            default: {}
	        },
	        linkedHocLieuID: { type: Number, default: 0 },
	    },
	    emits: ['update:isOpen', 'importJson'],
	    data() {
	        this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
	        return {
	            vueData,
	            groupBy: [
	                { key: 'TenHocLieu' }
	            ],
	            headers: [
	                { title: this.$t('message.Thumbnail'), sortable: false, key: 'Thumnail', width: '120' },
	                { title: this.$t('message.MaterialName'), sortable: false, key: 'TenHocLieu' },
	            ],
	            DataHocLieu: [],
	            DataLesson: [],
	            thumbnailErrors: {},
	        }
	    },
	    computed: {},
	    mounted() {
	        this.getLessonFromHocLieu()
	    },
	    methods: {
	        getThumbnailUrl(item) {
	            let url = item?.ThumbnailURL
	            if (!url && Array.isArray(item?.ThumbnailURLs)) url = item.ThumbnailURLs.find(Boolean)
	            if (!url && typeof item?.ThumbnailURLs === 'string') {
	                try {
	                    const urls = JSON.parse(item.ThumbnailURLs)
	                    if (Array.isArray(urls)) url = urls.find(Boolean)
	                } catch (error) {
	                    url = item.ThumbnailURLs
	                }
	            }
	            if (!url) return ''
	            if (/^https?:\/\//i.test(url)) return url
	            return `https://file.lhbs.vn/lms${url.startsWith('/') ? '' : '/'}${url}`
	        },
	        getContentType(type) {
	            const contentTypes = {
	                HTML: { label: 'HTML', icon: 'mdi-language-html5' },
	                INTERACTIVE: { label: 'Tương tác', icon: 'mdi-gesture-tap' },
	                READING: { label: 'Bài đọc', icon: 'mdi-book-open-page-variant' },
	                VIDEO: { label: 'Video', icon: 'mdi-video-outline' },
	                AUDIO: { label: 'Âm thanh', icon: 'mdi-volume-high' },
	                TAILIEU: { label: 'Tài liệu', icon: 'mdi-file-document-outline' },
	                SLIDE: { label: 'Bài trình chiếu', icon: 'mdi-presentation' },
	                ISPRING_CONTENT: { label: 'iSpring', icon: 'mdi-presentation-play' },
	            }
	            return contentTypes[type] || { label: type || 'Không xác định', icon: 'mdi-file-outline' }
	        },
	        getLessonFromHocLieu() {
	            if (!this.lessonDetail || !this.lessonDetail.MonHocID || !this.lessonDetail.KhoiID) return
	
	            let payload = {
	                MonHocID: this.lessonDetail.MonHocID,
	                KhoiID: this.lessonDetail.KhoiID,
	            }
	            ajaxCALL('lms/EL_Teacher_GetLessonFromHocLieu', payload, res => {
	                const hocLieuList = res?.data?.[0] || []
	                const importableTypes = [
	                    'HTML', 'INTERACTIVE', 'READING', 'VIDEO', 'AUDIO',
	                    'SLIDE', 'ISPRING_CONTENT', 'TAILIEU'
	                ]
	                const lessonList = (res?.data?.[1] || []).filter(item => importableTypes.includes(item.LoaiNoiDung))
	                this.DataHocLieu = this.linkedHocLieuID
	                    ? hocLieuList.filter(item => Number(item.HocLieuID) === Number(this.linkedHocLieuID))
	                    : hocLieuList
	                this.DataLesson = lessonList.map(item => {
	                    let objFindHocLieu = hocLieuList.find(i => i.HocLieuID === item.HocLieuID)
	                    if (objFindHocLieu) {
	                        return {
	                            ...item,
	                            TenHocLieu: objFindHocLieu.TenHocLieu || '',
	
	                        }
	                    } else {
	                        return {
	                            ...item,
	                            TenHocLieu: '',
	                        }
	                    }
	                })
	            });
	        },
	        importLesson(lesson) {
	            let data = lesson.DataJson || ''
	            if (typeof data === 'string') {
	                try {
	                    data = JSON.parse(data)
	                } catch (error) {
	                    // DataJson của nội dung HTML cũ có thể là HTML thuần.
	                }
	            }
	            const source = typeof data === 'object'
	                ? data?.htmlContent || data?.content || data?.url || data?.source || ''
	                : data
	            const title = lesson.TenNoiDung || (typeof data === 'object' ? data?.title || data?.fileName : '')
	            let elementType = 'HTML'
	            let elementData = { title, IsHTML: true, source }

	            if (lesson.LoaiNoiDung === 'VIDEO') {
	                elementType = 'YOUTUBE'
	                elementData = { title, source }
	            } else if (lesson.LoaiNoiDung === 'AUDIO') {
	                elementType = 'AUDIO'
	                elementData = { title, source }
	            } else if (['SLIDE', 'TAILIEU'].includes(lesson.LoaiNoiDung)) {
	                elementType = 'FILE'
	                elementData = {
	                    title,
	                    sources: [{
	                        id: typeof data === 'object' ? data?.driveFileId || data?.fileId || '' : '',
	                        name: typeof data === 'object' ? data?.fileName || data?.title || title : title,
	                        source,
	                    }],
	                }
	            } else if (lesson.LoaiNoiDung === 'ISPRING_CONTENT') {
	                elementData = { title, IsHTML: false, source }
	            }
	            elementData.sourceTracking = {
	                sourceType: 'HOC_LIEU_SO',
	                HocLieuID: lesson.HocLieuID,
	                NoiDungID: lesson.NoiDungID,
	                LoaiNoiDung: lesson.LoaiNoiDung,
	                importedAt: new Date().toISOString(),
	            }

	            this.$emit('importJson', { elementType, elementData })
	            this.$emit('update:isOpen', false)
	        },
	        onPreviewLesson(lesson) {
	            openWindow({
	                title: this.$t('message.PreviewLesson'),
	                url: `https://lms.lhbs.vn/hoc-lieu-view-v2?hoclieuid=${lesson.HocLieuID}&noidungid=${lesson.NoiDungID}`,
	            })
	        }
	    }
	}
</script>