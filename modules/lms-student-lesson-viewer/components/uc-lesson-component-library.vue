<template>
	<v-card flat>
		<v-card-title class="text-subtitle-1">Thư viện Nội dung</v-card-title>
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
			return {
				contentElements: [
					{ type: 'TEXT', label: 'Đoạn văn bản', icon: 'mdi-format-text', defaultData: { content: '<p>Nội dung văn bản mới...</p>' } },
					{
						type: 'IMAGE', label: 'Hình ảnh', icon: 'mdi-image-outline',
						defaultData: {
							title: "Tiêu đề hình ảnh",
							sources: []
						}
					},
					{
						type: 'YOUTUBE', label: 'Video (YouTube)', icon: 'mdi-youtube',
						defaultData: {
							title: "Tiêu đề yotube",
							source: ''
						}
					},
					{
						type: 'FILE', label: 'Tệp đính kèm', icon: 'mdi-paperclip',
						defaultData: {
							title: "Tiêu đề file",
							sources: []
						}
					},
					{
						type: 'AUDIO', label: 'Audio (Ghi âm/Tải lên)', icon: 'mdi-volume-high', color: 'orange-darken-2',
						defaultData: {
							title: "Tiêu đề audio",
							source: ''
						}
					},
					// {
					//     type: 'QUIZ', label: 'Câu hỏi nhanh (Quiz)', icon: 'mdi-frequently-asked-questions', color: 'green-darken-1',
					//     defaultData: {
					//         question: 'Câu hỏi...',
					//         options: [
					//             { id: 'opt1', text: 'A' },
					//             { id: 'opt2', text: 'B' }],
					//         answer: 'opt1'
					//     }
					// },
					{
						type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-radiobox-marked',
						defaultData: {
							config: {
								isAdvanced: false,
								questionText: 'Câu hỏi...',
								options: [
									{ id: 'opt1', text: 'A' },
									{ id: 'opt2', text: 'B' }],
								correctAnswer: 'opt1'
							}
						}
					},
					{
						type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-checkbox-multiple-marked-outline',
						defaultData: {
							config: {
								isAdvanced: false,
								questionText: 'Câu hỏi...',
								options: [
									{ id: 'opt1', text: 'A' },
									{ id: 'opt2', text: 'B' }],
								correctAnswers: ['opt1', 'opt2']
							}
						}
					},
					{
						type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline',
						defaultData: {
							config: {
								isAdvanced: false,
								questionText: 'Câu hỏi...',
								options: [
									{ id: true, text: 'Đúng' },
									{ id: false, text: 'Sai' }],
								correctAnswer: true
							}
						}
					},
					{
						type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox',
						defaultData: {
							config: {
								isAdvanced: false,
								questionText: 'Câu hỏi...',
								parts: [
									{ type: 'text', value: 'Điền vào ' },
									{ type: 'blank', id: 'blank_1', acceptedAnswers: ['chỗ trống'] },
									{ type: 'text', value: ' này.' }
								]
							}
	
						}
					},
					{
						type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge',
						defaultData: {
							config: {
								isAdvanced: false,
								questionText: 'Câu hỏi...',
								columnA: [],
								columnB: [],
								correctPairs: []
							}
						}
					},
				]
			}
		}
	}
</script>