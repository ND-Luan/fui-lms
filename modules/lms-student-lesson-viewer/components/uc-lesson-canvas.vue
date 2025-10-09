<template>
	<div class="lesson-canvas">
		<!-- Giao diện khi canvas rỗng -->
		<div v-if="!elements || elements.length === 0" class="text-center pa-10 text-grey empty-canvas">
			<v-icon size="64" class="mb-4">mdi-file-plus-outline</v-icon>
			<p>
				{{
					isViewer ? 'Bài giảng này chưa có nội dung.' : `Bắt đầu thêm nội dung cho bài giảng của bạn từ thư viện
				bên trái.`
				}}
			</p>
		</div>

		<div v-for="(element, index) in elements" :key="element.ElementID || index" :id="'element-' + index"
			class="element-preview"
			:class="{ 'selectable': !isViewer, 'selected': !isViewer && selectedIndex === index }"
			@click="!isViewer && $emit('update:selectedIndex', index)">

			<!-- Nút xóa (chỉ ở chế độ soạn bài) -->
			<v-btn v-if="!isViewer" icon size="x-small" variant="text" @click.stop="removeElement(index)"
				class="delete-btn">
				<v-icon>mdi-delete-outline</v-icon>
			</v-btn>

			<!-- Tiêu đề nâng cấp -->
			<div v-if="element.ElementData.title" class="element-title"
				:style="{ color: isViewer ? getVisualsForType(element.ElementType).color : 'inherit' }">
				<v-icon v-if="isViewer" :icon="getVisualsForType(element.ElementType).icon" class="mr-3" size="22">
				</v-icon>
				<span>{{ element.ElementData.title }}</span>
			</div>

			<div class="element-content" :class="{ 'with-title': !!element.ElementData.title }">
				<div v-if="element.ElementType === 'TEXT'" v-html="element.ElementData.content" class="text-content">
				</div>

				<div v-else-if="element.ElementType === 'IMAGE'" class="d-flex ga-2 flex-wrap">
					<div v-for="(file, fileIndex) in element.ElementData.sources" :key="file.source + fileIndex"
						style="width: 100vw">
						<v-img
							:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w10000'">
						</v-img>
						<p class="text-caption text-center text-medium-emphasis mt-1">{{ file.caption }}</p>
					</div>
				</div>

				<div v-else-if="element.ElementType === 'YOUTUBE'">
					<iframe v-if="getYoutubeEmbedUrl(element.ElementData.source)" width="100%" height="400"
						:src="getYoutubeEmbedUrl(element.ElementData.source)" title="YouTube video player"
						frameborder="0" allowfullscreen class="rounded-lg"></iframe>
					<div v-else class="text-center text-grey pa-4 border rounded">URL video không hợp lệ.</div>
				</div>

				<div v-else-if="element.ElementType === 'FILE'" class="d-flex ga-2 flex-wrap">
					<v-chip class="chip-style" v-for="(file, fileIndex) in element.ElementData.sources"
						:key="file.source + fileIndex" @click="window.open(file.source, '_blank')" label
						prepend-icon="mdi-download" color="primary">{{ file.name }}
					</v-chip>
				</div>

				<div v-else-if="element.ElementType === 'AUDIO'">
					<uc-wave-audio-player :audio-url="element.ElementData.source" />
				</div>
				<div v-else-if="element.ElementType === 'HTML'" style="width: 100%">
					<iframe :srcdoc="element.ElementData.source" sandbox="allow-scripts allow-popups allow-forms"
						style="width: 100%;height: 600px;">
					</iframe>
				</div>
				<!-- <div v-else-if="element.ElementType?.includes('QUIZ')">
					<div v-html="element.ElementData?.config?.questionText" />
					<component :is="getQuestionComponent(element.ElementType)" :question="element.ElementData"
						:answer="getAnswerForChild(element)" :isGrade="false" :readonly="false" />
				</div> -->

				<div v-else class="text-center pa-4 text-grey">
					<v-icon size="32">{{ getVisualsForType(element.ElementType).icon }}</v-icon>
					<p class="mt-2">{{ getVisualsForType(element.ElementType).label }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'uc-lesson-canvas',
	props: {
		elements: Array,
		selectedIndex: Number,
		isViewer: { type: Boolean, default: false }
	},
	emits: ['update:elements', 'update:selectedIndex'],
	data() {
		return {
			window,
			elementTypes: [
				{ type: 'TEXT', label: 'Đoạn văn bản', icon: 'mdi-text-long', color: '#3B82F6' },
				{ type: 'IMAGE', label: 'Hình ảnh', icon: 'mdi-image-multiple-outline', color: '#8B5CF6' },
				{ type: 'YOUTUBE', label: 'Video', icon: 'mdi-youtube', color: '#EF4444' },
				{ type: 'FILE', label: 'Tệp đính kèm', icon: 'mdi-paperclip', color: '#F97316' },
				{ type: 'AUDIO', label: 'Audio', icon: 'mdi-volume-high', color: '#10B981' },
				{ type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-help-circle-outline', color: '#0EA5E9' },
				{ type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-help-circle-outline', color: '#0EA5E9' },
				{ type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-help-circle-outline', color: '#0EA5E9' },
				{ type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-help-circle-outline', color: '#0EA5E9' },
				{ type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-help-circle-outline', color: '#0EA5E9' },
			]
		}
	},
	methods: {
		removeElement(index) {
			if (this.isViewer) return;
			const element = this.elements[index];

			if (element && element.ElementID) {
				ajaxCALL('lms/EL_Element_Delete', { ElementID: element.ElementID }, res => {
					CALL('getLessonData');
					if (this.selectedIndex === index) {
						this.$emit('update:selectedIndex', null);
					}
				});
			} else {
				const newElements = [...this.elements];
				newElements.splice(index, 1);
				this.$emit('update:elements', newElements);
				if (this.selectedIndex === index) {
					this.$emit('update:selectedIndex', null);
				}
			}
		},
		getYoutubeEmbedUrl(url) {
			if (!url || typeof url !== 'string') return null;
			let videoId = null;
			const patterns = [
				/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
				/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
				/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
			];
			for (const pattern of patterns) {
				const match = url.match(pattern);
				if (match && match[1]) {
					videoId = match[1];
					break;
				}
			}
			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		},
		getDriveFileId(url) {
			if (!url) return null;
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

		// =================================================================
		// == SỬA LỖI LOGIC TẠI ĐÂY                                      ==
		// =================================================================
		getAnswerForChild(element) {
			const config = element.ElementData?.config;
			if (!config) return null;

			// --- Ở chế độ Học bài của Học sinh (isViewer = true) ---
			// Trả về kiểu dữ liệu đúng nhưng rỗng để component con không bị lỗi
			if (this.isViewer) {
				switch (element.ElementType) {
					case 'QUIZ_MULTIPLE_CHOICE': return []; // Trả về mảng rỗng
					case 'QUIZ_MATCHING': return []; // Trả về mảng rỗng
					case 'QUIZ_FILL_IN_BLANK': return {}; // Trả về object rỗng
					default: return null; // Các trường hợp khác (single-choice, true-false) có thể nhận null
				}
			}

			// --- Ở chế độ Soạn bài của Giáo viên (isViewer = false) ---
			// Giữ nguyên logic cũ để giáo viên thấy đáp án đúng
			let answerObject = null;
			switch (element.ElementType) {
				case 'QUIZ_SINGLE_CHOICE': answerObject = config.correctAnswer; break;
				case 'QUIZ_MULTIPLE_CHOICE': answerObject = config.correctAnswers; break;
				case 'QUIZ_TRUE_FALSE': answerObject = config.correctAnswer; break;
				case 'QUIZ_FILL_IN_BLANK': {
					const blanks = config.parts?.filter(item => item.type === 'blank');
					const obj = {};
					if (blanks) {
						for (var item of blanks) {
							obj[item.id] = item.acceptedAnswers?.[0];
						}
					}
					answerObject = obj;
					break;
				}
				case 'QUIZ_MATCHING': answerObject = config.correctPairs; break;
			}
			return answerObject;
		},

		getVisualsForType(elementType) {
			const defaults = { label: 'Thành phần không xác định', icon: 'mdi-file-question-outline', color: '#4B5563' };
			if (!elementType) return defaults;
			const found = this.elementTypes.find(t => t.type === elementType);
			return found || defaults;
		},
	}
}
</script>