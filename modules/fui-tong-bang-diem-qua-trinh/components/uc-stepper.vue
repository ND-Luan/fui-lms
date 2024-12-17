<template>
	<div>
		<v-card-title class="text-primary d-flex">
			Quá trình bảng điểm
			<v-spacer></v-spacer>
			<v-chip v-if="vueData.DSNhomDiem.length > 0">
				Tình trạng
				<v-tooltip activator="parent" location="bottom" open-on-click>
					<div v-for="item in vueData.DSTinhTrang" class="d-flex ga-2 align-center">
						<v-badge :color="item.MauTinhTrang" inline dot></v-badge>
						<p> {{ item.TenTinhTrang }} </p>
					</div>
				</v-tooltip>
			</v-chip>
		</v-card-title>

		<v-stepper v-model="vueData.step" alt-labels v-if="vueData.DSNhomDiem.length > 0">
			<v-stepper-header>
				<template v-for="(item, index) in vueData.DSNhomDiem" :key="index">
					<v-stepper-item :value="item.ThuTuNhom" style="min-width: 150px !important;flex-basis: 150px;"
						:complete="item.TinhTrang === 2" editable :class="'text-' + item.MauTinhTrang">
						<template v-slot:icon>
							<v-icon :color="item.MauTinhTrang">{{ item.IconTinhTrang }}</v-icon>
						</template>
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
							<v-btn color="" @click="onLuuDiem()"
								:disabled="!vueData.DSHocSinh.length > 0 || fn_IsDisabledTinhTrangDiem({ TinhTrang: vueData.MaNhomCotDiemItem.MaNhomDiem, type: 'GV' }).isDisabled">
								Lưu tạm
							</v-btn>
							<v-btn color="orange-darken-1" @click="onGuiDiem()"
								:disabled="!vueData.DSHocSinh.length > 0 || fn_IsDisabledTinhTrangDiem({ TinhTrang: vueData.MaNhomCotDiemItem.MaNhomDiem, type: 'GV' }).isDisabled">
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