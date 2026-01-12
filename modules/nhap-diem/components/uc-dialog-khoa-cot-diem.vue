<template>
	<v-dialog v-model="modelValue" max-width="500">
		<v-card title="Khóa cột điểm">
			<v-card-text>
				<v-list v-model:selected="CotDiem">
					<v-list-subheader>Danh sách cột điểm</v-list-subheader>
					<v-list-item v-for="cd in DSCotDiem" :key="cd.value" :title="cd.title" :subtitle="cd.value"
						:value="cd.value" :disabled="cdMap[cd.value]">
						<template #append>
							<v-chip :color="cdMap[cd.value] ? 'primary' : 'amber'">
								{{ cdMap[cd.value] ? 'Đã khóa điểm' : 'Chưa khóa điểm' }}
							</v-chip>
						</template>
					</v-list-item>
				</v-list>
			</v-card-text>

			<v-card-actions>
				<v-spacer />
				<v-btn text="Đóng" @click="closeDialog" />
				<v-btn color="primary" :text="textKhoaCotDiem" @click="onKhoaCotDiem_Comp" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			modelValue: Boolean,
			filter: {
				type: Object,
				required: true
			},
			DSCotDiem: {
				type: Array,
				default: () => []
			},
			DSKhoaCotDiem_API: {
				type: Array,
				default: () => []
			},
			onKhoaCotDiem: Function
		},
		emits: ['update:modelValue', 'onKhoaCotDiem'],
		data() {
			return {
				CotDiem: null
			}
		},
	
		computed: {
			cdMap() {
				return this.DSKhoaCotDiem_API.reduce((map, item) => {
					map[item.MaCotDiem] = item.TinhTrang
					return map
				}, {})
			},
			textKhoaCotDiem() {
				let string = 'Khóa'
				if (this.CotDiem) {
					string += ' (' + this.CotDiem + ')'
				}
				return string
			}
		},
	
		watch: {
			// modelValue(isShow) {
			// 	if (isShow) {
			// 		this.loadTrangThaiCotDiem()
			// 	}
			// }
		},
	
		methods: {
			// async loadTrangThaiCotDiem() {
			// 	const { LopItem, MonHocItem } = this.filter
	
			// 	const data = await ajaxCALLPromise("lms/KhoaCotDiem_Get", {
			// 		LopID: LopItem.LopID,
			// 		MonHocLopID: MonHocItem.MonHocLopID
			// 	})
	
			// 	this.DSKhoaCotDiem_API = data.map(x => ({
			// 		value: x.MaCotDiem,
			// 		TinhTrang: x.TinhTrang
			// 	}))
			// },
	
			onKhoaCotDiem_Comp() {
				if (!this.CotDiem) {
					Vue.$toast.warning("Bạn chưa chọn cột điểm để khóa", {
						position: "top"
					})
					return
				}
				//Do List nhận là mảng 
				this.$emit('onKhoaCotDiem', this.CotDiem[0])
				this.closeDialog()
			},
	
			closeDialog() {
				this.$emit('update:modelValue', false)
			}
		}
	}
</script>