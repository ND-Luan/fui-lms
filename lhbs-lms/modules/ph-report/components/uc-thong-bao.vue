<template>
	<div style="background-color: #bdb7b712;">
		<div class="d-flex align-center pa-2">
			<span style="font-size: 17px; " class="font-weight-medium">Trang thông báo</span>
			<v-spacer />
			<uc-lich v-model:HocSinh="vueData.HocSinhSelected" />
		</div>
		<div class="d-flex ">
			<v-spacer />
			<v-chip-group v-model="Type" selected-class="text-primary" mandatory>
				<v-chip v-for="tag in tags" :key="tag.value">
					{{ tag.title }}
				</v-chip>
			</v-chip-group>
		</div>
		<div style="background-color: #f0f8ff00;height: calc(100vh - 298px); overflow: auto; padding-bottom: 42px;">
			<v-list lines="two" class="d-flex flex-column ga-2 mx-2 pt-0">
				<v-list-item class="rounded " v-for="tb in DSThongBao" :key="tb.ThongBaoID"
					@click="handleClickThongBao(tb)"
					:style="{ 'background-color': tb.Is_DaXem ? '#ffffff' : '#57d1573b !important' }">
					<template #prepend>
						<v-icon :color="tb.Color">{{ tb.Icon }}</v-icon>
					</template>
					<template #title>
						<span class="font-weight-medium">{{ tb.TypeTitle }}</span>
					</template>
					<template #subtitle>
						<div class="d-flex flex-column ga-1">
							<span class="clamp-2">{{ tb.TemplateContent }}</span>
							<span>
								Thời gian: {{ tb.ThoiGianNhan ? dayjs(tb.ThoiGianNhan).format('DD/MM/YYYY') : '-' }}
							</span>
						</div>
					</template>
				</v-list-item>
				<uc-empty v-if="DSThongBao.length === 0" />
			</v-list>
		</div>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				vueData,
				Type: 0,
				tags: [{ title: "Theo ngày", value: 0 }, { title: "Theo tuần", value: 1 }, { title: "Theo tháng", value: 2 }, { title: "Tất cả", value: 3 }],
				DSThongBao: [],
				IsShowDialogCalen: false
			}
		},
		mounted() {
			this.GET_EL_PhuHuynh_ThongBao_Get()
		},
		watch: {
			Type: function () {
				this.GET_EL_PhuHuynh_ThongBao_Get()
			}
		},
		methods: {
			GET_EL_PhuHuynh_ThongBao_Get() {
				ajaxCALL('/lms/EL_PhuHuynh_ThongBao_Get_ByHocSinhID', {
					HocSinhID: vueData.HocSinhSelected.HocSinhID,
					Type: this.Type
					// HocSinhID: 17100132
				}, res => {
					this.DSThongBao = res.data
				})
			},
			handleClickThongBao(tb) {
				this.updateStatus(tb).then(() => {
					tb.Is_DaXem = 1
					CALL("getCountThongBao")
					if (tb.ThongBao_TypeID !== 3) return  //Chấm
					// openWindow({
					// 	title: 'Thông báo',
					// 	url: `/lms-phu-huynh-thong-bao-chi-tiet?SubmissionID=${tb.SubmissionID}`
					// })
				})
			},
			async updateStatus(tb) {
				if (!tb.Is_DaXem) {
					return await ajaxCALLPromise('/lms/EL_PhuHuynh_ThongBao_Udp_Xem_ByThongBaoID', {
						ThongBaoID: tb.ThongBaoID
					})
				}
			},
			dayjs
		}
	}
</script>