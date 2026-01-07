<template>
	<v-dialog v-model="modelValue" max-width="500">
		<v-card title="Tình trạng điểm">

			<v-list>
				<v-list-subheader>Tình trạng cột điểm</v-list-subheader>
				<v-list-item v-for="cd in DSCotDiem" :title="cd?.CotDiem">
					<template #append>
						<v-chip color="primary" size="small">{{ cd.TinhTrangCotDiem }}</v-chip>
					</template>
				</v-list-item>
			</v-list>
			<v-card-text>

				<v-row>
					<v-col>
						<v-select v-model="form.TinhTrang" label="Tình trạng nhóm điểm" :items="DSTinhTrang" />
					</v-col>
				</v-row>
			</v-card-text>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text="Đóng" @click="$emit('update:modelValue', false)" />
				<v-btn text="Lưu" @click="onSave" variant="elevated" color="primary" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: {
		modelValue: Boolean,
		item: Object,
		capID: Number,
		onSaveFininsh: Function
	},
	data() {
		return {
			vueData,
			TinhTrang: null,
			DSTinhTrang: [
				{ title: "Chưa lưu", value: 0 },
				{ title: "Lưu tạm", value: 1 },
				{ title: "Gửi điểm", value: 2 },
			],
			DSCotDiem: [],
			form: {}
		}
	},
	mounted() {
		this.form = { ...this.item }
		this.onLoadTienDoNhapDiemChiTiet()
		console.log('item', this.item)
		if (this.item.MonHocCode == 'ANH' && this.item.LopID.includes('N')) {
			this.DSTinhTrang.push({ title: "Duyệt điểm", value: 4 })
		}
	},
	computed: {},
	watch: {
		modelValue: function (isShow) {
			if (isShow) {
				this.form = { ...this.item }
				this.onLoadTienDoNhapDiemChiTiet()
			}
		}
	},
	methods: {
		async onLoadTienDoNhapDiemChiTiet() {
			this.DSCotDiem = await ajaxCALLPromise("lms/TienDo_NhapDiem_ChiTiet", {
				NienKhoa: vueData.NienKhoa,
				MonHocLopID: this.form.MonHocLopID,
				LopID: this.form.LopID,
				MaNhomCotDiem: this.form.MaNhomCotDiem,
			})
		},
		onSave() {
			if (this.capID === 1) {
				ajaxCALL("lms/KQHT_MonHocLop_TinhTrang_Udp", {
					NienKhoa: vueData.NienKhoa,
					MonHocLopID: this.form.MonHocLopID,
					LopID: this.form.LopID,
					TinhTrang: this.form.TinhTrang,
					MaNhomCotDiem: this.form.MaNhomCotDiem,
					IsSendToManager: false,
				}, res => {
					this.$emit("update:modelValue", false)
					this.$emit("onSaveFininsh")
				})
			} else if (this.capID === 2 || this.capID === 3) {
				ajaxCALL("lms/KQHT_MonHocLop_TinhTrang_Udp_C2_C3", {
					NienKhoa: vueData.NienKhoa,
					MonHocLopID: this.form.MonHocLopID,
					LopID: this.form.LopID,
					TinhTrang: this.form.TinhTrang,
					MaNhomCotDiem: this.form.MaNhomCotDiem,
					IsSendToManager: false,
				}, res => {
					this.$emit("update:modelValue", false)
					this.$emit("onSaveFininsh")
				})
			}
		},

	},
}
</script>