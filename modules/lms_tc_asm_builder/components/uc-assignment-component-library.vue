<template>
	<v-card>
		<v-card-title class="text-subtitle-1">Thư viện Thành phần</v-card-title>
		<v-divider></v-divider>
		<v-list density="compact" nav>
			<v-list-subheader>CÂU HỎI TƯƠNG TÁC (QUIZ)</v-list-subheader>
			<v-list-item v-for="item in quizComponents" :key="item.type" @click="selectComponent(item)" link>
				<template v-slot:prepend>
					<v-icon :icon="item.icon" color="primary"></v-icon>
				</template>
				<v-list-item-title>{{ item.label }}</v-list-item-title>
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
					{ type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-radiobox-marked' },
					{ type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-checkbox-multiple-marked-outline' },
					{ type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', icon: 'mdi-check-circle-outline' },
					{ type: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều đúng / Sai', icon: 'mdi-check-circle-outline' },
					{ type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', icon: 'mdi-form-textbox' },
					{ type: 'QUIZ_MATCHING', label: 'Ghép nối', icon: 'mdi-merge' },
				],
				manualComponents: [
					{ type: 'SHORT_ANSWER', label: 'Trả lời ngắn', icon: 'mdi-text-short' },
					{ type: 'ESSAY', label: 'Tự luận (Soạn thảo)', icon: 'mdi-text-long' },
					{ type: 'FILE_UPLOAD', label: 'Nộp File', icon: 'mdi-upload-multiple' },
					{ type: 'AUDIO_RESPONSE', label: 'Ghi âm trả lời', icon: 'mdi-microphone-plus' }
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