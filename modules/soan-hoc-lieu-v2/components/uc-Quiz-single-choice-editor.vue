<template>
	<div>
		<!-- Câu hỏi -->
		<v-textarea label="Câu hỏi" v-model="localData.prompt" variant="outlined" density="compact" rows="2">
		</v-textarea>

		<!-- Danh sách đáp án -->
		<div v-for="(opt, index) in localData.options" :key="index" class="mt-3 d-flex align-center">
			<v-radio v-model="localData.correctAnswer" :value="opt.id" class="mr-2"></v-radio>
			<v-text-field v-model="opt.text" :label="'Lựa chọn ' + opt.id" variant="outlined" density="compact"
				class="flex-grow-1 mr-2"></v-text-field>
			<v-btn icon @click="removeOption(index)" v-if="localData.options.length > 1">
				<v-icon color="red">mdi-delete</v-icon>
			</v-btn>
		</div>

		<!-- Thêm đáp án -->
		<v-btn variant="text" size="small" class="mt-2" @click="addOption">
			<v-icon start>mdi-plus</v-icon> Thêm đáp án
		</v-btn>

		<!-- Giải thích -->
		<v-textarea label="Giải thích" v-model="localData.explanation" variant="outlined" rows="3" class="mt-4">
		</v-textarea>
	</div>
</template>

<script>
	export default {
  name: 'quiz-single-choice-editor',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localData: {
        prompt: '',
        options: [],
        correctAnswer: '',
        explanation: ''
      }
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localData = JSON.parse(JSON.stringify(val || {
          prompt: '',
          options: [{ id: 'a', text: '' }],
          correctAnswer: 'a',
          explanation: ''
        }));
      }
    },
    localData: {
      deep: true,
      handler(val) {
        this.$emit('update:modelValue', val);
      }
    }
  },
  methods: {
    addOption() {
      const nextId = String.fromCharCode(97 + this.localData.options.length); // 'a', 'b', 'c', ...
      this.localData.options.push({ id: nextId, text: '' });
    },
    removeOption(index) {
      this.localData.options.splice(index, 1);
      // Nếu đáp án đúng bị xoá thì đặt lại
      if (!this.localData.options.find(opt => opt.id === this.localData.correctAnswer)) {
        this.localData.correctAnswer = this.localData.options[0]?.id || '';
      }
    }
  }
}
</script>

<style scoped>
	.flex-grow-1 {
		flex-grow: 1;
	}
</style>