<template>
	<v-card>
		<p class="ma-2 text-subtitle-1 font-weight-medium">Thư viện câu hỏi</p>
		<v-divider></v-divider>
		<v-list density="compact" nav class="pa-0">
			<v-list-subheader>CÂU HỎI TƯƠNG TÁC (QUIZ)</v-list-subheader>
			<v-list-item v-for="item in quizComponents" :key="item.type" @click="selectComponent(item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" color="primary"></v-icon>
				</template>
				<v-list-item-title>{{ item.label }}</v-list-item-title>
				<v-list-item-subtitle v-if="item?.description">{{ item.description }}</v-list-item-subtitle>
			</v-list-item>
			<v-divider class="my-2"></v-divider>
			<v-list-subheader>CÂU HỎI TỰ LUẬN & THỰC HÀNH</v-list-subheader>
			<v-list-item v-for="item in manualComponents" :key="item.type" @click="selectComponent(item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" color="orange-darken-2"></v-icon>
				</template>
				<v-list-item-title>{{ item.label }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-card>
</template>

<script>
	export default {
		name: 'uc-assignment-component-library',
		emits: ['add-component'],
		data() {
			return {
				quizComponents: [
					{ type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm', description: "Một đáp án", icon: 'mdi-radiobox-marked', kind: "quiz" },
					{ type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm', description: "Nhiều đáp án", icon: 'mdi-checkbox-multiple-marked-outline', kind: "quiz" },
					{ type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline', kind: "quiz" },
					{ type: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều đúng / Sai', icon: 'mdi-check-circle-outline', kind: "quiz" },
					{ type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox', kind: "quiz" },
					{ type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge', kind: "quiz" },
				],
				manualComponents: [
					{ type: 'SHORT_ANSWER', label: 'Trả lời ngắn', icon: 'mdi-text-short', kind: "manual" },
					{ type: 'ESSAY', label: 'Tự luận', description: "Soạn thảo", icon: 'mdi-text-long', kind: "manual" },
					{ type: 'FILE_UPLOAD', label: 'Nộp File', icon: 'mdi-upload-multiple', kind: "manual" },
					{ type: 'AUDIO_RESPONSE', label: 'Ghi âm trả lời', icon: 'mdi-microphone-plus', kind: "manual" }
				]
			}
		},
		methods: {
			selectComponent(componentInfo) {
				this.$emit('add-component', componentInfo);
			}
		}
	}
</script>