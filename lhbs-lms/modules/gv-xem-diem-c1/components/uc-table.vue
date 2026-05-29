<template>
	<div v-for="hocSinh in vueData.DSHocSinhQLD" class="mt-2">
		<v-lazy :min-height="100" :options="{ 'threshold': 0.3 }">
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">
					Học sinh: [{{ hocSinh.HocSinhID}}] {{ hocSinh.HoTen}}
				</v-card-title>
				<v-data-table-virtual class="custom-border" :headers="getHeaders(hocSinh)" :items="getItems(hocSinh)"
					:items-per-page="-1" hide-default-footer>
					<template #item.TenMonHoc_HienThi="{item}">
						{{item.MonHocCode}}
						<!-- <v-chip v-if="item.TinhTrang" class="ml-2" :color="item.MauTinhTrang"
							size="small">{{item.TenTinhTrang}}
						</v-chip> -->
					</template>
					<template #item.log="{item}">
						<!-- <v-btn v-if="item.Count_Log_Diem > 0" @click="redirectLog(item)">
							{{item.Count_Log_Diem}}
							<v-icon>mdi-history</v-icon>
						</v-btn> -->
					</template>
				</v-data-table-virtual>
			</v-card>
		</v-lazy>
	</div>
	<uc-empty v-if="vueData.DSHocSinhQLD.length === 0" />
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Array
			}
		},
		data() {
			return {
				DSHocSinh: [],
				vueData
			}
		},
		watch: {
			modelValue: function (_) {
				this.DSHocSinh = _
			}
		},
		methods: {
			getHeaders(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem
				const headers = [
					{
						title: 'Tên môn học',
						value: 'MonHocName',
						minWidth: 100,
						align: 'left'
					}
				]
				const listMaCotDiem = [
					{
						title: "TX1",
						value: "TX1"
					},
					{
						title: "TX2",
						value: "TX2"
					},
					{
						title: "TX3",
						value: "TX3"
					},
					{
						title: "TX4",
						value: "TX4"
					},
					{
						title: "GK",
						value: "GK"
					},
					{
						title: "CK",
						value: "CK"
					},
					{
						title: "ĐTB",
						value: "DTB"
					}
				]
				if (vueData.CapID == 2) {
					for (let col of listMaCotDiem) {
						headers.push({
							title: col.title,
							value: col.value,
							minWidth: 50,
							align: 'center'
						})
					}
					return [...headers]
				} else if (vueData.CapID == 3) {
					for (let col of listMaCotDiem) {
						headers.push({
							title: col.title,
							value: col.value,
							minWidth: 50,
							align: 'center'
						})
					}
					headers.splice(5, 0, {
						title: "TX5",
						value: "TX5",
						align: 'center',
						minWidth: 50,
					})
					return [...headers]
				}
	
			},
			getItems(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem.sort()
				return hocSinh.DSCotDiem
			},
			redirectLog(item) {
				const url = `/log-diem?lopid=${item.LopID}&monhocid=${item.MonHocID}&manhomcotdiem=${item.MaNhomCotDiem}&hocsinhid=${item.HocSinhID}`
				openWindow({
					title: "Lịch sử chỉnh sửa",
					url: url,
				})
			}
		},
	}
</script>