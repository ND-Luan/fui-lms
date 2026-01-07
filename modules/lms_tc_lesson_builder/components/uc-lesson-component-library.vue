<template>
	<v-card flat>
		<v-card-title class="text-subtitle-1">{{ $t('message.ContentLibrary') }}</v-card-title>
		<v-divider></v-divider>
		<v-list density="compact" nav>
			<v-list-item v-for="item in contentElements" :key="item.type" @click="$emit('add-element', item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" :color="item.color || 'primary'"></v-icon>
				</template>
				<v-list-item-title>{{ item.label }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-card>
</template>

<script>
	export default {
		name: 'uc-lesson-component-library',
		emits: ['add-element'],
		data() {
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return {
				contentElements: [
					{
						type: 'TEXT', label: this.$t('message.TextBlock'), icon: 'mdi-format-text', defaultData: {
							title: this.$t('message.TextTitle'),
							content: `<p>${this.$t('message.NewTextContent')}</p>`
						}
					},
					{
						type: 'IMAGE', label: this.$t('message.Image'), icon: 'mdi-image-outline',
						defaultData: {
							title: this.$t('message.ImageTitle'),
							sources: []
						}
					},
					{
						type: 'YOUTUBE', label: 'Video (YouTube)', icon: 'mdi-youtube',
						defaultData: {
							title: this.$t('message.YoutubeTitle'),
							source: ''
						}
					},
					{
						type: 'FILE', label: this.$t('message.Attachment'), icon: 'mdi-paperclip',
						defaultData: {
							title: this.$t('message.FileTitle'),
							sources: []
						}
					},
					{
						type: 'AUDIO', label: this.$t('message.Audio'), icon: 'mdi-volume-high', color: 'orange-darken-2',
						defaultData: {
							title: this.$t('message.AudioTitle'),
							source: ''
						}
					},
					{
						type: 'HTML', label: 'HTML', icon: 'mdi-language-html5', color: 'orange-darken-2',
						defaultData: {
							title: this.$t('message.HtmlTitle'),
							IsHTML: true,
							source: ''
						}
					},
	
					// {
					// 	type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-radiobox-marked',
					// 	defaultData: {
					// 		config: {
					// 			isAdvanced: false,
					// 			questionText: 'Câu hỏi...',
					// 			options: [
					// 				{ id: 'opt1', text: 'A' },
					// 				{ id: 'opt2', text: 'B' }],
					// 			correctAnswer: 'opt1'
					// 		}
					// 	}
					// },
					// {
					// 	type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-checkbox-multiple-marked-outline',
					// 	defaultData: {
					// 		config: {
					// 			isAdvanced: false,
					// 			questionText: 'Câu hỏi...',
					// 			options: [
					// 				{ id: 'opt1', text: 'A' },
					// 				{ id: 'opt2', text: 'B' }],
					// 			correctAnswers: ['opt1', 'opt2']
					// 		}
					// 	}
					// },
					// {
					// 	type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline',
					// 	defaultData: {
					// 		config: {
					// 			isAdvanced: false,
					// 			questionText: 'Câu hỏi...',
					// 			options: [
					// 				{ id: true, text: 'Đúng' },
					// 				{ id: false, text: 'Sai' }],
					// 			correctAnswer: true
					// 		}
					// 	}
					// },
					// {
					// 	type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox',
					// 	defaultData: {
					// 		config: {
					// 			isAdvanced: false,
					// 			questionText: 'Câu hỏi...',
					// 			parts: [
					// 				{ type: 'text', value: 'Điền vào ' },
					// 				{ type: 'blank', id: 'blank_1', acceptedAnswers: ['chỗ trống'] },
					// 				{ type: 'text', value: ' này.' }
					// 			]
					// 		}
	
					// 	}
					// },
					// {
					// 	type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge',
					// 	defaultData: {
					// 		config: {
					// 			isAdvanced: false,
					// 			questionText: 'Câu hỏi...',
					// 			columnA: [],
					// 			columnB: [],
					// 			correctPairs: []
					// 		}
					// 	}
					// },
				]
			}
		}
	}
</script>