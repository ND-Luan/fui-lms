<template>
	<div class="pa-2" style="position: relative;height: calc(100vh - 4px);">
		<!-- Header Card - Thông tin bài tập -->
		<v-card class="mb-4" elevation="2">
			<v-card-title class="text-h6 bg-success text-white py-3">
				{{ ThongTinBaiTap.Title }}
			</v-card-title>
			<v-card-text class="pa-4">
				<v-row dense>
					<v-col cols="12" md="4" sm="12">
						<div class="text-body-2 text-grey-darken-1 mb-1">Môn học</div>
						<div class="text-body-1 font-weight-medium">{{ ThongTinBaiTap.TenMonHoc_HienThi ?? '-' }}</div>
					</v-col>
					<v-col cols="12" sm="6" md="4" lg="6">
						<div class="text-body-2 text-grey-darken-1 mb-1">Giáo viên giao bài</div>
						<div class="text-body-1 font-weight-medium">{{ ThongTinBaiTap.HoTenGV_GiaoBai }}</div>
					</v-col>
					<v-col cols="12" sm="6" md="4" lg="6">
						<div class="text-body-2 text-grey-darken-1 mb-1">Giáo viên chấm bài</div>
						<div class="text-body-1 font-weight-medium">{{ ThongTinNopBai.HoTenGV_ChamBai }}</div>
					</v-col>
				</v-row>

				<v-divider class="my-3"></v-divider>

				<v-row dense>
					<v-col cols="6">
						<v-row>
							<v-col cols="12" sm="6">
								<div class="d-flex align-center">
									<v-icon color="success" size="small" class="mr-2">mdi-check-circle</v-icon>
									<span class="text-body-2">
										Trắc nghiệm:
										<span class="font-weight-bold">{{ ThongTinDapAn.SoCauDung }}</span>/{{
											ThongTinDapAn.SoCauDung + ThongTinDapAn.SoCauKoDuDiem + ThongTinDapAn.SoCauSai
										}}
									</span>
								</div>
							</v-col>
							<v-col cols="12" sm="6">
								<div class="d-flex align-center">
									<v-icon color="primary" size="small" class="mr-2">mdi-star</v-icon>
									<span class="text-body-2">
										Điểm số:
										<span class="font-weight-bold text-primary">{{ ThongTinNopBai.Score }}</span>/{{
											ThongTinBaiTap.MaxScore }}
									</span>
								</div>
							</v-col>
						</v-row>
					</v-col>
					<v-col cols="6">
						<div class="text-end">
							<v-btn color="orange-darken-1" @click="handleShowGuiNhanXet()"
								icon="mdi-notebook-edit-outline" size="small" v-tooltip="'Ý kiến của bạn'">
							</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<!-- Results Section -->
		<div class="mb-2">
			<h2 class="text-h6 text-success font-weight-medium mb-3">
				<v-icon color="success" class="mr-1">mdi-book-check-outline</v-icon>
				Kết quả bài tập
			</h2>
		</div>

		<!-- Questions Groups -->
		<v-expansion-panels variant="accordion" class="mb-4">
			<v-expansion-panel v-for="(group, index) in QuestionsData" :key="index" elevation="1">
				<v-expansion-panel-title class="bg-grey-lighten-4">
					<div class="d-flex align-center">
						<v-icon size="small" class="mr-2 text-success">mdi-book-open-variant</v-icon>
						<span class="font-weight-medium">{{ group.title }}</span>
						<v-chip size="x-small" class="ml-2" color="grey-lighten-1">
							{{ group.questions.length }} câu
						</v-chip>
					</div>
				</v-expansion-panel-title>

				<v-expansion-panel-text>
					<v-list lines="one" class="pa-0">
						<v-list-item v-for="(q, qIndex) in group.questions" :key="qIndex" class="px-2"
							:class="{ 'bg-grey-lighten-5': qIndex % 2 === 0 }">


							<v-list-item-title>
								<span class="text-body-2">Câu {{ q.ordinalNumber }}: {{ q.type }}</span>
							</v-list-item-title>

							<template v-slot:append>
								<div class="d-flex align-center ga-2">
									<v-chip size="small" variant="tonal" color="grey-darken-1" prepend-icon="mdi-medal">
										{{ q.config.manualScore ?? 0 }}/{{ q.points }} điểm
									</v-chip>
									<v-chip :color="isCorrecAnswer(q).color" size="small" variant="flat"
										class="font-weight-medium">
										{{ isCorrecAnswer(q).title }}
									</v-chip>
								</div>
							</template>
						</v-list-item>
					</v-list>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>

		<v-dialog v-model="active">
			<v-card class="w-100">
				<v-card-title style="height:fit-content" class="bg-success  mb-2 d-flex">
					<span class="text-white text-body-1">Gửi phản hồi cho giáo viên</span>
					<v-spacer></v-spacer>
					<v-btn icon variant="text" size="small" @click="handleShowGuiNhanXet"><v-icon
							color="white">mdi-close</v-icon></v-btn>
				</v-card-title>
				<v-card-text class="py-0">
					<v-textarea v-model="PhanHoiPhuHuynh" placeholder="Nhập phản hồi cho giáo viên..." class="w-full"
						rows="3" :hide-details="true">
					</v-textarea>
				</v-card-text>
				<v-card-actions class="border-t mt-2">
					<v-btn color="primary" variant="outlined" size="small" @click="handleSendComment">
						<v-icon class="me-2">mdi-send-outline</v-icon>Gửi phản hồi
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			tab: null,
			ThongTinBaiTap: {},
			ThongTinNopBai: {},
			ThongTinDapAn: {},
			QuestionsData: [],
			vueData,
			PhanHoiPhuHuynh: '',
			active: false
		}
	},
	async mounted() {
		await this.GET_EL_PhuHuynh_ThongBao_KetQua_BySubmissionID()
		await this.GET_EL_PhuHuynh_Upd_SoLanXem_BySubmissionID()
	},
	computed: {
		widthScreen: function () {
			return window.innerWidth
		}
	},
	watch: {},
	methods: {
		async GET_EL_PhuHuynh_Upd_SoLanXem_BySubmissionID() {
			let res = await API_Service('EL_PhuHuynh_Upd_SoLanXem_BySubmissionID', { SubmissionID: vueData.SubmissionID }, 'GET')
		},
		async GET_EL_PhuHuynh_ThongBao_KetQua_BySubmissionID() {
			let res = await API_Service('EL_PhuHuynh_ThongBao_KetQua_BySubmissionID', { SubmissionID: vueData.SubmissionID }, 'GET')
			console.log('res', res)
			this.ThongTinDapAn = res[0][0]
			this.ThongTinBaiTap = res[1][0]
			this.ThongTinNopBai = res[2][0]
			console.log('this.ThongTinNopBai', this.ThongTinNopBai)
			let mapAnswerQuestions = this.handleMapingAnswer_For_Graded(JSON.parse(this.ThongTinBaiTap.AssignmentConfig), JSON.parse(this.ThongTinNopBai.AssignmentConfig))
			this.handleQuestion(mapAnswerQuestions, this.ThongTinNopBai)


		},
		handleQuestion(GroupQuestion, SubmissionInfo) {
			if (!GroupQuestion) return
			console.log('GroupQuestion', GroupQuestion)
			// let assignObject
			this.QuestionsData = this.handleMapDataShow(SubmissionInfo.SubmissionContent, GroupQuestion)
		},
		handleMapDataShow(SubmissionContent, GroupQuestion) {
			let ObjectSubmissionContent = JSON.parse(SubmissionContent)
			console.log('ObjectSubmissionContent', ObjectSubmissionContent.answers)
			let dataMap = GroupQuestion.map(group => {
				let mapGroup = group.questions.map(q => {
					let configMap = { ...q.config, studentAnswer: ObjectSubmissionContent.answers[q.id].answerData, manualScore: ObjectSubmissionContent.answers[q.id].grading.manualScore }
					return { ...q, config: configMap }
				})
				return { ...group, questions: mapGroup }
			})
			console.log('dataMap', dataMap)
			return dataMap
		},
		isCorrecAnswer(q) {
			if (q.config.manualScore == q.points) {
				return { title: 'Đúng', color: 'green' }
			} else if (q.config.manualScore < q.points && q.config.manualScore > 0) {
				return { title: 'Đúng một phần', color: 'primary' }
			} else {
				return { title: 'Sai', color: 'red' }
			}
		},
		async handleSendComment() {
			if (this.PhanHoiPhuHuynh.length == 0) {
				return Vue.$toast.warning('Vui lòng nhập phản hồi!', { position: 'top' })
			}
			let res = await API_Service('EL_PhuHuynh_YKien_Upd_By_SubmissionID', { SubmissionID: vueData.SubmissionID, NoiDungPhuHuynh: this.PhanHoiPhuHuynh })
			if (res) {
				Vue.$toast.success('Gửi phản hồi thành công!', { position: 'top' })
			} else {
				Vue.$toast.error('Gửi phản hồi thất bại!', { position: 'top' })
			}
			this.handleShowGuiNhanXet()
		},

		handleShowGuiNhanXet() {
			this.active = !this.active
			this.PhanHoiPhuHuynh = ''
		},
		API_Service,
		handleMapingAnswer_For_Graded,
		fn_ChamBaiStudent
	},
}
</script>