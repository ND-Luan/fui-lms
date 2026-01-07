<template>
	<v-dialog v-model="isOpen" max-width="1200">
		<v-card>
			<v-card-title class="d-flex ga-2 bg-primary">
				<p>{{ $t('message.ImportDigitalLesson') }}</p>
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
							:text="isExpanded(internalItem) ? $t('message.Close') : $t('message.ContentList')"
							class="text-none" color="medium-emphasis" size="small" variant="text" width="205" border
							slim @click="toggleExpand(internalItem)"></v-btn>
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
								<v-sheet rounded="lg" border>
									<v-table density="compact">
										<tbody class="bg-surface-light">
											<tr>
												<th>{{ $t('message.ContentName') }}</th>
												<th style="width:150px" class="text-center">{{ $t('message.ContentType')
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
												<td class="py-2 text-center" style="width:150px"> <v-icon
														color="orange">mdi-language-html5</v-icon>
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
	        }
	    },
	    computed: {},
	    mounted() {
	        this.getLessonFromHocLieu()
	    },
	    methods: {
	        getLessonFromHocLieu() {
	            if (!this.lessonDetail || !this.lessonDetail.MonHocID || !this.lessonDetail.KhoiID) return
	
	            let payload = {
	                MonHocID: this.lessonDetail.MonHocID,
	                KhoiID: this.lessonDetail.KhoiID,
	            }
	            ajaxCALL('lms/EL_Teacher_GetLessonFromHocLieu', payload, res => {
	                this.DataHocLieu = res.data[0]
	                this.DataLesson = res.data[1].map(item => {
	                    let objFindHocLieu = res.data[0].find(i => i.HocLieuID === item.HocLieuID)
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
	            let source = JSON.parse(lesson.DataJson).htmlContent
	            console.log('importLesson', lesson)
	            this.$emit('importJson', source)
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