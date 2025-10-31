<template>
	<v-dialog v-model="modelValue" max-width="500">
		<v-card title="Tình trạng điểm">
			<v-card-text>
				<v-row>
					<v-col>
						<v-select v-model="form.TinhTrang" :items="DSTinhTrang" />
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
				form: null
			}
		},
		mounted() { },
		computed: {},
		watch: {
			item: function (val) {
				if (!val) return
				this.form = val
			}
		},
		methods: {
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