<template>
	<v-row>
		<v-col cols="6" sm="6" md="4" lg="2">
			<v-select label="Chọn khối" v-model="form.KhoiItem" :items="DSKhoi" item-title="TenKhoiHoc"
				item-value="KhoiID" return-object />
		</v-col>
		<v-col cols="6" sm="6" md="4" lg="2">
			<v-select label="Chọn lớp" v-model="form.LopItem" :items="DSLop" item-title="TenLop" item-value="LopID"
				return-object :disabled="!form.KhoiItem" />
		</v-col>
		<v-col cols="6" sm="6" md="4" lg="2">
			<v-select label="Chọn môn học" v-model="form.MonHocItem" :items="DSMonHoc" item-title="TenMonHoc_HienThi"
				item-value="MonHocID" return-object :disabled="!form.LopItem" />
		</v-col>
		<v-col cols="6" sm="6" md="4" lg="2">
			<v-select label="Chọn mã nhóm" v-model="form.MaNhomCotDiemItem" :items="DSMaNhom"
				item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" return-object :disabled="!form.MonHocItem" />
		</v-col>
		<v-col cols="6" sm="6" md="4" lg="2">
			<v-btn text="Làm mới" @click="onRefreshFilter" />
		</v-col>
	</v-row>
</template>

<script>
	export default {
		props: {
			modelValue: Object,
			onRefresh: Function
		},
		data() {
			return {
				form: {
					KhoiItem: null,
					LopItem: null,
					MonHocItem: null,
					MaNhomCotDiemItem: null
				},
				DSKhoi: [],
				DSLop: [],
				DSMonHoc: [],
				DSMaNhom: []
			}
		},
		mounted() {
			this.getKhoi()
		},
		computed: {},
		watch: {
			modelValue: function (v) {
				this.form = v
			},
			'form.KhoiItem': function (newVal, oldVal) {
				// Khi chọn lại Khối, clear tất cả các cấp dưới
				if (newVal?.KhoiID !== oldVal?.KhoiID) {
					this.form.LopItem = null
					this.form.MonHocItem = null
					this.form.MaNhomCotDiemItem = null
					this.DSLop = []
					this.DSMonHoc = []
					this.DSMaNhom = []
	
					if (newVal?.KhoiID) {
						this.getLop()
						this.$emit("update:modelValue", this.form)
					}
				}
			},
			'form.LopItem': function (newVal, oldVal) {
				// Khi chọn lại Lớp, clear Môn học và Mã nhóm
				if (newVal?.LopID !== oldVal?.LopID) {
					this.form.MonHocItem = null
					this.form.MaNhomCotDiemItem = null
					this.DSMonHoc = []
					this.DSMaNhom = []
	
					if (newVal?.LopID) {
						this.getMonHoc()
						this.$emit("update:modelValue", this.form)
					}
				}
			},
			'form.MonHocItem': function (newVal, oldVal) {
				// Khi chọn lại Môn học, clear Mã nhóm
				if (newVal?.MonHocID !== oldVal?.MonHocID) {
					this.form.MaNhomCotDiemItem = null
					this.DSMaNhom = []
	
					if (newVal?.MonHocID) {
						this.getMaNhom()
						this.$emit("update:modelValue", this.form)
					}
				}
			},
			'form.MaNhomCotDiemItem': function (newVal) {
				if (newVal?.MaNhomCotDiem) {
					this.$emit("update:modelValue", this.form)
					this.$emit("onRefresh")
				}
			}
		},
		methods: {
			onRefreshFilter() {
				// Reset toàn bộ form
				this.$emit("update:modelValue", this.form)
				this.$emit("onRefresh")
			},
			async getKhoi() {
				this.DSKhoi = await ajaxCALLPromise("lms/KhoiHocByCapHoc_Get", { CapID: vueData.CapID })
			},
			async getLop() {
				this.DSLop = await ajaxCALLPromise("lms/Lop_Get_ByKhoiID", {
					KhoiID: this.form.KhoiItem.KhoiID,
					NienKhoa: vueData.NienKhoa
				})
			},
			async getMonHoc() {
				this.DSMonHoc = await ajaxCALLPromise("lms/MonHoc_Get_ByLopID", {
					NienKhoa: vueData.NienKhoa,
					LopID: this.form.LopItem.LopID
				})
			},
			async getMaNhom() {
				this.DSMaNhom = await ajaxCALLPromise("lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID", {
					TemplateBangDiemID: this.form.MonHocItem.TemplateBangDiemID
				})
			}
		},
	}
</script>