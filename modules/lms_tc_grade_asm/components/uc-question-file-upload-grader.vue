<template>
	<div class="grader-container">
		<div>
			<p class="text-subtitle-2 text-grey-darken-1 mb-2">Các file học sinh đã nộp:</p>
			<div v-if="answer && answer.length > 0">
				<v-chip v-for="(file, index) in answer" :key="file.fileId || index" class="ma-1"
					:color="getFileDetails(file.fileName, file.fileType).color" label>
					<v-icon left>{{ getFileDetails(file.fileName, file.fileType).icon }}</v-icon>
					<a :href="file.fileType === 'link' ? file.fileId : (urlReturnFile + '/FileData/' + file.fileId)"
						target="_blank" class="text-decoration-none ml-2">
						{{ truncateText(file.fileName, 40) }}
					</a>
				</v-chip>
			</div>
			<p class="text-grey" v-else><i>Học sinh không nộp file nào.</i></p>
		</div>

		<div class="mt-4 teacher-grading-area">
			<v-row>
				<v-col cols="12" sm="4">
					<label class="font-weight-medium">Điểm số</label>
					<v-text-field :model-value="grading ? grading.manualScore : 0" @update:model-value="updateScore"
						type="number" :max="question.points" min="0" step="0.25" outlined dense hide-details
						class="mt-2" :suffix="scoreSuffix" />
				</v-col>
				<v-col cols="12" sm="8">
					<label class="font-weight-medium">Nhận xét của giáo viên (tùy chọn)</label>
					<v-textarea :model-value="grading ? grading.teacherComment : ''"
						@update:model-value="updateTeacherComment" rows="2" outlined dense hide-details class="mt-2" />
				</v-col>
			</v-row>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-file-upload-grader',
		props: {
			question: Object,
			answer: Array,
			grading: Object
		},
		emits: ['grading-change'],
		data() {
			return {
				urlReturnFile: "https://file.lhbs.vn/lms"
			}
		},
		computed: {
			fileFilters() {
				return {
					"max_file_size": (this.question?.config?.maxFileSizeMB || 10) + "mb",
					"mime_types": [{
						"title": "Allowed files",
						"extensions": (this.question?.config?.allowedFileTypes || ["jpg", "jpeg", "png", "pdf", "docx"]).join(',')
					}]
				}
			},
			scoreSuffix() {
				const points = this.question?.points || 0;
				return `/ ${points}`;
			}
		},
		methods: {
			updateScore(newScore) {
				const score = parseFloat(newScore);
				if (isNaN(score) || score < 0 || score > this.question.points) return;
				const newGrading = { ...this.grading, manualScore: score };
				this.$emit('grading-change', newGrading);
			},
			updateTeacherComment(newComment) {
				const newGrading = { ...this.grading, teacherComment: newComment };
				this.$emit('grading-change', newGrading);
			},
			truncateText(value, length) {
				if (!value) return '';
				if (value.length <= length) return value;
				return value.substring(0, length) + '...';
			},
			getFileDetails(fileName, fileType) {
				if (!fileName) return { icon: 'mdi-file-question-outline', color: 'grey' };
				if (fileType === 'link') {
					if (fileName.includes('youtube.com') || fileName.includes('youtu.be')) return { icon: 'mdi-youtube', color: 'red' };
					if (fileName.includes('drive.google.com')) return { icon: 'mdi-google-drive', color: 'orange' };
					return { icon: 'mdi-link-variant', color: 'info' };
				}
				const extension = fileName.split('.').pop().toLowerCase();
				const fileTypes = {
					'jpg': { icon: 'mdi-file-image-outline', color: 'deep-purple accent-4' },
					'jpeg': { icon: 'mdi-file-image-outline', color: 'deep-purple accent-4' },
					'png': { icon: 'mdi-file-image-outline', color: 'deep-purple accent-4' },
					'pdf': { icon: 'mdi-file-pdf-box', color: 'red' },
					'doc': { icon: 'mdi-file-word-box', color: 'blue' },
					'docx': { icon: 'mdi-file-word-box', color: 'blue' },
					'default': { icon: 'mdi-file-outline', color: 'primary' }
				};
				return fileTypes[extension] || fileTypes['default'];
			}
		}
	}
</script>