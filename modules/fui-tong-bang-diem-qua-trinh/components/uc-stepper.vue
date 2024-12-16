<template>
	<div>
		<v-card-title class="text-primary">Quá trình bảng điểm</v-card-title>
		<v-stepper v-model="vueData.step" alt-labels v-if="vueData.DSNhomDiem.length > 0">
			<v-stepper-header>
				<template v-for="(item, index) in vueData.DSNhomDiem" :key="index">
					<v-stepper-item :value="item.ThuTuNhom" style="min-width: 200px !important;flex-basis: 235px;"
						editable selected-class="text-primary">
						<template v-slot:title>
							{{item.TenNhomCotDiem_VI}}
						</template>
						<!-- <template v-slot:subtitle>
							<p class="mt-2">
								{{item.TinhTrang}}
							</p>
						</template> -->
					</v-stepper-item>
				</template>
			</v-stepper-header>
			<v-stepper-window class="ma-0 mt-4">
				<v-stepper-window-item v-for="(item,index) in vueData.DSNhomDiem" :key="index"
					:value="item.ThuTuNhom">
					<v-card-title class="text-primary">Bảng điểm
						<v-chip class="ml-1" :color="vueData.TinhTrang?.color">
							{{vueData.TinhTrang?.text}}
						</v-chip>
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
		props: ["stepProp"],
		data() {
			return {
				vueData,
			}
		},
		mounted() { },
		computed: {},
		methods: {
			renderLabel(item) {
				return `Bảng điểm <span class='text-red'>${item.TenNhomCotDiem_VI}</span>`
			}
		},
	}
</script>