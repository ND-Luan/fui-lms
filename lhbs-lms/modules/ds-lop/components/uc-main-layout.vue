<template>
	<div class="pa-4">
		<v-card>
			<v-card-title class="text-primary">Tìm kiếm</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="2">
						<v-autocomplete v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID" outlined dense hide-details></v-autocomplete>
					</v-col>
					<!-- <v-col>
						<v-btn @click="onSearch" color="primary">Tìm kiếm</v-btn>
					</v-col> -->
				</v-row>
			</v-card-text>
		</v-card>

		<v-card class="mt-2">
			<v-card-title class="text-primary">
				Danh sách học sinh lớp
				<v-spacer></v-spacer>
				<v-spacer></v-spacer>
				<v-spacer></v-spacer>
				<!-- :style="{width : WIDTH_TEXT_FIELD_SEARCH + 'px'}" -->
				<v-text-field v-model="Search" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" single-line dense
					hide-details></v-text-field>
			</v-card-title>
			<v-card-text>
				<v-data-table :items="filterDSHocSinh" :headers="columns" :search="Search">
					<template v-slot:item.combineHoTen="{ item }">
						<p class="mb-1 text-subtitle-1 font-weight-medium">{{item.Ho}} {{item.Ten}}</p>
						<p class="mb-0">{{item.NgaySinh}}</p>
					</template>
				</v-data-table>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				DSHocSinhLop: [],
				DSHocSinhLopFilter: [],
				DSLop: [],
				DSHocSinh: [],
				LopID: null,
				columns: [{
					title: "STT",
					value: 'STT',
					className: "black--text",
					align: "center",
					width: 50,
					// width: WIDTH_COLUMN_TABLE.STT,
				},
				{
					title: "Mã học sinh",
					value: 'HocSinhID',
					width: 150,
					align: "center",
					// width: WIDTH_COLUMN_TABLE.MAHOCSINH,
					className: "black--text"
				},
				{
					title: 'Họ và tên / Ngày sinh',
					value: 'combineHoTen',
					key: 'combineHoTen',
					// width: WIDTH_COLUMN_TABLE.HOTEN_NGAYSINH,
					className: "black--text",
					scopedSlots: { customRender: 'combineHoTen' },
				}
				],
				Search: ""
			}
		},
		mounted() {
			this.getEdubot_GetLop()
			this.getEdubot_GetHocSinh()
			this.getEdubot_GetHocSinhLop()
		},
		computed: {
			filterDSHocSinh: function () {
				let ds = []
				if (this.DSHocSinhLopFilter.length > 0) {
					ds = this.DSHocSinhLopFilter.map((hs, index) => ({ ...hs, STT: index + 1 })).filter(x => {
						return x.HocSinhID.toString().toLowerCase().includes(this.Search.toLowerCase()) ||
							x.Ho.toLowerCase().includes(this.Search.toLowerCase()) ||
							x.Ten.toLowerCase().includes(this.Search.toLowerCase())
					})
				}
				return ds
			}
		},
		watch: {
			LopID: function (val) {
				if (val) {
					this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(this.DSHocSinhLop)
				}
			}
		},
		methods: {
			async getEdubot_GetLop() {
				const isSelect = await Edubot_Service.Edubot_GetLop()
				if (isSelect) {
					this.DSLop = isSelect
					if (isSelect[0]) this.LopID = isSelect[0].LopID
				}
			},
			async getEdubot_GetHocSinh() {
				const isSelect = await Edubot_Service.Edubot_GetHocSinh()
				if (isSelect) {
					this.DSHocSinh = isSelect.map((hs, index) => ({ ...hs, STT: index + 1 }))
				}
			},
			async getEdubot_GetHocSinhLop() {
				const isSelect = await Edubot_Service.Edubot_GetHocSinhLop()
				if (isSelect) {
					const dsHocSinhLop = isSelect
					const arrHslMapDSHocSinh = dsHocSinhLop.map((hsl, index) => {
						const hocSinh = this.DSHocSinh.find(hs => hs.HocSinhID === hsl.HocSinhID)
						if (hocSinh) {
							hsl.Ho = hocSinh.Ho
							hsl.Ten = hocSinh.Ten
							hsl.NgaySinh = hocSinh.NgaySinh
							hsl.Nu = hocSinh.Nu
						}
						return hsl
					})
					this.DSHocSinhLop = dsHocSinhLop
					this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(arrHslMapDSHocSinh)
				}
			},
			filterDSHocSinhWithLop(DSHocSinh) {
				const arr = DSHocSinh.filter(hs => hs.LopID === this.LopID)
				return arr
			},
			onSearch() {
				this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(this.DSHocSinhLop)
			}
		},
	}
</script>