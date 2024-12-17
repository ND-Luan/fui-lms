<template>
	<div>
		<v-card-title class="text-primary">Quá trình bảng điểm</v-card-title>
		<v-stepper v-model="vueData.step" alt-labels v-if="vueData.DSNhomDiem.length > 0">
			<v-stepper-header>
				<template v-for="(item, index) in vueData.DSNhomDiem" :key="index">
					<v-stepper-item :value="item.ThuTuNhom" style="min-width: 150px !important;flex-basis: 150px;"
						editable :selected-class="'text-' + item.MauTinhTrang">
						<template v-slot:title>
							{{ item.TenNhomCotDiem_VI }}
						</template>
						<template v-slot:subtitle>
							<p class="mt-2">
								{{ item.TenTinhTrang }}
							</p>
						</template>
					</v-stepper-item>
				</template>
			</v-stepper-header>
			<v-stepper-window class="ma-0 mt-4">
				<v-stepper-window-item v-for="(item, index) in vueData.DSNhomDiem" :key="index" :value="item.ThuTuNhom">
					<v-card-title class=" d-flex align-center">
						<p class="text-primary">Bảng điểm</p>
						<v-chip class="ml-1" :color="item.MauTinhTrang">
							{{ item.TenTinhTrang }}
						</v-chip>
						<v-spacer></v-spacer>
						<div>
							<v-btn icon="mdi-microsoft-excel" color="success" variant="text"
								@click="instance.download()" :disabled="!vueData.DSHocSinh.length > 0">
							</v-btn>
							<!--  -->
							<v-btn color="success" @click="onLuuDiem()"
								:disabled="!vueData.DSHocSinh.length > 0 || fn_IsDisabledTinhTrangDiem({ type: 'GV' }).isDisabled">
								Lưu điểm
							</v-btn>
							<v-btn color="primary" @click="onGuiDiem()"
								:disabled="!vueData.DSHocSinh.length > 0 || fn_IsDisabledTinhTrangDiem({ type: 'GV' }).isDisabled">
								Gửi điểm
							</v-btn>
						</div>
					</v-card-title>
					<uc-nhap-diem />
				</v-stepper-window-item>
			</v-stepper-window>
		</v-stepper>
		<uc-empty v-else />
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
		}
	},
	mounted() { },
	computed: {},
	methods: {
		fn_IsDisabledTinhTrangDiem,
		onLuuDiem,
		onGuiDiem
	},
}
</script>