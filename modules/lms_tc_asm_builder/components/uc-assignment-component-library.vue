<template>
	<v-card>
		<p class="ma-2 text-subtitle-1 font-weight-medium">{{ $t('message.QuestionLibrary') }}</p>
		<v-divider></v-divider>
		<v-list density="compact" nav class="pa-0">
			<v-list-subheader>{{ $t('message.InteractiveQuiz') }}</v-list-subheader>
			<v-list-item v-for="item in quizComponents" :key="item.type" @click="selectComponent(item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" color="primary"></v-icon>
				</template>
				<v-list-item-title>{{ IsEngLish ? item.label_EN : item.label}}</v-list-item-title>
				<v-list-item-subtitle v-if="item?.description">{{ IsEngLish ? item.description_EN :item.description
					}}</v-list-item-subtitle>
			</v-list-item>
			<v-divider class="my-2"></v-divider>
			<v-list-subheader>{{ $t('message.EssayAndPracticeQuestions') }}</v-list-subheader>
			<v-list-item v-for="item in manualComponents" :key="item.type" @click="selectComponent(item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" color="orange-darken-2"></v-icon>
				</template>
				<v-list-item-title>{{ IsEngLish ? item.label_EN : item.label}}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-card>
</template>

<script>
	export default {
		name: 'uc-assignment-component-library',
		emits: ['add-component'],
		data() {
			const toggle = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
			this.$i18n.locale = toggle ? "en" : "vi"
			return {
				quizComponents: [
					{ type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm', label_EN: 'Single Choice', description_EN: 'Single Choice', description: "Một đáp án", icon: 'mdi-radiobox-marked', kind: "quiz" },
					{ type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm', label_EN: 'Multiple Choice', description_EN: 'Multiple Choice', description: "Nhiều đáp án", icon: 'mdi-checkbox-multiple-marked-outline', kind: "quiz" },
					{ type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', label_EN: 'True / False', icon: 'mdi-check-circle-outline', kind: "quiz" },
					{ type: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều đúng / Sai', label_EN: 'Multiple True / False', icon: 'mdi-check-circle-outline', kind: "quiz" },
					{ type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', label_EN: 'Fill in the Blank', icon: 'mdi-form-textbox', kind: "quiz" },
					{ type: 'QUIZ_MATCHING', label: 'Ghép nối', label_EN: 'Matching', icon: 'mdi-merge', kind: "quiz" },
	
					// { type: 'QUIZ_MATCHING_V2', label: 'Ghép nối V2', icon: 'mdi-merge', kind: "quiz" },
				],
				manualComponents: [
					{ type: 'SHORT_ANSWER', label: 'Trả lời ngắn', label_EN: 'Short Answer', icon: 'mdi-text-short', kind: "manual" },
					{ type: 'ESSAY', label: 'Tự luận', label_EN: 'Essay', description: "Soạn thảo", icon: 'mdi-text-long', kind: "manual" },
					{ type: 'FILE_UPLOAD', label: 'Nộp File', label_EN: 'File Upload', icon: 'mdi-upload-multiple', kind: "manual" },
					{ type: 'AUDIO_RESPONSE', label: 'Ghi âm trả lời', label_EN: 'Audio Response', icon: 'mdi-microphone-plus', kind: "manual" },
	
				]
			}
		},
		computed: {
			IsEngLish: function () {
				return this.$i18n.locale == 'en'
			}
		},
		methods: {
			selectComponent(componentInfo) {
				this.$emit('add-component', componentInfo);
			}
		}
	}
</script>