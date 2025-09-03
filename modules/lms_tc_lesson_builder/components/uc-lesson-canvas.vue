<template>
	<div class="lesson-canvas">
		<div v-if="!elements || elements.length === 0" class="text-center pa-10 text-grey empty-canvas">
			<v-icon size="64" class="mb-4">mdi-file-plus-outline</v-icon>
			<p>Bắt đầu thêm nội dung cho bài giảng của bạn từ thư viện bên trái.</p>
		</div>

		<div v-for="(element, index) in elements" :key="index" class="element-preview"
			:class="{ 'selected': selectedIndex === index }" @click="$emit('update:selectedIndex', index)">
			<v-btn icon size="x-small" variant="text" @click.stop="removeElement(index)" class="delete-btn">
				<v-icon>mdi-delete-outline</v-icon>
			</v-btn>

			<p v-if="element.ElementData.title" class="element-title" style="word-break: break-word">
				{{ element.ElementData.title }}
			</p>

			<div class="element-content" :class="{'with-title': element.ElementData.title}">
				<div v-if="element.ElementType === 'TEXT'" v-html="element.ElementData.content" class="text-content" />

				<div v-else-if="element.ElementType === 'IMAGE'" class="d-flex ga-2">
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

				<div v-else-if="element.ElementType === 'YOUTUBE'">
					<iframe v-if="element.ElementData.source.length > 0" width="100%" height="400"
						:src="element.ElementData.source.replace('watch?v=', 'embed/')" title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen></iframe>
					<div v-else class="text-center text-grey pa-4">Chưa có video</div>
				</div>
				<div v-else-if="element.ElementType === 'FILE'" class="d-flex ga-2">
					<v-chip v-for="file in element.ElementData.sources" @click="window.open(file.source)"
						label>{{file.name}} </v-chip>
				</div>

				<div v-else-if="element.ElementType === 'AUDIO'">
					<uc-wave-audio-player :audio-url="element.ElementData.source" />
				</div>
				<div v-else-if="element.ElementType === 'HTML'" style="width: 100%">
					<iframe :srcdoc="element.ElementData.source" sandbox="allow-scripts allow-popups allow-forms"
						style="width: 100%;height: 600px;">
					</iframe>
				</div>
				<div v-else-if="element.ElementType?.includes('QUIZ')">
					<uc-latex-view :content="element.ElementData.config.questionText" />
					<component :is="getQuestionComponent(element.ElementType)" :question="element.ElementData"
						:answer="getAnswerForChild(element)" :isGrade="false" :readonly="true" />
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
			return {
				window,
				elementTypes: [
					{ value: 'TEXT', label: 'Đoạn văn bản', icon: 'mdi-format-text' },
					{ value: 'IMAGE', label: 'Hình ảnh', icon: 'mdi-image-outline' },
					{ value: 'YOUTUBE', label: 'Video', icon: 'mdi-youtube' },
					{ value: 'FILE', label: 'Tệp đính kèm', icon: 'mdi-paperclip' },
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
			removeElement(index) {
				const element = this.elements[index]
				ajaxCALL('lms/EL_Element_Delete', {
					ElementID: element.ElementID
				}, res => {
					CALL('getLessonData')
					if (this.selectedIndex === index) {
						this.$emit('update:selectedIndex', null);
					}
				})
				// this.$emit('update:elements', newElements);
				// newElements.splice(index, 1);
	
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
				return found ? found.label : 'Thành phần không xác định';
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
		}
	}
</script>