<template>
	<v-card :id="question.id" class="question-card mb-2" flat border>
		<v-card-text class="px-2 pt-2 pb-2">
			<!-- Header -->
			<div class="d-flex align-center ga-2 mb-2 ">
				<v-chip v-if="questionTypeLabel" class="font-weight-medium pa-0" variant="text" :color="questionTypeLabel.color" size="small">
					{{ questionTypeLabel.label }}
				</v-chip>
				<v-spacer></v-spacer>
				<v-chip v-if="!isGraded" class="font-weight-medium pa-0" variant="text" size="small" :color="status.color" :variant="status.variant">
					{{ status.label }}
				</v-chip>
				<v-chip color="primary" class="font-weight-medium pa-0" variant="text" size="small">
					{{ question.points }}đ
				</v-chip>
				<v-btn v-if="submissionStatus < 2" size="small"
					:icon="isFlagged ? 'mdi-flag-variant' : 'mdi-flag-variant-outline'" color="red" variant="text"
					@click="$emit('flag')" v-tooltip="'Đánh dấu câu hỏi'"></v-btn>
			</div>

			<!-- Question Text -->
			<div class="d-flex ga-2 mb-2">
				<v-icon :color="iconColor" size="18">
					{{ statusIcon }}
				</v-icon>
				<b style="flex-shrink: 0;">Câu {{ questionNumber }}:</b>
				<uc-latex-view class="question-text flex-column justify-start flex-grow-1" :escape-html="false"
					v-model:content="question.config.questionText" style="align-items: start !important;" />
			</div>

			<!-- Media - Lazy load khi visible -->
			<div v-if="question.config.media && shouldLoadMedia" class="media-container mb-2">
				<div v-if="question.config.media.sourceYT.source.length > 0" class="youtube-container">
					<iframe :src="renderUrlYoutube(question.config.media.sourceYT.source)" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen loading="lazy"></iframe>
				</div>

				<uc-wave-audio-player v-if="question.config.media.sourceRecord.source.length > 0"
					v-model:audioUrl="question.config.media.sourceRecord.source" />

				<div v-if="question.config.media.sourceFiles.image?.length > 0" style="min-height: fit-content">
					<v-img v-for="file in question.config.media.sourceFiles.image" :key="file.source"
						:src="getImageUrl(file.source)" :lazy-src="getImageUrl(file.source, 'w200')" class="rounded-lg"
						max-height="400" loading="lazy">
						<template #placeholder>
							<v-row align="center" class="fill-height ma-0" justify="center">
								<v-progress-circular color="grey-lighten-5" indeterminate />
							</v-row>
						</template>
					</v-img>
				</div>

				<div v-if="question.config.media.sourceFiles.file?.length > 0">
					<iframe v-for="file in question.config.media.sourceFiles.file" :key="file.source" :src="file.source"
						style="width: 100%; height: 400px;" loading="lazy"></iframe>
				</div>
			</div>

			<!-- Answer Component -->
			<component :is="questionComponent" :question="question" :answer="answer" :grading="grading" :isGrade="false"
				@answer-change="$emit('update:answer', $event)" :readonly="readonly"
				:submissionstatus="submissionStatus" :max-points="question.points"
				:student-comment="grading?.comment || ''" :is-block-copy-paste="isBlockCopyPaste" />
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		name: 'QuestionCard',
		props: {
			question: {
				type: Object,
				required: true
			},
			questionNumber: {
				type: Number,
				required: true
			},
			answer: {
				type: [Object, String, Array],
				default: null
			},
			grading: {
				type: Object,
				default: () => ({})
			},
			readonly: {
				type: Boolean,
				default: false
			},
			submissionStatus: {
				type: Number,
				default: 0
			},
			isBlockCopyPaste: {
				type: Boolean,
				default: false
			},
			isFlagged: {
				type: Boolean,
				default: false
			},
			status: {
				type: Object,
				default: () => ({ label: '', color: '', variant: '' })
			},
			statusIcon: {
				type: String,
				default: 'mdi-help-box-outline'
			},
			iconColor: {
				type: String,
				default: 'grey'
			}
		},
		emits: ['update:answer', 'flag'],
	
		data() {
			return {
				shouldLoadMedia: false,
				observer: null
			};
		},
	
		computed: {
			isGraded() {
				return this.submissionStatus === 4;
			},
	
			questionTypeLabel() {
				return questionsTypesLabel(this.question.type);
			},
	
			questionComponent() {
				const map = {
					'QUIZ_SINGLE_CHOICE': 'uc-question-single-choice',
					'QUIZ_MULTIPLE_CHOICE': 'uc-question-multiple-choice',
					'QUIZ_TRUE_FALSE': 'uc-question-true-false',
					'QUIZ_MULTIPLE_TRUE_FALSE': 'uc-question-multiple-true-false',
					'QUIZ_FILL_IN_BLANK': 'uc-question-fill-in-blank',
					'QUIZ_MATCHING': 'uc-question-matching',
					'SHORT_ANSWER': 'uc-question-short-answer',
					'ESSAY': 'uc-question-essay',
					'FILE_UPLOAD': 'uc-question-file-upload',
					'AUDIO_RESPONSE': 'uc-question-audio-response'
				};
				return map[this.question.type] || 'div';
			}
		},
	
		mounted() {
			// Lazy load media khi card visible (Intersection Observer)
			if (this.question.config.media) {
				this.observer = new IntersectionObserver(
					(entries) => {
						entries.forEach(entry => {
							if (entry.isIntersecting && !this.shouldLoadMedia) {
								this.shouldLoadMedia = true;
								this.observer.disconnect();
							}
						});
					},
					{
						rootMargin: '50px' // Load trước 50px khi sắp vào viewport
					}
				);
	
				this.observer.observe(this.$el);
			} else {
				this.shouldLoadMedia = true;
			}
		},
	
		beforeUnmount() {
			if (this.observer) {
				this.observer.disconnect();
			}
		},
	
		methods: {
			renderUrlYoutube(url) {
				if (!url) return '';
				let videoId = '';
				const standardMatch = url.match(/[?&]v=([^&]+)/);
				if (standardMatch) videoId = standardMatch[1];
				const shortMatch = url.match(/youtu\.be\/([^?]+)/);
				if (shortMatch) videoId = shortMatch[1];
				const embedMatch = url.match(/embed\/([^?]+)/);
				if (embedMatch) videoId = embedMatch[1];
				if (videoId) return `https://www.youtube.com/embed/${videoId}`;
				return url;
			},
	
			getDriveFileId(url) {
				if (!url) return null;
				const match = url.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			},
	
			getImageUrl(url, size = 'w1000') {
				const fileId = this.getDriveFileId(url);
				return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}` : url;
			}
		}
	}
</script>