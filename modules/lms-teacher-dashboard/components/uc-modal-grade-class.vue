<template>
	<v-dialog v-model="isOpen" fullscreen>
		<v-card id="ChamBaiDialog" style="overflow: hidden;">
			<v-card-title class="d-flex bg-primary ChamBaiDialog" style="max-height: 48px">
				<span class="text-white">{{ TitlePage }}</span>
				<v-spacer></v-spacer>
				<v-btn @click="onClose()" variant="text" icon="mdi-close"></v-btn>
			</v-card-title>
			<v-card-text class="pa-0 i">
				<iframe class="position-absolute" :src="url" width="100%" allow="fullscreen" style="border:none;"
					:style="{ 'height': gradeAssignment ? 'calc(100dvh)' : 'calc(100dvh - 64px)' }"></iframe>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: ["isOpen", "assignment"],
	emits: ["update:isOpen"],
	data() {
		return {
			url: '',
			gradeAssignment: false,
		}
	},
	mounted() {
		window.addEventListener(`message`, (event) => this.handleMessage(event))
	},
	computed: {
		TitlePage: function () {
			return this.assignment?.ResourceType == 'ASSIGNMENT' ? 'Xem tiến độ bài tập' : 'Xem tiến độ bài học'
		}
	},
	watch: {
		isOpen: function (val) {
			if (val) {
				if (this.assignment.ResourceType == 'ASSIGNMENT') {
					console.log('this.assignment', this.assignment)
					if (this.assignment.AssignType == 'CLASS') {
						this.url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${this.assignment?.AssignToClassID}&LopID=${this.assignment?.LopID}&KhoiID=${this.assignment?.KhoiID}&MonHocID=${this.assignment?.MonHocID}&AssignType=${this.assignment.AssignType}`
					} else {
						this.url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToStudentID=${this.assignment?.AssignToStudentID}&LopID=${this.assignment?.LopID}&KhoiID=${this.assignment?.KhoiID}&MonHocID=${this.assignment?.MonHocID}&AssignType=${this.assignment.AssignType}`
					}

				} else {
					this.url = `https://lms.lhbs.vn/lms-Lesson-Class-Detail?AssignToClassID=${this.assignment?.AssignToClassID}`

				}
				this.$emit('update:isOpen', true)
			}
		}
	},
	methods: {
		onClose() {
			this.$emit('update:isOpen', false)
			vueData.apiCall1()
		},
		handleMessage(event) {
			if (!event || !event.data || !event.data.type) return
			if (event.origin === 'https://lms.lhbs.vn' && event.data.type === "fromIframe") {
				if (event.data.value == 'hide') {
					this.gradeAssignment = true
					document.getElementsByClassName('ChamBaiDialog')[0].style.setProperty("display", "none", "important");
				} else {
					this.gradeAssignment = false
					document.getElementsByClassName('ChamBaiDialog')[0].style.setProperty("display", "flex", "important");
				}
			}
		}
	},
}
</script>