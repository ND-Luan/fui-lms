<template>
	<v-card>
		<v-card-title class="text-primary">Đồng bộ dữ liệu</v-card-title>
		<v-card-text>
			<div class="pa-4 w-100"
				style="border: 2px solid #1976d2; border-radius: 12px; background-color: #f5faff;">
				<v-row class="mb-4">
					<v-col cols="12">
						<h1 class="text-h5 font-weight-bold text-primary">Đồng bộ học sinh từ Edubot</h1>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="6">
						<v-btn color="primary" :loading="loadingFetch" :disabled="loadingFetch || loadingSync"
							@click="LoadDataHocSinhFromEdubot" prepend-icon="mdi-download" block>
							Lấy dữ liệu
						</v-btn>
					</v-col>
					<v-col cols="6">
						<v-btn color="success" :loading="loadingSync" :disabled="loadingFetch || loadingSync"
							@click="SyncDataToDB" prepend-icon="mdi-sync" block>
							Đồng bộ dữ liệu
						</v-btn>
					</v-col>
				</v-row>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				DataHocSinhEdubot: [],
				loadingFetch: false,
				loadingSync: false
			}
		},
		async mounted() {
			
		},
		computed: {},
		watch: {},
		methods: {
			async LoadDataHocSinhFromEdubot() {
				this.loadingFetch = true
				this.loadingSync = false
				const result = await new Promise((resolve) => {
					ajaxCALL(`https://tapi.lhbs.vn/student/LMS_GetLop?NamHoc=${vueData.NienKhoa}`, null, res => {
						resolve(res.data)
					}, err => { console.log('ee', err) })
				}).then(data => {
					this.DataHocSinhEdubot = data
				}).finally(() => {
					this.loadingFetch = false
					this.loadingSync = false
				})
	
	
			},
			async SyncDataToDB() {
				this.loadingSync = true
				this.loadingFetch = true
				const result = await new Promise((resolve, reject) => {
					const jsonHocSinh = JSON.stringify(this.DataHocSinhEdubot)
					ajaxCALL('/lms/DongBo_Lop_From_Edubot', {
						HocSinhJSON: jsonHocSinh
					}, res => {
						resolve(res.data)
					}, err => {
						reject(err)
					})
				}).finally(() => {
					this.loadingSync = false
					this.loadingFetch = false
				})
	
			}
		},
	}
</script>