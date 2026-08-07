<template>
	<div class="lesson-canvas">
		<div v-if="!elements || elements.length === 0" class="text-center pa-10 text-grey empty-canvas">
			<v-icon size="64" class="mb-4">mdi-file-plus-outline</v-icon>
			<p>{{ $t('message.StartAddingContent') }}</p>
		</div>

		<div v-for="(element, index) in elements" :key="index" class="element-preview"
			:class="{ 'selected': selectedIndex === index }" @click="$emit('update:selectedIndex', index)">
			<div class="d-flex ga-2 element-title">
				<p v-if="element.ElementData.title" style="word-break: break-word; width: 97%">
					{{ element.ElementData.title }}
				</p>
				<v-btn size="x-small" variant="text" @click.stop="removeElement(index)" class="delete-btn"
					icon="mdi-delete-outline" />
			</div>

			<div class="element-content" :class="{'with-title': element.ElementData.title}">
				<div v-if="element.ElementType === 'TEXT'">
					<div v-if="element.ElementData.content" v-html="element.ElementData.content" class="text-content"
						style="word-break: auto-phrase;" />
					<div v-else class="empty-element-state">
						<v-icon>mdi-text-box-remove-outline</v-icon>
						<span>Chưa có nội dung văn bản</span>
					</div>
				</div>

				<div v-else-if="element.ElementType === 'IMAGE'">
					<div v-if="element.ElementData.sources?.length" class="d-flex ga-2">
					<div v-for="file in element.ElementData.sources" style="width: 200px">
						<v-img
							:src="'https://drive.google.com/thumbnail?id='+ getDriveFileId(file.source) + '&sz=w1000'"
							:lazy-src="'https://drive.google.com/thumbnail?id='+ getDriveFileId(file.source) + '&sz=w1000'">
							<template v-slot:placeholder>
								<div class="d-flex align-center justify-center fill-height">
									<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
								</div>
							</template>
						</v-img>
						<p class="text-caption text-center text-medium-emphasis">{{ file.caption }}</p>
					</div>
					</div>
					<div v-else class="empty-element-state">
						<v-icon>mdi-image-off-outline</v-icon>
						<span>Chưa có hình ảnh</span>
					</div>
				</div>

				<div v-else-if="element.ElementType === 'YOUTUBE'">
					<iframe v-if="element.ElementData.source.length > 0" width="100%" height="400"
						:src="renderUrlYoutube(element.ElementData.source)" title="YouTube video player" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen></iframe>
					<div v-else class="empty-element-state">
						<v-icon>mdi-youtube-off</v-icon>
						<span>Chưa có video</span>
					</div>
				</div>
				<div v-else-if="element.ElementType === 'FILE'">
					<div v-if="element.ElementData.sources?.length" class="file-source-grid">
					<div v-for="(file, fileIndex) in element.ElementData.sources" :key="file.id || fileIndex"
						class="file-source-card">
						<iframe v-if="file.source" class="file-source-iframe" :src="file.source" :title="file.name"
							loading="lazy" />
						<div v-else class="file-source-fallback">
							<v-icon size="36" color="primary">mdi-file-outline</v-icon>
							<div class="file-source-name" :title="file.name">{{ file.name }}</div>
							<v-btn :href="file.source" target="_blank" rel="noopener" size="small" variant="outlined"
								color="primary">
								<v-icon start size="16">mdi-open-in-new</v-icon> Mở tệp
							</v-btn>
						</div>
					</div>
					</div>
					<div v-else class="empty-element-state">
						<v-icon>mdi-file-alert-outline</v-icon>
						<span>Chưa có tệp đính kèm</span>
					</div>
				</div>

				<div v-else-if="element.ElementType === 'AUDIO'">
					<uc-wave-audio-player v-if="element.ElementData.source" :audio-url="element.ElementData.source" />
					<div v-else class="empty-element-state">
						<v-icon>mdi-volume-off</v-icon>
						<span>Chưa có âm thanh</span>
					</div>
				</div>
				<div v-else-if="element.ElementType === 'HTML'" style="width: 100%">
					<!-- <div v-html="element.ElementData.source" /> -->
					<template v-if="element.ElementData.source">
					<iframe v-if="element.ElementData?.IsHTML" :srcdoc="element.ElementData.source"
						sandbox="allow-scripts allow-popups allow-forms allow-same-origin" style="width: 100%;height: 600px;">
					</iframe>

					<iframe v-else :src="element.ElementData.source"
						sandbox="allow-scripts allow-popups allow-forms allow-same-origin" style="width: 100%;height: 600px;">
					</iframe>
					</template>
					<div v-else class="empty-element-state">
						<v-icon>mdi-language-html5</v-icon>
						<span>Chưa có nội dung HTML</span>
					</div>
				</div>
				<div v-else-if="element.ElementType?.includes('QUIZ')">
					<template v-if="element.ElementData.config?.questionText">
						<uc-latex-view :content="element.ElementData.config.questionText" />
						<component :is="getQuestionComponent(element.ElementType)" :question="element.ElementData"
							:answer="getAnswerForChild(element)" :isGrade="false" :readonly="true" />
					</template>
					<div v-else class="empty-element-state">
						<v-icon>mdi-help-box-outline</v-icon>
						<span>Chưa có nội dung câu hỏi</span>
					</div>
				</div>

				<div v-else class="text-center pa-4 text-grey">
					<v-icon size="32">{{ getIconForType(element.ElementType) }}</v-icon>
					<p class="mt-2">{{ getLabelForType(element.ElementType) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-lesson-canvas',
		props: ['elements', 'selectedIndex'],
		emits: ['update:elements', 'update:selectedIndex'],
		data() {
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return {
				window,
				elementTypes: [
					{ value: 'TEXT', label: this.$t('message.TextBlock'), icon: 'mdi-format-text' },
					{ value: 'IMAGE', label: this.$t('message.Image'), icon: 'mdi-image-outline' },
					{ value: 'YOUTUBE', label: 'Video', icon: 'mdi-youtube' },
					{ value: 'FILE', label: this.$t('message.Attachment'), icon: 'mdi-paperclip' },
					{ value: 'AUDIO', label: 'Audio', icon: 'mdi-volume-high' },
					{ value: 'HTML', label: 'HTML', icon: 'mdi-language-html5' },
					// { value: 'QUIZ', label: 'Câu hỏi nhanh', icon: 'mdi-frequently-asked-questions' },
					// { type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-radiobox-marked' },
					// { type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-checkbox-multiple-marked-outline' },
					// { type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline' },
					// { type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox' },
					// { type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge' },
				]
			}
		},
		methods: {
			async removeElement(index) {
				const element = this.elements[index]
				try {
					const sources = element?.ElementData?.sources ||
						(element?.ElementData?.source ? [{ source: element.ElementData.source }] : [])
					const driveSources = sources.filter(file => this.getDriveFileId(file.source))
					if (driveSources.length) {
						const { access_token } = await new Promise(resolve => {
							ajaxCALL('lms/FP_Youtube_Token_Get', null, res => resolve(res?.data || res || {}))
						})
						await Promise.all(driveSources.map(file => fetch(
							`https://www.googleapis.com/drive/v3/files/${this.getDriveFileId(file.source)}`,
							{ method: 'DELETE', headers: { Authorization: `Bearer ${access_token}` } }
						).then(response => {
							if (!response.ok) throw new Error(`Xóa file Google Drive thất bại: ${response.statusText}`)
						})))
					}
					await new Promise((resolve, reject) => ajaxCALL('lms/EL_Element_Delete', {
						ElementID: element.ElementID
					}, response => response?.data ? resolve(response) : reject(new Error('Xóa nội dung bài học thất bại'))))
					CALL('getLessonData')
					if (this.selectedIndex === index) this.$emit('update:selectedIndex', null)
				} catch (error) {
					console.error('Lỗi xóa block bài học:', error)
					Vue.$toast.error(error.message || 'Không thể xóa nội dung bài học', { position: 'top' })
				}
				// this.$emit('update:elements', newElements);
				// newElements.splice(index, 1);
	
			},

			getDriveFileId(url) {
				if (!url || typeof url !== 'string') return null
				const match = url.match(/\/d\/([^/]+)/)
				return match?.[1] || null
			},
	
			getYoutubeEmbedUrl(url) {
				if (!url || typeof url !== 'string') return null;
				let videoId = null;
				const urlParts = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
				videoId = (urlParts[2] !== undefined) ? urlParts[2].split(/[^0-9a-z_\-]/i)[0] : urlParts[0];
	
				if (videoId) {
					return `https://www.youtube.com/embed/${videoId}`;
				}
				return null;
			},
	
			getIconForType(type) {
				const found = this.elementTypes.find(t => t.value === type);
				return found ? found.icon : 'mdi-help-box';
			},
	
			getLabelForType(type) {
				const found = this.elementTypes.find(t => t.value === type);
				return found ? found.label : this.$t('message.UnknownComponent');
			},
			getDriveFileId(url) {
				const match = url.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			},
			getQuestionComponent(type) {
				const map = {
					'QUIZ_SINGLE_CHOICE': 'uc-question-single-choice',
					'QUIZ_MULTIPLE_CHOICE': 'uc-question-multiple-choice',
					'QUIZ_TRUE_FALSE': 'uc-question-true-false',
					'QUIZ_FILL_IN_BLANK': 'uc-question-fill-in-blank',
					'QUIZ_MATCHING': 'uc-question-matching',
				};
				return map[type] || 'div';
			},
			getAnswerForChild(element) {
				let answerObject = null
				if (element.ElementType === 'QUIZ_SINGLE_CHOICE') answerObject = element.ElementData.config?.correctAnswer
				if (element.ElementType === 'QUIZ_MULTIPLE_CHOICE') answerObject = element.ElementData.config?.correctAnswers
				if (element.ElementType === 'QUIZ_TRUE_FALSE') answerObject = element.ElementData.config?.correctAnswer
				if (element.ElementType === 'QUIZ_FILL_IN_BLANK') {
					const _ = element.ElementData.config.parts.filter(item => item.type == 'blank') //.map(item => item.acceptedAnswers[0]).join(", ")
					const obj = {}
					for (var item of _) {
						obj[item.id] = item.acceptedAnswers[0]
					}
					answerObject = obj
				}
				if (element.ElementType === 'QUIZ_MATCHING') answerObject = element.ElementData.config?.correctPairs
				return answerObject;
			},
			renderUrlYoutube
		}
	}
</script>