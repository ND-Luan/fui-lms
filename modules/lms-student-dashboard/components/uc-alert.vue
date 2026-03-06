<template>
	<!-- <v-btn text="Bài tập & bài học (chưa hoàn thành)" variant="tonal" color="orange" @click="dialog = true" /> -->
	<v-dialog v-model="dialog" max-width="600">
		<v-card>
			<v-card-title class="d-flex">
				Bài tập & Bài học
				<v-spacer />
				<v-icon @click="dialog = false">mdi-close</v-icon>
			</v-card-title>

			<v-row class="ma-0" v-if="DSCanhBao.length > 0">
				<v-col class="pb-0" cols="auto" v-for="cb in DSCanhBao">
					<v-alert border="top" type="warning" variant="outlined" prominent closable>
						<template v-slot:title>
							{{cb.TenType}} • {{cb.TenMonHoc_HienThi}}
						</template>
						<p>{{cb.Title}}</p>
						<p class="text-caption" v-if="cb.Type === 'ASSIGNMENT'">Vui lòng hoàn thành bài tập</p>
						<p class="text-caption" v-if="cb.Type === 'LESSON'">Vui lòng hoàn thành bài học</p>
					</v-alert>
				</v-col>
			</v-row>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				dialog: false,
				DSCanhBao: [],
				vueData
			}
		},
		async mounted() {
			this.DSCanhBao = await ajaxCALLPromise("lms/EL_Student_Get_CanhBao_ByHocSinhID", {
				HocSinhID: vueData.user.UserID
			})
			if (this.DSCanhBao.length > 0) {
				this.dialog = true
			}
	
		},
		computed: {},
		watch: {},
		methods: {},
	}
</script>