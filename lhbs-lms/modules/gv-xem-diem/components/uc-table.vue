<template>
	<div v-for="hocSinh in vueData.DSHocSinhQLD" class="mt-2">
		<v-lazy :min-height="100" :options="{ 'threshold': 0.3 }">
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">
					Học sinh: [{{ hocSinh.HocSinhID}}] {{ hocSinh.HoTen}}
				</v-card-title>
				<v-data-table-virtual class="custom-border" :headers="getHeaders(hocSinh)" :items="getItems(hocSinh)"
					:items-per-page="-1" hide-default-footer>
					<template #item.TX1="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item, 'TX1')" color="primary">
								{{renderItemLMS(item, 'TX1')}}
							</v-chip>
						</div>
					</template>
					<template #item.TX2="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'TX2')" color="primary">
								{{renderItemLMS(item , 'TX2')}}
							</v-chip>
						</div>
					</template>
					<template #item.TX3="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'TX3')" color="primary">
								{{renderItemLMS(item, 'TX3')}}
							</v-chip>
						</div>
					</template>
					<template #item.TX4="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'TX4')" color="primary">
								{{renderItemLMS(item, 'TX4')}}
							</v-chip>
						</div>
					</template>
					<template #item.TX5="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'TX5')" color="primary">
								{{renderItemLMS(item, 'TX5')}}
							</v-chip>
						</div>
					</template>
					<template #item.GK="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'GK')" color="primary">
								{{renderItemLMS(item, 'GK')}}
							</v-chip>
						</div>
					</template>
					<template #item.CK="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'CK')" color="primary">
								{{renderItemLMS(item, 'CK')}}
							</v-chip>
						</div>
					</template>
					<template #item.DTB="{item, value}">
						<div class="d-flex ga-2 align-center justify-center">
							<p>{{value}}</p>
							<v-chip v-if="vueData.Is_Compare_LMS && renderItemLMS(item , 'DTB')" color="primary">
								{{renderItemLMS(item, 'DTB')}}
							</v-chip>
						</div>
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
				const headers = []
				let listMaCotDiem = [
					{
						title: 'Tên môn học',
						value: 'MonHocID',
						minWidth: 100,
						align: 'left'
					},
				]
				if (vueData.Semester.HocKi === 0) {
					listMaCotDiem = [{
						title: 'Tên môn học',
						value: 'MonHocID',
						minWidth: 100,
						align: 'left'
					}, {
						title: "DiemTB_CaNam",
						value: "DiemTB_CaNam"
					}]
				} else {
					listMaCotDiem = [{
						title: 'Tên môn học',
						value: 'MonHocID',
						minWidth: 100,
						align: 'left'
					}, {
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
					}]
				}
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
			renderItemLMS(itemTable, key) {
				let Diem = null
				if (vueData.DSHocSinh_LMS?.length == 0) return Diem
				const itemHocSinh_Mon = vueData.DSHocSinh_LMS.find(x =>
					x.MonHocCode.toLowerCase() === itemTable.MonHocID.toLowerCase()
					&& x.HocSinhID === itemTable.HocSinhID
				)
				if (itemHocSinh_Mon) {
					const MonHocCode = itemHocSinh_Mon.MonHocCode.toLowerCase()
					const Semester = vueData.Semester.value
					if (key === 'TX1') {
						if (MonHocCode === 'anh') {
							if (Semester === 'HK1') Diem = itemHocSinh_Mon?.Theme1_Total ?? null
							if (Semester === 'HK2') Diem = itemHocSinh_Mon?.Theme5_Total ?? null
						} else {
							Diem = itemHocSinh_Mon['TX_L1_' + Semester] ?? null
						}
					} else if (key === 'TX2') {
						if (MonHocCode === 'anh') {
							if (Semester === 'HK1') Diem = itemHocSinh_Mon?.Theme2_Total ?? null
							if (Semester === 'HK2') Diem = itemHocSinh_Mon?.Theme6_Total ?? null
						} else {
							Diem = itemHocSinh_Mon['TX_L2_' + Semester] ?? null
						}
					} else if (key === 'TX3') {
						if (MonHocCode === 'anh') {
							if (Semester === 'HK1') Diem = itemHocSinh_Mon?.Theme3_Total ?? null
							if (Semester === 'HK2') Diem = itemHocSinh_Mon?.Theme7_Total ?? null
						} else {
							Diem = itemHocSinh_Mon['TX_L3_' + Semester] ?? null
						}
					} else if (key === 'TX4') {
						if (MonHocCode === 'anh') {
							if (Semester === 'HK1') Diem = itemHocSinh_Mon?.Theme4_Total ?? null
							if (Semester === 'HK2') Diem = itemHocSinh_Mon?.Theme8_Total ?? null
						} else {
							Diem = itemHocSinh_Mon['TX_L4_' + Semester] ?? null
						}
					} else if (key === 'TX5') {
						Diem = itemHocSinh_Mon['TX_L5_' + Semester] ?? null
					} else if (key === 'GK') {
						if (MonHocCode === 'anh') {
							// Diem = itemHocSinh_Mon['DiemGK_' + Semester] ?? null
						} else {
							Diem = itemHocSinh_Mon['DiemGK_' + Semester] ?? null
						}
					} else if (key === 'CK') {
						if (MonHocCode === 'anh') {
							// Diem = itemHocSinh_Mon['DiemGK_' + Semester] ?? null
						} else {
							Diem = itemHocSinh_Mon['DiemCK_' + Semester] ?? null
						}
					} else if (key === 'DTB') {
						Diem = itemHocSinh_Mon['DiemTB_' + Semester] ?? null
					}
				}
				return Diem
			}
		},
	}
</script>