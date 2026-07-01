<template>
	<div v-for="hocSinh in DSHocSinh" :key="hocSinh.HocSinhID" class="mt-2">
		<v-lazy :min-height="100" :options="{ 'threshold': 0.3 }">
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">
					Học sinh: {{ hocSinh.SoDanhBo }} {{ hocSinh.HoTen }}
				</v-card-title>
				<v-data-table-virtual class="custom-border" :headers="hocSinh.headers" :items="hocSinh.items"
					:items-per-page="-1" hide-default-footer>
					<template #item.TenMonHoc_HienThi="{ item }">
						{{ item.TenMonHoc_HienThi }}
						<v-chip v-if="item.TinhTrang" variant="text" class="ml-2 font-weight-medium"
							:color="item.MauTinhTrang" size="small">{{ item.TenTinhTrang }}
						</v-chip>
					</template>
					<template #item.log="{ item }">
						<v-tooltip text="Lịch sử chỉnh sửa" location="top">
							<template #activator="{ props }">
								<v-btn v-if="item.Count_Log_Diem > 0" v-bind="props" icon variant="text"
									@click="redirectLog(item)">
									<v-icon>mdi-history</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</template>
				</v-data-table-virtual>
			</v-card>
		</v-lazy>
	</div>
	<uc-empty v-if="DSHocSinh.length === 0" />
</template>

<script>
	export default {
		props: {
		modelValue: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			DSHocSinh: []
		}
	},
	watch: {
		modelValue: {
			handler(val) {
				this.DSHocSinh = val ?? []
			},
			immediate: true
		}
	},
	methods: {
		redirectLog(item) {
			const url = `/log-diem?lopid=${item.LopID}&monhocid=${item.MonHocID}&manhomcotdiem=${item.MaNhomCotDiem}&hocsinhid=${item.HocSinhID}&NienKhoa=${window.vueData?.NienKhoa}`
			if (window.openWindow) {
				window.openWindow({
					title: "Lịch sử chỉnh sửa",
					url: url,
				})
			}
		}
	}
	}
</script>